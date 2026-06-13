import { useEffect, useReducer, type ReactNode } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import ResizableImage from "./ResizableImage"
import TextAlign from "@tiptap/extension-text-align"
import { TableKit } from "@tiptap/extension-table"
import { TextStyle, FontSize, Color } from "@tiptap/extension-text-style"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Minus,
  Pilcrow,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  /** Optional media picker; when set, the image button uses it instead of a prompt. */
  onPickImage?: () => Promise<string | null>
}

const FONT_SIZES = ["12px", "14px", "16px", "18px", "24px", "32px"]
const COLORS = [
  "#000000",
  "#64748b",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
]

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className="size-8 cursor-pointer"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  )
}

function Toolbar({
  editor,
  onPickImage,
}: {
  editor: Editor
  onPickImage?: () => Promise<string | null>
}) {
  const [, force] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    const handleTransaction = () => queueMicrotask(force)
    editor.on("transaction", handleTransaction)
    return () => {
      editor.off("transaction", handleTransaction)
    }
  }, [editor])

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Link URL", prev ?? "https://")
    if (url === null) return
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url.trim() }).run()
  }

  const applyAlign = (align: "left" | "center" | "right" | "justify") => {
    if (editor.isActive("image")) {
      editor.chain().focus().updateAttributes("image", { align }).run()
    } else {
      editor.chain().focus().setTextAlign(align).run()
    }
  }

  const addImage = async () => {
    if (onPickImage) {
      // Release editor focus so the dialog isn't opened over a focused,
      // aria-hidden ancestor.
      editor.commands.blur()
      const url = await onPickImage()
      if (url && url.trim()) {
        editor.chain().focus().setImage({ src: url.trim() }).run()
      }
      return
    }
    const url = window.prompt("Image URL")
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run()
    }
  }

  const currentSize =
    (editor.getAttributes("textStyle").fontSize as string | undefined) ??
    "default"

  const Divider = () => <div className="mx-1 h-6 border-l" />

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1 sticky top-0 z-10 bg-background">
      <ToolbarButton
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 className="size-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Inline code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="size-4" />
      </ToolbarButton>

      {/* Font size */}
      <Select
        value={currentSize}
        onValueChange={(v) => {
          if (v === "default") editor.chain().focus().unsetFontSize().run()
          else editor.chain().focus().setFontSize(v).run()
        }}
      >
        <SelectTrigger size="sm" className="ml-1 h-8 w-19.5 cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="default" className="cursor-pointer">
              Size
            </SelectItem>
            {FONT_SIZES.map((s) => (
              <SelectItem key={s} value={s} className="cursor-pointer">
                {s.replace("px", "")}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Text color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            title="Text color"
          >
            <Palette className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-5 gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="size-6 rounded border"
                style={{ backgroundColor: c }}
                onClick={() => editor.chain().focus().setColor(c).run()}
                aria-label={c}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            Reset color
          </Button>
        </PopoverContent>
      </Popover>

      <Divider />
      <ToolbarButton
        title="Paragraph"
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>

      {/* Alignment */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            title="Text align"
          >
            {editor.isActive({ textAlign: "center" }) ? (
              <AlignCenter className="size-4" />
            ) : editor.isActive({ textAlign: "right" }) ? (
              <AlignRight className="size-4" />
            ) : editor.isActive({ textAlign: "justify" }) ? (
              <AlignJustify className="size-4" />
            ) : (
              <AlignLeft className="size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => applyAlign("left")}>
            <AlignLeft className="size-4" /> Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyAlign("center")}>
            <AlignCenter className="size-4" /> Center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyAlign("right")}>
            <AlignRight className="size-4" /> Right
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyAlign("justify")}>
            <AlignJustify className="size-4" /> Justify
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Divider />
      <ToolbarButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="size-4" />
      </ToolbarButton>

      {/* Table */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            title="Table"
          >
            <TableIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            Insert table
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            Add column
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            Add row
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            Delete column
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            Delete row
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            Delete table
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarButton title="Image" onClick={addImage}>
        <ImageIcon className="size-4" />
      </ToolbarButton>
    </div>
  )
}

function RichTextEditor({ value, onChange, placeholder, onPickImage }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      ResizableImage,
      Placeholder.configure({
        placeholder: placeholder ?? "Write your content…",
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableKit.configure({ table: { resizable: true } }),
      TextStyle,
      FontSize,
      Color,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[360px] px-3 py-2",
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      // Defer setContent to avoid Tiptap's ReactNodeView.mount calling flushSync
      // while React is already flushing passive effects.
      let cancelled = false
      queueMicrotask(() => {
        if (cancelled || editor.isDestroyed) return
        editor.commands.setContent(value || "", { emitUpdate: false })
      })
      return () => { cancelled = true }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  return (
    <div className="">
      {editor && <Toolbar editor={editor} onPickImage={onPickImage} />}
        <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor
