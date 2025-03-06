import { compose, scale, translate } from "transformation-matrix"
import { GraphicsObject } from "../../../lib"
import { useMemo, useState, useRef, useEffect } from "react"
import useMouseMatrixTransform from "use-mouse-matrix-transform"
import { InteractiveState } from "./InteractiveState"
import { SuperGrid } from "react-supergrid"
import useResizeObserver from "@react-hook/resize-observer"
import { Line } from "./Line"
import { Point } from "./Point"
import { Rect } from "./Rect"
import { Circle } from "./Circle"
import { getGraphicsBounds } from "site/utils/getGraphicsBounds"
import {
  useIsPointOnScreen,
  useDoesLineIntersectViewport,
  useFilterLines,
  useFilterPoints,
  useFilterRects,
  useFilterCircles,
} from "./hooks"

// Type for tracking animated elements
type AnimatedElementsMap = {
  lines: Record<string, { points: { x: number; y: number }[] }>
  points: Record<string, { x: number; y: number }>
}

export type GraphicsObjectClickEvent = {
  type: "point" | "line" | "rect" | "circle"
  index: number
  object: any
}

export const InteractiveGraphics = ({
  graphics,
  onObjectClicked,
}: {
  graphics: GraphicsObject
  onObjectClicked?: (event: GraphicsObjectClickEvent) => void
}) => {
  const [activeLayers, setActiveLayers] = useState<string[] | null>(null)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [size, setSize] = useState({ width: 600, height: 600 })
  const [animatedElements, setAnimatedElements] = useState<AnimatedElementsMap>(
    {
      lines: {},
      points: {},
    },
  )
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
    onObjectClicked: onObjectClicked,
    animatedElements: animatedElements,
  }

  const showToolbar = availableLayers.length > 1 || maxStep > 0

  // Effect to track elements with animationKey
  useEffect(() => {
    // Create a copy of current state to build the new state
    const newAnimatedElements: AnimatedElementsMap = {
      lines: {},
      points: {},
    }

    // First, copy all existing animation keys (for cases where elements were removed)
    Object.keys(animatedElements.lines).forEach((key) => {
      newAnimatedElements.lines[key] = animatedElements.lines[key]
    })

    Object.keys(animatedElements.points).forEach((key) => {
      newAnimatedElements.points[key] = animatedElements.points[key]
    })

    // Then process current graphics objects
    // Track lines with animationKey
    graphics.lines?.forEach((line) => {
      if (line.animationKey) {
        // Only update if we don't already have this key or the points have changed
        const existingLine = animatedElements.lines[line.animationKey]

        if (!existingLine) {
          // First time we're seeing this line
          newAnimatedElements.lines[line.animationKey] = {
            points: [...line.points],
          }
        }
        // Otherwise keep the existing entry for animation purposes
      }
    })

    // Track points with animationKey
    graphics.points?.forEach((point) => {
      if (point.animationKey) {
        // Only update if we don't already have this key or the point has changed
        const existingPoint = animatedElements.points[point.animationKey]

        if (!existingPoint) {
          // First time we're seeing this point
          newAnimatedElements.points[point.animationKey] = {
            x: point.x,
            y: point.y,
          }
        }
        // Otherwise keep the existing entry for animation purposes
      }
    })

    // After animation completes, we need to update the stored positions
    // This is handled in the individual components

    setAnimatedElements(newAnimatedElements)
  }, [graphics])

  // Use custom hooks for visibility checks and filtering
  const isPointOnScreen = useIsPointOnScreen(realToScreen, size)

  const doesLineIntersectViewport = useDoesLineIntersectViewport(
    realToScreen,
    size,
  )

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

  const filterLines = useFilterLines(
    isPointOnScreen,
    doesLineIntersectViewport,
    filterLayerAndStep,
  )

  const filterPoints = useFilterPoints(isPointOnScreen, filterLayerAndStep)

  const filterRects = useFilterRects(
    isPointOnScreen,
    doesLineIntersectViewport,
    filterLayerAndStep,
  )

  const filterCircles = useFilterCircles(
    isPointOnScreen,
    filterLayerAndStep,
    realToScreen,
    size,
  )

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
        {graphics.lines?.map((l, originalIndex) =>
          filterLines(l) ? (
            <Line
              key={
                l.animationKey
                  ? `line-${l.animationKey}`
                  : `line-${originalIndex}`
              }
              line={l}
              index={originalIndex}
              interactiveState={interactiveState}
            />
          ) : null,
        )}
        {graphics.rects?.map((r, originalIndex) =>
          filterRects(r) ? (
            <Rect
              key={originalIndex}
              rect={r}
              index={originalIndex}
              interactiveState={interactiveState}
            />
          ) : null,
        )}
        {graphics.points?.map((p, originalIndex) =>
          filterPoints(p) ? (
            <Point
              key={
                p.animationKey
                  ? `point-${p.animationKey}`
                  : `point-${originalIndex}`
              }
              point={p}
              index={originalIndex}
              interactiveState={interactiveState}
            />
          ) : null,
        )}
        {graphics.circles?.map((c, originalIndex) =>
          filterCircles(c) ? (
            <Circle
              key={originalIndex}
              circle={c}
              index={originalIndex}
              interactiveState={interactiveState}
            />
          ) : null,
        )}
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
