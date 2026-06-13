import { useRef, type MouseEvent as ReactMouseEvent } from "react"
import Image from "@tiptap/extension-image"
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react"
import { GripVertical } from "lucide-react"

function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const width = node.attrs.width as number | null
  const align = node.attrs.align as string | null

  const startResize = (e: ReactMouseEvent, side: "left" | "right") => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = imgRef.current?.offsetWidth ?? 0

    const onMove = (ev: globalThis.MouseEvent) => {
      const dx = ev.clientX - startX
      const next = Math.max(
        40,
        Math.round(startWidth + (side === "right" ? dx : -dx))
      )
      updateAttributes({ width: next })
    }
    const onUp = () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  return (
    <NodeViewWrapper
      className="resizable-image"
      data-selected={selected ? "true" : undefined}
      data-align={align ?? undefined}
    >
      {/* Always present so the node stays draggable even after selection is lost. */}
      <div
        className="ri-drag"
        data-drag-handle
        contentEditable={false}
        title="Drag to move"
      >
        <GripVertical className="size-4" />
      </div>
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt ?? ""}
        title={node.attrs.title ?? ""}
        draggable={false}
        style={{ width: width ? `${width}px` : undefined }}
      />
      {selected && (
        <>
          <span
            className="ri-handle ri-left"
            onMouseDown={(e) => startResize(e, "left")}
          />
          <span
            className="ri-handle ri-right"
            onMouseDown={(e) => startResize(e, "right")}
          />
        </>
      )}
    </NodeViewWrapper>
  )
}

/** Image extension with a `width` attribute + drag-to-resize handles. */
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const w = el.getAttribute("width")
          if (w) return parseInt(w, 10)
          const styleWidth = (el as HTMLElement).style?.width
          return styleWidth ? parseInt(styleWidth, 10) : null
        },
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      align: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-align"),
        renderHTML: (attrs) =>
          attrs.align ? { "data-align": attrs.align } : {},
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },
})

export default ResizableImage
