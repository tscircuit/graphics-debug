import type { GraphicsObject } from "lib/types"

export const arrowShowcaseGraphics: GraphicsObject = {
  title: "Simple Arrow Showcase",
  arrows: [
    {
      start: { x: -90, y: 0 },
      end: { x: 90, y: 0 },
      color: "#2563eb",
      inlineLabel: "east",
      label: "Horizontal",
    },
    {
      start: { x: 0, y: -70 },
      end: { x: 0, y: 70 },
      color: "#f97316",
      inlineLabel: "north",
      label: "Vertical",
    },
    {
      start: { x: -60, y: -60 },
      end: { x: 60, y: 60 },
      doubleSided: true,
      color: "#10b981",
      inlineLabel: "diag",
      label: "Double sided",
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
      text: "Double sided diagonal arrow",
      anchorSide: "top_right",
    },
  ],
}
