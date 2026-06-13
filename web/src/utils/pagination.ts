
export function getPageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | null)[] = [1]
  if (current <= 3) {
    for (let i = 2; i <= 4; i++) pages.push(i)
    pages.push(null)
  } else if (current >= total - 2) {
    pages.push(null)
    for (let i = total - 3; i <= total - 1; i++) pages.push(i)
  } else {
    pages.push(null, current - 1, current, current + 1, null)
  }
  pages.push(total)
  return pages
}