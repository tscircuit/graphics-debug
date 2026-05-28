type IndexedObject = { originalIndex: number }

export type ObjectBucketMap = Record<string, IndexedObject[]>

const getNormalizedObjectLimit = (objectLimit?: number): number | null => {
  if (typeof objectLimit !== "number" || !Number.isFinite(objectLimit)) {
    return null
  }

  return Math.max(0, Math.floor(objectLimit))
}

export const applyObjectLimit = <T extends ObjectBucketMap>(
  buckets: T,
  objectLimit?: number,
): {
  buckets: T
  totalFilteredObjects: number
  isLimitReached: boolean
} => {
  const entries = Object.entries(buckets)
  const slots = entries.flatMap(([bucketName, objects]) =>
    objects.map((object) => ({
      key: `${bucketName}:${object.originalIndex}`,
    })),
  )
  const totalFilteredObjects = slots.length
  const normalizedLimit = getNormalizedObjectLimit(objectLimit)

  if (normalizedLimit === null || totalFilteredObjects <= normalizedLimit) {
    return { buckets, totalFilteredObjects, isLimitReached: false }
  }

  const firstAllowedIndex = totalFilteredObjects - normalizedLimit
  const allowedKeys = new Set(
    slots.slice(firstAllowedIndex).map((slot) => slot.key),
  )
  const limitedBuckets = Object.fromEntries(
    entries.map(([bucketName, objects]) => [
      bucketName,
      objects.filter((object) =>
        allowedKeys.has(`${bucketName}:${object.originalIndex}`),
      ),
    ]),
  ) as T

  return {
    buckets: limitedBuckets,
    totalFilteredObjects,
    isLimitReached: true,
  }
}
