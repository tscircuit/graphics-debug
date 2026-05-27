import { describe, expect, test } from "bun:test"
import { applyObjectLimit } from "../site/utils/applyObjectLimit"

describe("applyObjectLimit", () => {
  test("does not limit when objectLimit is undefined", () => {
    const result = applyObjectLimit({
      lines: [1, 2],
      points: [3, 4],
    })

    expect(result.totalObjectCount).toBe(4)
    expect(result.isLimited).toBe(false)
    expect(result.limitedGroups.lines).toEqual([1, 2])
    expect(result.limitedGroups.points).toEqual([3, 4])
  })

  test("applies a global limit across object groups", () => {
    const result = applyObjectLimit(
      {
        lines: ["line-1", "line-2"],
        points: ["point-1", "point-2"],
        rects: ["rect-1"],
      },
      3,
    )

    expect(result.totalObjectCount).toBe(5)
    expect(result.isLimited).toBe(true)
    expect(result.limitedGroups.lines).toEqual(["line-1", "line-2"])
    expect(result.limitedGroups.points).toEqual(["point-1"])
    expect(result.limitedGroups.rects).toEqual([])
  })

  test("supports an objectLimit of zero", () => {
    const result = applyObjectLimit(
      {
        lines: ["line-1"],
        points: ["point-1"],
      },
      0,
    )

    expect(result.totalObjectCount).toBe(2)
    expect(result.isLimited).toBe(true)
    expect(result.limitedGroups.lines).toEqual([])
    expect(result.limitedGroups.points).toEqual([])
  })
})
