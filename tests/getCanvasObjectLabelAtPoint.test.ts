import { describe, expect, test } from "bun:test"
import type { GraphicsObject } from "../lib"
import { getCanvasObjectLabelAtPoint } from "../lib/getCanvasObjectLabelAtPoint"
import type { Matrix } from "transformation-matrix"

const identityMatrix = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0,
} as Matrix

describe("getCanvasObjectLabelAtPoint", () => {
  test("prefers topmost points over shapes drawn earlier", () => {
    const graphics: GraphicsObject = {
      rects: [
        {
          center: { x: 0, y: 0 },
          width: 40,
          height: 40,
          label: "Bounding box",
        },
      ],
      points: [{ x: 0, y: 0, label: "Origin" }],
    }

    expect(
      getCanvasObjectLabelAtPoint(graphics, identityMatrix, { x: 0, y: 0 }),
    ).toBe("Origin")
  })

  test("returns the highest z-index line label when lines overlap", () => {
    const graphics: GraphicsObject = {
      lines: [
        {
          points: [
            { x: 0, y: 0 },
            { x: 20, y: 0 },
          ],
          label: "Bottom line",
          zIndex: 0,
        },
        {
          points: [
            { x: 0, y: 0 },
            { x: 20, y: 0 },
          ],
          label: "Top line",
          zIndex: 1,
        },
      ],
    }

    expect(
      getCanvasObjectLabelAtPoint(graphics, identityMatrix, { x: 10, y: 1 }),
    ).toBe("Top line")
  })

  test("detects rect, circle, and polygon hits from clicks inside the shape", () => {
    const graphics: GraphicsObject = {
      rects: [
        {
          center: { x: 10, y: 10 },
          width: 12,
          height: 12,
          label: "Rect label",
        },
      ],
      circles: [{ center: { x: 40, y: 40 }, radius: 8, label: "Circle label" }],
      polygons: [
        {
          points: [
            { x: 70, y: 10 },
            { x: 82, y: 10 },
            { x: 76, y: 24 },
          ],
          label: "Polygon label",
        },
      ],
    }

    expect(
      getCanvasObjectLabelAtPoint(graphics, identityMatrix, { x: 10, y: 10 }),
    ).toBe("Rect label")
    expect(
      getCanvasObjectLabelAtPoint(graphics, identityMatrix, { x: 40, y: 40 }),
    ).toBe("Circle label")
    expect(
      getCanvasObjectLabelAtPoint(graphics, identityMatrix, { x: 76, y: 14 }),
    ).toBe("Polygon label")
  })

  test("detects arrow hits and combines multiline arrow labels", () => {
    const graphics: GraphicsObject = {
      arrows: [
        {
          start: { x: 0, y: 0 },
          end: { x: 24, y: 0 },
          label: "I_out",
          inlineLabel: "v_out",
        },
      ],
    }

    expect(
      getCanvasObjectLabelAtPoint(graphics, identityMatrix, { x: 12, y: 1 }),
    ).toBe("I_out\nv_out")
  })

  test("detects infinite line labels", () => {
    const graphics: GraphicsObject = {
      infiniteLines: [
        {
          origin: { x: 0, y: 0 },
          directionVector: { x: 1, y: 0 },
          label: "X axis",
        },
      ],
    }

    expect(
      getCanvasObjectLabelAtPoint(graphics, identityMatrix, { x: 50, y: 3 }),
    ).toBe("X axis")
  })

  test("returns null when the click misses or the object is unlabeled", () => {
    const graphics: GraphicsObject = {
      points: [{ x: 0, y: 0 }],
      rects: [
        {
          center: { x: 20, y: 20 },
          width: 10,
          height: 10,
          label: "Rect label",
        },
      ],
    }

    expect(
      getCanvasObjectLabelAtPoint(graphics, identityMatrix, { x: 100, y: 100 }),
    ).toBeNull()
  })
})
