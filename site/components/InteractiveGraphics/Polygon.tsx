import type * as Types from "lib/types"
import { useState } from "react"
import { safeLighten } from "site/utils/safeLighten"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { Tooltip } from "./Tooltip"
import { defaultColors } from "./defaultColors"

export const Polygon = ({
  polygon,
  interactiveState,
  index,
}: {
  polygon: Types.Polygon
  interactiveState: InteractiveState
  index: number
}) => {
  const { points, fill, stroke, strokeWidth } = polygon
  const { realToScreen, onObjectClicked } = interactiveState
  const [isHovered, setIsHovered] = useState(false)

  if (!points || points.length === 0) return null

  const screenPoints = points.map((p) => applyToPoint(realToScreen, p))
  const xs = screenPoints.map((p) => p.x)
  const ys = screenPoints.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const padding = 4

  const svgLeft = minX - padding
  const svgTop = minY - padding
  const svgWidth = Math.max(maxX - minX, 0) + padding * 2
  const svgHeight = Math.max(maxY - minY, 0) + padding * 2

  const localPoints = screenPoints.map((p) => ({
    x: p.x - svgLeft,
    y: p.y - svgTop,
  }))

  const defaultColor = defaultColors[index % defaultColors.length]
  const hasStrokeOrFill = fill !== undefined || stroke !== undefined
  const baseFill = hasStrokeOrFill ? fill || "transparent" : defaultColor
  const baseStroke = stroke

  const displayFill = isHovered ? safeLighten(0.2, baseFill) : baseFill
  const displayStroke = baseStroke
    ? isHovered
      ? safeLighten(0.2, baseStroke)
      : baseStroke
    : undefined
  const screenStrokeWidth =
    strokeWidth === undefined ? undefined : strokeWidth * realToScreen.a

  return (
    <div
      style={{
        position: "absolute",
        top: svgTop,
        left: svgLeft,
        width: svgWidth,
        height: svgHeight,
        pointerEvents: "none",
      }}
    >
      <svg width={svgWidth} height={svgHeight} style={{ display: "block" }}>
        <polygon
          points={localPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill={displayFill}
          stroke={displayStroke ?? "none"}
          strokeWidth={screenStrokeWidth}
          pointerEvents="all"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() =>
            onObjectClicked?.({
              type: "polygon",
              index,
              object: polygon,
            })
          }
        />
      </svg>
      {isHovered && polygon.label && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 8,
            pointerEvents: "none",
          }}
        >
          <Tooltip text={polygon.label} />
        </div>
      )}
    </div>
  )
}
