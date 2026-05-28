type ObjectGroups = Record<string, readonly unknown[]>

export const normalizeObjectLimit = (
  objectLimit?: number,
): number | undefined => {
  if (objectLimit === undefined || !Number.isFinite(objectLimit)) {
    return undefined
  }

  return Math.max(0, Math.floor(objectLimit))
}

export const applyObjectLimit = <TGroups extends ObjectGroups>(
  groups: TGroups,
  objectLimit?: number,
): TGroups => {
  const limit = normalizeObjectLimit(objectLimit)
  if (limit === undefined) {
    return groups
  }

  let remaining = limit
  const entries = Object.entries(groups) as [
    keyof TGroups,
    TGroups[keyof TGroups],
  ][]
  const limitedGroups = {} as TGroups

  for (let index = entries.length - 1; index >= 0; index--) {
    const [key, objects] = entries[index]
    const keepCount = Math.min(objects.length, remaining)
    limitedGroups[key] = objects.slice(
      objects.length - keepCount,
    ) as unknown as TGroups[typeof key]
    remaining -= keepCount
  }

  return limitedGroups
}
