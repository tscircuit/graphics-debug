import { InteractiveGraphics } from "site/components/InteractiveGraphics/InteractiveGraphics"
import type { GraphicsObject } from "lib/types"

const graphicsWithSteps: GraphicsObject = {
  title: "Interactive Graphics Toolbar Options",
  stepMetadata: [
    { title: "Initialize scene" },
    { title: "Add connection" },
    { title: "Highlight result" },
  ],
  points: [
    { x: -40, y: -20, label: "A", step: 0 },
    { x: 40, y: 20, label: "B", step: 0 },
  ],
  lines: [
    {
      points: [
        { x: -40, y: -20 },
        { x: 40, y: 20 },
      ],
      strokeColor: "#2563eb",
      strokeWidth: 1.5,
      step: 1,
    },
  ],
  circles: [
    {
      center: { x: 40, y: 20 },
      radius: 10,
      fill: "rgba(37, 99, 235, 0.2)",
      stroke: "#2563eb",
      step: 2,
    },
  ],
}

export default function InteractiveGraphicsToolbarOptionsFixture() {
  return (
    <InteractiveGraphics
      graphics={graphicsWithSteps}
      alwaysShowToolbar={true}
      fullPage={true}
    />
  )
}
