import { useEffect } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import { createEditorExtensions } from "./extensions"
import { SelectionBubbleMenu } from "./SelectionBubbleMenu"
import { BlockDragHandle } from "./BlockDragHandle"

// Re-exported so existing imports (e.g. LeftPanel) keep working.
export { Toolbar } from "./Toolbar"

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  onPickImage?: () => Promise<string | null>
  onEditorReady?: (editor: Editor | null) => void
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
  onEditorReady,
}: Props) {
  const editor = useEditor({
    extensions: createEditorExtensions(placeholder),
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[360px] pl-6 pr-2 py-2",
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
  }, [value, editor])

  return (
    <div className="relative">
      {editor && <SelectionBubbleMenu editor={editor} />}
      {editor && <BlockDragHandle editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor
