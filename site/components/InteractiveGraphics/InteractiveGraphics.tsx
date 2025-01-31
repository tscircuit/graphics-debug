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

export const InteractiveGraphics = ({
  graphics,
}: { graphics: GraphicsObject }) => {
  const [activeLayers, setActiveLayers] = useState<string[] | null>(null)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [size, setSize] = useState({ width: 600, height: 600 })

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

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        height: 600,
        overflow: "hidden",
      }}
    >
      {graphics.lines?.map((l, i) => (
        <Line key={i} line={l} interactiveState={interactiveState} />
      ))}
      <SuperGrid
        stringifyCoord={(x, y) => `${x.toFixed(2)}, ${y.toFixed(2)}`}
        width={size.width}
        height={size.height}
        transform={realToScreen}
      />
    </div>
  )
}
