/**
 * Global post-filter object limiter for tscircuit/graphics-debug (#42)
 * Applies a single shared `objectLimit` across all 8 filtered graphics object buckets
 * rather than capping each bucket independently.
 */

export interface FilteredGraphicsBuckets<T = unknown> {
  points: T[]
  lines: T[]
  rects: T[]
  circles: T[]
  polygons: T[]
  texts: T[]
  arrows: T[]
  infiniteLines: T[]
}

export interface ObjectLimitResult<T = unknown> {
  buckets: FilteredGraphicsBuckets<T>
  totalPreLimitObjects: number
  displayedObjectsCount: number
  isLimitReached: boolean
}

const BUCKET_ORDER: (keyof FilteredGraphicsBuckets)[] = [
  "points",
  "lines",
  "rects",
  "circles",
  "polygons",
  "texts",
  "arrows",
  "infiniteLines",
]

export function applyObjectLimit<T = unknown>(
  filtered: FilteredGraphicsBuckets<T>,
  objectLimit?: number
): ObjectLimitResult<T> {
  const totalPreLimitObjects = BUCKET_ORDER.reduce(
    (sum, key) => sum + (filtered[key]?.length ?? 0),
    0
  )

  if (
    objectLimit === undefined ||
    objectLimit === null ||
    !Number.isFinite(objectLimit)
  ) {
    return {
      buckets: { ...filtered },
      totalPreLimitObjects,
      displayedObjectsCount: totalPreLimitObjects,
      isLimitReached: false,
    }
  }

  const normalizedLimit = Math.max(0, Math.floor(objectLimit))
  let remaining = normalizedLimit

  const limitedBuckets = {} as FilteredGraphicsBuckets<T>
  for (const key of BUCKET_ORDER) {
    const items = filtered[key] ?? []
    if (remaining <= 0) {
      limitedBuckets[key] = []
    } else if (items.length <= remaining) {
      limitedBuckets[key] = items.slice()
      remaining -= items.length
    } else {
      limitedBuckets[key] = items.slice(0, remaining)
      remaining = 0
    }
  }

  const displayedObjectsCount = BUCKET_ORDER.reduce(
    (sum, key) => sum + limitedBuckets[key].length,
    0
  )

  return {
    buckets: limitedBuckets,
    totalPreLimitObjects,
    displayedObjectsCount,
    isLimitReached: totalPreLimitObjects > normalizedLimit,
  }
}
