export function applyObjectLimitToBuckets<
  T extends Record<string, readonly unknown[]>,
>(
  buckets: T,
  objectLimit?: number,
): {
  buckets: { [K in keyof T]: Array<T[K][number]> }
  totalFilteredObjects: number
  isLimitReached: boolean
} {
  const entries = Object.entries(buckets) as Array<[keyof T, readonly unknown[]]>
  const totalFilteredObjects = entries.reduce(
    (total, [, objects]) => total + objects.length,
    0,
  )
  const copyBuckets = () => {
    const copiedBuckets = {} as { [K in keyof T]: Array<T[K][number]> }
    for (const [key, objects] of entries) {
      copiedBuckets[key] = [...objects] as Array<T[typeof key][number]>
    }
    return copiedBuckets
  }

  const limit =
    typeof objectLimit === "number" && Number.isFinite(objectLimit)
      ? Math.max(0, Math.floor(objectLimit))
      : undefined

  if (limit === undefined || totalFilteredObjects <= limit) {
    return {
      buckets: copyBuckets(),
      totalFilteredObjects,
      isLimitReached: false,
    }
  }

  const limitedBuckets = {} as { [K in keyof T]: Array<T[K][number]> }
  let remaining = limit

  for (const [key, objects] of entries) {
    const count = Math.min(objects.length, remaining)
    limitedBuckets[key] = objects.slice(0, count) as Array<
      T[typeof key][number]
    >
    remaining -= count
  }

  return {
    buckets: limitedBuckets,
    totalFilteredObjects,
    isLimitReached: true,
  }
}
