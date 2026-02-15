import { describe, expect, test } from "bun:test"
import { translateGraphics } from "../lib/translateGraphics"
import type { GraphicsObject } from "../lib/types"

describe("translateGraphics", () => {
  test("translates points, lines, infinite lines, rects, circles, arrows, and texts", () => {
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
      infiniteLines: [
        {
          origin: { x: 2, y: 3 },
          directionVector: { x: 0, y: 1 },
        },
      ],
      rects: [{ center: { x: 2, y: 2 }, width: 2, height: 2 }],
      circles: [{ center: { x: 3, y: 3 }, radius: 1 }],
      arrows: [
        {
          start: { x: 2, y: 2 },
          end: { x: 2, y: 7 },
        },
      ],
      texts: [{ x: 4, y: 4, text: "hi" }],
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
      infiniteLines: [
        {
          origin: { x: 7, y: 0 },
          directionVector: { x: 0, y: 1 },
        },
      ],
      rects: [{ center: { x: 7, y: -1 }, width: 2, height: 2 }],
      circles: [{ center: { x: 8, y: 0 }, radius: 1 }],
      arrows: [
        {
          start: { x: 7, y: -1 },
          end: { x: 7, y: 4 },
        },
      ],
      texts: [{ x: 9, y: 1, text: "hi" }],
    })
    // ensure original object was not mutated
    expect(original.points?.[0].x).toBe(1)
    expect(original.lines?.[0].points[0].x).toBe(0)
    expect(original.arrows?.[0].start.x).toBe(2)
  })
})
