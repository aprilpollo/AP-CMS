import { Construction } from "lucide-react"

function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
        <Construction className="size-10 text-muted-foreground" />
        <p className="max-w-md text-sm text-muted-foreground">
          This page is coming soon.
        </p>
      </div>
    </div>
  )
}

export default PlaceholderPage
