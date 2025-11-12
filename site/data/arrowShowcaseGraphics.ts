import type { ArrowDirection, GraphicsObject } from "lib/types"

const directionVectors: Record<ArrowDirection, { x: number; y: number }> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: 1 },
  bottom: { x: 0, y: -1 },
  "left-top": { x: -1 / Math.SQRT2, y: 1 / Math.SQRT2 },
  "left-bottom": { x: -1 / Math.SQRT2, y: -1 / Math.SQRT2 },
  "right-top": { x: 1 / Math.SQRT2, y: 1 / Math.SQRT2 },
  "right-bottom": { x: 1 / Math.SQRT2, y: -1 / Math.SQRT2 },
}

const arrowColors: Record<ArrowDirection, string> = {
  top: "#2563eb",
  "right-top": "#0ea5e9",
  right: "#22c55e",
  "right-bottom": "#84cc16",
  bottom: "#f59e0b",
  "left-bottom": "#f97316",
  left: "#ef4444",
  "left-top": "#a855f7",
}

const orderedDirections: ArrowDirection[] = [
  "top",
  "right-top",
  "right",
  "right-bottom",
  "bottom",
  "left-bottom",
  "left",
  "left-top",
]

const center = { x: 0, y: 0 }
const tailOffset = 40
const arrowExtent = 120
const labelRadius = tailOffset + arrowExtent + 32

const toTitleCase = (direction: ArrowDirection) =>
  direction
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")

export const arrowShowcaseGraphics: GraphicsObject = {
  title: "Eight Direction Arrow Showcase",
  coordinateSystem: "cartesian",
  arrows: orderedDirections.map((direction) => {
    const vector = directionVectors[direction]
    return {
      start: {
        x: center.x - vector.x * tailOffset,
        y: center.y - vector.y * tailOffset,
      },
      direction,
      length: tailOffset + arrowExtent,
      shaftWidth: 6,
      headWidth: 32,
      headLength: 28,
      color: arrowColors[direction],
      label: toTitleCase(direction),
    }
  }),
  circles: [
    {
      center,
      radius: 14,
      fill: "rgba(37, 99, 235, 0.18)",
      stroke: "#1d4ed8",
    },
  ],
  points: [
    {
      x: center.x,
      y: center.y,
      label: "Origin",
      color: "#1f2937",
    },
  ],
  texts: orderedDirections.map((direction) => {
    const vector = directionVectors[direction]
    return {
      x: center.x + vector.x * labelRadius,
      y: center.y + vector.y * labelRadius,
      text: toTitleCase(direction),
      anchorSide: "center" as const,
      color: "#1f2937",
      fontSize: 16,
    }
  }),
}

