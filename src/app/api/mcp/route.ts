import { NextResponse } from "next/server";
import { handleMcpJsonRpcRequest } from "@/lib/mcpService";
import { verifyBearerSecret } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const authHeader = request.headers.get("Authorization");

    if (!verifyBearerSecret(authHeader, process.env.MCP_AUTH_TOKEN)) {
        return NextResponse.json({ error: "Acesso MCP negado." }, { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await handleMcpJsonRpcRequest(body);
        return NextResponse.json(response);
    } catch (error: unknown) {
        console.error("MCP Server Error:", error);
        return NextResponse.json({
            jsonrpc: "2.0",
            error: { code: -32603, message: "Internal MCP error" },
            id: null
        }, { status: 500 });
    }
}
