import { useCallback } from "react"
import { BubbleMenu } from "@tiptap/react/menus"
import { useEditorState, type Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Link2Off,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { EDITOR_COLORS } from "./constants"

function BubbleButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      className="size-7 cursor-pointer"
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  )
}

const Divider = () => <span className="mx-0.5 h-5 w-px bg-border" />

/**
 * Floating mini-toolbar that appears when the user selects text — the
 * "highlight then tweak" experience, like Word or Notion.
 *
 * Active states are read via `useEditorState`, which only re-renders when the
 * selected flags change. Do NOT force a re-render on every transaction here:
 * re-rendering the <BubbleMenu> wrapper reconfigures its plugin, which
 * dispatches another transaction and creates an infinite loop.
 */
export function SelectionBubbleMenu({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      code: editor.isActive("code"),
      h1: editor.isActive("heading", { level: 1 }),
      h2: editor.isActive("heading", { level: 2 }),
      link: editor.isActive("link"),
    }),
  })

  const shouldShow = useCallback(
    ({ editor, from, to }: { editor: Editor; from: number; to: number }) => {
      // Only for a non-empty text selection, never over images/code blocks.
      if (from === to) return false
      if (!editor.isEditable) return false
      if (editor.isActive("image") || editor.isActive("codeBlock")) return false
      return true
    },
    []
  )

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Link URL", previous ?? "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8 }}
      shouldShow={shouldShow}
      className="flex items-center rounded-lg border bg-popover p-1 shadow-md"
    >
      <BubbleButton
        title="Bold"
        active={state?.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </BubbleButton>
      <BubbleButton
        title="Italic"
        active={state?.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </BubbleButton>
      <BubbleButton
        title="Underline"
        active={state?.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-4" />
      </BubbleButton>
      <BubbleButton
        title="Strikethrough"
        active={state?.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </BubbleButton>
      <BubbleButton
        title="Inline code"
        active={state?.code}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="size-4" />
      </BubbleButton>

      <Divider />

      <BubbleButton
        title="Heading 1"
        active={state?.h1}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="size-4" />
      </BubbleButton>
      <BubbleButton
        title="Heading 2"
        active={state?.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </BubbleButton>

      <Divider />

      <BubbleButton title="Link" active={state?.link} onClick={setLink}>
        <LinkIcon className="size-4" />
      </BubbleButton>
      {state?.link && (
        <BubbleButton
          title="Remove link"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Link2Off className="size-4" />
        </BubbleButton>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7 cursor-pointer"
            title="Text color"
          >
            <Palette className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-5 gap-1">
            {EDITOR_COLORS.map((c) => (
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
    </BubbleMenu>
  )
}
