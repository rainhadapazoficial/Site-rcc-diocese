"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertCircle,
    CheckCircle2,
    Image as ImageIcon,
    Link2,
    Loader2,
    RefreshCw,
    Trash2,
    Upload,
} from "lucide-react";
import {
    StorageFolder,
    validateExternalImageUrl,
} from "@/lib/upload-validation";
import {
    deleteAdminStorageImage,
    uploadAdminImage,
} from "@/lib/storage-client";

export interface ImageUploaderProps {
    /** Controlled value */
    value?: string;
    /** Initial value for uncontrolled / FormData usage */
    defaultValue?: string;
    /** Callback fired whenever the image URL changes */
    onChange?: (url: string) => void;
    /** Form field name (renders a hidden input for FormData submission) */
    name?: string;
    /** Target folder inside the Supabase Storage bucket */
    folder: StorageFolder;
    /** Field label */
    label?: string;
    /** Helper text / dimension recommendation */
    hint?: string;
    /** Placeholder for URL input */
    placeholder?: string;
    /** Require an image before form submission */
    required?: boolean;
    /** Compact layout for nested lists (history rows, attractions) */
    compact?: boolean;
    /** Preview aspect style */
    aspectRatio?: "video" | "square" | "banner" | "avatar";
    /** Optional CSS class for outer container */
    className?: string;
}

