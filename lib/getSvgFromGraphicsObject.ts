import {
  transform,
  compose,
  translate,
  scale,
  applyToPoint,
  identity,
  type Matrix,
} from "transformation-matrix"
import type { GraphicsObject, Point } from "./types"
import { stringify } from "svgson"
import pretty from "pretty"

const DEFAULT_SVG_SIZE = 640
const PADDING = 40

interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

function getBounds(graphics: GraphicsObject): Bounds {
  const points: Point[] = [
    ...(graphics.points || []),
    ...(graphics.lines || []).flatMap((line) => line.points),
    ...(graphics.rects || []).flatMap((rect) => {
      const halfWidth = rect.width / 2
      const halfHeight = rect.height / 2
      return [
        { x: rect.center.x - halfWidth, y: rect.center.y - halfHeight },
        { x: rect.center.x + halfWidth, y: rect.center.y - halfHeight },
        { x: rect.center.x - halfWidth, y: rect.center.y + halfHeight },
        { x: rect.center.x + halfWidth, y: rect.center.y + halfHeight },
      ]
    }),
    ...(graphics.circles || []).flatMap((circle) => [
      { x: circle.center.x - circle.radius, y: circle.center.y }, // left
      { x: circle.center.x + circle.radius, y: circle.center.y }, // right
      { x: circle.center.x, y: circle.center.y - circle.radius }, // top
      { x: circle.center.x, y: circle.center.y + circle.radius }, // bottom
    ]),
    ...(graphics.texts || []).map((t) => ({ x: t.x, y: t.y })),
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

function getProjectionMatrix(
  bounds: Bounds,
  coordinateSystem: GraphicsObject["coordinateSystem"],
) {
  const width = bounds.maxX - bounds.minX || 1
  const height = bounds.maxY - bounds.minY || 1

  const scale_factor = Math.min(
    (DEFAULT_SVG_SIZE - 2 * PADDING) / width,
    (DEFAULT_SVG_SIZE - 2 * PADDING) / height,
  )

  const yFlip = coordinateSystem === "screen" ? 1 : -1

  return compose(
    translate(DEFAULT_SVG_SIZE / 2, DEFAULT_SVG_SIZE / 2),
    scale(scale_factor, yFlip * scale_factor),
    translate(-(bounds.minX + width / 2), -(bounds.minY + height / 2)),
  )
}

function projectPoint(point: Point, matrix: Matrix) {
  const projected = applyToPoint(matrix, { x: point.x, y: point.y })
  return { ...point, ...projected }
}

export function getSvgFromGraphicsObject(
  graphics: GraphicsObject,
  {
    includeTextLabels = true,
    backgroundColor,
  }: {
    includeTextLabels?: boolean | Array<"points" | "lines" | "rects">
    backgroundColor?: string
  } = {},
): string {
  const bounds = getBounds(graphics)
  const matrix = getProjectionMatrix(bounds, graphics.coordinateSystem)

  const shouldRenderLabel = (type: "points" | "lines" | "rects"): boolean => {
    if (typeof includeTextLabels === "boolean") {
      return includeTextLabels
    }
    if (Array.isArray(includeTextLabels)) {
      return includeTextLabels.includes(type)
    }
    return false
  }

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
      // Background rectangle (optional)
      ...(backgroundColor
        ? [
            {
              name: "rect",
              type: "element",
              attributes: {
                width: "100%",
                height: "100%",
                fill: backgroundColor,
              },
            },
          ]
        : []),
      // Points
      ...(graphics.points || []).map((point) => {
        const projected = projectPoint(point, matrix)
        return {
          name: "g",
          type: "element",
          attributes: {},
          children: [
            {
              name: "circle",
              type: "element",
              attributes: {
                "data-type": "point",
                "data-label": point.label || "",
                "data-x": point.x.toString(),
                "data-y": point.y.toString(),
                cx: projected.x.toString(),
                cy: projected.y.toString(),
                r: "3",
                fill: point.color || "black",
              },
            },
            ...(shouldRenderLabel("points") && point.label
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
      ...(graphics.lines || []).map((line) => {
        const projectedPoints = line.points.map((p) => projectPoint(p, matrix))
        return {
          name: "g",
          type: "element",
          attributes: {},
          children: [
            {
              name: "polyline",
              type: "element",
              attributes: {
                "data-points": line.points
                  .map((p) => `${p.x},${p.y}`)
                  .join(" "),
                "data-type": "line",
                "data-label": line.label || "",
                points: projectedPoints.map((p) => `${p.x},${p.y}`).join(" "),
                fill: "none",
                stroke: line.strokeColor || "black",
                "stroke-width": (line.strokeWidth ?? 1).toString(),
                ...(line.strokeDash && {
                  "stroke-dasharray": Array.isArray(line.strokeDash)
                    ? line.strokeDash.join(" ")
                    : line.strokeDash,
                }),
              },
            },
            ...(shouldRenderLabel("lines") &&
            line.label &&
            projectedPoints.length > 0
              ? [
                  {
                    name: "text",
                    type: "element",
                    attributes: {
                      x: (projectedPoints[0].x + 5).toString(),
                      y: (projectedPoints[0].y - 5).toString(),
                      "font-family": "sans-serif",
                      "font-size": "12",
                      fill: line.strokeColor || "black",
                    },
                    children: [{ type: "text", value: line.label }],
                  },
                ]
              : []),
          ],
        }
      }),
      // Rectangles
      ...(graphics.rects || []).map((rect) => {
        const corner1 = {
          x: rect.center.x - rect.width / 2,
          y: rect.center.y - rect.height / 2,
        }
        const projectedCorner1 = projectPoint(corner1, matrix)
        const corner2 = {
          x: rect.center.x + rect.width / 2,
          y: rect.center.y + rect.height / 2,
        }
        const projectedCorner2 = projectPoint(corner2, matrix)
        const scaledWidth = Math.abs(projectedCorner2.x - projectedCorner1.x)
        const scaledHeight = Math.abs(projectedCorner2.y - projectedCorner1.y)
        const rectX = Math.min(projectedCorner1.x, projectedCorner2.x)
        const rectY = Math.min(projectedCorner1.y, projectedCorner2.y)

        return {
          name: "g",
          type: "element",
          attributes: {},
          children: [
            {
              name: "rect",
              type: "element",
              attributes: {
                "data-type": "rect",
                "data-label": rect.label || "",
                "data-x": rect.center.x.toString(),
                "data-y": rect.center.y.toString(),
                x: rectX.toString(),
                y: rectY.toString(),
                width: scaledWidth.toString(),
                height: scaledHeight.toString(),
                fill: rect.fill || "none",
                stroke: rect.stroke || "black",
                "stroke-width": Math.abs(1 / matrix.a).toString(), // Consider scaling stroke width like lines if needed
              },
            },
            ...(shouldRenderLabel("rects") && rect.label
              ? [
                  {
                    name: "text",
                    type: "element",
                    attributes: {
                      x: (rectX + 5).toString(),
                      y: (rectY - 5).toString(), // Position above the top-left corner
                      "font-family": "sans-serif",
                      "font-size": "12",
                      fill: rect.stroke || "black", // Default to stroke color for label
                    },
                    children: [{ type: "text", value: rect.label }],
                  },
                ]
              : []),
          ],
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
            "data-type": "circle",
            "data-label": "",
            "data-x": circle.center.x.toString(),
            "data-y": circle.center.y.toString(),
            cx: projected.x.toString(),
            cy: projected.y.toString(),
            r: scaledRadius.toString(),
            fill: circle.fill || "none",
            stroke: circle.stroke || "black",
            "stroke-width": Math.abs(1 / matrix.a).toString(),
          },
        }
      }),
      // Texts
      ...(graphics.texts || []).map((txt) => {
        const projected = projectPoint({ x: txt.x, y: txt.y }, matrix)
        const anchor = txt.anchorSide ?? "center"
        const alignMap: Record<string, string> = {
          top_left: "start",
          center_left: "start",
          bottom_left: "start",
          top_center: "middle",
          center: "middle",
          bottom_center: "middle",
          top_right: "end",
          center_right: "end",
          bottom_right: "end",
        }
        const baselineMap: Record<string, string> = {
          top_left: "text-before-edge",
          top_center: "text-before-edge",
          top_right: "text-before-edge",
          center_left: "central",
          center: "central",
          center_right: "central",
          bottom_left: "text-after-edge",
          bottom_center: "text-after-edge",
          bottom_right: "text-after-edge",
        }
        return {
          name: "text",
          type: "element",
          attributes: {
            "data-type": "text",
            "data-label": txt.text,
            "data-x": txt.x.toString(),
            "data-y": txt.y.toString(),
            x: projected.x.toString(),
            y: projected.y.toString(),
            fill: txt.color || "black",
            "font-size": (txt.fontSize ?? 12).toString(),
            "font-family": "sans-serif",
            "text-anchor": alignMap[anchor],
            "dominant-baseline": baselineMap[anchor],
          },
          children: [{ type: "text", value: txt.text }],
        }
      }),
      // Crosshair lines and coordinates (initially hidden)
      {
        name: "g",
        type: "element",
        attributes: {
          id: "crosshair",
          style: "display: none",
        },
        children: [
          {
            name: "line",
            type: "element",
            attributes: {
              id: "crosshair-h",
              y1: "0",
              y2: DEFAULT_SVG_SIZE.toString(),
              stroke: "#666",
              "stroke-width": "0.5",
            },
          },
          {
            name: "line",
            type: "element",
            attributes: {
              id: "crosshair-v",
              x1: "0",
              x2: DEFAULT_SVG_SIZE.toString(),
              stroke: "#666",
              "stroke-width": "0.5",
            },
          },
          {
            name: "text",
            type: "element",
            attributes: {
              id: "coordinates",
              "font-family": "monospace",
              "font-size": "12",
              fill: "#666",
            },
            children: [{ type: "text", value: "" }],
          },
        ],
      },
      // Mouse tracking script
      {
        name: "script",
        type: "element",
        children: [
          {
            type: "text",
            value: `
              document.currentScript.parentElement.addEventListener('mousemove', (e) => {
                const svg = e.currentTarget;
                const rect = svg.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const crosshair = svg.getElementById('crosshair');
                const h = svg.getElementById('crosshair-h');
                const v = svg.getElementById('crosshair-v');
                const coords = svg.getElementById('coordinates');
                
                crosshair.style.display = 'block';
                h.setAttribute('x1', '0');
                h.setAttribute('x2', '${DEFAULT_SVG_SIZE}');
                h.setAttribute('y1', y);
                h.setAttribute('y2', y);
                v.setAttribute('x1', x);
                v.setAttribute('x2', x);
                v.setAttribute('y1', '0');
                v.setAttribute('y2', '${DEFAULT_SVG_SIZE}');

                // Calculate real coordinates using inverse transformation
                const matrix = ${JSON.stringify(matrix)};
                // Manually invert and apply the affine transform
                // Since we only use translate and scale, we can directly compute:
                // x' = (x - tx) / sx
                // y' = (y - ty) / sy
                const sx = matrix.a;
                const sy = matrix.d;
                const tx = matrix.e; 
                const ty = matrix.f;
                const realPoint = {
                  x: (x - tx) / sx,
                  y: (y - ty) / sy // Flip y back since we used negative scale
                }
                
                coords.textContent = \`(\${realPoint.x.toFixed(2)}, \${realPoint.y.toFixed(2)})\`;
                coords.setAttribute('x', (x + 5).toString());
                coords.setAttribute('y', (y - 5).toString());
              });
              document.currentScript.parentElement.addEventListener('mouseleave', () => {
                document.currentScript.parentElement.getElementById('crosshair').style.display = 'none';
              });
            `,
          },
        ],
      },
    ],
  }

  // biome-ignore lint/suspicious/noExplicitAny: TODO
  return pretty(stringify(svgObject as any))
}
