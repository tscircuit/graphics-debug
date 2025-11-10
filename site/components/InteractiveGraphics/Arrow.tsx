import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { useMemo, useState } from "react"
import type { MouseEvent as ReactMouseEvent } from "react"
import { Tooltip } from "./Tooltip"
import { distToLineSegment } from "site/utils/distToLineSegment"
import { defaultColors } from "./defaultColors"
import { safeLighten } from "site/utils/safeLighten"

const getArrowHeadPoints = (
  tip: { x: number; y: number },
  tail: { x: number; y: number },
  headLength: number,
  headWidth: number,
) => {
  const angle = Math.atan2(tip.y - tail.y, tip.x - tail.x)
  const sin = Math.sin(angle)
  const cos = Math.cos(angle)

  return [
    tip,
    {
      x: tip.x - headLength * cos + headWidth * sin,
      y: tip.y - headLength * sin - headWidth * cos,
    },
    {
      x: tip.x - headLength * cos - headWidth * sin,
      y: tip.y - headLength * sin + headWidth * cos,
    },
  ]
}

export const Arrow = ({
  arrow,
  index,
  interactiveState,
}: {
  arrow: Types.Arrow
  index: number
  interactiveState: InteractiveState
}) => {
  const { realToScreen, onObjectClicked } = interactiveState
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const screenStart = useMemo(
    () => applyToPoint(realToScreen, arrow.start),
    [arrow.start, realToScreen],
  )
  const screenEnd = useMemo(
    () => applyToPoint(realToScreen, arrow.end),
    [arrow.end, realToScreen],
  )

  const rawScale = Math.abs(realToScreen.a)
  const scale = rawScale === 0 ? 1 : rawScale
  const strokeWidth = (arrow.strokeWidth ?? 1 / scale) * scale
  const color = arrow.strokeColor ?? defaultColors[index % defaultColors.length]
  const headLength = (arrow.headLength ?? 10) * scale
  const headWidth = arrow.headWidth ?? headLength / 2

  const endHead = getArrowHeadPoints(
    screenEnd,
    screenStart,
    headLength,
    headWidth,
  )
  const startHead = arrow.doubleSided
    ? getArrowHeadPoints(screenStart, screenEnd, headLength, headWidth)
    : null

  const handleMouseMove = (event: ReactMouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    setMousePos({ x: mouseX, y: mouseY })

    const distance = distToLineSegment(
      mouseX,
      mouseY,
      screenStart.x,
      screenStart.y,
      screenEnd.x,
      screenEnd.y,
    )

    setIsHovered(distance < 10)
  }

  const baseColor = color
  const displayColor = isHovered ? safeLighten(0.2, baseColor) : baseColor

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
      onClick={
        isHovered
          ? () =>
              onObjectClicked?.({
                type: "arrow",
                index,
                object: arrow,
              })
          : undefined
      }
    >
      <line
        x1={screenStart.x}
        y1={screenStart.y}
        x2={screenEnd.x}
        y2={screenEnd.y}
        stroke={displayColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <polygon
        points={endHead.map((point) => `${point.x},${point.y}`).join(" ")}
        fill={displayColor}
      />
      {startHead && (
        <polygon
          points={startHead.map((point) => `${point.x},${point.y}`).join(" ")}
          fill={displayColor}
        />
      )}
      {isHovered && arrow.label && (
        <foreignObject
          x={mousePos.x}
          y={mousePos.y - 40}
          width={300}
          height={40}
        >
          <Tooltip text={arrow.label} />
        </foreignObject>
      )}
    </svg>
  )
}
