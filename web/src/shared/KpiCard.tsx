import { type ComponentType } from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type IconType = ComponentType<{ className?: string }>

/**
 * Headline number for a KPI row. The delta carries an arrow as well as a
 * status colour so it never relies on colour alone.
 */
function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  hint,
}: {
  icon: IconType
  label: string
  value: string
  delta?: number
  hint?: string
}) {
  const positive = (delta ?? 0) >= 0

  return (
    <Card size="sm">
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </div>
        </div>
        <div className="text-2xl leading-none font-semibold tracking-tight">
          {value}
        </div>
        <div className="flex items-center gap-1 text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                positive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive"
              )}
            >
              {positive ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

export default KpiCard
