"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";

import {
    Bold, Italic, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Quote, Heading1,
    ImageIcon,
    Table as TableIcon, Palette, Highlighter,
    Undo, Redo, Eraser
} from "lucide-react";
import { uploadAdminImage } from "@/lib/storage-client";
import { validateExternalImageUrl } from "@/lib/upload-validation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface PremiumEditorProps {
    content: string;
    onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    const addImageFromUpload = async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                try {
                    const publicUrl = await uploadAdminImage(file, "galerias");
                    editor.chain().focus().setImage({ src: publicUrl }).run();
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : "Erro ao enviar imagem.";
                    alert(msg);
                }
            }
        };
        input.click();
    };

    const addImageFromUrl = () => {
        const rawUrl = window.prompt("Cole a URL da imagem (https://...):");
        if (!rawUrl) return;
        const validation = validateExternalImageUrl(rawUrl);
        if (!validation.valid) {
            alert(validation.error || "URL de imagem inválida.");
            return;
        }
        editor.chain().focus().setImage({ src: validation.url }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50/50 backdrop-blur-sm rounded-t-xl sticky top-0 z-10">
            {/* Text Style */}
            <div className="flex gap-1 items-center px-1">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive("bold") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <Bold className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <Italic className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive("underline") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <UnderlineIcon className="w-4 h-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

            {/* Alignment */}
            <div className="flex gap-1 items-center px-1">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={editor.isActive({ textAlign: 'left' }) ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <AlignLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={editor.isActive({ textAlign: 'center' }) ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <AlignCenter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={editor.isActive({ textAlign: 'right' }) ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <AlignRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

            {/* Headings */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 px-3">
                        <Heading1 className="w-4 h-4" />
                        <span className="text-xs font-bold">Título</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1 - Principal</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2 - Seção</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3 - Subseção</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>P - Texto Comum</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

            {/* Lists & More */}
            <div className="flex gap-1 items-center px-1">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive("bulletList") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <List className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive("orderedList") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <ListOrdered className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive("blockquote") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <Quote className="w-4 h-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

            {/* Colors & Media */}
            <div className="flex gap-1 items-center px-1">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={editor.isActive("highlight") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <Highlighter className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <Palette className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="grid grid-cols-4 p-2 gap-1">
                        {['#000000', '#004d2c', '#FFD700', '#FF0000', '#008000', '#808080'].map(color => (
                            <button
                                key={color}
                                className="w-6 h-6 rounded-md border"
                                style={{ backgroundColor: color }}
                                onClick={() => editor.chain().focus().setColor(color).run()}
                            />
                        ))}
                        <DropdownMenuItem className="col-span-4 justify-center" onClick={() => editor.chain().focus().unsetColor().run()}>Limpar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" title="Inserir imagem">
                            <ImageIcon className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={addImageFromUpload}>
                            Fazer Upload (JPG, PNG, WebP)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={addImageFromUrl}>
                            Inserir Link (URL)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                    <TableIcon className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex-1" />

            {/* History */}
            <div className="flex gap-1 items-center px-1">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}>
                    <Undo className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}>
                    <Redo className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
                    <Eraser className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export function PremiumEditor({ content, onChange }: PremiumEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            CharacterCount,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Image.configure({
                HTMLAttributes: { class: "rounded-2xl max-w-full h-auto shadow-lg my-8 mx-auto" },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: "text-brand-gold underline font-bold" },
            }),
            Youtube.configure({
                HTMLAttributes: { class: "rounded-2xl aspect-video w-full my-8 shadow-xl" },
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[400px] p-8 max-w-none prose-headings:text-brand-blue prose-p:text-gray-600 prose-img:mx-auto",
            },
        },
    });

    return (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <div className="p-2 bg-gray-50 border-t flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">
                <span>RCC Diocese de Sinop • Editor Premium</span>
                <span>{editor?.storage.characterCount.words()} Palavras</span>
            </div>
        </div>
    );
}
