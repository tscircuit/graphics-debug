import { getArrowGeometry, getInlineLabelLayout } from "lib/arrowHelpers"
import type * as Types from "lib/types"
import { useMemo, useState } from "react"
import { distToLineSegment } from "site/utils/distToLineSegment"
import { safeLighten } from "site/utils/safeLighten"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { defaultColors } from "./defaultColors"

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

  const geometry = useMemo(() => getArrowGeometry(arrow), [arrow])

  const screenPoints = useMemo(() => {
    return {
      shaftStart: applyToPoint(realToScreen, geometry.shaftStart),
      shaftEnd: applyToPoint(realToScreen, geometry.shaftEnd),
      heads: geometry.heads.map((head) => ({
        tip: applyToPoint(realToScreen, head.tip),
        base: applyToPoint(realToScreen, head.base),
        leftWing: applyToPoint(realToScreen, head.leftWing),
        rightWing: applyToPoint(realToScreen, head.rightWing),
      })),
    }
  }, [geometry, realToScreen])

  const scaleFactor = Math.abs(realToScreen.a)
  const fontSize = 12
  const strokeWidth = geometry.shaftWidth * (scaleFactor || 1)
  const alongSeparation = fontSize * 0.6
  const inlineLabelLayout = useMemo(
    () =>
      getInlineLabelLayout(screenPoints.shaftStart, screenPoints.shaftEnd, {
        fontSize,
        strokeWidth,
        normalPadding: 6,
        alongOffset: arrow.label ? alongSeparation : 0,
      }),
    [screenPoints, fontSize, strokeWidth, arrow.label, alongSeparation],
  )
  const labelLayout = useMemo(
    () =>
      getInlineLabelLayout(screenPoints.shaftStart, screenPoints.shaftEnd, {
        fontSize,
        strokeWidth,
        normalPadding: 12,
        alongOffset: arrow.inlineLabel ? -alongSeparation : 0,
      }),
    [screenPoints, fontSize, strokeWidth, arrow.inlineLabel, alongSeparation],
  )

  const baseColor =
    arrow.color || defaultColors[index % defaultColors.length] || "black"
  const displayColor = isHovered ? safeLighten(0.2, baseColor) : baseColor

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const hoverThreshold = 10
    const segments: Array<{
      from: { x: number; y: number }
      to: { x: number; y: number }
    }> = [
      { from: screenPoints.shaftStart, to: screenPoints.shaftEnd },
      ...screenPoints.heads.flatMap((head) => [
        { from: head.base, to: head.leftWing },
        { from: head.leftWing, to: head.tip },
        { from: head.tip, to: head.rightWing },
        { from: head.rightWing, to: head.base },
      ]),
    ]

    const isNear = segments.some(({ from, to }) => {
      const distance = distToLineSegment(
        mouseX,
        mouseY,
        from.x,
        from.y,
        to.x,
        to.y,
      )
      return distance < hoverThreshold
    })

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
        x1={screenPoints.shaftStart.x}
        y1={screenPoints.shaftStart.y}
        x2={screenPoints.shaftEnd.x}
        y2={screenPoints.shaftEnd.y}
        stroke={displayColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        pointerEvents="stroke"
      />
      {screenPoints.heads.map((head, headIndex) => (
        <polygon
          key={headIndex}
          points={`${head.tip.x},${head.tip.y} ${head.leftWing.x},${head.leftWing.y} ${head.rightWing.x},${head.rightWing.y}`}
          fill={displayColor}
        />
      ))}
      {arrow.label && (
        <text
          x={labelLayout.x}
          y={labelLayout.y}
          fill={displayColor}
          fontSize={fontSize}
          fontFamily="sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
          pointerEvents="none"
        >
          {arrow.label}
        </text>
      )}
      {arrow.inlineLabel && (
        <text
          x={inlineLabelLayout.x}
          y={inlineLabelLayout.y}
          fill={displayColor}
          fontSize={fontSize}
          fontFamily="sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(${inlineLabelLayout.angleDegrees} ${inlineLabelLayout.x} ${inlineLabelLayout.y})`}
          pointerEvents="none"
        >
          {arrow.inlineLabel}
        </text>
      )}
    </svg>
  )
}
