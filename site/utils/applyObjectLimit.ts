/**
 * Applies a global object limit across multiple buckets.
 * Takes the last `limit` objects distributed across buckets from the end,
 * filling from the last bucket backwards.
 *
 * Example: buckets = [[L1,L2], [R1,R2,R3]], limit = 3
 *   -> [[L1], [R1,R2,R3]]  (last 3 across all buckets)
 */
export function applyObjectLimit<T extends unknown[]>(
  buckets: T[],
  limit: number,
): T[] {
  if (!limit) {
    return buckets.map(() => [] as unknown as T)
  }

  const total = buckets.reduce((sum, b) => sum + b.length, 0)
  if (total <= limit) return buckets

  let remaining = limit
  const result: T[] = new Array(buckets.length)

  for (let i = buckets.length - 1; i >= 0; i--) {
    const take = Math.min(buckets[i].length, remaining)
    result[i] = take > 0 ? (buckets[i].slice(-take) as T) : ([] as unknown as T)
    remaining -= take
    if (remaining <= 0) {
      for (let j = i - 1; j >= 0; j--) {
        result[j] = [] as unknown as T
      }
      return result
    }
  }

  return result
}
