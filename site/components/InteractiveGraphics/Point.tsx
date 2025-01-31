import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { lighten } from "polished"
import { useState } from "react"
import { Tooltip } from "./Tooltip"
import { defaultColors } from "./defaultColors"

export const Point = ({
  point,
  interactiveState,
  index,
}: {
  point: Types.Point
  interactiveState: InteractiveState
  index: number
}) => {
  const { color, label, layer, step } = point
  const { activeLayers, activeStep, realToScreen } = interactiveState
  const [isHovered, setIsHovered] = useState(false)

  const screenPoint = applyToPoint(realToScreen, point)
  const size = 10

  return (
    <div
      style={{
        position: "absolute",
        left: screenPoint.x - size / 2,
        top: screenPoint.y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${
          isHovered
            ? lighten(0.2, color ?? defaultColors[index % defaultColors.length])
            : color ?? defaultColors[index % defaultColors.length]
        }`,
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && label && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 8,
          }}
        >
          <Tooltip text={label} />
        </div>
      )}
    </div>
  )
}
