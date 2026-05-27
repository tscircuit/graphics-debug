import { describe, expect, test } from "bun:test"
import type { GraphicsObject } from "../lib"
import { getFilteredAndLimitedGraphics } from "../site/components/InteractiveGraphics/object-limit"

const createGraphics = (): GraphicsObject => ({
  rects: [
    {
      center: { x: 200, y: 100 },
      width: 50,
      height: 100,
      layer: "layer1",
      step: 0,
    },
    {
      center: { x: 250, y: 100 },
      width: 50,
      height: 100,
      layer: "layer1",
      step: 1,
    },
    {
      center: { x: 300, y: 100 },
      width: 50,
      height: 100,
      layer: "layer1",
      step: 2,
    },
  ],
  points: [
    {
      x: 0,
      y: 0,
      layer: "layer1",
    },
    {
      x: 50,
      y: 0,
      layer: "layer2",
    },
    {
      x: 100,
      y: 0,
      layer: "layer3",
    },
  ],
  circles: [
    {
      center: { x: 400, y: 100 },
      radius: 25,
      fill: "blue",
      stroke: "black",
      layer: "layer1",
      step: 0,
      label: "Circle 1",
    },
  ],
})

describe("getFilteredAndLimitedGraphics", () => {
  test("limits across all object types after filters are applied", () => {
    const graphics = createGraphics()

    const result = getFilteredAndLimitedGraphics(
      graphics,
      {
        lines: () => true,
        infiniteLines: () => true,
        rects: (rect) => rect.layer === "layer1" && rect.step === 0,
        polygons: () => true,
        points: (point) => point.layer === "layer1",
        circles: (circle) => circle.layer === "layer1" && circle.step === 0,
        texts: () => true,
        arrows: () => true,
      },
      3,
    )

    expect(result.totalFilteredObjects).toBe(3)
    expect(result.isLimitReached).toBe(false)
    expect(result.rects).toHaveLength(1)
    expect(result.points).toHaveLength(1)
    expect(result.circles).toHaveLength(1)
  })

  test("enforces a single shared limit across categories using post-filter ordering", () => {
    const graphics = createGraphics()

    const result = getFilteredAndLimitedGraphics(
      graphics,
      {
        lines: () => true,
        infiniteLines: () => true,
        rects: () => true,
        polygons: () => true,
        points: () => true,
        circles: () => true,
        texts: () => true,
        arrows: () => true,
      },
      3,
    )

    expect(result.totalFilteredObjects).toBe(7)
    expect(result.isLimitReached).toBe(true)
    expect(result.rects).toHaveLength(0)
    expect(result.points.map((point) => point.originalIndex)).toEqual([1, 2])
    expect(result.circles.map((circle) => circle.originalIndex)).toEqual([0])
  })
})
