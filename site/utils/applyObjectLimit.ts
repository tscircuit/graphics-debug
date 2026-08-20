export const applyObjectLimit = <T extends Record<string, any[]>>(
  buckets: T,
  renderOrder: ReadonlyArray<keyof T & string>,
  limit: number | undefined,
): T => {
  if (!limit || limit <= 0) return buckets

  let total = 0
  for (const key of renderOrder) total += buckets[key]?.length ?? 0
  if (total <= limit) return buckets

  const result = { ...buckets }
  for (const key of renderOrder) (result as any)[key] = []

  let budget = limit
  for (let i = renderOrder.length - 1; i >= 0; i--) {
    if (budget <= 0) break
    const key = renderOrder[i]
    const arr = buckets[key] ?? []
    if (arr.length <= budget) {
      ;(result as any)[key] = arr
      budget -= arr.length
    } else {
      ;(result as any)[key] = arr.slice(-budget)
      budget = 0
    }
  }
  return result
}
