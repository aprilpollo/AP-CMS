import { useRef, type RefObject } from "react"
import { Hammer, Images, LayoutGrid, Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toolbar } from "@/components/editor/RichTextEditor"
import { cn } from "@/lib/utils"
import type { Editor } from "@tiptap/react"
import type { Media } from "@/types/cms"

interface LeftPanelProps {
  open: boolean
  editor: Editor | null
  mediaItems: Media[]
  uploading: boolean
  fileRef: RefObject<HTMLInputElement | null>
  onUpload: (files: FileList | null) => void
  setMime: (mime: string) => void
  hasMore: boolean
  loadingMedia: boolean
  onLoadMore: () => void
}

export function LeftPanel({
  open,
  editor,
  mediaItems,
  uploading,
  fileRef,
  onUpload,
  setMime,
  hasMore,
  loadingMedia,
  onLoadMore,
}: LeftPanelProps) {
  const hasMoreRef = useRef(hasMore)
  const loadingRef = useRef(loadingMedia)
  const onLoadMoreRef = useRef(onLoadMore)

  hasMoreRef.current = hasMore
  loadingRef.current = loadingMedia
  onLoadMoreRef.current = onLoadMore

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (
      scrollHeight - scrollTop - clientHeight < 80 &&
      hasMoreRef.current &&
      !loadingRef.current
    ) {
      onLoadMoreRef.current()
    }
  }

  return (
    <aside
      className={cn(
        "shrink-0 overflow-hidden border-r bg-background transition-[width] duration-100 ease-linear",
        open ? "w-72" : "w-0"
      )}
    >
      <Tabs defaultValue="tools">
        <TabsList className="min-h-10 w-full border-b" variant="line">
          <TabsTrigger value="tools" className="cursor-pointer justify-start">
            <Hammer />
            Tools
          </TabsTrigger>
          <TabsTrigger
            value="patterns"
            className="cursor-pointer justify-start"
          >
            <LayoutGrid />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="media" className="cursor-pointer justify-start">
            <Images />
            Media
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="px-2">
          {editor && <Toolbar editor={editor} />}
        </TabsContent>

        <TabsContent value="patterns" className="px-2">
          Use predefined patterns to speed up your workflow.
        </TabsContent>

        <TabsContent value="media" className="space-y-2">
          <div className="relative w-full px-2">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search media…" className="pl-8" />
          </div>
          <div className="grid grid-cols-2 gap-2 px-2">
            <Select defaultValue="all" onValueChange={setMime}>
              <SelectTrigger size="sm" className="w-full cursor-pointer">
                <SelectValue placeholder="Select mime type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Mime Types</SelectLabel>
                  <SelectItem value="all" className="cursor-pointer">
                    All
                  </SelectItem>
                  <SelectItem value="image/png" className="cursor-pointer">
                    PNG
                  </SelectItem>
                  <SelectItem value="image/jpeg" className="cursor-pointer">
                    JPEG
                  </SelectItem>
                  <SelectItem value="image/gif" className="cursor-pointer">
                    GIF
                  </SelectItem>
                  <SelectItem value="image/webp" className="cursor-pointer">
                    WEBP
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              <Upload />
              Upload
            </Button>
          </div>
          <ScrollArea
            className="h-[calc(100dvh-220px)]"
            onViewportScroll={handleScroll}
          >
            <div className="grid grid-cols-2 gap-2 px-2">
              {mediaItems.map((m) => (
                <div
                  key={m.id}
                  className="aspect-square cursor-pointer overflow-hidden rounded-md border bg-muted active:cursor-move"
                >
                  <img
                    src={m.url}
                    alt={m.original_name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            {loadingMedia && (
              <div className="flex justify-center py-2">
                <span className="text-xs text-muted-foreground">Loading…</span>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
