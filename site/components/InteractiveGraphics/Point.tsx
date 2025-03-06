import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { useState, useEffect, useRef } from "react"
import { Tooltip } from "./Tooltip"
import { defaultColors } from "./defaultColors"
import { safeLighten } from "site/utils/safeLighten"

export const Point = ({
  point,
  interactiveState,
  index,
}: {
  point: Types.Point
  interactiveState: InteractiveState
  index: number
}) => {
  const { color, label, layer, step, animationKey } = point
  const {
    activeLayers,
    activeStep,
    realToScreen,
    onObjectClicked,
    animatedElements,
  } = interactiveState
  const [isHovered, setIsHovered] = useState(false)

  // For animation
  const [animatedPoint, setAnimatedPoint] = useState<{ x: number; y: number }>({
    x: point.x,
    y: point.y,
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const prevPointRef = useRef<{ x: number; y: number }>({
    x: point.x,
    y: point.y,
  })
  const targetPointRef = useRef<{ x: number; y: number }>({
    x: point.x,
    y: point.y,
  })

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

    // Interpolate between previous and current point
    const newPoint = {
      x:
        prevPointRef.current.x +
        (targetPointRef.current.x - prevPointRef.current.x) * easedProgress,
      y:
        prevPointRef.current.y +
        (targetPointRef.current.y - prevPointRef.current.y) * easedProgress,
    }

    setAnimatedPoint(newPoint)

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      setIsAnimating(false)
      startTimeRef.current = 0
      animationRef.current = null
    }
  }

  // Start animation when point changes and we have an animation key
  useEffect(() => {
    if (!animationKey) {
      setAnimatedPoint({ x: point.x, y: point.y })
      return
    }

    // Get stored previous point for this animation key
    const storedPoint = animatedElements?.points[animationKey]

    if (
      storedPoint &&
      (point.x !== storedPoint.x || point.y !== storedPoint.y)
    ) {
      // Start a new animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      prevPointRef.current = storedPoint
      targetPointRef.current = { x: point.x, y: point.y }
      setIsAnimating(true)
      startTimeRef.current = 0
      animationRef.current = requestAnimationFrame(animate)
    } else if (!isAnimating) {
      // If not animating, just update point directly
      setAnimatedPoint({ x: point.x, y: point.y })
    }

    // Clean up animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [point.x, point.y, animationKey, animatedElements])

  // Map animated point to screen coordinates
  const screenPoint = applyToPoint(realToScreen, animatedPoint)
  const size = 10

  return (
    <div
      style={{
        position: "absolute",
        left: screenPoint.x - size / 2,
        top: screenPoint.y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${
          isHovered
            ? safeLighten(
                0.2,
                color ?? defaultColors[index % defaultColors.length],
              )
            : (color ?? defaultColors[index % defaultColors.length])
        }`,
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() =>
        onObjectClicked?.({
          type: "point",
          index,
          object: point,
        })
      }
    >
      {isHovered && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 8,
          }}
        >
          <Tooltip
            text={`${label ? `${label}\n` : ""}x: ${point.x.toFixed(2)}, y: ${point.y.toFixed(2)}`}
          />
        </div>
      )}
    </div>
  )
}
