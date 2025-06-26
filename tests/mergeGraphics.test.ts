import { describe, expect, test } from "bun:test"
import { mergeGraphics } from "../lib/mergeGraphics"
import type { GraphicsObject } from "../lib/types"

describe("mergeGraphics", () => {
  test("combines rects, points, lines and circles", () => {
    const a: GraphicsObject = {
      points: [{ x: 0, y: 0 }],
      rects: [{ center: { x: 1, y: 1 }, width: 2, height: 2 }],
    }
    const b: GraphicsObject = {
      lines: [
        {
          points: [
            { x: 2, y: 2 },
            { x: 3, y: 3 },
          ],
        },
      ],
      circles: [{ center: { x: 4, y: 4 }, radius: 1 }],
    }
    const merged = mergeGraphics(a, b)
    expect(merged).toEqual({
      points: [{ x: 0, y: 0 }],
      rects: [{ center: { x: 1, y: 1 }, width: 2, height: 2 }],
      lines: [
        {
          points: [
            { x: 2, y: 2 },
            { x: 3, y: 3 },
          ],
        },
      ],
      circles: [{ center: { x: 4, y: 4 }, radius: 1 }],
    })
    // check immutability
    expect(a.lines).toBeUndefined()
    expect(b.points).toBeUndefined()
  })
})
