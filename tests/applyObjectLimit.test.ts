import { describe, expect, test } from "bun:test"
import { applyObjectLimit } from "site/components/InteractiveGraphics/applyObjectLimit"

describe("applyObjectLimit", () => {
  test("caps objects globally across groups", () => {
    const result = applyObjectLimit(
      [
        [{ id: "line-1" }, { id: "line-2" }, { id: "line-3" }],
        [{ id: "rect-1" }, { id: "rect-2" }],
        [{ id: "point-1" }, { id: "point-2" }],
      ] as const,
      3,
    )

    expect(result.totalObjectCount).toBe(7)
    expect(result.isLimitReached).toBe(true)
    expect(result.groups).toEqual([
      [],
      [{ id: "rect-2" }],
      [{ id: "point-1" }, { id: "point-2" }],
    ])
  })

  test("keeps all objects when the filtered count is within the limit", () => {
    const result = applyObjectLimit(
      [[{ id: "line-1" }], [{ id: "point-1" }]] as const,
      2,
    )

    expect(result.totalObjectCount).toBe(2)
    expect(result.isLimitReached).toBe(false)
    expect(result.groups).toEqual([[{ id: "line-1" }], [{ id: "point-1" }]])
  })

  test("supports a zero limit", () => {
    const result = applyObjectLimit([[{ id: "line-1" }]] as const, 0)

    expect(result.totalObjectCount).toBe(1)
    expect(result.isLimitReached).toBe(true)
    expect(result.groups).toEqual([[]])
  })
})
