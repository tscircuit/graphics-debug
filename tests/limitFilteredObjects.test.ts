import { describe, expect, test } from "bun:test"
import {
  type FilteredObjectGroupName,
  filteredObjectGroupOrder,
  limitFilteredObjects,
} from "site/components/InteractiveGraphics/limitFilteredObjects"

const makeObjects = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, originalIndex) => ({
    id: `${prefix}-${originalIndex}`,
    originalIndex,
  }))

const makeGroups = (
  groups: Partial<
    Record<FilteredObjectGroupName, ReturnType<typeof makeObjects>>
  >,
) =>
  Object.fromEntries(
    filteredObjectGroupOrder.map((groupName) => [
      groupName,
      groups[groupName] ?? [],
    ]),
  ) as Record<FilteredObjectGroupName, ReturnType<typeof makeObjects>>

const countObjects = (
  groups: Record<FilteredObjectGroupName, ReturnType<typeof makeObjects>>,
) =>
  filteredObjectGroupOrder.reduce(
    (total, groupName) => total + groups[groupName].length,
    0,
  )

describe("limitFilteredObjects", () => {
  test("enforces objectLimit across all object groups", () => {
    const result = limitFilteredObjects(
      makeGroups({
        arrows: makeObjects("arrow", 2),
        lines: makeObjects("line", 2),
        points: makeObjects("point", 2),
      }),
      3,
    )

    expect(result.totalFilteredObjects).toBe(6)
    expect(result.isLimitReached).toBe(true)
    expect(countObjects(result.groups)).toBe(3)
    expect(result.groups.arrows).toEqual([])
    expect(result.groups.lines.map((object) => object.id)).toEqual(["line-1"])
    expect(result.groups.points.map((object) => object.id)).toEqual([
      "point-0",
      "point-1",
    ])
  })

  test("leaves filtered groups unchanged when the total is within the limit", () => {
    const groups = makeGroups({
      rects: makeObjects("rect", 1),
      circles: makeObjects("circle", 1),
      texts: makeObjects("text", 1),
    })
    const result = limitFilteredObjects(groups, 3)

    expect(result.totalFilteredObjects).toBe(3)
    expect(result.isLimitReached).toBe(false)
    expect(result.groups).toBe(groups)
  })
})
