import { compose, type Matrix, applyToPoint } from "transformation-matrix"
import { GraphicsObject } from "../../../lib"
import { useState } from "react"
import useMouseMatrixTransform from "use-mouse-matrix-transform"
import { InteractiveState } from "./InteractiveState"
import { SuperGrid } from "react-supergrid"

export const InteractiveGraphics = ({
  graphics,
}: { graphics: GraphicsObject }) => {
  const [activeLayers, setActiveLayers] = useState<string[] | null>(null)
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const { transform: realToScreen, ref } = useMouseMatrixTransform({})

  const interactiveState: InteractiveState = {
    activeLayers: activeLayers,
    activeStep: activeStep,
    realToScreen: transform,
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
      <SuperGrid width={600} height={600} transform={realToScreen} />
    </div>
  )
}
