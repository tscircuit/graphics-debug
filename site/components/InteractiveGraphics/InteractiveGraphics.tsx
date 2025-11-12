import {
  compose,
  scale,
  translate,
  inverse,
  applyToPoint,
} from "transformation-matrix"
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
import { Text } from "./Text"
import { Arrow } from "./Arrow"
import { getGraphicsBounds } from "site/utils/getGraphicsBounds"
import { sortRectsByArea } from "site/utils/sortRectsByArea"
import {
  useIsPointOnScreen,
  useDoesLineIntersectViewport,
  useFilterLines,
  useFilterPoints,
  useFilterRects,
  useFilterCircles,
  useFilterTexts,
  useFilterArrows,
} from "./hooks"
import { DimensionOverlay } from "../DimensionOverlay"
import { getMaxStep } from "site/utils/getMaxStep"
import { ContextMenu } from "./ContextMenu"
import { Marker, MarkerPoint } from "./Marker"

export type GraphicsObjectClickEvent = {
  type: "point" | "line" | "rect" | "circle" | "text" | "arrow"
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
    clientX: number
    clientY: number
  } | null>(null)
  const [markers, setMarkers] = useState<MarkerPoint[]>([])
  const availableLayers: string[] = Array.from(
    new Set([
      ...(graphics.lines?.map((l) => l.layer!).filter(Boolean) ?? []),
      ...(graphics.rects?.map((r) => r.layer!).filter(Boolean) ?? []),
      ...(graphics.points?.map((p) => p.layer!).filter(Boolean) ?? []),
      ...(graphics.texts?.map((t) => t.layer!).filter(Boolean) ?? []),
      ...(graphics.circles?.map((c) => c.layer!).filter(Boolean) ?? []),
      ...(graphics.arrows?.map((a) => a.layer!).filter(Boolean) ?? []),
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
    const width = Math.max(
      graphicsBoundsWithPadding.maxX - graphicsBoundsWithPadding.minX,
      1,
    )
    const height = Math.max(
      graphicsBoundsWithPadding.maxY - graphicsBoundsWithPadding.minY,
      1,
    )
    const scaleFactor = Math.min(
      size.width / width,
      size.height / height,
    )
    const yFlip = graphics.coordinateSystem === "screen" ? 1 : -1

    return compose(
      translate(size.width / 2, size.height / 2),
      scale(scaleFactor, yFlip * scaleFactor),
      translate(
        -(graphicsBoundsWithPadding.maxX + graphicsBoundsWithPadding.minX) / 2,
        -(graphicsBoundsWithPadding.maxY + graphicsBoundsWithPadding.minY) / 2,
      ),
    )
  }, [
    size,
    graphicsBoundsWithPadding,
    graphics.coordinateSystem,
  ])

  type SavedData = {
    transform: any
    markers: MarkerPoint[]
  }

  const getSavedData = useCallback((): SavedData | null => {
    try {
      const savedData = localStorage.getItem(getStorageKey())
      if (savedData) {
        return JSON.parse(savedData)
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
    }
    return null
  }, [getStorageKey])

  const getSavedTransform = useCallback(() => {
    const savedData = getSavedData()
    return savedData?.transform || null
  }, [getSavedData])

  const {
    transform: realToScreen,
    ref,
    setTransform,
  } = useMouseMatrixTransform({
    initialTransform: getDefaultTransform(),
  })

  useResizeObserver(ref, (entry: ResizeObserverEntry) => {
    setSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    })
  })

  // Load saved markers on mount
  useEffect(() => {
    const savedData = getSavedData()
    if (savedData?.markers) {
      setMarkers(savedData.markers)
    }
  }, [getSavedData])

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()

    // Get mouse position
    const mouseX = event.clientX
    const mouseY = event.clientY

    // Get element position
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const elementX = rect.left
    const elementY = rect.top

    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Menu dimensions (approximate)
    const menuWidth = 160
    const menuHeight = 100

    // Position based on quadrant of the screen
    let x = mouseX - elementX
    let y = mouseY - elementY

    // If mouse is in right half of viewport, position menu to the left
    if (mouseX > viewportWidth / 2) {
      x = x - menuWidth
    }

    // If mouse is in bottom half of viewport, position menu above
    if (mouseY > viewportHeight / 2) {
      y = y - menuHeight
    }

    setContextMenu({
      x,
      y,
      clientX: mouseX,
      clientY: mouseY,
    })
  }, [])

  const saveToLocalStorage = useCallback(
    (transform: any, markerPoints: MarkerPoint[]) => {
      try {
        const dataToSave: SavedData = {
          transform,
          markers: markerPoints,
        }
        localStorage.setItem(getStorageKey(), JSON.stringify(dataToSave))
      } catch (error) {
        console.error("Error saving data:", error)
      }
    },
    [getStorageKey],
  )

  const handleSaveCamera = useCallback(() => {
    saveToLocalStorage(realToScreen, markers)
  }, [saveToLocalStorage, realToScreen, markers])

  const handleLoadCamera = useCallback(() => {
    try {
      const savedTransform = getSavedTransform()
      if (savedTransform) {
        setTransform(savedTransform)
      }
    } catch (error) {
      console.error("Error loading camera position:", error)
    }
  }, [getSavedTransform, setTransform])

  const handleClearCamera = useCallback(() => {
    try {
      const defaultTransform = getDefaultTransform()
      saveToLocalStorage(defaultTransform, markers)
      setTransform(defaultTransform)
    } catch (error) {
      console.error("Error clearing camera position:", error)
    }
  }, [saveToLocalStorage, getDefaultTransform, setTransform, markers])

  const handleAddMark = useCallback(() => {
    if (!contextMenu) return

    try {
      // Convert screen coordinates to real-world coordinates
      const screenPoint = { x: contextMenu.clientX, y: contextMenu.clientY }
      const rect = ref.current?.getBoundingClientRect()

      if (rect) {
        const screenX = screenPoint.x - rect.left
        const screenY = screenPoint.y - rect.top

        // Apply inverse transform to get real-world coordinates
        const inverseTransform = inverse(realToScreen)
        const [realX, realY] = applyToPoint(inverseTransform, [
          screenX,
          screenY,
        ])

        const newMarker: MarkerPoint = { x: realX, y: realY }
        const newMarkers = [...markers, newMarker]

        setMarkers(newMarkers)
        const savedData = getSavedData()
        if (savedData?.transform) {
          saveToLocalStorage(savedData.transform, newMarkers)
        }
      }
    } catch (error) {
      console.error("Error adding marker:", error)
    }
  }, [contextMenu, ref, realToScreen, markers, saveToLocalStorage])

  const handleClearMarks = useCallback(() => {
    setMarkers([])
    const savedData = getSavedData()
    if (savedData?.transform) {
      saveToLocalStorage(savedData.transform, [])
    }
  }, [getSavedData, saveToLocalStorage])

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
  const filterTexts = useFilterTexts(isPointOnScreen, filterLayerAndStep)
  const filterArrows = useFilterArrows(
    isPointOnScreen,
    doesLineIntersectViewport,
    filterLayerAndStep,
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
    () => sortRectsByArea(filterAndLimit(graphics.rects, filterRects)),
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
  const filteredTexts = useMemo(
    () => filterAndLimit(graphics.texts, filterTexts),
    [graphics.texts, filterTexts, objectLimit],
  )
  const filteredArrows = useMemo(
    () => filterAndLimit(graphics.arrows, filterArrows),
    [graphics.arrows, filterArrows, objectLimit],
  )

  const totalFilteredObjects =
    filteredLines.length +
    filteredRects.length +
    filteredPoints.length +
    filteredCircles.length +
    filteredTexts.length +
    filteredArrows.length
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
          {filteredArrows.map((arrow) => (
            <Arrow
              key={arrow.originalIndex}
              arrow={arrow}
              index={arrow.originalIndex}
              interactiveState={interactiveState}
            />
          ))}
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
          {filteredTexts.map((txt) => (
            <Text
              key={txt.originalIndex}
              textObj={txt}
              index={txt.originalIndex}
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
        {markers.map((marker, index) => (
          <Marker
            key={index}
            marker={marker}
            index={index}
            transform={realToScreen}
          />
        ))}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onSaveCamera={handleSaveCamera}
            onLoadCamera={handleLoadCamera}
            onClearCamera={handleClearCamera}
            onAddMark={handleAddMark}
            onClearMarks={handleClearMarks}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    </div>
  )
}
