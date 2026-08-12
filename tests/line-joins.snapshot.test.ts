import { expect, test } from "bun:test"
import { getSvgFromGraphicsObject } from "../lib/getSvgFromGraphicsObject"
import type { GraphicsObject } from "../lib/types"

test("renders the join of a thick, acute polyline", () => {
  const input: GraphicsObject = {
    lines: [
      {
        points: [
          { x: -1.5, y: 2 },
          { x: 0, y: -2 },
          { x: 1.5, y: 2 },
        ],
        strokeColor: "#2563eb",
        strokeWidth: 0.8,
      },
    ],
  }

  const svg = getSvgFromGraphicsObject(input, {
    svgWidth: 320,
    svgHeight: 240,
  })

  expect(svg).toMatchSvgSnapshot(import.meta.path, "acute-polyline")
})
