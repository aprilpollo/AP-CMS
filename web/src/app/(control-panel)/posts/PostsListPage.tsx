import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostsTable } from "@/components/post/table"
import { getPosts } from "@/store/api/post"
import type { Post } from "@/types/cms"
import PageContainer from "@/shared/PageContainer"

function PostsListPage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [searchInput, setSearchInput] = useState("")
  const [_search, setSearch] = useState("")

  const GetPosts = async () => {
    const res = await getPosts()
    const data = (await res.json()) as {
      code: number
      error?: string
      message: string
      payload: Post[]
    }
    if (data.code === 200) {
      setPosts(data.payload)
    }
  }
  useEffect(() => {
    GetPosts()
  }, [])

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
      <PostsTable data={posts} onDeleted={GetPosts} />
    </PageContainer>
  )
}

export default PostsListPage
