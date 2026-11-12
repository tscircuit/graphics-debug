export const filteredObjectGroupOrder = [
  "arrows",
  "infiniteLines",
  "lines",
  "rects",
  "polygons",
  "circles",
  "texts",
  "points",
] as const

export type FilteredObjectGroupName = (typeof filteredObjectGroupOrder)[number]

export type FilteredObjectGroups = Record<FilteredObjectGroupName, unknown[]>

export const limitFilteredObjects = <TGroups extends FilteredObjectGroups>(
  groups: TGroups,
  objectLimit?: number,
): {
  groups: TGroups
  totalFilteredObjects: number
  isLimitReached: boolean
} => {
  const totalFilteredObjects = filteredObjectGroupOrder.reduce(
    (total, groupName) => total + groups[groupName].length,
    0,
  )

  if (!objectLimit || objectLimit <= 0 || totalFilteredObjects <= objectLimit) {
    return { groups, totalFilteredObjects, isLimitReached: false }
  }

  let objectsToDrop = totalFilteredObjects - objectLimit
  const limitedGroups: Partial<FilteredObjectGroups> = {}

  for (const groupName of filteredObjectGroupOrder) {
    const objects = groups[groupName]
    const dropCount = Math.min(objectsToDrop, objects.length)
    limitedGroups[groupName] =
      dropCount > 0 ? objects.slice(dropCount) : objects
    objectsToDrop -= dropCount
  }

  return {
    groups: limitedGroups as TGroups,
    totalFilteredObjects,
    isLimitReached: true,
  }
}
