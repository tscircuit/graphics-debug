import type * as Types from "lib/types"
import { getProjectedRectGeometry } from "lib/rectGeometry"
import type { InteractiveState } from "./InteractiveState"
import { useEffect, useState } from "react"
import { defaultColors } from "./defaultColors"
import { safeLighten } from "site/utils/safeLighten"

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
  let { fill, stroke } = rect
  const {
    activeLayers,
    activeStep,
    realToScreen,
    onObjectClicked,
    setHoverTooltip,
  } = interactiveState
  const [isHovered, setIsHovered] = useState(false)

  const projectedRect = getProjectedRectGeometry(rect, realToScreen)

  // Default style when neither fill nor stroke is specified
  const hasStrokeOrFill = fill !== undefined || stroke !== undefined

  let backgroundColor = hasStrokeOrFill ? fill || "transparent" : defaultColor
  if (isHovered) {
    backgroundColor = safeLighten(0.2, backgroundColor)
    stroke = safeLighten(0.2, stroke!)
  }

  useEffect(() => {
    if (!isHovered || !rect.label) return

    setHoverTooltip?.({
      text: rect.label,
      x: projectedRect.center.x,
      y: projectedRect.center.y - projectedRect.height / 2,
    })

    return () => {
      setHoverTooltip?.(null)
    }
  }, [
    isHovered,
    projectedRect.center.x,
    projectedRect.center.y,
    projectedRect.height,
    rect.label,
    setHoverTooltip,
  ])

  return (
    <div
      style={{
        position: "absolute",
        left: projectedRect.center.x,
        top: projectedRect.center.y,
        width: projectedRect.width,
        height: projectedRect.height,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor,
          border: stroke
            ? `2px solid ${isHovered ? safeLighten(0.2, stroke) : stroke}`
            : "none",
          boxSizing: "border-box",
          cursor: "pointer",
          transition: "border-color 0.2s",
          transformOrigin: "center",
          transform: `rotate(${projectedRect.angleDegrees}deg)`,
          pointerEvents: "auto",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setHoverTooltip?.(null)
        }}
        onClick={() =>
          onObjectClicked?.({
            type: "rect",
            index,
            object: rect,
          })
        }
      />
    </div>
  )
}
