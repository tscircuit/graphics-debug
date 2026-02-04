import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { useRef, useState } from "react"
import { Tooltip } from "./Tooltip"
import { distToLineSegment } from "site/utils/distToLineSegment"
import { defaultColors } from "./defaultColors"
import { safeLighten } from "site/utils/safeLighten"

export const Line = ({
  line,
  index,
  interactiveState,
}: { line: Types.Line; index: number; interactiveState: InteractiveState }) => {
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
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const svgRef = useRef<SVGSVGElement | null>(null)

  const screenPoints = points.map((p) => applyToPoint(realToScreen, p))

  const xs = screenPoints.map((p) => p.x)
  const ys = screenPoints.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const hoverThreshold = 10 // pixels
  // Calculate the actual stroke width in screen pixels
  const screenStrokeWidth = strokeWidth * realToScreen.a
  // Padding must account for half the stroke width (stroke extends both sides of the line)
  // plus the hover threshold for interaction
  const padding = Math.max(hoverThreshold + 4, screenStrokeWidth / 2 + 2)

  const svgLeft = minX - padding
  const svgTop = minY - padding
  const svgWidth = Math.max(maxX - minX, 0) + padding * 2
  const svgHeight = Math.max(maxY - minY, 0) + padding * 2

  const localPoints = screenPoints.map((p) => ({
    x: p.x - svgLeft,
    y: p.y - svgTop,
  }))

  const handleMouseMove = (e: React.MouseEvent<SVGPolylineElement>) => {
    const rect =
      svgRef.current?.getBoundingClientRect() ??
      e.currentTarget.ownerSVGElement?.getBoundingClientRect()
    if (!rect) return
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top
    const mouseX = localX + svgLeft
    const mouseY = localY + svgTop

    setMousePos({ x: localX, y: localY })

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
      ref={svgRef}
      style={{
        position: "absolute",
        top: svgTop,
        left: svgLeft,
        width: svgWidth,
        height: svgHeight,
        pointerEvents: "none",
      }}
    >
      <polyline
        points={localPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        stroke="transparent"
        fill="none"
        strokeWidth={strokeWidth * realToScreen.a + hoverThreshold * 2}
        strokeLinecap="round"
        pointerEvents="stroke"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsHovered(false)}
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
        points={localPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        stroke={isHovered ? safeLighten(0.2, baseColor) : baseColor}
        fill="none"
        strokeWidth={strokeWidth * realToScreen.a}
        strokeDasharray={
          !strokeDash
            ? undefined
            : typeof strokeDash === "string"
              ? strokeDash
              : `${strokeDash[0] * realToScreen.a}, ${strokeDash[1] * realToScreen.a}`
        }
        strokeLinecap="round"
        pointerEvents="none"
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
