import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { lighten } from "polished"
import { useState } from "react"
import { Tooltip } from "./Tooltip"

export const Rect = ({
  rect,
  interactiveState,
}: {
  rect: Types.Rect
  interactiveState: InteractiveState
}) => {
  const { center, width, height, fill, stroke, layer, step } = rect
  const { activeLayers, activeStep, realToScreen } = interactiveState
  const [isHovered, setIsHovered] = useState(false)

  const screenCenter = applyToPoint(realToScreen, center)
  const screenWidth = width * realToScreen.a
  const screenHeight = height * Math.abs(realToScreen.d)

  // Default style when neither fill nor stroke is specified
  const defaultColor = "rgba(0, 0, 255, 0.2)" // faded blue
  const hasStrokeOrFill = fill !== undefined || stroke !== undefined

  return (
    <div
      style={{
        position: "absolute",
        left: screenCenter.x - screenWidth / 2,
        top: screenCenter.y - screenHeight / 2,
        width: screenWidth,
        height: screenHeight,
        backgroundColor: hasStrokeOrFill ? (fill || "transparent") : defaultColor,
        border: stroke ? `2px solid ${isHovered ? lighten(0.2, stroke) : stroke}` : "none",
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
