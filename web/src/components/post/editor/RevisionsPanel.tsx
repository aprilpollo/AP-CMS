import { format } from "date-fns"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useListRevisionsQuery, useRestoreRevisionMutation } from "@/store/api/cmsApi"
import { apiError } from "@/utils/apiError"
import type { Post } from "@/types/cms"

export function RevisionsPanel({
  postId,
  onRestored,
}: {
  postId: string
  onRestored: (p: Post) => void
}) {
  const { data: revisions = [], isLoading } = useListRevisionsQuery(postId)
  const [restore, { isLoading: restoring }] = useRestoreRevisionMutation()

  async function doRestore(rid: number) {
    try {
      const p = await restore({ id: postId, rid }).unwrap()
      onRestored(p)
      toast.success("Revision restored")
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>
  if (revisions.length === 0)
    return <p className="text-sm text-muted-foreground">No revisions yet.</p>

  return (
    <div className="space-y-2">
      {revisions.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            #{r.id} · {format(new Date(r.created_at), "MMM d, HH:mm")}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => doRestore(r.id)}
            disabled={restoring}
          >
            <RotateCcw className="size-3" />
            Restore
          </Button>
        </div>
      ))}
    </div>
  )
}
