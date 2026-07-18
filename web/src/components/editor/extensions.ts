import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import { TableKit } from "@tiptap/extension-table"
import { TextStyle, FontSize, Color } from "@tiptap/extension-text-style"
import ResizableImage from "./ResizableImage"
import type { AnyExtension } from "@tiptap/react"

/**
 * Shared extension set for the post rich-text editor. Kept in one place so the
 * editor, toolbar, and bubble menu all operate on the same schema.
 */
export function createEditorExtensions(placeholder?: string): AnyExtension[] {
  return [
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
  ]
}
