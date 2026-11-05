export type StorageFolder =
    | "eventos"
    | "noticias"
    | "pessoas"
    | "ministerios"
    | "grupos-oracao"
    | "banners"
    | "logos"
    | "galerias"
    | "grupos"
    | "coordenadores"
    | "paginas"
    | "ministerios_historico"
    | "editor";

export const DEFAULT_STORAGE_BUCKET = "rcc-imagens";

export const ALLOWED_STORAGE_BUCKETS = new Set([
    "rcc-imagens",
    "media",
    "galeria-fotos",
]);

export const ALLOWED_STORAGE_FOLDERS = new Set<string>([
    "eventos",
    "noticias",
    "pessoas",
    "ministerios",
    "grupos-oracao",
    "banners",
    "logos",
    "galerias",
    "grupos",
    "coordenadores",
    "paginas",
    "ministerios_historico",
    "editor",
]);

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
]);

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
};

export function normalizeStorageFolder(folder: string): string {
    const cleaned = folder.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
    if (!ALLOWED_STORAGE_FOLDERS.has(cleaned)) {
        return "galerias";
    }
    return cleaned;
}

export function validateImageUpload(
    file: { name: string; size: number; type: string },
    subfolder: string
): { filePath: string; ext: string; normalizedFolder: string } {
    if (!file || file.size <= 0) {
        throw new Error("Arquivo inválido ou vazio.");
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error("A imagem excede o limite máximo permitido de 5 MB.");
    }

    const rawExt = (file.name.split(".").pop() || "").toLowerCase().trim();
    if (!ALLOWED_IMAGE_EXTENSIONS.has(rawExt) || !ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
        throw new Error("Formato de arquivo não permitido. Envie apenas imagens JPG, PNG ou WebP (máx. 5 MB).");
    }

    const normalizedFolder = normalizeStorageFolder(subfolder);
    const ext = MIME_TO_EXT[file.type] || rawExt;
    const uniqueId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    return {
        filePath: `${normalizedFolder}/${Date.now()}-${uniqueId}.${ext}`,
        ext,
        normalizedFolder,
    };
}

/**
 * Inspects the real binary header (magic bytes) of an uploaded file on the server
 * to prevent disguised scripts/HTML/SVG/executables from bypassing MIME checks.
 */
export function detectImageMimeFromMagicBytes(
    bytes: Uint8Array
): "image/jpeg" | "image/png" | "image/webp" | "image/gif" | null {
    if (!bytes || bytes.length < 12) return null;

    // Scan first 512 bytes for suspicious script/HTML/PHP markers
    const headSlice = bytes.subarray(0, Math.min(bytes.length, 512));
    const asciiPreview = new TextDecoder("utf-8", { fatal: false }).decode(headSlice).toLowerCase();
    if (
        asciiPreview.includes("<script") ||
        asciiPreview.includes("<?php") ||
        asciiPreview.includes("<svg") ||
        asciiPreview.includes("<!doctype html") ||
        asciiPreview.includes("<html")
    ) {
        return null;
    }

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return "image/jpeg";
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
    ) {
        return "image/png";
    }

    // WebP: "RIFF" (52 49 46 46) at 0..3 and "WEBP" (57 45 42 50) at 8..11
    if (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
    ) {
        return "image/webp";
    }

    // GIF: "GIF87a" or "GIF89a" (47 49 46 38 37/39 61)
    if (
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38 &&
        (bytes[4] === 0x37 || bytes[4] === 0x39) &&
        bytes[5] === 0x61
    ) {
        return "image/gif";
    }

    return null;
}

/**
 * Validates external image URLs to prevent XSS (javascript:, data:) and SSRF to private networks.
 */
export function validateExternalImageUrl(rawUrl: string): {
    valid: boolean;
    url: string;
    error?: string;
} {
    const trimmed = (rawUrl || "").trim();
    if (!trimmed) {
        return { valid: false, url: "", error: "Informe uma URL de imagem." };
    }

    // Allow safe root-relative paths (e.g. /logo-rcc-sinop.png)
    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("..")) {
        return { valid: true, url: trimmed };
    }

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            return {
                valid: false,
                url: trimmed,
                error: "A URL da imagem deve começar com https:// ou http://.",
            };
        }

        const host = parsed.hostname.toLowerCase();
        if (
            host === "localhost" ||
            host === "127.0.0.1" ||
            host === "0.0.0.0" ||
            host === "::1" ||
            host === "169.254.169.254" ||
            host.startsWith("10.") ||
            host.startsWith("192.168.") ||
            /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
            host.endsWith(".local") ||
            host.endsWith(".internal")
        ) {
            return {
                valid: false,
                url: trimmed,
                error: "Hosts locais ou privados não são permitidos para URLs de imagem.",
            };
        }

        return { valid: true, url: parsed.toString() };
    } catch {
        return {
            valid: false,
            url: trimmed,
            error: "Formato de URL inválido. Exemplo: https://exemplo.com/imagem.jpg",
        };
    }
}

/**
 * Extracts bucket and filePath from a public Supabase Storage URL.
 */
export function parseSupabaseStorageUrl(
    url: string
): { bucket: string; filePath: string } | null {
    if (!url || typeof url !== "string") return null;
    const marker = "/storage/v1/object/public/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;

    const rest = url.slice(idx + marker.length).split("?")[0];
    const parts = rest.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const bucket = parts[0];
    const filePath = parts.slice(1).join("/");
    if (!ALLOWED_STORAGE_BUCKETS.has(bucket) || filePath.includes("..")) {
        return null;
    }

    return { bucket, filePath };
}
