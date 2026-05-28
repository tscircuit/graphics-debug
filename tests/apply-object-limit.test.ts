import { describe, expect, test } from "bun:test"
import {
  applyObjectLimit,
  normalizeObjectLimit,
} from "site/utils/applyObjectLimit"

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

  test("carries unused budget to earlier groups", () => {
    const limited = applyObjectLimit(
      {
        lines: ["line-1", "line-2"],
        rects: ["rect-1"],
        points: [],
      },
      2,
    )

    expect(limited).toEqual({
      lines: ["line-2"],
      rects: ["rect-1"],
      points: [],
    })
  })

  test("preserves every group key after the budget is consumed", () => {
    const limited = applyObjectLimit(
      {
        lines: ["line-1"],
        rects: ["rect-1"],
        points: ["point-1"],
      },
      1,
    )

    expect(limited).toEqual({
      lines: [],
      rects: [],
      points: ["point-1"],
    })
  })

  test("treats negative limits as zero", () => {
    expect(
      applyObjectLimit(
        {
          lines: ["line-1"],
          points: ["point-1"],
        },
        -1,
      ),
    ).toEqual({
      lines: [],
      points: [],
    })
  })

  test("floors fractional limits before slicing groups", () => {
    expect(
      applyObjectLimit(
        {
          lines: ["line-1", "line-2"],
          points: ["point-1", "point-2"],
        },
        2.9,
      ),
    ).toEqual({
      lines: [],
      points: ["point-1", "point-2"],
    })
  })

  test("ignores non-finite limits", () => {
    const groups = {
      lines: ["line-1"],
      points: ["point-1"],
    }

    expect(applyObjectLimit(groups, Number.NaN)).toBe(groups)
    expect(applyObjectLimit(groups, Number.POSITIVE_INFINITY)).toBe(groups)
  })

  test("normalizes finite limits for UI messages", () => {
    expect(normalizeObjectLimit(undefined)).toBeUndefined()
    expect(normalizeObjectLimit(Number.NaN)).toBeUndefined()
    expect(normalizeObjectLimit(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(normalizeObjectLimit(-4)).toBe(0)
    expect(normalizeObjectLimit(3.9)).toBe(3)
  })
})
