import { describe, expect, test } from "bun:test"
import {
  normalizeObjectLimit,
  takeObjectLimit,
} from "site/components/InteractiveGraphics/object-limit"

describe("InteractiveGraphics objectLimit", () => {
  test("applies one object budget across render groups", () => {
    const [arrows, lines, rects] = takeObjectLimit(
      [["arrow-1", "arrow-2"], ["line-1", "line-2"], ["rect-1"]] as const,
      3,
    )

    expect(arrows).toEqual(["arrow-1", "arrow-2"])
    expect(lines).toEqual(["line-1"])
    expect(rects).toEqual([])
  })

  test("counts zero as a real limit", () => {
    const [points] = takeObjectLimit([["point-1"]] as const, 0)

    expect(points).toEqual([])
  })

  test("leaves all groups unchanged when no limit is provided", () => {
    const [points, circles] = takeObjectLimit(
      [["point-1"], ["circle-1"]] as const,
      null,
    )

    expect(points).toEqual(["point-1"])
    expect(circles).toEqual(["circle-1"])
  })

  test("normalizes fractional and invalid limits", () => {
    expect(normalizeObjectLimit(2.9)).toBe(2)
    expect(normalizeObjectLimit(-1)).toBe(0)
    expect(normalizeObjectLimit(Number.NaN)).toBe(null)
    expect(normalizeObjectLimit(undefined)).toBe(null)
  })
})
