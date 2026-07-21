import { type ComponentType } from "react"
import { Card, CardContent } from "@/components/ui/card"

type IconType = ComponentType<{ className?: string }>

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType
  label: string
  value: number | string
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-semibold leading-none tracking-tight">
            {value}
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard
