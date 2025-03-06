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

  // For animation
  const [animatedPoints, setAnimatedPoints] =
    useState<{ x: number; y: number }[]>(points)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const prevPointsRef = useRef<{ x: number; y: number }[]>(points)
  const targetPointsRef = useRef<{ x: number; y: number }[]>(points)

  // Animation function
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp
    }

    const elapsed = timestamp - startTimeRef.current
    const duration = 500 // Animation duration in ms
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-in-out)
    const easedProgress =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

    // Interpolate between previous and current points
    const newPoints = prevPointsRef.current.map((prevPoint, i) => {
      const targetPoint = targetPointsRef.current[i]
      return {
        x: prevPoint.x + (targetPoint.x - prevPoint.x) * easedProgress,
        y: prevPoint.y + (targetPoint.y - prevPoint.y) * easedProgress,
      }
    })

    setAnimatedPoints(newPoints)

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      setIsAnimating(false)
      startTimeRef.current = 0
      animationRef.current = null
    }
  }

  // Start animation when points change and we have an animation key
  useEffect(() => {
    if (!animationKey) {
      setAnimatedPoints(points)
      return
    }

    // Get stored previous points for this animation key
    const storedLine = animatedElements?.lines[animationKey]

    if (
      storedLine &&
      JSON.stringify(points) !== JSON.stringify(storedLine.points)
    ) {
      // Start a new animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      prevPointsRef.current = storedLine.points
      targetPointsRef.current = points
      setIsAnimating(true)
      startTimeRef.current = 0
      animationRef.current = requestAnimationFrame(animate)
    } else if (!isAnimating) {
      // If not animating, just update points directly
      setAnimatedPoints(points)
    }

    // Clean up animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [points, animationKey, animatedElements])

  // Map animated points to screen coordinates
  const screenPoints = animatedPoints.map((p) => applyToPoint(realToScreen, p))

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
