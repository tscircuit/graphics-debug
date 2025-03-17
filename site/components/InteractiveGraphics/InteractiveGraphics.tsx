import { compose, scale, translate } from "transformation-matrix"
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
import {
  useIsPointOnScreen,
  useDoesLineIntersectViewport,
  useFilterLines,
  useFilterPoints,
  useFilterRects,
  useFilterCircles,
} from "./hooks"
import { DimensionOverlay } from "../DimensionOverlay"

export type GraphicsObjectClickEvent = {
  type: "point" | "line" | "rect" | "circle"
  index: number
  object: any
}

export const InteractiveGraphics = ({
  graphics,
  onObjectClicked,
  objectLimit,
}: {
  graphics: GraphicsObject
  onObjectClicked?: (event: GraphicsObjectClickEvent) => void
  objectLimit?: number
}) => {
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
    onObjectClicked: onObjectClicked,
  }

  const showToolbar = availableLayers.length > 1 || maxStep > 0

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

  const filteredLines = useMemo(() => {
    if (!graphics.lines) return []
    return graphics.lines
      .map((line, index) => ({ line, originalIndex: index }))
      .filter((item) => filterLines(item.line))
  }, [graphics.lines, filterLines])

  const filteredPoints = useMemo(() => {
    if (!graphics.points) return []
    return graphics.points
      .map((point, index) => ({ point, originalIndex: index }))
      .filter((item) => filterPoints(item.point))
  }, [graphics.points, filterPoints])

  const filteredRects = useMemo(() => {
    if (!graphics.rects) return []
    return graphics.rects
      .map((rect, index) => ({ rect, originalIndex: index }))
      .filter((item) => filterRects(item.rect))
  }, [graphics.rects, filterRects])

  const filteredCircles = useMemo(() => {
    if (!graphics.circles) return []
    return graphics.circles
      .map((circle, index) => ({ circle, originalIndex: index }))
      .filter((item) => filterCircles(item.circle))
  }, [graphics.circles, filterCircles])

  const visibleObjectCount = useMemo(
    () =>
      filteredLines.length +
      filteredPoints.length +
      filteredRects.length +
      filteredCircles.length,
    [filteredLines, filteredPoints, filteredRects, filteredCircles],
  )

  const limitReached = useMemo(
    () => !!objectLimit && visibleObjectCount > objectLimit,
    [objectLimit, visibleObjectCount],
  )

  const { displayedLines, displayedPoints, displayedRects, displayedCircles } =
    useMemo(() => {
      if (!objectLimit) {
        return {
          displayedLines: filteredLines,
          displayedPoints: filteredPoints,
          displayedRects: filteredRects,
          displayedCircles: filteredCircles,
        }
      }

      let remaining = objectLimit
      const total = visibleObjectCount

      const lineCount = Math.min(
        filteredLines.length,
        Math.floor((remaining * filteredLines.length) / total),
      )
      remaining -= lineCount

      const pointCount = Math.min(
        filteredPoints.length,
        Math.floor(
          (remaining * filteredPoints.length) / (total - filteredLines.length),
        ),
      )
      remaining -= pointCount

      const rectCount = Math.min(
        filteredRects.length,
        Math.floor(
          (remaining * filteredRects.length) /
            (total - filteredLines.length - filteredPoints.length),
        ),
      )
      remaining -= rectCount

      // Use any remaining slots for circles
      const circleCount = Math.min(filteredCircles.length, remaining)

      return {
        displayedLines: filteredLines.slice(0, lineCount),
        displayedPoints: filteredPoints.slice(0, pointCount),
        displayedRects: filteredRects.slice(0, rectCount),
        displayedCircles: filteredCircles.slice(0, circleCount),
      }
    }, [
      filteredLines,
      filteredPoints,
      filteredRects,
      filteredCircles,
      objectLimit,
      visibleObjectCount,
    ])

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
              {limitReached && (
                <span style={{ color: "red", marginLeft: 8 }}>
                  Showing {objectLimit} of {visibleObjectCount} objects
                </span>
              )}
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
        <DimensionOverlay transform={realToScreen}>
          {displayedLines.map(({ line, originalIndex }) => (
            <Line
              key={`line-${originalIndex}`}
              line={line}
              index={originalIndex}
              interactiveState={interactiveState}
            />
          ))}
          {displayedRects.map(({ rect, originalIndex }) => (
            <Rect
              key={`rect-${originalIndex}`}
              rect={rect}
              index={originalIndex}
              interactiveState={interactiveState}
            />
          ))}
          {displayedPoints.map(({ point, originalIndex }) => (
            <Point
              key={`point-${originalIndex}`}
              point={point}
              index={originalIndex}
              interactiveState={interactiveState}
            />
          ))}
          {displayedCircles.map(({ circle, originalIndex }) => (
            <Circle
              key={`circle-${originalIndex}`}
              circle={circle}
              index={originalIndex}
              interactiveState={interactiveState}
            />
          ))}
          <SuperGrid
            stringifyCoord={(x, y) => `${x.toFixed(2)}, ${y.toFixed(2)}`}
            width={size.width}
            height={size.height}
            transform={realToScreen}
          />
        </DimensionOverlay>
      </div>
    </div>
  )
}
