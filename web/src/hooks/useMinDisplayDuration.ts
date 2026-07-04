import { useEffect, useRef, useState } from "react"

/**
 * Keeps the returned value `true` for at least `minDuration` ms after `loading`
 * first becomes true, even if `loading` flips back to false sooner.
 */
function useMinDisplayDuration(loading: boolean, minDuration: number) {
  const [display, setDisplay] = useState(loading)
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (loading) {
      startedAtRef.current = Date.now()
      setDisplay(true)
      return
    }

    if (startedAtRef.current === null) {
      setDisplay(false)
      return
    }

    const remaining = minDuration - (Date.now() - startedAtRef.current)

    if (remaining <= 0) {
      setDisplay(false)
      return
    }

    const timer = setTimeout(() => setDisplay(false), remaining)
    return () => clearTimeout(timer)
  }, [loading, minDuration])

  return display
}

export default useMinDisplayDuration
