import { useRef, useEffect, useState, type MouseEvent } from "react"
import { drawGraphicsToCanvas, type GraphicsObject } from "../../lib"
import useMouseMatrixTransform from "use-mouse-matrix-transform"
import { compose, scale, translate, type Matrix } from "transformation-matrix"
import useResizeObserver from "@react-hook/resize-observer"
import { getCanvasObjectLabelAtPoint } from "../../lib/getCanvasObjectLabelAtPoint"
import { getMaxStep } from "site/utils/getMaxStep"
import { getGraphicsFilteredByStep } from "site/utils/getGraphicsFilteredByStep"
import { getGraphicsBoundsWithPadding } from "site/utils/getGraphicsBoundsWithPadding"

interface InteractiveGraphicsCanvasProps {
  graphics: GraphicsObject
  showLabelsByDefault?: boolean
  showGrid?: boolean
  height?: number | string
  width?: number | string
}

export function InteractiveGraphicsCanvas({
  graphics,
  showLabelsByDefault = false,
  showGrid = true,
  height = 500,
  width = "100%",
}: InteractiveGraphicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 600, height: 600 })
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [showLabels, setShowLabels] = useState(showLabelsByDefault)
  const [showLastStep, setShowLastStep] = useState(true)
  const [enableObjectInteraction, setEnableObjectInteraction] = useState(false)
  const [selectedObjectLabel, setSelectedObjectLabel] = useState<string | null>(
    null,
  )

  // Calculate the maximum step value from all graphics objects
  const maxStep = getMaxStep(graphics)

  // Filter graphics objects based on step
  const filteredGraphics = getGraphicsFilteredByStep(graphics, {
    activeStep,
    showLastStep,
    maxStep,
  })

  // Get bounds of the graphics with padding
  const graphicsBoundsWithPadding = getGraphicsBoundsWithPadding(graphics)

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
    drawGraphicsToCanvas(filteredGraphics, canvasRef.current, {
      transform: transform,
      disableLabels: !showLabels,
      hideInlineLabels: !showLabels,
    })

    // Draw a grid for reference if requested
    if (showGrid) {
      drawGrid(canvasRef.current, transform)
    }
  }

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
  const transformPoint = (point: { x: number; y: number }, matrix: Matrix) => {
    return {
      x: matrix.a * point.x + matrix.c * point.y + matrix.e,
      y: matrix.b * point.x + matrix.d * point.y + matrix.f,
    }
  }

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!enableObjectInteraction || !canvasRef.current) return

    const canvas = canvasRef.current
    const bounds = canvas.getBoundingClientRect()
    const scaleX = bounds.width === 0 ? 1 : canvas.width / bounds.width
    const scaleY = bounds.height === 0 ? 1 : canvas.height / bounds.height

    const label = getCanvasObjectLabelAtPoint(
      filteredGraphics,
      transform,
      {
        x: (event.clientX - bounds.left) * scaleX,
        y: (event.clientY - bounds.top) * scaleY,
      },
      {
        hitSlop: 8,
      },
    )

    setSelectedObjectLabel(label)
  }

  // Apply the drawing when transform changes
  useEffect(() => {
    drawCanvas()
  }, [transform, size, filteredGraphics, showGrid, showLabels])

  useEffect(() => {
    if (!selectedObjectLabel) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedObjectLabel(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedObjectLabel])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label>
            <input
              type="checkbox"
              style={{ marginRight: 4 }}
              checked={activeStep !== null}
              onChange={(e) => {
                setActiveStep(e.target.checked ? 0 : null)
              }}
            />
            Filter by step
          </label>

          <input
            type="number"
            min={0}
            max={maxStep}
            value={activeStep ?? 0}
            onChange={(e) => {
              const value = parseInt(e.target.value)
              setShowLastStep(false)
              setActiveStep(Number.isNaN(value) ? 0 : Math.min(value, maxStep))
            }}
            disabled={activeStep === null}
            style={{ width: "60px" }}
          />

          <label>
            <input
              type="checkbox"
              style={{ marginRight: 4 }}
              checked={showLastStep}
              onChange={(e) => {
                setShowLastStep(e.target.checked)
                setActiveStep(null)
              }}
            />
            Show last step
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label>
            <input
              type="checkbox"
              style={{ marginRight: 4 }}
              checked={showLabels}
              onChange={(e) => {
                setShowLabels(e.target.checked)
              }}
            />
            Show labels
          </label>

          <label>
            <input
              type="checkbox"
              style={{ marginRight: 4 }}
              checked={enableObjectInteraction}
              onChange={(event) => {
                const isEnabled = event.target.checked
                setEnableObjectInteraction(isEnabled)
                if (!isEnabled) {
                  setSelectedObjectLabel(null)
                }
              }}
            />
            Enable Object Interation
          </label>
        </div>
      </div>

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
          width: width,
          height: height,
          border: "1px solid #ccc",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height,
          }}
        />

        {selectedObjectLabel && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Object label"
            onClick={() => {
              setSelectedObjectLabel(null)
            }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              background: "rgba(0, 0, 0, 0.28)",
            }}
          >
            <div
              onClick={(event) => {
                event.stopPropagation()
              }}
              style={{
                width: "min(420px, 100%)",
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Object label
              </div>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  marginBottom: 16,
                }}
              >
                {selectedObjectLabel}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedObjectLabel(null)
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InteractiveGraphicsCanvas
