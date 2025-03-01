import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { useState } from "react"
import { Tooltip } from "./Tooltip"
import { defaultColors } from "./defaultColors"
import { safeLighten } from "site/utils/safeLighten"

export const Circle = ({
  circle,
  interactiveState,
  index,
}: {
  circle: Types.Circle
  interactiveState: InteractiveState
  index: number
}) => {
  const defaultColor = defaultColors[index % defaultColors.length]
  let { center, radius, fill, stroke, layer, step, label } = circle
  const { activeLayers, activeStep, realToScreen, onObjectClicked } =
    interactiveState
  const [isHovered, setIsHovered] = useState(false)
  const screenCenter = applyToPoint(realToScreen, center)
  const screenRadius = radius * realToScreen.a
  let backgroundColor = fill || defaultColor
  if (isHovered) {
    backgroundColor = safeLighten(0.2, backgroundColor)
    stroke = stroke ? safeLighten(0.2, stroke) : stroke
  }
  return (
    <div
      style={{
        position: "absolute",
        left: screenCenter.x - screenRadius,
        top: screenCenter.y - screenRadius,
        width: screenRadius * 2,
        height: screenRadius * 2,
        borderRadius: "50%",
        backgroundColor,
        border: stroke ? `2px solid ${stroke}` : "none",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() =>
        onObjectClicked?.({
          type: "circle",
          index,
          object: circle,
        })
      }
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
