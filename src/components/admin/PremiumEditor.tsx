"use client";

import { useState } from "react";
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
    ImageIcon, Check, X,
    Table as TableIcon, Palette, Highlighter,
    Undo, Redo, Eraser
} from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
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

const MenuBar = ({
    editor,
    showImagePanel,
    setShowImagePanel,
}: {
    editor: Editor | null;
    showImagePanel: boolean;
    setShowImagePanel: (v: boolean) => void;
}) => {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50/50 backdrop-blur-sm rounded-t-xl sticky top-0 z-10 items-center">
            {/* Text Style */}
            <div className="flex gap-1 items-center px-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive("bold") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <Bold className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <Italic className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive("underline") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <UnderlineIcon className="w-4 h-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-gray-200 my-auto" />

            {/* Alignment */}
            <div className="flex gap-1 items-center px-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    className={editor.isActive({ textAlign: "left" }) ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <AlignLeft className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    className={editor.isActive({ textAlign: "center" }) ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <AlignCenter className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    className={editor.isActive({ textAlign: "right" }) ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <AlignRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-gray-200 my-auto" />

            {/* Headings */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="gap-1 font-bold text-xs">
                        <Heading1 className="w-4 h-4" />
                        Título
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                        Título 1 (Grande)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        Título 2 (Médio)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                        Título 3 (Pequeno)
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-gray-200 my-auto" />

            {/* Lists */}
            <div className="flex gap-1 items-center px-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive("bulletList") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <List className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive("orderedList") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <ListOrdered className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive("blockquote") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <Quote className="w-4 h-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-gray-200 my-auto" />

            {/* Rich Features */}
            <div className="flex gap-1 items-center px-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={editor.isActive("highlight") ? "bg-brand-blue text-white" : "hover:bg-brand-blue/10"}>
                    <Highlighter className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="sm">
                            <Palette className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="grid grid-cols-4 p-2 gap-1">
                        {['#000000', '#004d2c', '#FFD700', '#FF0000', '#008000', '#808080'].map(color => (
                            <button
                                type="button"
                                key={color}
                                className="w-6 h-6 rounded-md border"
                                style={{ backgroundColor: color }}
                                onClick={() => editor.chain().focus().setColor(color).run()}
                            />
                        ))}
                        <DropdownMenuItem className="col-span-4 justify-center" onClick={() => editor.chain().focus().unsetColor().run()}>Limpar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    type="button"
                    variant={showImagePanel ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowImagePanel(!showImagePanel)}
                    className={`gap-1.5 text-xs font-bold rounded-lg px-3 ${
                        showImagePanel
                            ? "bg-brand-blue text-white"
                            : "border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10"
                    }`}
                >
                    <ImageIcon className="w-4 h-4 text-brand-gold" />
                    Inserir Imagem
                </Button>

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                    <TableIcon className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex-1" />

            {/* History */}
            <div className="flex gap-1 items-center px-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}>
                    <Undo className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}>
                    <Redo className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
                    <Eraser className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export function PremiumEditor({ content, onChange }: PremiumEditorProps) {
    const [showImagePanel, setShowImagePanel] = useState(false);
    const [pendingImageUrl, setPendingImageUrl] = useState("");

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
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[320px] p-6 max-w-none prose-headings:text-brand-blue prose-p:text-gray-600 prose-img:mx-auto",
            },
        },
    });

    const handleInsertIntoEditor = () => {
        if (!editor || !pendingImageUrl) return;
        editor.chain().focus().setImage({ src: pendingImageUrl }).run();
        setPendingImageUrl("");
        setShowImagePanel(false);
    };

    return (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
            <MenuBar
                editor={editor}
                showImagePanel={showImagePanel}
                setShowImagePanel={setShowImagePanel}
            />

            {showImagePanel && (
                <div className="p-4 bg-blue-50/40 border-b border-blue-100 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                            Adicionar Imagem ao Corpo do Texto
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setShowImagePanel(false);
                                setPendingImageUrl("");
                            }}
                            className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <ImageUploader
                        value={pendingImageUrl}
                        onChange={(url) => setPendingImageUrl(url)}
                        folder="galerias"
                        placeholder="https://exemplo.com/imagem-artigo.jpg"
                        compact
                    />

                    {pendingImageUrl && (
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                onClick={handleInsertIntoEditor}
                                className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl h-9 px-4 text-xs font-bold gap-1.5"
                            >
                                <Check className="w-4 h-4 text-brand-gold" />
                                Inserir Imagem no Texto
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <EditorContent editor={editor} />
            <div className="px-6 py-2 bg-gray-50 border-t flex justify-between items-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                <div className="flex gap-4">
                    <span>Palavras: {editor?.storage.characterCount.words() || 0}</span>
                    <span>Caracteres: {editor?.storage.characterCount.characters() || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Editor Ativo
                </div>
            </div>
        </div>
    );
}
