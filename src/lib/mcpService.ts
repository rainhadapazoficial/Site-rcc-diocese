import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import { sanitizeHtml } from "./sanitize";

// Usamos a SERVICE_ROLE_KEY no MCP para que o Agente de IA ignore o RLS 
// e consiga gerenciar o conteúdo sem precisar de uma sessão de usuário logado.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const MCP_TOOLS = [
    {
        name: "get_prayer_requests",
        description: "Recupera os pedidos de oração mais recentes do Supabase.",
        inputSchema: {
            type: "object",
            properties: {
                limit: { type: "number", default: 10 }
            }
        }
    },
    {
        name: "create_blog_post",
        description: "Cria um novo post no blog.",
        inputSchema: {
            type: "object",
            properties: {
                title: { type: "string" },
                content: { type: "string" },
                excerpt: { type: "string" },
                category: { type: "string" },
                image_url: { type: "string" }
            },
            required: ["title", "content"]
        }
    },
    {
        name: "manage_events",
        description: "Lista os próximos eventos.",
        inputSchema: {
            type: "object",
            properties: {
                limit: { type: "number", default: 5 }
            }
        }
    },
    {
        name: "get_custom_pages",
        description: "Lista todas as páginas dinâmicas (como Festa do Rei Jesus, História, etc).",
        inputSchema: {
            type: "object",
            properties: {}
        }
    },
    {
        name: "get_system_settings",
        description: "Recupera as configurações globais não-sensíveis (ex: n8n URL).",
        inputSchema: {
            type: "object",
            properties: {}
        }
    }
];

export async function executeMcpTool(name: string, args: Record<string, unknown> | undefined) {
    try {
        if (name === "get_prayer_requests") {
            const { data, error } = await supabase
                .from("prayer_requests")
                .select("*")
                .order("created_at", { ascending: false })
                .limit((args?.limit as number) || 10);

            if (error) throw error;
            return { content: [{ type: "text", text: JSON.stringify(data) }] };
        }

        if (name === "create_blog_post") {
            const argsObj = (args || {}) as Record<string, unknown>;
            const title = String(argsObj.title || "").trim();
            const content = sanitizeHtml(String(argsObj.content || ""));
            const excerpt = argsObj.excerpt ? sanitizeHtml(String(argsObj.excerpt)) : null;
            const category = argsObj.category ? String(argsObj.category) : null;
            const image_url = argsObj.image_url ? String(argsObj.image_url) : null;
            
            const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "-").replace(/[^\w-]+/g, "");

            const { error } = await supabase
                .from("posts")
                .insert([{
                    title,
                    content,
                    excerpt: excerpt || content.slice(0, 150),
                    category: category || "Geral",
                    image_url: image_url || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3",
                    author: "IA Assistant (MCP)",
                    slug,
                    date: new Date().toLocaleDateString("pt-BR")
                }]);

            if (error) throw error;
            return { content: [{ type: "text", text: `Post "${title}" criado com sucesso!` }] };
        }

        if (name === "manage_events") {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .order("date", { ascending: true })
                .limit((args?.limit as number) || 5);

            if (error) throw error;
            return { content: [{ type: "text", text: JSON.stringify(data) }] };
        }

        if (name === "get_custom_pages") {
            const { data, error } = await supabase
                .from("custom_pages")
                .select("id, slug, title, is_published");

            if (error) throw error;
            return { content: [{ type: "text", text: JSON.stringify(data) }] };
        }

        if (name === "get_system_settings") {
            const { data, error } = await supabase
                .from("system_settings")
                .select("settings_key, settings_value, updated_at")
                .neq("settings_key", "n8n_api_key");

            if (error) throw error;
            return { content: [{ type: "text", text: JSON.stringify(data) }] };
        }

        throw new Error(`Tool not found: ${name}`);
    } catch (error: unknown) {
        return {
            isError: true,
            content: [{ type: "text", text: error instanceof Error ? error.message : "Unknown error" }]
        };
    }
}

export const mcpServer = new Server(
    {
        name: "rcc-sinop-manager",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
            resources: {},
        },
    }
);

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: MCP_TOOLS };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return executeMcpTool(name, args as Record<string, unknown> | undefined);
});

export async function handleMcpJsonRpcRequest(body: Record<string, unknown>) {
    const id = body?.id ?? null;
    const method = typeof body?.method === "string" ? body.method : "";
    const params = (body?.params || {}) as Record<string, unknown>;

    if (method === "initialize") {
        return {
            jsonrpc: "2.0",
            id,
            result: {
                protocolVersion: "2024-11-05",
                capabilities: { tools: {}, resources: {} },
                serverInfo: { name: "rcc-sinop-manager", version: "1.0.0" },
            },
        };
    }

    if (method === "ping") {
        return { jsonrpc: "2.0", id, result: {} };
    }

    if (method === "tools/list") {
        return { jsonrpc: "2.0", id, result: { tools: MCP_TOOLS } };
    }

    if (method === "tools/call") {
        const toolName = typeof params.name === "string" ? params.name : "";
        const toolArgs = (params.arguments || {}) as Record<string, unknown>;
        const result = await executeMcpTool(toolName, toolArgs);
        return { jsonrpc: "2.0", id, result };
    }

    return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
    };
}
