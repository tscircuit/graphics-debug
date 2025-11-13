import type { GraphicsObject } from "lib/types"

export const arrowShowcaseGraphics: GraphicsObject = {
  title: "Simple Arrow Showcase",
  coordinateSystem: "cartesian",
  arrows: [
    {
      start: { x: -90, y: 0 },
      end: { x: 90, y: 0 },
      color: "#2563eb",
    },
    {
      start: { x: 0, y: -70 },
      end: { x: 0, y: 70 },
      color: "#f97316",
    },
    {
      start: { x: -60, y: -60 },
      end: { x: 60, y: 60 },
      flipped: true,
      color: "#10b981",
    },
  ],
  texts: [
    {
      x: 0,
      y: -100,
      text: "Horizontal arrow",
      anchorSide: "bottom_center",
    },
    {
      x: 100,
      y: 0,
      text: "Vertical arrow",
      anchorSide: "center_left",
    },
    {
      x: -100,
      y: 100,
      text: "Flipped diagonal arrow",
      anchorSide: "top_right",
    },
  ],
}
