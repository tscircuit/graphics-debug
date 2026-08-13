type ObjectBuckets = Record<string, readonly unknown[]>

type LimitedBuckets<TBuckets extends ObjectBuckets> = {
  [TKey in keyof TBuckets]: TBuckets[TKey] extends readonly (infer TItem)[]
    ? TItem[]
    : never
}

export function applyObjectLimit<TBuckets extends ObjectBuckets>(
  buckets: TBuckets,
  objectLimit?: number,
): LimitedBuckets<TBuckets> {
  const bucketKeys = Object.keys(buckets) as Array<keyof TBuckets>
  const limitedBuckets = {} as LimitedBuckets<TBuckets>

  for (const key of bucketKeys) {
    limitedBuckets[key] = [] as unknown as LimitedBuckets<TBuckets>[typeof key]
  }

  if (!objectLimit || objectLimit <= 0) {
    for (const key of bucketKeys) {
      limitedBuckets[key] = [
        ...buckets[key],
      ] as unknown as LimitedBuckets<TBuckets>[typeof key]
    }
    return limitedBuckets
  }

  const allObjects = bucketKeys.flatMap((key) =>
    buckets[key].map((object) => ({ key, object })),
  )

  for (const { key, object } of allObjects.slice(-objectLimit)) {
    ;(limitedBuckets[key] as unknown[]).push(object)
  }

  return limitedBuckets
}
