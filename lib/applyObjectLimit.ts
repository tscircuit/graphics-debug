/**
 * Applies a global `objectLimit` across multiple arrays proportionally.
 *
 * Each array receives a share of the limit proportional to its size, so the
 * total number of objects across all arrays never exceeds `objectLimit`. The
 * last N elements of each array are kept (most-recently-added objects are
 * preferred).
 *
 * @param arrays  The filtered object arrays, one per object type.
 * @param objectLimit  Maximum total objects to display, or undefined for no limit.
 * @returns The same arrays, each potentially sliced to fit within the limit.
 */
export function applyObjectLimit<T>(
  arrays: T[][],
  objectLimit: number | undefined,
): T[][] {
  if (!objectLimit) return arrays
  const total = arrays.reduce((sum, arr) => sum + arr.length, 0)
  if (total <= objectLimit) return arrays

  return arrays.map((arr) => {
    if (arr.length === 0) return arr
    const allocated = Math.max(
      1,
      Math.round((arr.length / total) * objectLimit),
    )
    return arr.slice(-allocated)
  })
}

/**
 * Returns whether the total number of objects across all arrays exceeds the
 * given limit. The count is taken BEFORE any limit is applied.
 */
export function isObjectLimitReached(
  arrays: unknown[][],
  objectLimit: number | undefined,
): boolean {
  if (!objectLimit) return false
  const total = arrays.reduce((sum, arr) => sum + arr.length, 0)
  return total > objectLimit
}
