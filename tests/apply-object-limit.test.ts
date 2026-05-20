import { describe, expect, test } from "bun:test"
import { applyObjectLimit } from "site/utils/applyObjectLimit"

describe("applyObjectLimit", () => {
  test("applies one shared limit across object groups", () => {
    const limited = applyObjectLimit(
      {
        lines: ["line-1", "line-2"],
        rects: ["rect-1", "rect-2"],
        points: ["point-1", "point-2"],
      },
      3,
    )

    expect(limited).toEqual({
      lines: [],
      rects: ["rect-2"],
      points: ["point-1", "point-2"],
    })
  })

  test("returns filtered groups unchanged when no limit is set", () => {
    const groups = {
      lines: ["line-1"],
      points: ["point-1", "point-2"],
    }

    expect(applyObjectLimit(groups)).toBe(groups)
  })

  test("supports an explicit zero-object limit", () => {
    expect(
      applyObjectLimit(
        {
          lines: ["line-1"],
          points: ["point-1"],
        },
        0,
      ),
    ).toEqual({
      lines: [],
      points: [],
    })
  })
})
