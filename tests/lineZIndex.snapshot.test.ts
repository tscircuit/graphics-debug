import { expect, test } from "bun:test"
import { getSvgFromGraphicsObject } from "../lib/getSvgFromGraphicsObject"
import type { GraphicsObject } from "../lib/types"

test("renders lines in zIndex order", () => {
  const input: GraphicsObject = {
    lines: [
      {
        points: [
          { x: -4, y: 5 },
          { x: 10, y: 5 },
        ],
        strokeColor: "black",
        strokeWidth: 1,
        zIndex: 10,
        label: "top",
      },
      {
        points: [
          { x: 5, y: -4 },
          { x: 5, y: 10 },
        ],
        strokeColor: "blue",
        strokeWidth: 1,
        zIndex: 0,
        label: "bottom",
      },
    ],
  }

  const svg = getSvgFromGraphicsObject(input, {
    svgWidth: 200,
    svgHeight: 200,
    includeTextLabels: true,
  })

  expect(svg).toMatchSvgSnapshot(import.meta.path, "line-z-index")
})
