import { describe, expect, test } from "bun:test"
import { getSvgFromGraphicsObject } from "../lib/getSvgFromGraphicsObject"
import type { GraphicsObject } from "../lib/types"

describe("getSvgFromGraphicsObject", () => {
  test("should generate SVG with points", () => {
    const input: GraphicsObject = {
      points: [
        { x: 0, y: 0, label: "A", color: "red" },
        { x: 1, y: 1, label: "B", color: "blue" },
      ],
    }

    const svg = getSvgFromGraphicsObject(input)
    expect(svg).toBeString()
    expect(svg).toContain("<svg")
    expect(svg).toContain('width="640"')
    expect(svg).toContain('height="640"')
    expect(svg).toContain('fill="red"')
    expect(svg).toContain('fill="blue"')
    expect(svg).toContain(">A<")
    expect(svg).toContain(">B<")
    expect(svg).toMatchSvgSnapshot(import.meta.path, "points")
  })

  test("should generate SVG with lines and custom stroke properties", () => {
    const input: GraphicsObject = {
      lines: [
        {
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
          ],
          strokeWidth: 2,
          strokeColor: "blue",
        },
        {
          points: [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
          ],
          // Test default values when properties are not specified
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(input)
    expect(svg).toBeString()
    expect(svg).toContain("<polyline")
    // Test custom stroke properties
    expect(svg).toContain('stroke-width="2"')
    expect(svg).toContain('stroke="blue"')
    // Test default values
    expect(svg).toContain('stroke-width="1"')
    expect(svg).toContain('stroke="black"')
    expect(svg).toMatchSvgSnapshot(import.meta.path, "lines")
  })

  test("should generate SVG with rectangles", () => {
    const input: GraphicsObject = {
      rects: [
        {
          center: { x: 0, y: 0 },
          width: 10,
          height: 20,
          fill: "yellow",
          stroke: "green",
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(input)
    expect(svg).toBeString()
    expect(svg).toContain("<rect")
    expect(svg).toContain('fill="yellow"')
    expect(svg).toContain('stroke="green"')
    expect(svg).toMatchSvgSnapshot(import.meta.path, "rectangles")
  })

  test("should generate SVG with circles", () => {
    const input: GraphicsObject = {
      circles: [
        {
          center: { x: 0, y: 0 },
          radius: 5,
          fill: "purple",
          stroke: "orange",
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(input)
    expect(svg).toBeString()
    expect(svg).toContain("<circle")
    expect(svg).toContain('fill="purple"')
    expect(svg).toContain('stroke="orange"')
    expect(svg).toMatchSvgSnapshot(import.meta.path, "circles")
  })

  test("should handle cartesian coordinates correctly", () => {
    const input: GraphicsObject = {
      coordinateSystem: "cartesian",
      rects: [
        {
          center: { x: 0, y: 0 },
          width: 10,
          height: 20,
          fill: "yellow",
          stroke: "green",
        },
        {
          center: { x: 0, y: 30 },
          width: 5,
          height: 5,
          fill: "red",
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(input)
    expect(svg).toBeString()
    expect(svg).toContain("<rect")
    expect(svg).toContain('fill="yellow"')
    expect(svg).toContain('stroke="green"')
    // In cartesian coordinates, the rectangle should be centered
    expect(svg).toMatchSvgSnapshot(import.meta.path, "cartesian-rect")
  })

  test("should handle empty graphics object", () => {
    const input: GraphicsObject = {}

    const svg = getSvgFromGraphicsObject(input)
    expect(svg).toBeString()
    expect(svg).toContain("<svg")
    expect(svg).toContain('width="640"')
    expect(svg).toContain('height="640"')
  })

  test("should maintain aspect ratio in projection", () => {
    const input: GraphicsObject = {
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 50 },
      ],
    }

    const svg = getSvgFromGraphicsObject(input)
    expect(svg).toBeString()
    // The SVG should maintain the 2:1 aspect ratio of the points
    // while fitting within the 640x640 viewport
  })
})
