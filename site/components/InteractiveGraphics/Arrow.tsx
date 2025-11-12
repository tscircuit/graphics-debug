import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { useMemo, useState } from "react"
import { Tooltip } from "./Tooltip"
import { defaultColors } from "./defaultColors"
import { safeLighten } from "site/utils/safeLighten"
import { distToLineSegment } from "site/utils/distToLineSegment"
import { getArrowGeometry } from "lib/arrowHelpers"

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

  const geometry = useMemo(() => getArrowGeometry(arrow), [arrow])

  const screenPoints = useMemo(() => {
    return {
      tail: applyToPoint(realToScreen, geometry.tail),
      headBase: applyToPoint(realToScreen, geometry.headBase),
      tip: applyToPoint(realToScreen, geometry.tip),
      leftWing: applyToPoint(realToScreen, geometry.leftWing),
      rightWing: applyToPoint(realToScreen, geometry.rightWing),
    }
  }, [geometry, realToScreen])

  const scaleFactor = useMemo(() => Math.hypot(realToScreen.a, realToScreen.b), [
    realToScreen.a,
    realToScreen.b,
  ])

  const baseColor =
    arrow.color || defaultColors[index % defaultColors.length] || "black"
  const displayColor = isHovered ? safeLighten(0.2, baseColor) : baseColor

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    setMousePos({ x: mouseX, y: mouseY })

    const hoverThreshold = 10
    const distToShaft = distToLineSegment(
      mouseX,
      mouseY,
      screenPoints.tail.x,
      screenPoints.tail.y,
      screenPoints.headBase.x,
      screenPoints.headBase.y,
    )

    const distToTipLeft = distToLineSegment(
      mouseX,
      mouseY,
      screenPoints.tip.x,
      screenPoints.tip.y,
      screenPoints.leftWing.x,
      screenPoints.leftWing.y,
    )

    const distToTipRight = distToLineSegment(
      mouseX,
      mouseY,
      screenPoints.tip.x,
      screenPoints.tip.y,
      screenPoints.rightWing.x,
      screenPoints.rightWing.y,
    )

    const distAcrossBase = distToLineSegment(
      mouseX,
      mouseY,
      screenPoints.leftWing.x,
      screenPoints.leftWing.y,
      screenPoints.rightWing.x,
      screenPoints.rightWing.y,
    )

    const isNear =
      distToShaft < hoverThreshold ||
      distToTipLeft < hoverThreshold ||
      distToTipRight < hoverThreshold ||
      distAcrossBase < hoverThreshold

    setIsHovered(isNear)
  }

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
          ? (event) => {
              event.stopPropagation()
              onObjectClicked?.({ type: "arrow", index, object: arrow })
            }
          : undefined
      }
    >
      <line
        x1={screenPoints.tail.x}
        y1={screenPoints.tail.y}
        x2={screenPoints.headBase.x}
        y2={screenPoints.headBase.y}
        stroke={displayColor}
        strokeWidth={geometry.shaftWidth * (scaleFactor || 1)}
        strokeLinecap="round"
        pointerEvents="stroke"
      />
      <polygon
        points={`${screenPoints.tip.x},${screenPoints.tip.y} ${screenPoints.leftWing.x},${screenPoints.leftWing.y} ${screenPoints.rightWing.x},${screenPoints.rightWing.y}`}
        fill={displayColor}
      />
      {isHovered && arrow.label && (
        <foreignObject x={mousePos.x} y={mousePos.y - 40} width={300} height={40}>
          <Tooltip text={arrow.label} />
        </foreignObject>
      )}
    </svg>
  )
}
