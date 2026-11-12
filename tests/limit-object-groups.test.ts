import { describe, expect, test } from "bun:test"
import { limitObjectGroups } from "../site/components/InteractiveGraphics/InteractiveGraphics"

describe("limitObjectGroups", () => {
  test("limits objects globally across groups in display order", () => {
    const result = limitObjectGroups(
      {
        lines: [{ id: "line-1" }, { id: "line-2" }],
        rects: [{ id: "rect-1" }, { id: "rect-2" }],
        points: [{ id: "point-1" }],
      },
      3,
    )

    expect(result.totalObjectCount).toBe(5)
    expect(result.isLimitReached).toBe(true)
    expect(result.groups.lines).toEqual([{ id: "line-1" }, { id: "line-2" }])
    expect(result.groups.rects).toEqual([{ id: "rect-1" }])
    expect(result.groups.points).toEqual([])
  })

  test("counts filtered objects before applying the limit", () => {
    const result = limitObjectGroups(
      {
        arrows: [],
        lines: [{ id: "visible-line" }],
        rects: [{ id: "visible-rect" }],
      },
      2,
    )

    expect(result.totalObjectCount).toBe(2)
    expect(result.isLimitReached).toBe(false)
    expect(result.groups.lines).toEqual([{ id: "visible-line" }])
    expect(result.groups.rects).toEqual([{ id: "visible-rect" }])
  })

  test("does not trim for missing or non-positive limits", () => {
    const groups = {
      lines: [{ id: "line-1" }],
      points: [{ id: "point-1" }],
    }

    expect(limitObjectGroups(groups).groups).toEqual(groups)
    expect(limitObjectGroups(groups, 0).groups).toEqual(groups)
    expect(limitObjectGroups(groups, -1).groups).toEqual(groups)
  })
})
