import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { useEffect, useState } from "react"
import { defaultColors } from "./defaultColors"
import { safeLighten } from "site/utils/safeLighten"

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
  const {
    activeLayers,
    activeStep,
    realToScreen,
    onObjectClicked,
    setHoverTooltip,
  } = interactiveState
  const [isHovered, setIsHovered] = useState(false)

  const screenPoint = applyToPoint(realToScreen, point)
  const size = 10
  const tooltipText = `${label ? `${label}\n` : ""}x: ${point.x.toFixed(2)}, y: ${point.y.toFixed(2)}`

  useEffect(() => {
    if (!isHovered) return

    setHoverTooltip?.({
      text: tooltipText,
      x: screenPoint.x,
      y: screenPoint.y - size / 2,
    })

    return () => {
      setHoverTooltip?.(null)
    }
  }, [isHovered, screenPoint.x, screenPoint.y, setHoverTooltip, tooltipText])

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
            ? safeLighten(
                0.2,
                color ?? defaultColors[index % defaultColors.length],
              )
            : (color ?? defaultColors[index % defaultColors.length])
        }`,
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setHoverTooltip?.(null)
      }}
      onClick={() =>
        onObjectClicked?.({
          type: "point",
          index,
          object: point,
        })
      }
    ></div>
  )
}
