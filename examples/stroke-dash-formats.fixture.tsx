import React, { useRef, useEffect, useState } from "react"
import { drawGraphicsToCanvas, GraphicsObject } from "../lib"
import useResizeObserver from "@react-hook/resize-observer"
import { InteractiveGraphicsCanvas } from "lib/react"

// Example graphics object with different strokeDash formats
const strokeDashExamples: GraphicsObject = {
  title: "StrokeDash Format Examples",
  lines: [
    // String format examples
    {
      points: [
        { x: 50, y: 50 },
        { x: 250, y: 50 },
      ],
      strokeColor: "red",
      strokeWidth: 3,
      strokeDash: "5,5", // Basic dashed line - 5px dash, 5px gap
      label: "String: '5,5'",
    },
    {
      points: [
        { x: 50, y: 100 },
        { x: 250, y: 100 },
      ],
      strokeColor: "red",
      strokeWidth: 3,
      strokeDash: "10,5", // Longer dash, shorter gap
      label: "String: '10,5'",
    },
    {
      points: [
        { x: 50, y: 150 },
        { x: 250, y: 150 },
      ],
      strokeColor: "red",
      strokeWidth: 3,
      strokeDash: "5", // Single value - 5px dash, 5px gap (browser default behavior)
      label: "String: '5'",
    },
    {
      points: [
        { x: 50, y: 200 },
        { x: 250, y: 200 },
      ],
      strokeColor: "red",
      strokeWidth: 3,
      strokeDash: "10,5,2,5", // Complex pattern
      label: "String: '10,5,2,5'",
    },

    // Array format examples - should match the string versions above
    {
      points: [
        { x: 350, y: 50 },
        { x: 550, y: 50 },
      ],
      strokeColor: "blue",
      strokeWidth: 3,
      strokeDash: [5, 5], // Basic dashed line - equivalent to "5,5"
      label: "Array: [5, 5]",
    },
    {
      points: [
        { x: 350, y: 100 },
        { x: 550, y: 100 },
      ],
      strokeColor: "blue",
      strokeWidth: 3,
      strokeDash: [10, 5], // Longer dash, shorter gap - equivalent to "10,5"
      label: "Array: [10, 5]",
    },
    {
      points: [
        { x: 350, y: 150 },
        { x: 550, y: 150 },
      ],
      strokeColor: "blue",
      strokeWidth: 3,
      strokeDash: [5], // Single value - equivalent to "5" string
      label: "Array: [5]",
    },
    {
      points: [
        { x: 350, y: 200 },
        { x: 550, y: 200 },
      ],
      strokeColor: "blue",
      strokeWidth: 3,
      strokeDash: [10, 5, 2, 5], // Complex pattern - equivalent to "10,5,2,5"
      label: "Array: [10, 5, 2, 5]",
    },

    // Special cases
    {
      points: [
        { x: 50, y: 250 },
        { x: 250, y: 250 },
      ],
      strokeColor: "green",
      strokeWidth: 3,
      strokeDash: "0", // Zero value should render as solid line
      label: "String: '0'",
    },
    {
      points: [
        { x: 350, y: 250 },
        { x: 550, y: 250 },
      ],
      strokeColor: "green",
      strokeWidth: 3,
      strokeDash: [0], // Zero value array should render as solid line
      label: "Array: [0]",
    },
    {
      points: [
        { x: 50, y: 300 },
        { x: 250, y: 300 },
      ],
      strokeColor: "purple",
      strokeWidth: 3,
      // No strokeDash property - should render as solid line
      label: "No strokeDash (solid)",
    },
  ],
  // Using screen coordinates for predictable positioning
  coordinateSystem: "screen",
}

export default function StrokeDashFormats() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 600, height: 400 })

  // Monitor container size
  useResizeObserver(containerRef, (entry) => {
    setSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    })
  })

  // Draw function that uses our canvas renderer
  const drawCanvas = () => {
    if (!canvasRef.current) return

    // Make sure canvas dimensions match container
    canvasRef.current.width = size.width
    canvasRef.current.height = size.height

    // Draw the graphics with different strokeDash formats
    drawGraphicsToCanvas(strokeDashExamples, canvasRef.current)

    // Add labels for each line
    const ctx = canvasRef.current.getContext("2d")
    if (ctx) {
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "black"

      strokeDashExamples.lines?.forEach((line) => {
        if (line.label && line.points.length > 0) {
          const x = line.points[0].x
          const y = line.points[0].y
          ctx.fillText(line.label, x, y - 5)
        }
      })
    }
  }

  // Apply the drawing when size changes
  useEffect(() => {
    drawCanvas()
  }, [size])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h2>StrokeDash Format Examples</h2>
      <p>Demonstrating both string and array formats for strokeDash property</p>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: 350,
          border: "1px solid #ccc",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
      <InteractiveGraphicsCanvas graphics={strokeDashExamples} />
    </div>
  )
}
