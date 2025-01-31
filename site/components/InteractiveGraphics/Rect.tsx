import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { lighten } from "polished"
import { useState } from "react"
import { Tooltip } from "./Tooltip"
import { defaultColors } from "./defaultColors"

export const Rect = ({
  rect,
  interactiveState,
  index,
}: {
  rect: Types.Rect
  interactiveState: InteractiveState
  index: number
}) => {
  const defaultColor = defaultColors[index % defaultColors.length]
  let { center, width, height, fill, stroke, layer, step } = rect
  const { activeLayers, activeStep, realToScreen } = interactiveState
  const [isHovered, setIsHovered] = useState(false)

  const screenCenter = applyToPoint(realToScreen, center)
  const screenWidth = width * realToScreen.a
  const screenHeight = height * Math.abs(realToScreen.d)

  // Default style when neither fill nor stroke is specified
  const hasStrokeOrFill = fill !== undefined || stroke !== undefined

  let backgroundColor = hasStrokeOrFill ? fill || "transparent" : defaultColor
  if (isHovered) {
    try {
      backgroundColor = lighten(0.2, backgroundColor)
    } catch (e) {}
    try {
      if (stroke) {
        stroke = lighten(0.2, stroke)
      }
    } catch (e) {}
  }

  return (
    <div
      style={{
        position: "absolute",
        left: screenCenter.x - screenWidth / 2,
        top: screenCenter.y - screenHeight / 2,
        width: screenWidth,
        height: screenHeight,
        backgroundColor,
        border: stroke
          ? `2px solid ${isHovered ? lighten(0.2, stroke) : stroke}`
          : "none",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && rect.label && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 8,
          }}
        >
          <Tooltip text={rect.label} />
        </div>
      )}
    </div>
  )
}
