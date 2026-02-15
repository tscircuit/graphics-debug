import { stringify } from "svgson"
import {
  type Matrix,
  applyToPoint,
  compose,
  identity,
  scale,
  transform,
  translate,
} from "transformation-matrix"
import {
  getArrowBoundingBox,
  getArrowGeometry,
  getInlineLabelLayout,
} from "./arrowHelpers"
import { FONT_SIZE_HEIGHT_RATIO, FONT_SIZE_WIDTH_RATIO } from "./constants"
import { clipInfiniteLineToBounds } from "./infiniteLineHelpers"
import type { GraphicsObject, Point } from "./types"

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
    ...(graphics.polygons || []).flatMap((polygon) => polygon.points),
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
    ...(graphics.arrows || []).flatMap((arrow) => {
      const bounds = getArrowBoundingBox(arrow)
      return [
        { x: bounds.minX, y: bounds.minY },
        { x: bounds.maxX, y: bounds.maxY },
      ]
    }),
    ...(graphics.texts || []).flatMap((t) => {
      const fontSize = t.fontSize ?? 12
      const width = t.text.length * fontSize * FONT_SIZE_WIDTH_RATIO
      const height = fontSize * FONT_SIZE_HEIGHT_RATIO
      const anchor = t.anchorSide ?? "center"
      const offsetMap: Record<string, { dx: number; dy: number }> = {
        top_left: { dx: 0, dy: 0 },
        top_center: { dx: -width / 2, dy: 0 },
        top_right: { dx: -width, dy: 0 },
        center_left: { dx: 0, dy: -height / 2 },
        center: { dx: -width / 2, dy: -height / 2 },
        center_right: { dx: -width, dy: -height / 2 },
        bottom_left: { dx: 0, dy: -height },
        bottom_center: { dx: -width / 2, dy: -height },
        bottom_right: { dx: -width, dy: -height },
      }
      const { dx, dy } = offsetMap[anchor]
      const x0 = t.x + dx
      const y0 = t.y + dy
      return [
        { x: x0, y: y0 },
        { x: x0 + width, y: y0 + height },
      ]
    }),
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
  svgWidth: number,
  svgHeight: number,
) {
  const width = bounds.maxX - bounds.minX || 1
  const height = bounds.maxY - bounds.minY || 1

  const scale_factor = Math.min(
    (svgWidth - 2 * PADDING) / width,
    (svgHeight - 2 * PADDING) / height,
  )

  const yFlip = coordinateSystem === "screen" ? 1 : -1

  return compose(
    translate(svgWidth / 2, svgHeight / 2),
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
    includeTextLabels = false,
    hideInlineLabels = false,
    backgroundColor = "white",
    svgWidth = DEFAULT_SVG_SIZE,
    svgHeight = DEFAULT_SVG_SIZE,
  }: {
    includeTextLabels?:
      | boolean
      | Array<
          "points" | "lines" | "infiniteLines" | "rects" | "polygons" | "arrows"
        >
    backgroundColor?: string | null
    hideInlineLabels?: boolean
    svgWidth?: number
    svgHeight?: number
  } = {},
): string {
  const bounds = getBounds(graphics)
  const matrix = getProjectionMatrix(
    bounds,
    graphics.coordinateSystem,
    svgWidth,
    svgHeight,
  )
  const strokeScale = Math.abs(matrix.a)

  const shouldRenderLabel = (
    type:
      | "points"
      | "lines"
      | "infiniteLines"
      | "rects"
      | "polygons"
      | "arrows",
  ): boolean => {
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
      width: svgWidth.toString(),
      height: svgHeight.toString(),
      viewBox: `0 0 ${svgWidth} ${svgHeight}`,
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
                "stroke-width": !line.strokeWidth
                  ? "1px"
                  : typeof line.strokeWidth === "string"
                    ? line.strokeWidth
                    : (strokeScale * line.strokeWidth).toString(),
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
      ...(graphics.infiniteLines || []).flatMap((line) => {
        const segment = clipInfiniteLineToBounds(line, bounds)
        if (!segment) return []

        const [start, end] = segment
        const projectedStart = projectPoint(start, matrix)
        const projectedEnd = projectPoint(end, matrix)

        return [
          {
            name: "g",
            type: "element",
            attributes: {},
            children: [
              {
                name: "line",
                type: "element",
                attributes: {
                  "data-type": "infinite-line",
                  "data-label": line.label || "",
                  "data-origin": `${line.origin.x},${line.origin.y}`,
                  "data-direction": `${line.directionVector.x},${line.directionVector.y}`,
                  x1: projectedStart.x.toString(),
                  y1: projectedStart.y.toString(),
                  x2: projectedEnd.x.toString(),
                  y2: projectedEnd.y.toString(),
                  stroke: line.strokeColor || "black",
                  "stroke-width": !line.strokeWidth
                    ? "1px"
                    : typeof line.strokeWidth === "string"
                      ? line.strokeWidth
                      : (strokeScale * line.strokeWidth).toString(),
                  ...(line.strokeDash && {
                    "stroke-dasharray": Array.isArray(line.strokeDash)
                      ? line.strokeDash.join(" ")
                      : line.strokeDash,
                  }),
                },
              },
              ...(shouldRenderLabel("infiniteLines") && line.label
                ? [
                    {
                      name: "text",
                      type: "element",
                      attributes: {
                        x: (
                          (projectedStart.x + projectedEnd.x) / 2 +
                          5
                        ).toString(),
                        y: (
                          (projectedStart.y + projectedEnd.y) / 2 -
                          5
                        ).toString(),
                        "font-family": "sans-serif",
                        "font-size": "12",
                        fill: line.strokeColor || "black",
                      },
                      children: [{ type: "text", value: line.label }],
                    },
                  ]
                : []),
            ],
          },
        ]
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
                      y: rectY.toString(),
                      "font-family": "sans-serif",
                      "dominant-baseline": "text-before-edge",
                      "font-size": (
                        ((scaledWidth + scaledHeight) / 2) *
                        0.06
                      ).toString(),
                      fill: rect.stroke || "black", // Default to stroke color for label
                    },
                    children: [{ type: "text", value: rect.label }],
                  },
                ]
              : []),
          ],
        }
      }),
      // Polygons
      ...(graphics.polygons || []).map((polygon) => {
        const projectedPoints = polygon.points.map((point) =>
          projectPoint(point, matrix),
        )
        const xs = projectedPoints.map((p) => p.x)
        const ys = projectedPoints.map((p) => p.y)
        const minX = xs.length > 0 ? Math.min(...xs) : 0
        const minY = ys.length > 0 ? Math.min(...ys) : 0
        const polygonStrokeWidth =
          polygon.strokeWidth === undefined
            ? Math.abs(1 / matrix.a)
            : strokeScale * polygon.strokeWidth

        return {
          name: "g",
          type: "element",
          attributes: {},
          children: [
            {
              name: "polygon",
              type: "element",
              attributes: {
                "data-type": "polygon",
                "data-label": polygon.label || "",
                "data-points": polygon.points
                  .map((p) => `${p.x},${p.y}`)
                  .join(" "),
                points: projectedPoints.map((p) => `${p.x},${p.y}`).join(" "),
                fill: polygon.fill || "none",
                stroke: polygon.stroke || "black",
                "stroke-width": polygonStrokeWidth.toString(),
              },
            },
            ...(shouldRenderLabel("polygons") && polygon.label
              ? [
                  {
                    name: "text",
                    type: "element",
                    attributes: {
                      x: (minX + 5).toString(),
                      y: minY.toString(),
                      "font-family": "sans-serif",
                      "dominant-baseline": "text-before-edge",
                      "font-size": "12",
                      fill: polygon.stroke || "black",
                    },
                    children: [{ type: "text", value: polygon.label }],
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
      ...(graphics.arrows || []).map((arrow) => {
        const geometry = getArrowGeometry(arrow)
        const projectedShaftStart = projectPoint(geometry.shaftStart, matrix)
        const projectedShaftEnd = projectPoint(geometry.shaftEnd, matrix)
        const fontSize = 12
        const strokeWidth = geometry.shaftWidth
        const alongSeparation = fontSize * 0.6
        const inlineLabelLayout = getInlineLabelLayout(
          projectedShaftStart,
          projectedShaftEnd,
          {
            fontSize,
            strokeWidth,
            normalPadding: 6,
            alongOffset: arrow.label ? alongSeparation : 0,
          },
        )
        const arrowLabelLayout = getInlineLabelLayout(
          projectedShaftStart,
          projectedShaftEnd,
          {
            fontSize,
            strokeWidth,
            normalPadding: 12,
            alongOffset: arrow.inlineLabel ? -alongSeparation : 0,
          },
        )

        const color = arrow.color || "black"

        const headChildren = geometry.heads.map((head) => {
          const projectedTip = projectPoint(head.tip, matrix)
          const projectedLeftWing = projectPoint(head.leftWing, matrix)
          const projectedRightWing = projectPoint(head.rightWing, matrix)

          return {
            name: "polygon",
            type: "element",
            attributes: {
              "data-type": "arrow-head",
              points: [
                `${projectedTip.x},${projectedTip.y}`,
                `${projectedLeftWing.x},${projectedLeftWing.y}`,
                `${projectedRightWing.x},${projectedRightWing.y}`,
              ].join(" "),
              fill: color,
            },
          }
        })

        const children = [
          {
            name: "line",
            type: "element",
            attributes: {
              "data-type": "arrow-shaft",
              x1: projectedShaftStart.x.toString(),
              y1: projectedShaftStart.y.toString(),
              x2: projectedShaftEnd.x.toString(),
              y2: projectedShaftEnd.y.toString(),
              stroke: color,
              "stroke-width": geometry.shaftWidth.toString(),
              "stroke-linecap": "round",
            },
          },
          ...headChildren,
          ...(shouldRenderLabel("arrows") && arrow.label
            ? [
                {
                  name: "text",
                  type: "element",
                  attributes: {
                    "data-type": "arrow-label",
                    x: arrowLabelLayout.x.toString(),
                    y: arrowLabelLayout.y.toString(),
                    "font-family": "sans-serif",
                    "font-size": fontSize.toString(),
                    "text-anchor": "middle",
                    "dominant-baseline": "central",
                    fill: color,
                  },
                  children: [{ type: "text", value: arrow.label }],
                },
              ]
            : []),
          ...(!hideInlineLabels && arrow.inlineLabel
            ? [
                {
                  name: "text",
                  type: "element",
                  attributes: {
                    "data-type": "arrow-inline-label",
                    x: inlineLabelLayout.x.toString(),
                    y: inlineLabelLayout.y.toString(),
                    transform: `rotate(${inlineLabelLayout.angleDegrees} ${inlineLabelLayout.x} ${inlineLabelLayout.y})`,
                    "font-family": "sans-serif",
                    "font-size": fontSize.toString(),
                    "text-anchor": "middle",
                    "dominant-baseline": "central",
                    fill: color,
                  },
                  children: [{ type: "text", value: arrow.inlineLabel }],
                },
              ]
            : []),
        ]

        return {
          name: "g",
          type: "element",
          attributes: {
            "data-type": "arrow",
            "data-start": `${arrow.start.x},${arrow.start.y}`,
            "data-end": `${arrow.end.x},${arrow.end.y}`,
            "data-double-sided": arrow.doubleSided ? "true" : "false",
            ...(arrow.label ? { "data-label": arrow.label } : {}),
            ...(arrow.inlineLabel
              ? { "data-inline-label": arrow.inlineLabel }
              : {}),
          },
          children,
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
            "font-size": ((txt.fontSize ?? 12) * Math.abs(matrix.a)).toString(),
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
              y2: svgHeight.toString(),
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
              x2: svgWidth.toString(),
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
                h.setAttribute('x2', '${svgWidth}');
                h.setAttribute('y1', y);
                h.setAttribute('y2', y);
                v.setAttribute('x1', x);
                v.setAttribute('x2', x);
                v.setAttribute('y1', '0');
                v.setAttribute('y2', '${svgHeight}');

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
  return stringify(svgObject as any)
}
