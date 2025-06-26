import { describe, expect, test } from "bun:test"
import { translateGraphics } from "../lib/translateGraphics"
import type { GraphicsObject } from "../lib/types"

describe("translateGraphics", () => {
  test("translates points, lines, rects and circles", () => {
    const original: GraphicsObject = {
      points: [{ x: 1, y: 1 }],
      lines: [
        {
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
          ],
        },
      ],
      rects: [{ center: { x: 2, y: 2 }, width: 2, height: 2 }],
      circles: [{ center: { x: 3, y: 3 }, radius: 1 }],
    }
    const result = translateGraphics(original, 5, -3)
    expect(result).toEqual({
      points: [{ x: 6, y: -2 }],
      lines: [
        {
          points: [
            { x: 5, y: -3 },
            { x: 6, y: -2 },
          ],
        },
      ],
      rects: [{ center: { x: 7, y: -1 }, width: 2, height: 2 }],
      circles: [{ center: { x: 8, y: 0 }, radius: 1 }],
    })
    // ensure original object was not mutated
    expect(original.points?.[0].x).toBe(1)
    expect(original.lines?.[0].points[0].x).toBe(0)
  })
})
