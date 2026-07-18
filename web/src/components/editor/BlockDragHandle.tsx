import { useRef } from "react"
import { DragHandle } from "@tiptap/extension-drag-handle-react"
import type { Editor } from "@tiptap/react"
import type { Node } from "@tiptap/pm/model"
import { Copy, GripVertical, Trash2, Eraser } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

/**
 * Notion-style drag handle: hover a block to reveal a grip in the left gutter.
 * Drag it to reorder blocks; right-click it for quick block actions.
 *
 * The grip is left as a plain draggable element (Tiptap sets `draggable` on the
 * portal wrapper). Actions live on a right-click context menu instead of a
 * click dropdown, so opening the menu never swallows the drag gesture.
 */
export function BlockDragHandle({ editor }: { editor: Editor }) {
  const current = useRef<{ node: Node | null; pos: number }>({
    node: null,
    pos: 0,
  })

  const withNode = (fn: (node: Node, pos: number) => void) => {
    const { node, pos } = current.current
    if (!node) return
    fn(node, pos)
  }

  const duplicate = () =>
    withNode((node, pos) =>
      editor
        .chain()
        .focus()
        .insertContentAt(pos + node.nodeSize, node.toJSON())
        .run()
    )

  const remove = () =>
    withNode((node, pos) =>
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .run()
    )

  const clearFormat = () =>
    withNode((node, pos) =>
      editor
        .chain()
        .focus()
        .setTextSelection({ from: pos + 1, to: pos + node.nodeSize - 1 })
        .unsetAllMarks()
        .setParagraph()
        .run()
    )

  return (
    <DragHandle
      editor={editor}
      onNodeChange={({ node, pos }) => {
        current.current = { node, pos }
      }}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            role="button"
            aria-label="Drag to move · right-click for actions"
            title="Drag to move · right-click for actions"
            className="flex h-6 w-5 cursor-grab items-center justify-center rounded text-muted-foreground/60 hover:bg-muted hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={duplicate}>
            <Copy className="size-4" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem onSelect={clearFormat}>
            <Eraser className="size-4" />
            Clear format
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" onSelect={remove}>
            <Trash2 className="size-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DragHandle>
  )
}
