import { describe, expect, test } from "bun:test"
import { applyObjectLimit } from "site/utils/applyObjectLimit"

describe("applyObjectLimit", () => {
  test("caps objects globally across buckets", () => {
    const limited = applyObjectLimit(
      {
        lines: [{ id: "line-1" }, { id: "line-2" }],
        rects: [{ id: "rect-1" }, { id: "rect-2" }],
        points: [{ id: "point-1" }, { id: "point-2" }],
      },
      3,
    )

    const renderedObjects = [
      ...limited.lines,
      ...limited.rects,
      ...limited.points,
    ].map((object) => object.id)

    expect(renderedObjects).toEqual(["rect-2", "point-1", "point-2"])
    expect(limited.lines).toHaveLength(0)
  })

  test("does not limit objects when objectLimit is omitted", () => {
    const limited = applyObjectLimit({
      lines: [{ id: "line-1" }],
      points: [{ id: "point-1" }],
    })

    expect(limited.lines).toHaveLength(1)
    expect(limited.points).toHaveLength(1)
  })
})
