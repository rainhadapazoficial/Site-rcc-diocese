const FORBIDDEN_TAGS_WITH_CONTENT = /<(script|style|object|embed|applet|meta|base|form|input|button|textarea|select|option)\b[^>]*>[\s\S]*?<\/\1>/gi;
const FORBIDDEN_SELF_CLOSING_TAGS = /<(script|style|object|embed|applet|meta|base|link|form|input|button|textarea|select|option)\b[^>]*\/?>/gi;
const EVENT_HANDLER_ATTR = /\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const SRC_DOC_ATTR = /\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_URI_ATTR = /\s+(href|src|action|formaction|xlink:href|data)\s*=\s*(?:"\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"]*"|'\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^']*'|(?:\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^\s>]*))/gi;

const SAFE_IFRAME_HOSTS = new Set([
    "www.youtube.com",
    "youtube.com",
    "www.youtube-nocookie.com",
    "player.vimeo.com",
    "open.spotify.com",
    "www.google.com",
]);

function sanitizeIframes(html: string): string {
    return html.replace(/<iframe\b([^>]*)>(?:[\s\S]*?<\/iframe>)?/gi, (fullMatch, attrs: string) => {
        const srcMatch = attrs.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const src = (srcMatch?.[1] || srcMatch?.[2] || srcMatch?.[3] || "").trim();
        if (!src) return "";
        try {
            const parsed = new URL(src);
            if (parsed.protocol !== "https:" || !SAFE_IFRAME_HOSTS.has(parsed.hostname.toLowerCase())) {
                return "";
            }
            return fullMatch;
        } catch {
            return "";
        }
    });
}

export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
    if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

    let cleaned = dirtyHtml;
    // Remove dangerous container tags and their contents
    cleaned = cleaned.replace(FORBIDDEN_TAGS_WITH_CONTENT, "");
    cleaned = cleaned.replace(FORBIDDEN_SELF_CLOSING_TAGS, "");
    // Validate iframes against allowlist of trusted embed providers
    cleaned = sanitizeIframes(cleaned);
    // Remove all inline event handlers (onerror, onload, onclick, etc.) and srcdoc
    cleaned = cleaned.replace(EVENT_HANDLER_ATTR, "");
    cleaned = cleaned.replace(SRC_DOC_ATTR, "");
    // Remove javascript:, vbscript:, and data:text/html URIs
    cleaned = cleaned.replace(DANGEROUS_URI_ATTR, "");

    return cleaned;
}

export function escapeHtml(str: string | null | undefined): string {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

