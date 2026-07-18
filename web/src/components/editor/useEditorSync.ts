import { useEffect, useReducer } from "react"
import type { Editor } from "@tiptap/react"

/**
 * Re-renders the calling component whenever the editor state changes, so that
 * active/disabled states of toolbar and bubble-menu buttons stay in sync.
 */
export function useEditorSync(editor: Editor | null) {
  const [, force] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    if (!editor) return
    const handle = () => queueMicrotask(force)
    editor.on("transaction", handle)
    editor.on("selectionUpdate", handle)
    return () => {
      editor.off("transaction", handle)
      editor.off("selectionUpdate", handle)
    }
  }, [editor])
}
