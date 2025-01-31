import {
  compose,
  type Matrix,
  applyToPoint,
  scale,
  translate,
} from "transformation-matrix"
import { GraphicsObject } from "../../../lib"
import { useState } from "react"
import useMouseMatrixTransform from "use-mouse-matrix-transform"
import { InteractiveState } from "./InteractiveState"
import { SuperGrid } from "react-supergrid"
import useResizeObserver from "@react-hook/resize-observer"
import { Line } from "./Line"
import { Point } from "./Point"
import { Rect } from "./Rect"

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

  const { transform: realToScreen, ref } = useMouseMatrixTransform({
    initialTransform: compose(translate(0, size.height), scale(1, -1)),
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
        {graphics.lines?.filter(filterLayerAndStep)?.map((l, i) => (
          <Line
            key={i}
            line={l}
            index={i}
            interactiveState={interactiveState}
          />
        ))}
        {graphics.rects?.filter(filterLayerAndStep)?.map((r, i) => (
          <Rect
            key={i}
            rect={r}
            index={i}
            interactiveState={interactiveState}
          />
        ))}
        {graphics.points?.filter(filterLayerAndStep)?.map((p, i) => (
          <Point
            key={i}
            point={p}
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
