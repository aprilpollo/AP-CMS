import { useTimeout } from "@/hooks"
import { useState } from "react"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"
import { LoaderCircle } from "lucide-react"
import clsx from "clsx"

export type LoadingProps = {
  delay?: number
  className?: string
}

/**
 * Loading displays a moon-themed loading animation with an optional delay
 */
function Loading(props: LoadingProps) {
  const { delay = 0, className } = props
  const [showLoading, setShowLoading] = useState(!delay)

  useTimeout(() => {
    setShowLoading(true)
  }, delay)

  return (
    <div
      id="splash-screen"
      className={clsx(className, !showLoading ? "hidden" : "")}
    >
      <div className="flex h-60 flex-col items-center justify-center">
        <TextHoverEffect text="AP-CMS" automatic/>
        <span className="text-md text-muted-foreground flex items-center gap-1"><LoaderCircle className="animate-spin size-4"/> Loading ...</span>
      </div>
    </div>
  )
}

export default Loading
