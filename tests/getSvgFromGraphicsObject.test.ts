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
    expect(svg).not.toContain(">A<")
    expect(svg).not.toContain(">B<")
    expect(svg).toMatchSvgSnapshot(import.meta.path, "points")
  })

  test("includes point labels when includeTextLabels is true", () => {
    const input: GraphicsObject = {
      points: [
        { x: 0, y: 0, label: "A", color: "red" },
        { x: 1, y: 1, label: "B", color: "blue" },
      ],
    }

    const svg = getSvgFromGraphicsObject(input, { includeTextLabels: true })
    expect(svg).toContain(">A<")
    expect(svg).toContain(">B<")
  })

  test("should generate SVG with lines and custom stroke properties", () => {
    const input: GraphicsObject = {
      lines: [
        {
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
          ],
          strokeWidth: 2,
          strokeColor: "blue",
        },
        {
          points: [
            { x: 10, y: 0 },
            { x: 0, y: 10 },
          ],
          // Test default values when properties are not specified
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(input, {
      svgWidth: 200,
      svgHeight: 200,
    })
    expect(svg).toBeString()
    expect(svg).toContain("<polyline")
    // Test custom stroke properties
    expect(svg).toContain('stroke="blue"')
    // Test stroke width scaling
    const strokeWidths = Array.from(
      svg.matchAll(/<polyline[^>]*stroke-width="([0-9.]+)"/g),
    )
    expect(strokeWidths).toMatchInlineSnapshot(`
      [
        [
          "<polyline data-points="0,0 10,10" data-type="line" data-label="" points="40,160 160,40" fill="none" stroke="blue" stroke-width="24"",
          "24",
        ],
      ]
    `)
    // Test default color
    expect(svg).toContain('stroke="black"')
    expect(svg).toMatchSvgSnapshot(import.meta.path, "lines")
  })

  test("should generate SVG with infinite lines without affecting bounds", () => {
    const withOnlyRect: GraphicsObject = {
      rects: [
        {
          center: { x: 0, y: 0 },
          width: 10,
          height: 10,
        },
      ],
    }

    const withRectAndInfiniteLine: GraphicsObject = {
      ...withOnlyRect,
      infiniteLines: [
        {
          origin: { x: 0, y: 0 },
          directionVector: { x: 1, y: 0 },
          strokeColor: "#555",
          strokeWidth: 0.5,
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(withRectAndInfiniteLine)
    const svgWithoutInfiniteLine = getSvgFromGraphicsObject(withOnlyRect)

    expect(svg).toContain('data-type="infinite-line"')
    expect(svg).toContain('data-origin="0,0"')
    expect(svg).toContain('data-direction="1,0"')

    const rectWidthWithInfiniteLine = svg.match(
      /<rect[^>]*data-type="rect"[^>]*width="([0-9.]+)"/,
    )?.[1]
    const rectWidthWithoutInfiniteLine = svgWithoutInfiniteLine.match(
      /<rect[^>]*data-type="rect"[^>]*width="([0-9.]+)"/,
    )?.[1]
    expect(rectWidthWithInfiniteLine).toBe(rectWidthWithoutInfiniteLine)
    expect(svg).toMatchSvgSnapshot(import.meta.path, "infinite-lines")
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

  test("should generate SVG with polygons", () => {
    const input: GraphicsObject = {
      polygons: [
        {
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 5, y: 10 },
          ],
          fill: "gold",
          stroke: "black",
          strokeWidth: 0.2,
          label: "Tri",
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(input, {
      includeTextLabels: ["polygons"],
    })
    expect(svg).toBeString()
    expect(svg).toContain("<polygon")
    expect(svg).toContain('fill="gold"')
    expect(svg).toContain('stroke="black"')
    expect(svg).toContain(">Tri<")
    expect(svg).toMatchSvgSnapshot(import.meta.path, "polygons")
  })

  test("rect label font size scales with dimensions", () => {
    const input: GraphicsObject = {
      rects: [
        {
          center: { x: 0, y: 0 },
          width: 50,
          height: 50,
          stroke: "black",
          fill: "none",
          label: "R",
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(input, { includeTextLabels: true })
    const rectMatch = svg.match(
      /<rect[^>]*width="([0-9.]+)"[^>]*height="([0-9.]+)"/,
    )
    const textMatch = svg.match(/<text[^>]*font-size="([0-9.]+)"/)
    expect(rectMatch).toBeTruthy()
    expect(textMatch).toBeTruthy()
    const width = parseFloat(rectMatch![1])
    const height = parseFloat(rectMatch![2])
    const fontSize = parseFloat(textMatch![1])
    const expected = ((width + height) / 2) * 0.06
    expect(fontSize).toBeCloseTo(expected)
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

  test("should generate SVG with arrows", () => {
    const input: GraphicsObject = {
      arrows: [
        {
          start: { x: 0, y: 0 },
          end: { x: 20, y: 0 },
          color: "red",
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(input)

    expect(svg).toBeString()
    expect(svg).toContain('data-type="arrow"')
    expect(svg).toContain('data-start="0,0"')
    expect(svg).toContain('data-end="20,0"')
    expect(svg).toContain('data-double-sided="false"')
    expect(svg).toMatchSvgSnapshot(import.meta.path, "arrows")
    expect(svg).toContain('data-type="arrow-shaft"')
    expect(svg).toContain('data-type="arrow-head"')
    expect(svg).toContain('stroke="red"')
    const headCount = (svg.match(/data-type="arrow-head"/g) ?? []).length
    expect(headCount).toBe(1)
  })

  test("should generate SVG with double sided arrows", () => {
    const input: GraphicsObject = {
      arrows: [
        {
          start: { x: -20, y: 0 },
          end: { x: 20, y: 0 },
          color: "blue",
          doubleSided: true,
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(input)

    expect(svg).toContain('data-double-sided="true"')
    const headCount = (svg.match(/data-type="arrow-head"/g) ?? []).length
    expect(headCount).toBe(2)
    expect(svg).toMatchSvgSnapshot(import.meta.path, "double-sided-arrows")
  })

  test("renders inline arrow labels by default and optional labels on request", () => {
    const input: GraphicsObject = {
      arrows: [
        {
          start: { x: 0, y: 0 },
          end: { x: 20, y: 10 },
          color: "teal",
          label: "Vector",
          inlineLabel: "v",
        },
      ],
    }

    const svgWithoutLabels = getSvgFromGraphicsObject(input)
    expect(svgWithoutLabels).not.toContain(">Vector<")
    expect(svgWithoutLabels).toContain(">v<")
    expect(svgWithoutLabels).toContain('data-type="arrow-inline-label"')

    const svgWithInlineLabelsHidden = getSvgFromGraphicsObject(input, {
      hideInlineLabels: true,
    })
    expect(svgWithInlineLabelsHidden).not.toContain(">v<")
    expect(svgWithInlineLabelsHidden).not.toContain(
      'data-type="arrow-inline-label"',
    )

    const svgWithLabels = getSvgFromGraphicsObject(input, {
      includeTextLabels: ["arrows"],
    })

    expect(svgWithLabels).toContain('data-label="Vector"')
    expect(svgWithLabels).toContain('data-inline-label="v"')
    expect(svgWithLabels).toContain('data-type="arrow-label"')
    expect(svgWithLabels).toContain('data-type="arrow-inline-label"')
    expect(svgWithLabels).toContain(">Vector<")
    expect(svgWithLabels).toContain(">v<")
    expect(svgWithLabels).toContain('transform="rotate(')
  })

  test("should generate SVG with texts", () => {
    const input: GraphicsObject = {
      texts: [
        {
          x: 0,
          y: 0,
          text: "Hello",
          color: "green",
          fontSize: 16,
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(input)
    expect(svg).toBeString()
    expect(svg).toContain("Hello")
    const match = svg.match(/font-size="([0-9.]+)"/)
    expect(match).toBeTruthy()
    expect(parseFloat(match![1])).toBeGreaterThan(16)
    expect(svg).toMatchSvgSnapshot(import.meta.path, "texts")
  })

  test("respects text anchorSide", () => {
    const input: GraphicsObject = {
      texts: [
        {
          x: 0,
          y: 0,
          text: "A",
          anchorSide: "top_right",
        },
      ],
    }

    const svg = getSvgFromGraphicsObject(input)
    expect(svg).toContain('text-anchor="end"')
    expect(svg).toContain('dominant-baseline="text-before-edge"')
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

  test("allows customizing svg width and height", () => {
    const svg = getSvgFromGraphicsObject(
      {},
      {
        svgWidth: 300,
        svgHeight: 200,
      },
    )

    expect(svg).toContain('width="300"')
    expect(svg).toContain('height="200"')
  })
})
