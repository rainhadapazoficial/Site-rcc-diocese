import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import nodemailer from "nodemailer";
import { triggerN8NWebhook } from "@/lib/n8n";
import { escapeHtml } from "@/lib/sanitize";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
    try {
        const ip = getClientIp(request);
        if (!checkRateLimit(`prayer:${ip}`, 5, 10 * 60 * 1000)) {
            return NextResponse.json(
                { error: "Muitas solicitações. Aguarde alguns minutos e tente novamente." },
                { status: 429 }
            );
        }

        const body = await request.json().catch(() => null);
        const name = typeof body?.name === "string" ? body.name.trim() : "";
        const email = typeof body?.email === "string" ? body.email.trim() : "";
        const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
        const message = typeof body?.message === "string" ? body.message.trim() : "";

        // 1. Validation
        if (!name || !message) {
            return NextResponse.json(
                { error: "Nome e pedido de oração são obrigatórios." },
                { status: 400 }
            );
        }

        if (name.length > 120 || email.length > 160 || phone.length > 40 || message.length > 3000) {
            return NextResponse.json(
                { error: "Um ou mais campos excedem o tamanho máximo permitido." },
                { status: 400 }
            );
        }

        // 2. Save to Supabase
        const { error: supabaseError } = await supabase
            .from("prayer_requests")
            .insert([
                {
                    name,
                    email: email || "nao-informado@rccdesinop.com.br",
                    phone: phone || null,
                    message,
                    created_at: new Date().toISOString()
                },
            ]);

        if (supabaseError) {
            console.error("Supabase Error:", supabaseError);
            return NextResponse.json(
                { error: "Erro ao registrar seu pedido de oração." },
                { status: 500 }
            );
        }

        // 2.5 Trigger n8n webhook asynchronously
        triggerN8NWebhook("prayer_request", {
            name,
            email,
            phone,
            message
        }).catch((err) => console.error("N8N webhook error:", err));

        // 3. Send Email via SMTP (supporting both SMTP_PASS and SMTP_PASSWORD)
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
        const smtpHost = process.env.SMTP_HOST || "mail.rccdesinop.com.br";
        const smtpPort = Number(process.env.SMTP_PORT) || 465;

        if (smtpUser && smtpPass) {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });

            const safeName = escapeHtml(name);
            const safeEmail = escapeHtml(email || "Não informado");
            const safePhone = escapeHtml(phone || "Não informado");
            const safeMessage = escapeHtml(message);

            const mailOptions = {
                from: process.env.SMTP_FROM || `"Diocese de Sinop - Site" <${smtpUser}>`,
                to: process.env.SMTP_TO || "coordenacao@rccdesinop.com.br",
                replyTo: email || undefined,
                subject: `🙏 Novo Pedido de Oração: ${name.replace(/[\r\n]+/g, " ")}`,
                html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #004d2c; padding: 20px; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; font-style: italic;">Diocese de Sinop</h1>
          </div>
          <div style="padding: 30px; color: #333;">
            <h2 style="color: #004d2c; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Pedido de Intercessão</h2>
            <p><strong>Nome:</strong> ${safeName}</p>
            <p><strong>E-mail:</strong> ${safeEmail}</p>
            <p><strong>Telefone:</strong> ${safePhone}</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #d4af37;">
              <p style="margin: 0; font-style: italic; white-space: pre-wrap;">"${safeMessage}"</p>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
              Este é um e-mail automático enviado pelo site oficial da RCC Diocese de Sinop.
            </p>
          </div>
        </div>
      `,
            };

            await transporter.sendMail(mailOptions).catch((err) => {
                console.error("SMTP delivery error:", err);
            });
        }

        return NextResponse.json({ success: true, message: "Pedido de oração recebido com sucesso!" });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor." },
            { status: 500 }
        );
    }
}
