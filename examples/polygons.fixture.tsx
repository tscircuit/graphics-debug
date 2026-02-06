import { InteractiveGraphics } from "site/components/InteractiveGraphics/InteractiveGraphics"
import type { GraphicsObject } from "../lib"

const polygonGraphics: GraphicsObject = {
  title: "Polygons Example",
  coordinateSystem: "screen",
  polygons: [
    {
      points: [
        { x: 40, y: 40 },
        { x: 140, y: 40 },
        { x: 90, y: 120 },
      ],
      fill: "gold",
      stroke: "black",
      label: "Triangle",
    },
    {
      points: [
        { x: 200, y: 60 },
        { x: 320, y: 80 },
        { x: 300, y: 170 },
        { x: 220, y: 150 },
      ],
      fill: "rgba(0, 120, 180, 0.35)",
      stroke: "#0078b4",
      label: "Quad",
    },
  ],
  points: [{ x: 90, y: 120, color: "red", label: "Apex" }],
}

export default () => {
  return <InteractiveGraphics graphics={polygonGraphics} />
}
