import React, { useRef, useEffect, useState } from "react"
import {
  drawGraphicsToCanvas,
  computeTransformFromViewbox,
  getBounds,
  GraphicsObject,
} from "../lib"
import useMouseMatrixTransform from "use-mouse-matrix-transform"
import { compose, scale, translate } from "transformation-matrix"
import useResizeObserver from "@react-hook/resize-observer"

// Example graphics object with different elements
const exampleGraphics: GraphicsObject = {
  title: "Canvas Renderer Demo",
  points: [
    { x: 0, y: 0, label: "Origin", color: "blue" },
    { x: 50, y: 50, label: "Point A", color: "red" },
    { x: -50, y: 20, label: "Point B", color: "green" },
  ],
  lines: [
    {
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
        { x: -50, y: 20 },
      ],
      strokeColor: "gray",
      strokeWidth: 2,
      strokeDash: "5,5",
    },
  ],
  rects: [
    {
      center: { x: 0, y: 30 },
      width: 40,
      height: 20,
      fill: "rgba(255, 0, 0, 0.2)",
      stroke: "red",
    },
  ],
  circles: [
    {
      center: { x: 25, y: 25 },
      radius: 15,
      fill: "rgba(0, 255, 0, 0.2)",
      stroke: "green",
    },
  ],
  coordinateSystem: "cartesian",
}

export default function CanvasRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 600, height: 600 })

  // Get bounds of the graphics with padding
  const graphicsBoundsWithPadding = React.useMemo(() => {
    const bounds = getBounds(exampleGraphics)
    const width = bounds.maxX - bounds.minX
    const height = bounds.maxY - bounds.minY
    return {
      minX: bounds.minX - width / 10,
      minY: bounds.minY - height / 10,
      maxX: bounds.maxX + width / 10,
      maxY: bounds.maxY + height / 10,
    }
  }, [])

  // Use mouse transform hook for panning/zooming
  const { transform, ref: mouseTransformRef } = useMouseMatrixTransform({
    initialTransform: compose(
      translate(size.width / 2, size.height / 2),
      scale(
        Math.min(
          size.width /
            (graphicsBoundsWithPadding.maxX - graphicsBoundsWithPadding.minX),
          size.height /
            (graphicsBoundsWithPadding.maxY - graphicsBoundsWithPadding.minY),
        ),
        -Math.min(
          size.width /
            (graphicsBoundsWithPadding.maxX - graphicsBoundsWithPadding.minX),
          size.height /
            (graphicsBoundsWithPadding.maxY - graphicsBoundsWithPadding.minY),
        ),
      ),
      translate(
        -(graphicsBoundsWithPadding.maxX + graphicsBoundsWithPadding.minX) / 2,
        -(graphicsBoundsWithPadding.maxY + graphicsBoundsWithPadding.minY) / 2,
      ),
    ),
  })

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

    // Draw the graphics with the current transform
    drawGraphicsToCanvas(exampleGraphics, canvasRef.current, {
      transform: transform,
    })

    // Draw a grid for reference
    drawGrid(canvasRef.current, transform)
  }

  // Draw a grid to help with visualization
  const drawGrid = (canvas: HTMLCanvasElement, transform: any) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.save()

    // Draw coordinate axes
    ctx.beginPath()

    // X-axis
    const xAxisStart = { x: -1000, y: 0 }
    const xAxisEnd = { x: 1000, y: 0 }
    const xAxisStartTransformed = transformPoint(xAxisStart, transform)
    const xAxisEndTransformed = transformPoint(xAxisEnd, transform)

    ctx.moveTo(xAxisStartTransformed.x, xAxisStartTransformed.y)
    ctx.lineTo(xAxisEndTransformed.x, xAxisEndTransformed.y)

    // Y-axis
    const yAxisStart = { x: 0, y: -1000 }
    const yAxisEnd = { x: 0, y: 1000 }
    const yAxisStartTransformed = transformPoint(yAxisStart, transform)
    const yAxisEndTransformed = transformPoint(yAxisEnd, transform)

    ctx.moveTo(yAxisStartTransformed.x, yAxisStartTransformed.y)
    ctx.lineTo(yAxisEndTransformed.x, yAxisEndTransformed.y)

    ctx.strokeStyle = "#aaa"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw grid lines
    ctx.beginPath()
    ctx.setLineDash([2, 2])

    // Determine grid spacing based on zoom level
    const gridSize = 10

    // Draw vertical grid lines
    for (let x = -100; x <= 100; x += gridSize) {
      if (x === 0) continue // Skip the axis

      const start = transformPoint({ x, y: -100 }, transform)
      const end = transformPoint({ x, y: 100 }, transform)

      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
    }

    // Draw horizontal grid lines
    for (let y = -100; y <= 100; y += gridSize) {
      if (y === 0) continue // Skip the axis

      const start = transformPoint({ x: -100, y }, transform)
      const end = transformPoint({ x: 100, y }, transform)

      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
    }

    ctx.strokeStyle = "#ddd"
    ctx.stroke()
    ctx.restore()
  }

  // Helper to transform a point through the matrix
  const transformPoint = (point: { x: number; y: number }, matrix: any) => {
    return {
      x: matrix.a * point.x + matrix.c * point.y + matrix.e,
      y: matrix.b * point.x + matrix.d * point.y + matrix.f,
    }
  }

  // Apply the drawing when transform changes
  useEffect(() => {
    drawCanvas()
  }, [transform, size])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h2>Canvas Renderer with Mouse Panning/Zooming</h2>
      <p>Drag to pan, scroll to zoom</p>
      <div
        ref={(node) => {
          // Using a callback ref approach
          containerRef.current = node
          // Apply the mouse transform ref if available
          if (mouseTransformRef && node) {
            mouseTransformRef.current = node
          }
        }}
        style={{
          position: "relative",
          width: "100%",
          height: 500,
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
    </div>
  )
}
