import { describe, expect, test } from "bun:test"
import { sortRectsByArea } from "site/utils/sortRectsByArea"
import type { Rect } from "lib/types"

describe("sortRectsByArea", () => {
  test("orders rectangles so smaller ones come last", () => {
    const rects: Rect[] = [
      { center: { x: 0, y: 0 }, width: 10, height: 10 },
      { center: { x: 0, y: 0 }, width: 5, height: 5 },
      { center: { x: 0, y: 0 }, width: 20, height: 20 },
    ]

    const sorted = sortRectsByArea(rects)
    const areas = sorted.map((r) => r.width * r.height)
    expect(areas).toEqual([400, 100, 25])
  })
})
