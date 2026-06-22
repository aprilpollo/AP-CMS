import { History, ImageUp, NotebookPen, Pencil, Trash2 } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StatusBadge } from "@/lib/cms"
import { cn } from "@/lib/utils"
import { RevisionsPanel } from "@/components/post/editor/RevisionsPanel"
import { format } from "date-fns"
import type { Media, Post } from "@/types/cms"
import MediaPickerDialog from "@/components/media/MediaPickerDialog"

interface RightPanelProps {
  open: boolean
  isEdit: boolean
  post?: Post
  changing: boolean
  pickerOpen: boolean
  onPickerOpenChange: (open: boolean) => void
  onPicked: (media: Media) => void
  featured?: string
  onPickFeatured: () => void
  onSetStatus: (status: string) => void
  onDelete: () => void
  onRestored: (p: Post) => void
}

export function RightPanel({
  open,
  isEdit,
  post,
  changing,
  pickerOpen,
  onPickerOpenChange,
  onPicked,
  featured,
  onPickFeatured,
  onSetStatus,
  onDelete,
  onRestored,
}: RightPanelProps) {
  return (
    <>
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={onPickerOpenChange}
        onSelect={onPicked}
      />
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
            <TabsTrigger
              value="revisions"
              className="cursor-pointer justify-start"
            >
              <History />
              Revisions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="post" className="space-y-2 px-2">
            <div className="space-y-2 pb-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Status & Visibility
              </p>
              {isEdit && post ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Status
                    </span>
                    <StatusBadge status={post.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Published
                    </span>
                    <Badge variant="outline" className="rounded-sm">
                      {post.published_at
                        ? format(new Date(post.published_at), "PPpp")
                        : "Not published"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Slug
                    </span>
                    <Badge variant="outline" className="rounded-sm">
                      {post.slug}
                      <Pencil className="text-muted-foreground" />
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Format
                    </span>
                    <Badge variant="outline" className="rounded-sm capitalize">
                      {post.content_format}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Author
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={post.author?.avatar_url ?? "#"}
                            alt={post.author?.id}
                          />
                          <AvatarFallback>
                            {post.author?.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{post.author?.display_name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-2">
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
            <div className="border-b" />
            <div className="space-y-2 pb-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Featured Image
              </p>
              {featured ? (
                <div className="group relative overflow-hidden rounded-md border aspect-video">
                  <img
                    src={featured}
                    alt="Featured"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={onPickFeatured}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-32 w-full aspect-video"
                  onClick={onPickFeatured}
                >
                  <ImageUp className="text-muted-foreground" />
                  Set featured image
                </Button>
              )}
            </div>
            <div className="border-b" />
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="categories">
                <AccordionTrigger>Categories</AccordionTrigger>
                <AccordionContent>
                  You can organize your posts into different categories to make
                  them easier to find.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="tags">
                <AccordionTrigger>Tags</AccordionTrigger>
                <AccordionContent>
                  You can add tags to your posts to help with organization and
                  searchability.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
    </>
  )
}
