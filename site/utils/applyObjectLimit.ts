type ObjectGroups = Record<string, unknown[]>

export function applyObjectLimit<TGroups extends ObjectGroups>(
  groups: TGroups,
  objectLimit?: number,
): {
  limitedGroups: TGroups
  totalObjectCount: number
  isLimited: boolean
} {
  const totalObjectCount = Object.values(groups).reduce(
    (total, objects) => total + objects.length,
    0,
  )
  const shouldLimit = objectLimit !== undefined && objectLimit >= 0

  if (!shouldLimit || totalObjectCount <= objectLimit) {
    return {
      limitedGroups: groups,
      totalObjectCount,
      isLimited: false,
    }
  }

  let remainingObjects = objectLimit
  const limitedGroups = {} as TGroups

  for (const [key, objects] of Object.entries(groups)) {
    const objectCount = Math.min(objects.length, remainingObjects)
    ;(limitedGroups as ObjectGroups)[key] = objects.slice(0, objectCount)
    remainingObjects -= objectCount
  }

  return {
    limitedGroups,
    totalObjectCount,
    isLimited: true,
  }
}
