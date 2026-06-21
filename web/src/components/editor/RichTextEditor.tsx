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
  Minus,
  Pilcrow,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { ScrollArea } from "@/components/ui/scroll-area"

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  onPickImage?: () => Promise<string | null>
  onEditorReady?: (editor: Editor | null) => void
}

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
  // onPickImage,
}: {
  editor: Editor
  //onPickImage?: () => Promise<string | null>
}) {
  const [, force] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    const handleTransaction = () => queueMicrotask(force)
    editor.on("transaction", handleTransaction)
    return () => {
      editor.off("transaction", handleTransaction)
    }
  }, [editor])


  const applyAlign = (align: "left" | "center" | "right" | "justify") => {
    if (editor.isActive("image")) {
      editor.chain().focus().updateAttributes("image", { align }).run()
    } else {
      editor.chain().focus().setTextAlign(align).run()
    }
  }


  const SectionLabel = ({ children }: { children: ReactNode }) => (
    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </p>
  )

  const EditerTool = {
    format: [
      {
        label: "Bold",
        command: () => editor.chain().focus().toggleBold().run(),
        active: editor.isActive("bold"),
        icon: <Bold />,
      },
      {
        label: "Paragraph",
        command: () => editor.chain().focus().setParagraph().run(),
        active: editor.isActive("paragraph"),
        icon: <Pilcrow />,
      },
      {
        label: "Italic",
        command: () => editor.chain().focus().toggleItalic().run(),
        active: editor.isActive("italic"),
        icon: <Italic />,
      },
      {
        label: "Underline",
        command: () => editor.chain().focus().toggleUnderline().run(),
        active: editor.isActive("underline"),
        icon: <UnderlineIcon />,
      },
      {
        label: "Strikethrough",
        command: () => editor.chain().focus().toggleStrike().run(),
        active: editor.isActive("strike"),
        icon: <Strikethrough />,
      },
      {
        label: "Inline code",
        command: () => editor.chain().focus().toggleCode().run(),
        active: editor.isActive("code"),
        icon: <Code />,
      },
      {
        label: "Left",
        command: () => applyAlign("left"),
        active: editor.getAttributes("paragraph").textAlign === "left",
        icon: <AlignLeft />,
      },
      {
        label: "Center",
        command: () => applyAlign("center"),
        active: editor.getAttributes("paragraph").textAlign === "center",
        icon: <AlignCenter />,
      },
      {
        label: "Right",
        command: () => applyAlign("right"),
        active: editor.getAttributes("paragraph").textAlign === "right",
        icon: <AlignRight />,
      },
      {
        label: "Justify",
        command: () => applyAlign("justify"),
        active: editor.getAttributes("paragraph").textAlign === "justify",
        icon: <AlignJustify />,
      },
      {
        label: "Heading 1",
        command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        active: editor.isActive("heading", { level: 1 }),
        icon: <Heading1 />,
      },
      {
        label: "Heading 2",
        command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: editor.isActive("heading", { level: 2 }),
        icon: <Heading2 />,
      },
      {
        label: "Heading 3",
        command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: editor.isActive("heading", { level: 3 }),
        icon: <Heading3 />,
      },
    ],
  }

  return (
    <ScrollArea className="h-[calc(100dvh-48px-40px)]">
      <div className="space-y-3">
        {/* Format */}
        <div className="space-y-1.5">
          <SectionLabel>Format</SectionLabel>
          <div className="flex flex-wrap gap-0.5">
            {EditerTool.format.map((item) => (
              <ToolbarButton
                key={item.label}
                title={item.label}
                onClick={item.command}
                active={item.active}
              >
                {item.icon}
              </ToolbarButton>
            ))}
          </div>
        </div>
        <div className="border-b" />

        {/* Lists & Blocks */}
        <div className="space-y-1.5">
          <SectionLabel>Lists & Blocks</SectionLabel>
          <div className="flex flex-wrap gap-0.5">
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
          </div>
        </div>
        <div className="border-b" />

        {/* Insert */}
        <div className="space-y-1.5">
          <SectionLabel>Insert</SectionLabel>
          <div className="flex items-center gap-0.5">
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Text color"
                >
                  <Palette />
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
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

export { Toolbar }

function RichTextEditor({
  value,
  onChange,
  placeholder,
  onEditorReady,
}: Props) {
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
          "prose prose-sm dark:prose-invert max-w-none min-h-[360px] px-2 py-2",
      },
    },
  })

  useEffect(() => {
    onEditorReady?.(editor)
    return () => onEditorReady?.(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

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
      return () => {
        cancelled = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  return (
    <div className="">
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor
