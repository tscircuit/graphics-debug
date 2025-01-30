import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"

export const Line = ({
  line,
  interactiveState,
}: { line: Types.Line; interactiveState: InteractiveState }) => {
  const { points, layer, step, strokeColor, strokeWidth } = line
  const { activeLayers, activeStep, realToScreen } = interactiveState

  const screenPoints = points.map((p) => applyToPoint(realToScreen, p))

  return (
    <svg style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <polyline
        points={screenPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}
