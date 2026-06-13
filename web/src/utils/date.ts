


export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "--/--/----"

  const date = new Date(dateString)
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(date)

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? ""
  const day = parts.find((part) => part.type === "day")?.value ?? ""
  const month = parts.find((part) => part.type === "month")?.value ?? ""
  const year = parts.find((part) => part.type === "year")?.value ?? ""

  return `${weekday} ${day} ${month} ${year}`.trim()
}

export const formatDatev2 = (dateString: string | Date | undefined) => {
  if (!dateString) return "--/--/----"

  const date = new Date(dateString)
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(date)

  // const weekday = parts.find((part) => part.type === "weekday")?.value ?? ""
  const day = parts.find((part) => part.type === "day")?.value ?? ""
  const month = parts.find((part) => part.type === "month")?.value ?? ""
  const year = parts.find((part) => part.type === "year")?.value ?? ""

  return `${month} ${day} ${year}`.trim()
}

export function toDateTimeStringFromUnixMs(unixMs: number): string {
  const date = new Date(unixMs)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hour}:${minute}`
}