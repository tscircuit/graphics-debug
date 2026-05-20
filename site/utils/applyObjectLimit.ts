type ObjectGroups = Record<string, readonly unknown[]>

export const applyObjectLimit = <TGroups extends ObjectGroups>(
  groups: TGroups,
  objectLimit?: number,
): TGroups => {
  if (objectLimit === undefined) {
    return groups
  }

  const limit = Math.max(0, objectLimit)
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
    ) as TGroups[typeof key]
    remaining -= keepCount
  }

  return limitedGroups
}
