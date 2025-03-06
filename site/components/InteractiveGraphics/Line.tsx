import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { lighten } from "polished"
import { useState, useRef, useEffect } from "react"
import { Tooltip } from "./Tooltip"
import { distToLineSegment } from "site/utils/distToLineSegment"
import { defaultColors } from "./defaultColors"
import { safeLighten } from "site/utils/safeLighten"

export const Line = ({
  line,
  index,
  interactiveState,
}: { line: Types.Line; index: number; interactiveState: InteractiveState }) => {
  const {
    activeLayers,
    activeStep,
    realToScreen,
    onObjectClicked,
    animatedElements,
  } = interactiveState
  const {
    points,
    layer,
    step,
    strokeColor,
    strokeWidth = 1 / realToScreen.a,
    strokeDash,
    animationKey,
  } = line
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [animating, setAnimating] = useState(false)
  const [prevPoints, setPrevPoints] =
    useState<{ x: number; y: number }[]>(points)

  // Store and animate between points when they change
  useEffect(() => {
    if (animationKey) {
      // Get previously stored points for this animation key
      const storedLine = animatedElements?.lines[animationKey]

      if (storedLine) {
        // Check if points have changed
        const pointsChanged =
          JSON.stringify(points) !== JSON.stringify(storedLine.points)

        if (pointsChanged) {
          // Set previous points from stored position
          setPrevPoints(storedLine.points)
          setAnimating(true)

          // Reset after animation completes
          const timer = setTimeout(() => {
            setAnimating(false)
          }, 500) // Animation duration matches CSS transition

          return () => clearTimeout(timer)
        }
      }
    }
  }, [points, animationKey, animatedElements])

  // Use previous points for animation or current points if not animating
  const pointsToRender = animationKey && animating ? prevPoints : points
  const screenPoints = pointsToRender.map((p) => applyToPoint(realToScreen, p))

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
        width: "100%",
        height: "100%",
      }}
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
    >
      <polyline
        points={screenPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        stroke={isHovered ? safeLighten(0.2, baseColor) : baseColor}
        fill="none"
        strokeWidth={strokeWidth * realToScreen.a}
        strokeDasharray={strokeDash}
        strokeLinecap="round"
        style={{
          transition: animationKey ? "all 0.5s ease-in-out" : "none",
        }}
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
