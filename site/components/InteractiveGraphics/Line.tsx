import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { lighten } from "polished"
import { useState } from "react"
import { Tooltip } from "./Tooltip"

export const Line = ({
  line,
  index,
  interactiveState,
}: { line: Types.Line; index: number; interactiveState: InteractiveState }) => {
  const { points, layer, step, strokeColor, strokeWidth = 1 } = line
  const { activeLayers, activeStep, realToScreen } = interactiveState
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const screenPoints = points.map((p) => applyToPoint(realToScreen, p))

  // Calculate distance from point to line segment
  const distToLineSegment = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) => {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) param = dot / lenSq

    let xx = 0
    let yy = 0

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = px - xx
    const dy = py - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const hoverThreshold = 10 // pixels

    setMousePos({ x: mouseX, y: mouseY })

    // Check distance to each line segment
    let isNearLine = false
    for (let i = 0; i < screenPoints.length - 1; i++) {
      const dist = distToLineSegment(
        mouseX,
        mouseY,
        screenPoints[i].x,
        screenPoints[i].y,
        screenPoints[i + 1].x,
        screenPoints[i + 1].y,
      )
      if (dist < hoverThreshold) {
        isNearLine = true
        break
      }
    }

    setIsHovered(isNearLine)
  }

  const baseColor = strokeColor ?? "blue"

  return (
    <svg
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
    >
      <polyline
        points={screenPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        stroke={isHovered ? lighten(0.2, baseColor) : baseColor}
        strokeWidth={strokeWidth * realToScreen.a}
      />
      {isHovered && line.label && (
        <foreignObject
          x={mousePos.x}
          y={mousePos.y - 40}
          width={300}
          height={40}
        >
          <Tooltip text={line.label} />
        </foreignObject>
      )}
    </svg>
  )
}
