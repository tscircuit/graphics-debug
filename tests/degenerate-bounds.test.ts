import { describe, expect, test } from "bun:test"
import { decode } from "fast-png"
import { JSDOM } from "jsdom"
import { applyToPoint } from "transformation-matrix"
import {
  computeTransformFromViewbox,
  getBounds,
} from "../lib/drawGraphicsToCanvas"
import { getPngBufferFromGraphicsObject } from "../lib/getPngBufferFromGraphicsObject"
import { getSvgFromGraphicsObject } from "../lib/getSvgFromGraphicsObject"
import type { GraphicsObject } from "../lib/types"

const width = 320
const height = 200
const center = { x: 17, y: -23 }

const cases: { name: string; graphics: GraphicsObject }[] = [
  { name: "single point", graphics: { points: [center] } },
  {
    name: "vertical line",
    graphics: {
      lines: [
        {
          points: [
            { x: 17, y: -24 },
            { x: 17, y: -22 },
          ],
        },
      ],
    },
  },
  {
    name: "horizontal line",
    graphics: {
      lines: [
        {
          points: [
            { x: 16, y: -23 },
            { x: 18, y: -23 },
          ],
        },
      ],
    },
  },
]

describe("centering graphics with zero-width or zero-height bounds", () => {
  for (const coordinateSystem of ["screen", "cartesian"] as const) {
    for (const { name, graphics } of cases) {
      const input = { ...graphics, coordinateSystem }

      test(`${coordinateSystem}: centers ${name} in both viewbox formats`, () => {
        const bounds = getBounds(input)
        const viewboxes = [
          bounds,
          {
            center,
            width: bounds.maxX - bounds.minX,
            height: bounds.maxY - bounds.minY,
          },
        ]

        for (const viewbox of viewboxes) {
          const matrix = computeTransformFromViewbox(viewbox, width, height, {
            yFlip: coordinateSystem === "cartesian",
            padding: 20,
          })
          const projectedCenter = applyToPoint(matrix, center)
          expect(projectedCenter.x).toBeCloseTo(width / 2)
          expect(projectedCenter.y).toBeCloseTo(height / 2)
          expect(Number.isFinite(matrix.a)).toBe(true)
          expect(Math.abs(matrix.a)).toBeGreaterThan(0)
          expect(Math.sign(matrix.d)).toBe(
            coordinateSystem === "cartesian" ? -1 : 1,
          )
        }
      })

      test(`${coordinateSystem}: centers ${name} in SVG output`, async () => {
        const svg = getSvgFromGraphicsObject(input, {
          svgWidth: width,
          svgHeight: height,
        })
        const document = new JSDOM(svg, { contentType: "image/svg+xml" }).window
          .document
        const point = document.querySelector('[data-type="point"]')

        if (point) {
          expect(Number(point.getAttribute("cx"))).toBeCloseTo(width / 2)
          expect(Number(point.getAttribute("cy"))).toBeCloseTo(height / 2)
        } else {
          const line = document.querySelector('[data-type="line"]')
          expect(line).not.toBeNull()
          const endpoints = line!.getAttribute("points")!.split(" ")
          const [start, end] = endpoints.map((point) =>
            point.split(",").map(Number),
          )
          expect((start[0] + end[0]) / 2).toBeCloseTo(width / 2)
          expect((start[1] + end[1]) / 2).toBeCloseTo(height / 2)
        }

        if (coordinateSystem === "cartesian" && name === "single point") {
          await expect(svg).toMatchSvgSnapshot(import.meta.path, "point")
        }
      })

      test(`${coordinateSystem}: centers ${name} in rasterized PNG output`, async () => {
        const png = decode(
          await getPngBufferFromGraphicsObject(input, {
            pngWidth: width,
            pngHeight: height,
          }),
        )
        const darkPixels: { x: number; y: number }[] = []
        for (let y = 0; y < png.height; y++) {
          for (let x = 0; x < png.width; x++) {
            const offset = (y * png.width + x) * png.channels
            if (
              png.data[offset] < 250 &&
              png.data[offset + 1] < 250 &&
              png.data[offset + 2] < 250
            ) {
              darkPixels.push({ x: x + 0.5, y: y + 0.5 })
            }
          }
        }

        expect(darkPixels.length).toBeGreaterThan(0)
        const xs = darkPixels.map((point) => point.x)
        const ys = darkPixels.map((point) => point.y)
        const rasterCenterX = (Math.min(...xs) + Math.max(...xs)) / 2
        const rasterCenterY = (Math.min(...ys) + Math.max(...ys)) / 2
        expect(Math.abs(rasterCenterX - width / 2)).toBeLessThan(1)
        expect(Math.abs(rasterCenterY - height / 2)).toBeLessThan(1)
      })
    }
  }
})
