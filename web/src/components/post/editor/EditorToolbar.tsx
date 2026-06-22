import { ArrowLeft, PanelLeftIcon, PanelRightIcon, Save, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditorToolbarProps {
  isEdit: boolean
  postStatus?: string
  saving: boolean
  onBack: () => void
  onToggleLeft: () => void
  onToggleRight: () => void
  onSaveDraft: () => void
  onPublish: () => void
}

export function EditorToolbar({
  isEdit,
  postStatus,
  saving,
  onBack,
  onToggleLeft,
  onToggleRight,
  onSaveDraft,
  onPublish,
}: EditorToolbarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-1 border-b bg-background px-2">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="rounded-sm"
        >
          <ArrowLeft className="text-muted-foreground" />
          Back
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onToggleLeft}
          className="rounded-sm"
          aria-label="Toggle left panel"
        >
          <PanelLeftIcon className="text-muted-foreground" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onToggleRight}
          aria-label="Toggle right panel"
          className="rounded-sm"
        >
          <PanelRightIcon className="text-muted-foreground" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          disabled={saving}
          className="rounded-sm"
        >
          <Save className="text-muted-foreground" />
          Save
        </Button>

        {(!isEdit || postStatus !== "published") && (
          <Button
            size="sm"
            onClick={onPublish}
            disabled={saving}
            className="rounded-sm"
          >
            <Send className="text-muted-foreground" />
            Publish
          </Button>
        )}
      </div>
    </div>
  )
}
