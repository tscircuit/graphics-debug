import type * as Types from "lib/types"
import { useEffect, useState } from "react"
import { safeLighten } from "site/utils/safeLighten"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
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
  const { realToScreen, onObjectClicked, setHoverTooltip } = interactiveState
  const [isHovered, setIsHovered] = useState(false)

  const hasPoints = Boolean(points && points.length > 0)
  const screenPoints = hasPoints
    ? points.map((p) => applyToPoint(realToScreen, p))
    : []
  const xs = screenPoints.map((p) => p.x)
  const ys = screenPoints.map((p) => p.y)
  const minX = hasPoints ? Math.min(...xs) : 0
  const maxX = hasPoints ? Math.max(...xs) : 0
  const minY = hasPoints ? Math.min(...ys) : 0
  const maxY = hasPoints ? Math.max(...ys) : 0
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

  useEffect(() => {
    if (!hasPoints || !isHovered || !polygon.label) return

    setHoverTooltip?.({
      text: polygon.label,
      x: (minX + maxX) / 2,
      y: svgTop,
    })

    return () => {
      setHoverTooltip?.(null)
    }
  }, [hasPoints, isHovered, maxX, minX, polygon.label, setHoverTooltip, svgTop])

  if (!hasPoints) return null

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
          onMouseLeave={() => {
            setIsHovered(false)
            setHoverTooltip?.(null)
          }}
          onClick={() =>
            onObjectClicked?.({
              type: "polygon",
              index,
              object: polygon,
            })
          }
        />
      </svg>
    </div>
  )
}
