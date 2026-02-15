import {
  clipInfiniteLineToBounds,
  getViewportBoundsFromMatrix,
} from "lib/infiniteLineHelpers"
import type * as Types from "lib/types"
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
  const { realToScreen, onObjectClicked } = interactiveState

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

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
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
        stroke={baseColor}
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
  )
}
