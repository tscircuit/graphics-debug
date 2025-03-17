import React from "react"
import { GraphicsObject } from "../lib"
import InteractiveGraphicsCanvas from "../site/components/InteractiveGraphicsCanvas"

// Example graphics object with different elements and steps
const steppedGraphics: GraphicsObject = {
  title: "Interactive Canvas Demo with Steps",
  points: [
    { x: 0, y: 0, label: "Origin", color: "blue", step: 0 },
    { x: 50, y: 50, label: "Point A", color: "red", step: 1 },
    { x: -50, y: 20, label: "Point B", color: "green", step: 2 },
    { x: -20, y: -30, label: "Point C", color: "purple", step: 3 },
  ],
  lines: [
    {
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
      ],
      strokeColor: "gray",
      strokeWidth: 2,
      step: 1,
    },
    {
      points: [
        { x: 0, y: 0 },
        { x: -50, y: 20 },
      ],
      strokeColor: "green",
      strokeWidth: 2,
      step: 2,
    },
    {
      points: [
        { x: 0, y: 0 },
        { x: -20, y: -30 },
      ],
      strokeColor: "purple",
      strokeWidth: 2,
      step: 3,
    },
  ],
  rects: [
    {
      center: { x: 0, y: 30 },
      width: 40,
      height: 20,
      fill: "rgba(255, 0, 0, 0.2)",
      stroke: "red",
      step: 1,
    },
    {
      center: { x: -30, y: 0 },
      width: 30,
      height: 30,
      fill: "rgba(0, 0, 255, 0.2)",
      stroke: "blue",
      step: 2,
    },
  ],
  circles: [
    {
      center: { x: 25, y: 25 },
      radius: 15,
      fill: "rgba(0, 255, 0, 0.2)",
      stroke: "green",
      step: 1,
    },
    {
      center: { x: -20, y: -30 },
      radius: 10,
      fill: "rgba(255, 0, 255, 0.2)",
      stroke: "purple",
      step: 3,
    },
  ],
  coordinateSystem: "cartesian",
}

export default function InteractiveGraphicsCanvasFixture() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h2>Interactive Graphics Canvas</h2>
      <p>Drag to pan, scroll to zoom</p>
      <p>Use the step controls to visualize the graphics step by step</p>
      <p>
        When dimension tool is enabled, press 'd' key to measure distances and
        coordinates
      </p>

      <InteractiveGraphicsCanvas
        graphics={steppedGraphics}
        height={500}
        showGrid={true}
      />
    </div>
  )
}
