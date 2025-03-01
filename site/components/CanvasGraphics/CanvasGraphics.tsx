import React, { useRef, useEffect, useState } from "react"
import { GraphicsObject } from "../../../lib/types"
import {
  drawGraphicsToCanvas,
  getBounds,
} from "../../../lib/drawGraphicsToCanvas"
import useMouseMatrixTransform from "use-mouse-matrix-transform"
import { compose, scale, translate, type Matrix } from "transformation-matrix"
import useResizeObserver from "@react-hook/resize-observer"

interface CanvasGraphicsProps {
  graphics: GraphicsObject
  width?: number
  height?: number
  withGrid?: boolean
  initialTransform?: Matrix
  disableLabels?: boolean
}

// Create a container component that handles the mouse matrix transform
function TransformContainer({
  initialTransform,
  children,
  onTransformChange,
}: {
  initialTransform: Matrix
  children: React.ReactNode
  onTransformChange: (transform: Matrix) => void
}) {
  const { transform, ref } = useMouseMatrixTransform({
    initialTransform,
  })

  // Update parent with transform changes
  useEffect(() => {
    onTransformChange(transform)
  }, [transform, onTransformChange])

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </div>
  )
}

export const CanvasGraphics = ({
  graphics,
  width = 600,
  height = 600,
  withGrid = true,
  disableLabels = false,
  initialTransform,
}: CanvasGraphicsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width, height })
  const [currentTransform, setCurrentTransform] = useState<Matrix | null>(null)

  // Get bounds of the graphics with padding
  const graphicsBoundsWithPadding = React.useMemo(() => {
    const bounds = getBounds(graphics)
    const bWidth = bounds.maxX - bounds.minX
    const bHeight = bounds.maxY - bounds.minY
    return {
      minX: bounds.minX - bWidth / 10,
      minY: bounds.minY - bHeight / 10,
      maxX: bounds.maxX + bWidth / 10,
      maxY: bounds.maxY + bHeight / 10,
    }
  }, [graphics])

  // Compute initial transform if not provided
  const computedInitialTransform = React.useMemo(() => {
    if (initialTransform) return initialTransform

    const yFlip = graphics.coordinateSystem === "cartesian"
    return compose(
      translate(size.width / 2, size.height / 2),
      scale(
        Math.min(
          size.width /
            (graphicsBoundsWithPadding.maxX - graphicsBoundsWithPadding.minX),
          size.height /
            (graphicsBoundsWithPadding.maxY - graphicsBoundsWithPadding.minY),
        ),
        yFlip
          ? -Math.min(
              size.width /
                (graphicsBoundsWithPadding.maxX -
                  graphicsBoundsWithPadding.minX),
              size.height /
                (graphicsBoundsWithPadding.maxY -
                  graphicsBoundsWithPadding.minY),
            )
          : Math.min(
              size.width /
                (graphicsBoundsWithPadding.maxX -
                  graphicsBoundsWithPadding.minX),
              size.height /
                (graphicsBoundsWithPadding.maxY -
                  graphicsBoundsWithPadding.minY),
            ),
      ),
      translate(
        -(graphicsBoundsWithPadding.maxX + graphicsBoundsWithPadding.minX) / 2,
        -(graphicsBoundsWithPadding.maxY + graphicsBoundsWithPadding.minY) / 2,
      ),
    )
  }, [graphics, graphicsBoundsWithPadding, initialTransform, size])

  // Track transform changes from the mouse transform hook
  const handleTransformChange = React.useCallback((transform: Matrix) => {
    setCurrentTransform(transform)
  }, [])

  // Monitor container size
  useResizeObserver(containerRef, (entry) => {
    setSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    })
  })

  // Draw function that uses our canvas renderer
  const drawCanvas = React.useCallback(() => {
    if (!canvasRef.current || !currentTransform) return

    // Make sure canvas dimensions match container
    canvasRef.current.width = size.width
    canvasRef.current.height = size.height

    // Draw the graphics with the current transform
    drawGraphicsToCanvas(graphics, canvasRef.current, {
      transform: currentTransform,
      disableLabels,
    })

    // Draw a grid for reference if enabled
    if (withGrid) {
      drawGrid(canvasRef.current, currentTransform)
    }
  }, [canvasRef, currentTransform, graphics, size, withGrid])

  // Draw a grid to help with visualization
  const drawGrid = (canvas: HTMLCanvasElement, transform: Matrix) => {
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

    // Calculate a good grid size based on zoom level
    // This is an approximate calculation
    const zoomLevel = Math.abs(transform.a) // Scale factor
    const gridSize = Math.pow(10, Math.floor(Math.log10(100 / zoomLevel)))

    const gridRange = Math.ceil(1000 / gridSize) * gridSize

    // Draw vertical grid lines
    for (let x = -gridRange; x <= gridRange; x += gridSize) {
      if (x === 0) continue // Skip the axis

      const start = transformPoint({ x, y: -gridRange }, transform)
      const end = transformPoint({ x, y: gridRange }, transform)

      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
    }

    // Draw horizontal grid lines
    for (let y = -gridRange; y <= gridRange; y += gridSize) {
      if (y === 0) continue // Skip the axis

      const start = transformPoint({ x: -gridRange, y }, transform)
      const end = transformPoint({ x: gridRange, y }, transform)

      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
    }

    ctx.strokeStyle = "#ddd"
    ctx.stroke()
    ctx.restore()
  }

  // Helper to transform a point through the matrix
  const transformPoint = (point: { x: number; y: number }, matrix: Matrix) => {
    return {
      x: matrix.a * point.x + matrix.c * point.y + matrix.e,
      y: matrix.b * point.x + matrix.d * point.y + matrix.f,
    }
  }

  // Apply the drawing when transform changes
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Initialize transform
  useEffect(() => {
    setCurrentTransform(computedInitialTransform)
  }, [computedInitialTransform])

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: `${height}px`,
        border: "1px solid #eee",
        overflow: "hidden",
      }}
    >
      <TransformContainer
        initialTransform={computedInitialTransform}
        onTransformChange={handleTransformChange}
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
      </TransformContainer>
    </div>
  )
}
