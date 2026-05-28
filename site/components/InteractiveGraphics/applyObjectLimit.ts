type LimitedGroups<Groups extends readonly ReadonlyArray<unknown>[]> = {
  [Index in keyof Groups]: Groups[Index] extends ReadonlyArray<infer Item>
    ? Item[]
    : never
}

export const applyObjectLimit = <
  Groups extends readonly ReadonlyArray<unknown>[],
>(
  groups: Groups,
  objectLimit?: number,
): {
  groups: LimitedGroups<Groups>
  totalObjectCount: number
  isLimitReached: boolean
} => {
  const totalObjectCount = groups.reduce(
    (total, group) => total + group.length,
    0,
  )

  if (objectLimit === undefined || !Number.isFinite(objectLimit)) {
    return {
      groups: groups.map((group) => [...group]) as LimitedGroups<Groups>,
      totalObjectCount,
      isLimitReached: false,
    }
  }

  const normalizedLimit = Math.max(0, Math.floor(objectLimit))

  if (totalObjectCount <= normalizedLimit) {
    return {
      groups: groups.map((group) => [...group]) as LimitedGroups<Groups>,
      totalObjectCount,
      isLimitReached: false,
    }
  }

  const limitedGroups = groups.map(() => []) as LimitedGroups<Groups>
  const writableGroups = limitedGroups as unknown as unknown[][]
  let remainingObjects = normalizedLimit

  for (
    let groupIndex = groups.length - 1;
    groupIndex >= 0 && remainingObjects > 0;
    groupIndex--
  ) {
    const group = groups[groupIndex]
    const takeCount = Math.min(group.length, remainingObjects)
    if (takeCount === 0) continue

    writableGroups[groupIndex] = group.slice(group.length - takeCount)
    remainingObjects -= takeCount
  }

  return {
    groups: limitedGroups,
    totalObjectCount,
    isLimitReached: true,
  }
}
