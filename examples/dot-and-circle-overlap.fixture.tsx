import { InteractiveGraphics } from "site/components/InteractiveGraphics/InteractiveGraphics"
import type { GraphicsObject } from "../lib"

const overlapGraphics: GraphicsObject = {
  title: "Dot + Circle Overlap",
  points: [{ x: 0, y: 0, color: "#ef4444", label: "Dot" }],
  circles: [
    {
      center: { x: 0, y: 0 },
      radius: 3,
      fill: "none",
      stroke: "#2563eb",
      label: "Circle",
    },
  ],
  texts: [
    { x: 0.5, y: 0.5, text: "Dot" },
    { x: 3.5, y: -0.5, text: "Circle" },
  ],
}

export default function DotAndCircleOverlapFixture() {
  return <InteractiveGraphics graphics={overlapGraphics} />
}
