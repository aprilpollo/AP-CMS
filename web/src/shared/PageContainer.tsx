import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

function PageContainer({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <main className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 pt-4 md:px-6 md:pt-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className={cn("space-y-4", className)}>{children}</div>
    </main>
  )
}

export default PageContainer
