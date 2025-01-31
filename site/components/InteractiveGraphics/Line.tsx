import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { lighten } from "polished"
import { useState } from "react"
import { Tooltip } from "./Tooltip"
import { distToLineSegment } from "site/utils/distToLineSegment"
import { defaultColors } from "./defaultColors"

export const Line = ({
  line,
  index,
  interactiveState,
}: { line: Types.Line; index: number; interactiveState: InteractiveState }) => {
  const { activeLayers, activeStep, realToScreen } = interactiveState
  const {
    points,
    layer,
    step,
    strokeColor,
    strokeWidth = 1 / realToScreen.a,
  } = line
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const screenPoints = points.map((p) => applyToPoint(realToScreen, p))

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

  const baseColor = strokeColor ?? defaultColors[index % defaultColors.length]

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
      }}
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
