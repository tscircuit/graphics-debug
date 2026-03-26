import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { useMemo } from "react"
import { Tooltip } from "./Tooltip"
import { distToLineSegment } from "site/utils/distToLineSegment"
import { defaultColors } from "./defaultColors"
import { safeLighten } from "site/utils/safeLighten"

export const Line = ({
  line,
  index,
  interactiveState,
  size,
  mousePosition,
}: {
  line: Types.Line
  index: number
  interactiveState: InteractiveState
  size: { width: number; height: number }
  mousePosition: { x: number; y: number } | null
}) => {
  const { activeLayers, activeStep, realToScreen, onObjectClicked } =
    interactiveState
  const {
    points,
    layer,
    step,
    strokeColor,
    strokeWidth = 1 / realToScreen.a,
    strokeDash,
  } = line

  const screenPoints = points.map((p) => applyToPoint(realToScreen, p))

  // Calculate the actual stroke width in screen pixels
  const screenStrokeWidth = strokeWidth * Math.abs(realToScreen.a)
  const hoverPadding = 3
  const minHoverRadius = 6
  const hoverRadius = Math.max(
    screenStrokeWidth / 2 + hoverPadding,
    minHoverRadius,
  )
  const hitStrokeWidth = hoverRadius * 2

  const isHovered = useMemo(() => {
    if (!mousePosition) return false
    for (let i = 0; i < screenPoints.length - 1; i++) {
      const dist = distToLineSegment(
        mousePosition.x,
        mousePosition.y,
        screenPoints[i].x,
        screenPoints[i].y,
        screenPoints[i + 1].x,
        screenPoints[i + 1].y,
      )
      if (dist <= hoverRadius) {
        return true
      }
    }
    return false
  }, [hoverRadius, mousePosition, screenPoints])

  const baseColor = strokeColor ?? defaultColors[index % defaultColors.length]

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: size.width,
        height: size.height,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <polyline
        points={screenPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        stroke="transparent"
        fill="none"
        strokeWidth={hitStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="stroke"
        onClick={
          isHovered
            ? () =>
                onObjectClicked?.({
                  type: "line",
                  index,
                  object: line,
                })
            : undefined
        }
      />
      <polyline
        points={screenPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        stroke={isHovered ? safeLighten(0.2, baseColor) : baseColor}
        fill="none"
        strokeWidth={screenStrokeWidth}
        strokeDasharray={
          !strokeDash
            ? undefined
            : typeof strokeDash === "string"
              ? strokeDash
              : `${strokeDash[0] * Math.abs(realToScreen.a)}, ${strokeDash[1] * Math.abs(realToScreen.a)}`
        }
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="none"
      />
      {isHovered && line.label && (
        <foreignObject
          x={mousePosition?.x ?? 0}
          y={(mousePosition?.y ?? 0) - 40}
          width={300}
          height={40}
        >
          <Tooltip text={line.label} />
        </foreignObject>
      )}
    </svg>
  )
}
