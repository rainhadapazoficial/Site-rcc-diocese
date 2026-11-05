import { NextRequest, NextResponse } from "next/server";

const ADMIN_TOKEN_COOKIE = "rcc_admin_token";

function isJwtStructurallyValid(token: string | undefined): boolean {
    if (!token || token === "undefined" || token === "null") return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    try {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const payload = JSON.parse(atob(padded));
        if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
            return false;
        }
        return Boolean(payload.sub && payload.role === "authenticated");
    } catch {
        return false;
    }
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const cookieToken = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined;

    if (pathname.startsWith("/api/admin/")) {
        if (!isJwtStructurallyValid(bearerToken) && !isJwtStructurallyValid(cookieToken)) {
            return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
        }
        return NextResponse.next();
    }

    if (pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/status")) {
        if (!isJwtStructurallyValid(cookieToken)) {
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/dashboard/:path*", "/admin/status/:path*", "/api/admin/:path*"],
};

