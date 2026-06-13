import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MediaLibraryView from "@/app/(control-panel)/media/MediaLibraryView"
import type { Media } from "@/types/cms"

function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: Media) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>
            Select an existing file or upload a new one.
          </DialogDescription>
        </DialogHeader>
        <MediaLibraryView onSelect={onSelect} />
      </DialogContent>
    </Dialog>
  )
}

export default MediaPickerDialog
