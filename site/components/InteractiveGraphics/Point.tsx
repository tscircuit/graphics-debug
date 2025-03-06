import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"
import { useState, useEffect } from "react"
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
  const [prevPoint, setPrevPoint] = useState<{ x: number; y: number }>(point)
  const [animating, setAnimating] = useState(false)

  // Handle animation when points change using the stored animated elements
  useEffect(() => {
    if (animationKey) {
      // Get previously stored point for this animation key
      const storedPoint = animatedElements?.points[animationKey]

      if (storedPoint) {
        // Check if point coordinates have changed
        const pointChanged =
          point.x !== storedPoint.x || point.y !== storedPoint.y

        if (pointChanged) {
          // Set previous point from stored position
          setPrevPoint(storedPoint)
          setAnimating(true)

          // Reset after animation completes
          const timer = setTimeout(() => {
            setAnimating(false)
          }, 500) // Animation duration matches CSS transition

          return () => clearTimeout(timer)
        }
      }
    }
  }, [point.x, point.y, animationKey, animatedElements])

  // Use previous point for animation or current point if not animating
  const pointToRender = animationKey && animating ? prevPoint : point
  const screenPoint = applyToPoint(realToScreen, pointToRender)
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
        transition: animationKey
          ? "border-color 0.2s, left 0.5s ease-in-out, top 0.5s ease-in-out"
          : "border-color 0.2s",
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