export function ImageUploader({
    value,
    defaultValue = "",
    onChange,
    name,
    folder,
    label,
    hint,
    placeholder = "https://exemplo.com/imagem.jpg",
    required = false,
    compact = false,
    aspectRatio = "video",
    className = "",
}: ImageUploaderProps) {
    const isControlled = value !== undefined;
    const [internalUrl, setInternalUrl] = useState<string>(value ?? defaultValue ?? "");
    const currentUrl = isControlled ? (value || "") : internalUrl;

    const [mode, setMode] = useState<"upload" | "link">(
        currentUrl && !currentUrl.includes("/storage/v1/object/public/") ? "link" : "upload"
    );
    const [linkInput, setLinkInput] = useState<string>(currentUrl);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState(false);
    const [sessionUploadedUrl, setSessionUploadedUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const inputId = useId();

    // Sync state when controlled value or defaultValue changes (e.g. switching edited item)
    useEffect(() => {
        if (isControlled) {
            setLinkInput(value || "");
            setPreviewError(false);
        }
    }, [isControlled, value]);

    useEffect(() => {
        if (!isControlled) {
            setInternalUrl(defaultValue || "");
            setLinkInput(defaultValue || "");
            setPreviewError(false);
        }
    }, [defaultValue, isControlled]);

    const commitUrl = (newUrl: string) => {
        if (!isControlled) {
            setInternalUrl(newUrl);
        }
        setLinkInput(newUrl);
        setPreviewError(false);
        onChange?.(newUrl);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMessage(null);
        setSuccessMessage(null);
        setIsUploading(true);

        try {
            const uploadedUrl = await uploadAdminImage(file, folder);

            // If we already uploaded a temporary file in this same session, clean it up safely
            if (sessionUploadedUrl && sessionUploadedUrl !== uploadedUrl) {
                void deleteAdminStorageImage(sessionUploadedUrl);
            }

            setSessionUploadedUrl(uploadedUrl);
            commitUrl(uploadedUrl);
            setSuccessMessage("Imagem enviada com sucesso para o Supabase Storage!");
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Erro ao fazer upload da imagem.";
            setErrorMessage(msg);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setLinkInput(raw);
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!raw.trim()) {
            commitUrl("");
            return;
        }

        const validation = validateExternalImageUrl(raw);
        if (validation.valid) {
            commitUrl(validation.url);
        } else {
            // Still update controlled state if user is typing, or show validation error on blur
            setErrorMessage(validation.error || "URL inválida.");
        }
    };

    const handleLinkBlur = () => {
        if (!linkInput.trim()) {
            setErrorMessage(null);
            commitUrl("");
            return;
        }
        const validation = validateExternalImageUrl(linkInput);
        if (!validation.valid) {
            setErrorMessage(validation.error || "URL inválida.");
        } else {
            setErrorMessage(null);
            commitUrl(validation.url);
            setSuccessMessage("URL validada com sucesso!");
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };

    const handleRemove = async () => {
        setErrorMessage(null);
        setSuccessMessage(null);

        if (sessionUploadedUrl && currentUrl === sessionUploadedUrl) {
            await deleteAdminStorageImage(sessionUploadedUrl);
            setSessionUploadedUrl(null);
        }

        commitUrl("");
    };

    const previewHeightClass = compact
        ? "h-24"
        : aspectRatio === "banner"
          ? "h-32"
          : aspectRatio === "square" || aspectRatio === "avatar"
            ? "h-36 w-36"
            : "h-40";

    return (
        <div className={`space-y-2.5 ${className}`}>
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={currentUrl}
                    required={required}
                />
            )}

            <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Header: Label + Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    {label && (
                        <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-brand-blue" />
                            {label}
                            {required && <span className="text-red-500">*</span>}
                        </Label>
                    )}
                    {hint && (
                        <p className="text-[10px] text-brand-blue/60 font-medium italic mt-0.5">
                            {hint}
                        </p>
                    )}
                </div>

                <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200/70">
                    <button
                        type="button"
                        onClick={() => {
                            setMode("upload");
                            setErrorMessage(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            mode === "upload"
                                ? "bg-brand-blue text-white shadow-sm"
                                : "text-gray-500 hover:text-brand-blue"
                        }`}
                    >
                        <Upload className="w-3 h-3" />
                        Fazer Upload
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode("link");
                            setErrorMessage(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            mode === "link"
                                ? "bg-brand-blue text-white shadow-sm"
                                : "text-gray-500 hover:text-brand-blue"
                        }`}
                    >
                        <Link2 className="w-3 h-3" />
                        Inserir Link
                    </button>
                </div>
            </div>

            {/* Mode Content */}
            {mode === "upload" ? (
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl border-dashed border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5 hover:border-brand-blue h-11 px-4 text-xs font-bold flex-1 justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                                Enviando para o Supabase...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 text-brand-gold" />
                                {currentUrl ? "Substituir Imagem (Upload)" : "Selecionar Imagem (JPG, PNG ou WebP • máx. 5 MB)"}
                            </>
                        )}
                    </Button>
                    {currentUrl && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemove}
                            title="Remover imagem"
                            className="h-11 w-11 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Input
                            type="url"
                            value={linkInput}
                            onChange={handleLinkChange}
                            onBlur={handleLinkBlur}
                            placeholder={placeholder}
                            className="rounded-xl h-11 pr-9 text-xs bg-white"
                        />
                        <Link2 className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {currentUrl && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemove}
                            title="Remover imagem"
                            className="h-11 w-11 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}

            {/* Feedback Messages */}
            {errorMessage && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {successMessage && !errorMessage && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Image Preview */}
            {currentUrl && (
                <div className="relative group rounded-2xl overflow-hidden border border-gray-200 bg-slate-50 shadow-sm">
                    <div className={`relative w-full ${previewHeightClass} flex items-center justify-center overflow-hidden`}>
                        {!previewError ? (
                            <img
                                src={currentUrl}
                                alt={label || "Pré-visualização da imagem"}
                                className={`w-full h-full ${
                                    aspectRatio === "square" ? "object-contain p-2" : "object-cover"
                                }`}
                                onError={() => setPreviewError(true)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center gap-1">
                                <AlertCircle className="w-6 h-6 text-amber-500" />
                                <span className="text-[11px] font-medium text-gray-500">
                                    Não foi possível carregar a pré-visualização desta URL.
                                </span>
                            </div>
                        )}

                        {/* Hover Actions Overlay */}
                        <div className="absolute inset-0 bg-brand-blue/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="rounded-xl text-xs font-bold h-8 px-3 bg-white text-brand-blue hover:bg-gray-100"
                            >
                                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                Substituir
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={handleRemove}
                                disabled={isUploading}
                                className="rounded-xl text-xs font-bold h-8 px-3"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                Remover
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

