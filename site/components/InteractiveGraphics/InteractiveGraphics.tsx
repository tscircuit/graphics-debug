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
              key={originalIndex}
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
              key={originalIndex}
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
