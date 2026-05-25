import {
  clipInfiniteLineToBounds,
  getViewportBoundsFromMatrix,
} from "lib/infiniteLineHelpers"
import type * as Types from "lib/types"
import { useState } from "react"
import { safeLighten } from "site/utils/safeLighten"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { defaultColors } from "./defaultColors"

export const InfiniteLine = ({
  infiniteLine,
  index,
  interactiveState,
  size,
}: {
  infiniteLine: Types.InfiniteLine
  index: number
  interactiveState: InteractiveState
  size: { width: number; height: number }
}) => {
  const { realToScreen, onObjectClicked, setHoverTooltip } = interactiveState
  const [isHovered, setIsHovered] = useState(false)

  const viewportBounds = getViewportBoundsFromMatrix(
    realToScreen,
    size.width,
    size.height,
  )
  const segment = clipInfiniteLineToBounds(infiniteLine, viewportBounds)

  if (!segment) {
    return null
  }

  const [start, end] = segment
  const screenStart = applyToPoint(realToScreen, start)
  const screenEnd = applyToPoint(realToScreen, end)
  const baseColor =
    infiniteLine.strokeColor ?? defaultColors[index % defaultColors.length]
  const strokeWidth =
    (infiniteLine.strokeWidth ?? 1 / Math.abs(realToScreen.a)) *
    Math.abs(realToScreen.a)
  const tooltipX = (screenStart.x + screenEnd.x) / 2
  const tooltipY = (screenStart.y + screenEnd.y) / 2

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: size.width,
        height: size.height,
        pointerEvents: "none",
      }}
    >
      <svg
        style={{
          width: size.width,
          height: size.height,
          pointerEvents: "none",
        }}
      >
        <line
          x1={screenStart.x}
          y1={screenStart.y}
          x2={screenEnd.x}
          y2={screenEnd.y}
          stroke="transparent"
          strokeWidth={strokeWidth + 10}
          pointerEvents="stroke"
          onMouseEnter={() => {
            setIsHovered(true)
            if (infiniteLine.label) {
              setHoverTooltip?.({
                text: infiniteLine.label,
                x: tooltipX,
                y: tooltipY,
              })
            }
          }}
          onMouseLeave={() => {
            setIsHovered(false)
            setHoverTooltip?.(null)
          }}
          onClick={() =>
            onObjectClicked?.({
              type: "infinite-line",
              index,
              object: infiniteLine,
            })
          }
        />
        <line
          x1={screenStart.x}
          y1={screenStart.y}
          x2={screenEnd.x}
          y2={screenEnd.y}
          stroke={isHovered ? safeLighten(0.2, baseColor) : baseColor}
          strokeWidth={strokeWidth}
          strokeDasharray={
            !infiniteLine.strokeDash
              ? undefined
              : typeof infiniteLine.strokeDash === "string"
                ? infiniteLine.strokeDash
                : infiniteLine.strokeDash
                    .map((dash) => dash * Math.abs(realToScreen.a))
                    .join(",")
          }
          pointerEvents="none"
        />
      </svg>
    </div>
  )
}
