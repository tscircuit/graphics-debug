import {
  compose,
  type Matrix,
  applyToPoint,
  scale,
  translate,
} from "transformation-matrix"

// Margin in pixels for determining if elements are off-screen
// Small value makes it easier to see when elements aren't being rendered
// Increase this value if elements appear to pop in/out too abruptly
const OFFSCREEN_MARGIN = 5
import { GraphicsObject } from "../../../lib"
import { useMemo, useState } from "react"
import useMouseMatrixTransform from "use-mouse-matrix-transform"
import { InteractiveState } from "./InteractiveState"
import { SuperGrid } from "react-supergrid"
import useResizeObserver from "@react-hook/resize-observer"
import { Line } from "./Line"
import { Point } from "./Point"
import { Rect } from "./Rect"
import { Circle } from "./Circle"
import { getGraphicsBounds } from "site/utils/getGraphicsBounds"

export const InteractiveGraphics = ({
  graphics,
}: { graphics: GraphicsObject }) => {
  const [activeLayers, setActiveLayers] = useState<string[] | null>(null)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [size, setSize] = useState({ width: 600, height: 600 })
  const availableLayers: string[] = Array.from(
    new Set([
      ...(graphics.lines?.map((l) => l.layer!).filter(Boolean) ?? []),
      ...(graphics.rects?.map((r) => r.layer!).filter(Boolean) ?? []),
      ...(graphics.points?.map((p) => p.layer!).filter(Boolean) ?? []),
    ]),
  )
  const maxStep = Math.max(
    0,
    ...(graphics.lines?.map((l) => l.step!).filter(Boolean) ?? []),
    ...(graphics.rects?.map((r) => r.step!).filter(Boolean) ?? []),
    ...(graphics.points?.map((p) => p.step!).filter(Boolean) ?? []),
  )

  const graphicsBoundsWithPadding = useMemo(() => {
    const actualBounds = getGraphicsBounds(graphics)
    const width = actualBounds.maxX - actualBounds.minX
    const height = actualBounds.maxY - actualBounds.minY
    return {
      minX: actualBounds.minX - width / 10,
      minY: actualBounds.minY - height / 10,
      maxX: actualBounds.maxX + width / 10,
      maxY: actualBounds.maxY + height / 10,
    }
  }, [graphics])

  const { transform: realToScreen, ref } = useMouseMatrixTransform({
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

  useResizeObserver(ref, (entry: ResizeObserverEntry) => {
    setSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    })
  })

  const interactiveState: InteractiveState = {
    activeLayers: activeLayers,
    activeStep: activeStep,
    realToScreen: realToScreen,
  }

  const showToolbar = availableLayers.length > 1 || maxStep > 0

  // Helper to check if a point is on screen
  const isPointOnScreen = useMemo(() => {
    return (point: { x: number; y: number }) => {
      const screenPoint = applyToPoint(realToScreen, point)
      return (
        screenPoint.x >= -OFFSCREEN_MARGIN &&
        screenPoint.x <= size.width + OFFSCREEN_MARGIN &&
        screenPoint.y >= -OFFSCREEN_MARGIN &&
        screenPoint.y <= size.height + OFFSCREEN_MARGIN
      )
    }
  }, [realToScreen, size])

  // Helper to check if a line intersects with the viewport
  const doesLineIntersectViewport = useMemo(() => {
    return (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      // Convert real-world points to screen coordinates
      const sp1 = applyToPoint(realToScreen, p1)
      const sp2 = applyToPoint(realToScreen, p2)

      // Viewport boundaries with margin
      const left = -OFFSCREEN_MARGIN
      const right = size.width + OFFSCREEN_MARGIN
      const top = -OFFSCREEN_MARGIN
      const bottom = size.height + OFFSCREEN_MARGIN

      // If either point is inside the viewport, the line intersects
      if (
        (sp1.x >= left && sp1.x <= right && sp1.y >= top && sp1.y <= bottom) ||
        (sp2.x >= left && sp2.x <= right && sp2.y >= top && sp2.y <= bottom)
      ) {
        return true
      }

      // Helper function to check if a line intersects with a line segment
      const intersects = (
        a1: { x: number; y: number },
        a2: { x: number; y: number },
        b1: { x: number; y: number },
        b2: { x: number; y: number },
      ) => {
        // Line segment A is (a1, a2), line segment B is (b1, b2)
        const det =
          (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x)

        // If lines are parallel or coincident, they don't intersect in a unique point
        if (det === 0) return false

        const lambda =
          ((b2.y - b1.y) * (b2.x - a1.x) + (b1.x - b2.x) * (b2.y - a1.y)) / det
        const gamma =
          ((a1.y - a2.y) * (b2.x - a1.x) + (a2.x - a1.x) * (b2.y - a1.y)) / det

        // Check if the intersection point is within both line segments
        return lambda >= 0 && lambda <= 1 && gamma >= 0 && gamma <= 1
      }

      // Check intersection with each edge of the viewport
      return (
        // Top edge
        intersects(sp1, sp2, { x: left, y: top }, { x: right, y: top }) ||
        // Right edge
        intersects(sp1, sp2, { x: right, y: top }, { x: right, y: bottom }) ||
        // Bottom edge
        intersects(sp1, sp2, { x: left, y: bottom }, { x: right, y: bottom }) ||
        // Left edge
        intersects(sp1, sp2, { x: left, y: top }, { x: left, y: bottom })
      )
    }
  }, [realToScreen, size])

  // Filter by layer and step
  const filterLayerAndStep = (obj: { layer?: string; step?: number }) => {
    if (activeLayers && obj.layer && !activeLayers.includes(obj.layer))
      return false
    if (
      activeStep !== null &&
      obj.step !== undefined &&
      obj.step !== activeStep
    )
      return false
    return true
  }

  // Enhanced filters that also check visibility
  const filterLines = useMemo(() => {
    return (line: any) => {
      // First apply layer and step filters
      if (!filterLayerAndStep(line)) return false

      // Then check if any point of the line is visible
      if (
        line.points.some((p: { x: number; y: number }) => isPointOnScreen(p))
      ) {
        return true
      }

      // If no points are visible, check if any line segment intersects the viewport
      for (let i = 0; i < line.points.length - 1; i++) {
        if (doesLineIntersectViewport(line.points[i], line.points[i + 1])) {
          return true
        }
      }

      // If it's a closed shape (polyline), check the last segment too
      if (line.points.length > 2 && line.closed) {
        if (
          doesLineIntersectViewport(
            line.points[line.points.length - 1],
            line.points[0],
          )
        ) {
          return true
        }
      }

      return false
    }
  }, [isPointOnScreen, doesLineIntersectViewport, filterLayerAndStep])

  const filterPoints = useMemo(() => {
    return (point: any) => {
      // First apply layer and step filters
      if (!filterLayerAndStep(point)) return false

      // Then check if the point is visible
      return isPointOnScreen(point)
    }
  }, [isPointOnScreen, filterLayerAndStep])

  const filterRects = useMemo(() => {
    return (rect: any) => {
      // First apply layer and step filters
      if (!filterLayerAndStep(rect)) return false

      // For rectangles, check if any corner or the center is visible
      const { center, width, height } = rect
      const halfWidth = width / 2
      const halfHeight = height / 2

      const topLeft = { x: center.x - halfWidth, y: center.y - halfHeight }
      const topRight = { x: center.x + halfWidth, y: center.y - halfHeight }
      const bottomLeft = { x: center.x - halfWidth, y: center.y + halfHeight }
      const bottomRight = { x: center.x + halfWidth, y: center.y + halfHeight }

      // Check if any corner or center is visible
      if (
        isPointOnScreen(center) ||
        isPointOnScreen(topLeft) ||
        isPointOnScreen(topRight) ||
        isPointOnScreen(bottomLeft) ||
        isPointOnScreen(bottomRight)
      ) {
        return true
      }

      // Check if any edge of the rectangle intersects the viewport
      return (
        doesLineIntersectViewport(topLeft, topRight) ||
        doesLineIntersectViewport(topRight, bottomRight) ||
        doesLineIntersectViewport(bottomRight, bottomLeft) ||
        doesLineIntersectViewport(bottomLeft, topLeft)
      )
    }
  }, [isPointOnScreen, doesLineIntersectViewport, filterLayerAndStep])

  const filterCircles = useMemo(() => {
    return (circle: any) => {
      // First apply layer and step filters
      if (!filterLayerAndStep(circle)) return false

      // For circles, check if center is visible or if any cardinal point is visible
      const { center, radius } = circle

      // Check if center or cardinal points on the circle are visible
      if (
        isPointOnScreen(center) ||
        isPointOnScreen({ x: center.x + radius, y: center.y }) ||
        isPointOnScreen({ x: center.x - radius, y: center.y }) ||
        isPointOnScreen({ x: center.x, y: center.y + radius }) ||
        isPointOnScreen({ x: center.x, y: center.y - radius })
      ) {
        return true
      }

      // Check if the circle intersects the viewport
      // Convert to screen coordinates for viewport intersection test
      const screenCenter = applyToPoint(realToScreen, center)
      const scale = Math.abs(realToScreen.a) // Get the scale factor
      const screenRadius = radius * scale

      // Viewport boundaries
      const left = -OFFSCREEN_MARGIN
      const right = size.width + OFFSCREEN_MARGIN
      const top = -OFFSCREEN_MARGIN
      const bottom = size.height + OFFSCREEN_MARGIN

      // Check if the circle intersects with the viewport
      // Case 1: Circle center is inside the viewport horizontally but outside vertically
      if (screenCenter.x >= left && screenCenter.x <= right) {
        if (
          Math.abs(screenCenter.y - top) <= screenRadius ||
          Math.abs(screenCenter.y - bottom) <= screenRadius
        ) {
          return true
        }
      }

      // Case 2: Circle center is inside the viewport vertically but outside horizontally
      if (screenCenter.y >= top && screenCenter.y <= bottom) {
        if (
          Math.abs(screenCenter.x - left) <= screenRadius ||
          Math.abs(screenCenter.x - right) <= screenRadius
        ) {
          return true
        }
      }

      // Case 3: Circle center is outside the viewport, check corners
      const cornerDistanceSquared = (cornerX: number, cornerY: number) => {
        const dx = screenCenter.x - cornerX
        const dy = screenCenter.y - cornerY
        return dx * dx + dy * dy
      }

      const radiusSquared = screenRadius * screenRadius

      return (
        cornerDistanceSquared(left, top) <= radiusSquared ||
        cornerDistanceSquared(right, top) <= radiusSquared ||
        cornerDistanceSquared(left, bottom) <= radiusSquared ||
        cornerDistanceSquared(right, bottom) <= radiusSquared
      )
    }
  }, [isPointOnScreen, filterLayerAndStep, realToScreen, size])

  return (
    <div>
      {showToolbar && (
        <div style={{ margin: 8 }}>
          {availableLayers.length > 1 && (
            <select
              value={activeLayers ? activeLayers[0] : ""}
              onChange={(e) => {
                const value = e.target.value
                setActiveLayers(value === "" ? null : [value])
              }}
              style={{ marginRight: 8 }}
            >
              <option value="">All Layers</option>
              {availableLayers.map((layer) => (
                <option key={layer} value={layer}>
                  {layer}
                </option>
              ))}
            </select>
          )}

          {maxStep > 0 && (
            <div
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              Step:
              <input
                type="number"
                min={0}
                max={maxStep}
                value={activeStep ?? 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  setActiveStep(Number.isNaN(value) ? null : value)
                }}
                disabled={activeStep === null}
              />
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
            </div>
          )}
        </div>
      )}

      <div
        ref={ref}
        style={{
          position: "relative",
          height: 600,
          overflow: "hidden",
        }}
      >
        {graphics.lines?.filter(filterLines)?.map((l, i) => (
          <Line
            key={i}
            line={l}
            index={i}
            interactiveState={interactiveState}
          />
        ))}
        {graphics.rects?.filter(filterRects)?.map((r, i) => (
          <Rect
            key={i}
            rect={r}
            index={i}
            interactiveState={interactiveState}
          />
        ))}
        {graphics.points?.filter(filterPoints)?.map((p, i) => (
          <Point
            key={i}
            point={p}
            index={i}
            interactiveState={interactiveState}
          />
        ))}
        {graphics.circles?.filter(filterCircles)?.map((c, i) => (
          <Circle
            key={i}
            circle={c}
            index={i}
            interactiveState={interactiveState}
          />
        ))}
        <SuperGrid
          stringifyCoord={(x, y) => `${x.toFixed(2)}, ${y.toFixed(2)}`}
          width={size.width}
          height={size.height}
          transform={realToScreen}
        />
      </div>
    </div>
  )
}
