import React from "react"
import type { GraphicsObject } from "lib/types"
import InteractiveGraphicsCanvas from "site/components/InteractiveGraphicsCanvas"

const graphicsWithSteps: GraphicsObject = {
  title: "Interactive Canvas Toolbar Options",
  stepMetadata: [
    { title: "Seed points" },
    { title: "Draw path" },
    { title: "Show focus" },
  ],
  points: [
    { x: 0, y: 0, label: "Center", color: "blue", step: 0 },
    { x: 60, y: 20, label: "Target", color: "red", step: 1 },
  ],
  lines: [
    {
      points: [
        { x: 0, y: 0 },
        { x: 60, y: 20 },
      ],
      strokeColor: "#16a34a",
      strokeWidth: 1,
      step: 1,
    },
  ],
  circles: [
    {
      center: { x: 60, y: 20 },
      radius: 12,
      fill: "rgba(22, 163, 74, 0.2)",
      stroke: "#16a34a",
      step: 2,
    },
  ],
}

export default function InteractiveGraphicsCanvasToolbarOptionsFixture() {
  return (
    <InteractiveGraphicsCanvas
      graphics={graphicsWithSteps}
      alwaysShowToolbar={true}
      fullPage={true}
      showGrid={true}
    />
  )
}
