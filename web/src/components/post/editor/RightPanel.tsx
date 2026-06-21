import { History, NotebookPen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/lib/cms"
import { cn } from "@/lib/utils"
import { RevisionsPanel } from "@/components/post/editor/RevisionsPanel"
import type { Post } from "@/types/cms"

interface RightPanelProps {
  open: boolean
  isEdit: boolean
  post?: Post
  changing: boolean
  onSetStatus: (status: string) => void
  onDelete: () => void
  onRestored: (p: Post) => void
}

export function RightPanel({
  open,
  isEdit,
  post,
  changing,
  onSetStatus,
  onDelete,
  onRestored,
}: RightPanelProps) {
  return (
    <aside
      className={cn(
        "shrink-0 overflow-hidden border-l bg-background transition-[width] duration-200 ease-linear",
        open ? "w-72" : "w-0"
      )}
    >
      <Tabs defaultValue="post">
        <TabsList className="min-h-10 w-full border-b" variant="line">
          <TabsTrigger value="post" className="cursor-pointer justify-start">
            <NotebookPen />
            Post
          </TabsTrigger>
          <TabsTrigger value="revisions" className="cursor-pointer justify-start">
            <History />
            Revisions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="post" className="px-2">
          <div className="space-y-2 pb-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Status
            </p>
            {isEdit && post ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current</span>
                  <StatusBadge status={post.status} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {post.status !== "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSetStatus("draft")}
                      disabled={changing}
                    >
                      Set draft
                    </Button>
                  )}
                  {post.status !== "archived" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSetStatus("archived")}
                      disabled={changing}
                    >
                      Archive
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Saved as a draft until you publish.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="revisions" className="px-2">
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Revision History
            </p>
            {isEdit && post ? (
              <RevisionsPanel
                postId={String(post.id)}
                onRestored={onRestored}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Save the post first to see revisions.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
