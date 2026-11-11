export const normalizeObjectLimit = (objectLimit: number | undefined) => {
  if (objectLimit === undefined || !Number.isFinite(objectLimit)) return null
  return Math.max(0, Math.floor(objectLimit))
}

export const takeObjectLimit = <T extends readonly unknown[][]>(
  objectGroups: T,
  objectLimit: number | null,
): { [K in keyof T]: T[K][number][] } => {
  if (objectLimit === null) {
    return objectGroups.map((group) => [...group]) as {
      [K in keyof T]: T[K][number][]
    }
  }

  let remainingObjects = objectLimit

  return objectGroups.map((group) => {
    if (remainingObjects <= 0) return []

    const limitedGroup = group.slice(0, remainingObjects)
    remainingObjects -= limitedGroup.length

    return limitedGroup
  }) as { [K in keyof T]: T[K][number][] }
}
