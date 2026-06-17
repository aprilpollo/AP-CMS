import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostsTable } from "@/components/post/table"
import PageContainer from "@/shared/PageContainer"

function PostsListPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState("")
  const [_search, setSearch] = useState("")

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  return (
    <PageContainer
      title="Posts"
      description="Create and manage your posts."
      actions={
        <Button
          onClick={() => navigate("/posts/new")}
          // className="cursor-pointer"
          size="sm"
          variant="outline"
        >
          <Plus className="size-4" />
          New Post
        </Button>
      }
    >
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts…"
            className="pl-8"
          />
        </div>
      </div>
      <PostsTable data={[]} />

      {/* <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              “{toDelete?.title}” will be permanently deleted along with its
              comments, tags and revisions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </PageContainer>
  )
}

export default PostsListPage
