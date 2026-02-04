import { InteractiveGraphics } from "site/components/InteractiveGraphics/InteractiveGraphics"
import type { GraphicsObject } from "../lib"

const pcbTracesGraphics: GraphicsObject = {
  coordinateSystem: "cartesian",
  title: "PCB Traces - Stroke Width Test",
  lines: [
    // Route 1: A trace with horizontal, vertical, and diagonal segments
    {
      points: [
        { x: 0, y: 0 },
        { x: 2, y: 0 }, // horizontal
        { x: 2, y: 2 }, // vertical
        { x: 4, y: 4 }, // diagonal 45°
        { x: 6, y: 4 }, // horizontal
        { x: 6, y: 6 }, // vertical
      ],
      strokeColor: "red",
      strokeWidth: 0.4, // typical PCB trace width in mm
      label: "Route 1 (z=0)",
    },
    // Route 2: Another trace with mixed orientations
    {
      points: [
        { x: 1, y: 0 },
        { x: 1, y: 1 }, // vertical
        { x: 3, y: 3 }, // diagonal 45°
        { x: 5, y: 3 }, // horizontal
      ],
      strokeColor: "blue",
      strokeWidth: 0.4,
      label: "Route 2 (z=1)",
    },
    // Route 3: Sharp corners to test strokeLinejoin
    {
      points: [
        { x: 7, y: 0 },
        { x: 7, y: 2 }, // vertical
        { x: 9, y: 2 }, // horizontal (90° corner)
        { x: 9, y: 4 }, // vertical (90° corner)
        { x: 11, y: 4 }, // horizontal
      ],
      strokeColor: "green",
      strokeWidth: 0.4,
      label: "Route 3 - Sharp corners",
    },
    // Route 4: Various diagonal angles
    {
      points: [
        { x: 0, y: 7 },
        { x: 1, y: 7.5 }, // shallow diagonal
        { x: 2, y: 9 }, // steep diagonal
        { x: 4, y: 10 }, // shallow diagonal
        { x: 5, y: 10 }, // horizontal
      ],
      strokeColor: "purple",
      strokeWidth: 0.4,
      label: "Route 4 - Various angles",
    },
    // Route 5: Thick trace to make issues more visible
    {
      points: [
        { x: 12, y: 0 },
        { x: 12, y: 3 }, // vertical
        { x: 14, y: 5 }, // diagonal
        { x: 16, y: 5 }, // horizontal
        { x: 18, y: 7 }, // diagonal
        { x: 18, y: 10 }, // vertical
      ],
      strokeColor: "orange",
      strokeWidth: 0.4, // thicker trace
      label: "Route 5 - Thick trace",
    },
  ],
  // Add some component pads as reference points
  circles: [
    { center: { x: 0, y: 0 }, radius: 0.4, fill: "rgba(255, 0, 0, 0.5)" },
    { center: { x: 6, y: 6 }, radius: 0.4, fill: "rgba(255, 0, 0, 0.5)" },
    { center: { x: 1, y: 0 }, radius: 0.4, fill: "rgba(0, 0, 255, 0.5)" },
    { center: { x: 5, y: 3 }, radius: 0.4, fill: "rgba(0, 0, 255, 0.5)" },
  ],
  // PCB board outline
  rects: [
    {
      center: { x: 9, y: 5 },
      width: 22,
      height: 14,
      stroke: "rgba(0, 136, 255, 0.5)",
      fill: "rgba(0, 136, 255, 0.05)",
      label: "PCB Board",
    },
  ],
}

export default () => {
  return (
    <div>
      <h2 style={{ padding: "8px" }}>
        PCB Traces - Zoom in to verify consistent stroke widths
      </h2>
      <p style={{ padding: "0 8px", color: "#666" }}>
        Zoom in on corners and compare diagonal vs horizontal/vertical segments.
        All segments should maintain consistent stroke width regardless of zoom
        level or line orientation.
      </p>
      <InteractiveGraphics graphics={pcbTracesGraphics} height={700} />
    </div>
  )
}
