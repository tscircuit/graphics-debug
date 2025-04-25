import { compose, scale, translate } from "transformation-matrix"
import { GraphicsObject } from "../../../lib"
import { useMemo, useState, useEffect, useCallback } from "react"
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
import { getMaxStep } from "site/utils/getMaxStep"
import { ContextMenu } from "./ContextMenu"

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
  const [showLastStep, setShowLastStep] = useState(true)
  const [size, setSize] = useState({ width: 600, height: 600 })
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
  } | null>(null)
  const availableLayers: string[] = Array.from(
    new Set([
      ...(graphics.lines?.map((l) => l.layer!).filter(Boolean) ?? []),
      ...(graphics.rects?.map((r) => r.layer!).filter(Boolean) ?? []),
      ...(graphics.points?.map((p) => p.layer!).filter(Boolean) ?? []),
    ]),
  )
  const maxStep = getMaxStep(graphics)

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

  const getStorageKey = useCallback(() => {
    const path = window.location.pathname
    const search = window.location.search
    return `saved-camera-position-${path}${search}`
  }, [])

  const getDefaultTransform = useCallback(() => {
    return compose(
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
    )
  }, [size, graphicsBoundsWithPadding])

  const getSavedTransform = useCallback(() => {
    try {
      const savedTransform = localStorage.getItem(getStorageKey())
      if (savedTransform) {
        return JSON.parse(savedTransform)
      }
    } catch (error) {
      console.error("Error loading saved camera position:", error)
    }
    return null
  }, [getStorageKey])

  const {
    transform: realToScreen,
    ref,
    setTransform,
  } = useMouseMatrixTransform({
    initialTransform: getSavedTransform() || getDefaultTransform(),
  })

  useResizeObserver(ref, (entry: ResizeObserverEntry) => {
    setSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    })
  })

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    })
  }, [])

  const handleSaveCamera = useCallback(() => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(realToScreen))
    } catch (error) {
      console.error("Error saving camera position:", error)
    }
  }, [getStorageKey, realToScreen])

  const handleClearCamera = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey())
      setTransform(getDefaultTransform())
    } catch (error) {
      console.error("Error clearing camera position:", error)
    }
  }, [getStorageKey, getDefaultTransform, setTransform])

  const interactiveState: InteractiveState = {
    activeLayers: activeLayers,
    activeStep: showLastStep ? maxStep : activeStep,
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

    const selectedStep = showLastStep ? maxStep : activeStep
    if (
      selectedStep !== null &&
      obj.step !== undefined &&
      obj.step !== selectedStep
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

  const filterAndLimit = <T,>(
    objects: T[] | undefined,
    filterFn: (obj: T) => boolean,
  ): (T & { originalIndex: number })[] => {
    if (!objects) return []
    const filtered = objects
      .map((obj, index) => ({ ...obj, originalIndex: index }))
      .filter(filterFn)
    return objectLimit ? filtered.slice(-objectLimit) : filtered
  }

  const filteredLines = useMemo(
    () => filterAndLimit(graphics.lines, filterLines),
    [graphics.lines, filterLines, objectLimit],
  )
  const filteredRects = useMemo(
    () => filterAndLimit(graphics.rects, filterRects),
    [graphics.rects, filterRects, objectLimit],
  )
  const filteredPoints = useMemo(
    () => filterAndLimit(graphics.points, filterPoints),
    [graphics.points, filterPoints, objectLimit],
  )
  const filteredCircles = useMemo(
    () => filterAndLimit(graphics.circles, filterCircles),
    [graphics.circles, filterCircles, objectLimit],
  )

  const totalFilteredObjects =
    filteredLines.length +
    filteredRects.length +
    filteredPoints.length +
    filteredCircles.length
  const isLimitReached = objectLimit && totalFilteredObjects > objectLimit

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
                  setShowLastStep(false)
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
                    setShowLastStep(false)
                    setActiveStep(e.target.checked ? 0 : null)
                  }}
                />
                Filter by step
              </label>
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
              {isLimitReached && (
                <span style={{ color: "red", fontSize: "12px" }}>
                  Display limited to {objectLimit} objects. Received:{" "}
                  {totalFilteredObjects}.
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
        onContextMenu={handleContextMenu}
      >
        <DimensionOverlay transform={realToScreen}>
          {filteredLines.map((line) => (
            <Line
              key={line.originalIndex}
              line={line}
              index={line.originalIndex}
              interactiveState={interactiveState}
            />
          ))}
          {filteredRects.map((rect) => (
            <Rect
              key={rect.originalIndex}
              rect={rect}
              index={rect.originalIndex}
              interactiveState={interactiveState}
            />
          ))}
          {filteredPoints.map((point) => (
            <Point
              key={point.originalIndex}
              point={point}
              index={point.originalIndex}
              interactiveState={interactiveState}
            />
          ))}
          {filteredCircles.map((circle) => (
            <Circle
              key={circle.originalIndex}
              circle={circle}
              index={circle.originalIndex}
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
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onSaveCamera={handleSaveCamera}
            onClearCamera={handleClearCamera}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    </div>
  )
}
