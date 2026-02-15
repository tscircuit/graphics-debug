import type { GraphicsObject } from "lib/types"

export const arrowShowcaseGraphics: GraphicsObject = {
  title: "Simple Arrow Showcase",
  arrows: [
    {
      start: { x: -120, y: 70 },
      end: { x: -20, y: 70 },
      color: "#2563eb",
      inlineLabel: "inlineLabel",
      label: "label",
    },
    {
      start: { x: 35, y: -95 },
      end: { x: 35, y: -15 },
      color: "#f97316",
      inlineLabel: "inlineLabel",
      label: "label",
    },
    {
      start: { x: 80, y: 40 },
      end: { x: 140, y: 95 },
      doubleSided: true,
      color: "#10b981",
      inlineLabel: "inlineLabel",
      label: "label",
    },
  ],
  texts: [
    {
      x: -70,
      y: 95,
      text: "Horizontal arrow",
      anchorSide: "bottom_center",
    },
    {
      x: 55,
      y: -55,
      text: "Vertical arrow",
      anchorSide: "center_left",
    },
    {
      x: 145,
      y: 100,
      text: "Double sided diagonal arrow",
      anchorSide: "top_left",
    },
  ],
}
