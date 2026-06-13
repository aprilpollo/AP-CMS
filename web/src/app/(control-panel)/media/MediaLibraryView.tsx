import { useRef, useState } from "react"
import {
  Upload,
  Copy,
  FileText,
  Film,
  File as FileIcon,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiError } from "@/utils/apiError"
import {
  useListMediaQuery,
  useUploadMediaMutation,
  type MediaListParams,
} from "@/store/api/cmsApi"
import type { Media } from "@/types/cms"

const LIMIT = 24

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

function MediaThumb({ m }: { m: Media }) {
  if (m.mime_type.startsWith("image/")) {
    return (
      <img
        src={m.url}
        alt={m.alt_text ?? m.original_name}
        loading="lazy"
        className="aspect-square w-full rounded-t-md object-cover"
      />
    )
  }
  const Icon = m.mime_type.startsWith("video/")
    ? Film
    : m.mime_type === "application/pdf"
      ? FileText
      : FileIcon
  return (
    <div className="flex aspect-square w-full items-center justify-center rounded-t-md bg-muted">
      <Icon className="size-10 text-muted-foreground" />
    </div>
  )
}

function MediaLibraryView({ onSelect }: { onSelect?: (m: Media) => void }) {
  const [mime, setMime] = useState("all")
  const [page, setPage] = useState(1)
  const fileRef = useRef<HTMLInputElement>(null)
  const [upload, { isLoading: uploading }] = useUploadMediaMutation()

  const params: MediaListParams = {
    _limit: LIMIT,
    _offset: (page - 1) * LIMIT,
  }
  if (mime !== "all") params.mime_type = mime

  const { data, isFetching } = useListMediaQuery(params)
  const items = data?.items ?? []
  const total = data?.pagination?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / LIMIT))

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    let ok = 0
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append("file", file)
      try {
        await upload(fd).unwrap()
        ok++
      } catch (e) {
        toast.error(`${file.name}: ${apiError(e)}`)
      }
    }
    if (ok) toast.success(`Uploaded ${ok} file${ok > 1 ? "s" : ""}`)
    if (fileRef.current) fileRef.current.value = ""
    setPage(1)
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
    toast.success("URL copied")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select
          value={mime}
          onValueChange={(v) => {
            setMime(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All files</SelectItem>
            <SelectItem value="image/*">Images</SelectItem>
            <SelectItem value="application/pdf">PDF</SelectItem>
            <SelectItem value="video/*">Video</SelectItem>
          </SelectContent>
        </Select>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          {isFetching ? "Loading…" : "No media yet. Upload to get started."}
        </div>
      ) : (
        <ScrollArea className="h-[60vh]" ScrollBarProps={{ className: "hidden" }}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-md border">
                <button
                  type="button"
                  className="block w-full"
                  onClick={() => (onSelect ? onSelect(m) : copyUrl(m.url))}
                  title={onSelect ? "Select" : "Copy URL"}
                >
                  <MediaThumb m={m} />
                </button>
                <div className="space-y-1 p-2">
                  <p
                    className="truncate text-xs font-medium"
                    title={m.original_name}
                  >
                    {m.original_name}
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[10px] text-muted-foreground">
                      {formatBytes(m.size_bytes)}
                      {m.width && m.height ? ` · ${m.width}×${m.height}` : ""}
                    </span>
                    {onSelect ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => onSelect(m)}
                      >
                        Select
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1.5"
                        onClick={() => copyUrl(m.url)}
                        title="Copy URL"
                      >
                        <Copy className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        </ScrollArea>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} file{total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <span>
            Page {page} of {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MediaLibraryView
