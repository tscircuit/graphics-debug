import { describe, expect, test } from "bun:test"
import { setStepOfAllObjects } from "../lib/setStepOfAllObjects"
import type { GraphicsObject } from "../lib/types"

describe("setStepOfAllObjects", () => {
  test("sets step on all element types including arrows", () => {
    const graphics: GraphicsObject = {
      points: [{ x: 0, y: 0 }],
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
          origin: { x: 0, y: 0 },
          directionVector: { x: 1, y: 0 },
        },
      ],
      rects: [{ center: { x: 0, y: 0 }, width: 1, height: 1 }],
      circles: [{ center: { x: 0, y: 0 }, radius: 1 }],
      polygons: [
        {
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0.5, y: 1 },
          ],
        },
      ],
      arrows: [
        {
          start: { x: 0, y: 0 },
          end: { x: 5, y: 5 },
          label: "arrow1",
        },
        {
          start: { x: 1, y: 1 },
          end: { x: 3, y: 3 },
          doubleSided: true,
        },
      ],
      texts: [{ x: 0, y: 0, text: "hello" }],
    }

    setStepOfAllObjects(graphics, 3)

    expect(graphics.points![0].step).toBe(3)
    expect(graphics.lines![0].step).toBe(3)
    expect(graphics.infiniteLines![0].step).toBe(3)
    expect(graphics.rects![0].step).toBe(3)
    expect(graphics.circles![0].step).toBe(3)
    expect(graphics.polygons![0].step).toBe(3)
    expect(graphics.arrows![0].step).toBe(3)
    expect(graphics.arrows![1].step).toBe(3)
    expect(graphics.texts![0].step).toBe(3)
  })

  test("handles empty graphics object", () => {
    const graphics: GraphicsObject = {}
    const result = setStepOfAllObjects(graphics, 1)
    expect(result).toEqual({})
  })
})
