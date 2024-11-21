import {
  transform,
  compose,
  translate,
  scale,
  applyToPoint,
  type Matrix,
} from "transformation-matrix"
import type { GraphicsObject, Point } from "./types"
import { stringify } from "svgson"

const DEFAULT_SVG_SIZE = 400
const PADDING = 40

interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

function getBounds(graphics: GraphicsObject["graphics"]): Bounds {
  const points: Point[] = [
    ...(graphics.points || []),
    ...(graphics.lines || []).flatMap((line) => line.points),
    ...(graphics.rects || []).map((rect) => rect.center),
    ...(graphics.circles || []).map((circle) => circle.center),
  ]

  if (points.length === 0) {
    return { minX: -1, maxX: 1, minY: -1, maxY: 1 }
  }

  return points.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      maxX: Math.max(bounds.maxX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )
}

function getProjectionMatrix(bounds: Bounds) {
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY

  const scale_factor = Math.min(
    (DEFAULT_SVG_SIZE - 2 * PADDING) / width,
    (DEFAULT_SVG_SIZE - 2 * PADDING) / height,
  )

  return compose(
    translate(DEFAULT_SVG_SIZE / 2, DEFAULT_SVG_SIZE / 2),
    scale(scale_factor, -scale_factor),
    translate(-(bounds.minX + width / 2), -(bounds.minY + height / 2)),
  )
}

function projectPoint(point: Point, matrix: Matrix) {
  const projected = applyToPoint(matrix, { x: point.x, y: point.y })
  return { ...point, ...projected }
}

export function getSvgFromGraphicsObject(graphicsObj: GraphicsObject): string {
  const { graphics } = graphicsObj
  const bounds = getBounds(graphics)
  const matrix = getProjectionMatrix(bounds)

  const svgObject = {
    name: "svg",
    type: "element",
    attributes: {
      width: DEFAULT_SVG_SIZE.toString(),
      height: DEFAULT_SVG_SIZE.toString(),
      viewBox: `0 0 ${DEFAULT_SVG_SIZE} ${DEFAULT_SVG_SIZE}`,
      xmlns: "http://www.w3.org/2000/svg",
    },
    children: [
      // Points
      ...(graphics.points || []).map((point) => {
        const projected = projectPoint(point, matrix)
        return {
          name: "g",
          type: "element",
          children: [
            {
              name: "circle",
              type: "element",
              attributes: {
                cx: projected.x.toString(),
                cy: projected.y.toString(),
                r: "3",
                fill: point.color || "black",
              },
            },
            ...(point.label
              ? [
                  {
                    name: "text",
                    type: "element",
                    attributes: {
                      x: (projected.x + 5).toString(),
                      y: (projected.y - 5).toString(),
                      "font-family": "sans-serif",
                      "font-size": "12",
                    },
                    children: [{ type: "text", value: point.label }],
                  },
                ]
              : []),
          ],
        }
      }),
      // Lines
      ...(graphics.lines || []).map((line) => ({
        name: "polyline",
        type: "element",
        attributes: {
          points: line.points
            .map((p) => projectPoint(p, matrix))
            .map((p) => `${p.x},${p.y}`)
            .join(" "),
          fill: "none",
          stroke: "black",
          "stroke-width": (line.points[0].stroke || 1).toString(),
        },
      })),
      // Rectangles
      ...(graphics.rects || []).map((rect) => {
        const projected = projectPoint(rect.center, matrix)
        const scaledWidth = rect.width * matrix.a
        const scaledHeight = rect.height * matrix.d
        return {
          name: "rect",
          type: "element",
          attributes: {
            x: (projected.x - scaledWidth / 2).toString(),
            y: (projected.y - scaledHeight / 2).toString(),
            width: scaledWidth.toString(),
            height: scaledHeight.toString(),
            fill: rect.fill || "none",
            stroke: rect.stroke || "black",
          },
        }
      }),
      // Circles
      ...(graphics.circles || []).map((circle) => {
        const projected = projectPoint(circle.center, matrix)
        const scaledRadius = circle.radius * Math.abs(matrix.a)
        return {
          name: "circle",
          type: "element",
          attributes: {
            cx: projected.x.toString(),
            cy: projected.y.toString(),
            r: scaledRadius.toString(),
            fill: circle.fill || "none",
            stroke: circle.stroke || "black",
          },
        }
      }),
    ],
  }

  // biome-ignore lint/suspicious/noExplicitAny: TODO
  return stringify(svgObject as any)
}
