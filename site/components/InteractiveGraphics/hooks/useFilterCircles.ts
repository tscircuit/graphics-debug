import { useMemo } from "react"
import { type Matrix, applyToPoint } from "transformation-matrix"
import { OFFSCREEN_MARGIN } from "./useDoesLineIntersectViewport"

type Circle = {
  center: { x: number; y: number }
  radius: number
  layer?: string
  step?: number
}

type UseFilterCirclesParams = {
  isPointOnScreen: (point: { x: number; y: number }) => boolean
  filterLayerAndStep: (obj: { layer?: string; step?: number }) => boolean
  realToScreen: Matrix
  size: { width: number; height: number }
}

export const useFilterCircles = ({
  isPointOnScreen,
  filterLayerAndStep,
  realToScreen,
  size,
}: UseFilterCirclesParams) => {
  return useMemo(() => {
    return (circle: Circle) => {
      // First apply layer and step filters
      if (!filterLayerAndStep(circle)) return false

      // For circles, check if center is visible or if any cardinal point is visible
      const { center, radius } = circle

      // Check if center or cardinal points on the circle are visible
      if (
        isPointOnScreen(center) ||
        isPointOnScreen({ x: center.x + radius, y: center.y }) ||
        isPointOnScreen({ x: center.x - radius, y: center.y }) ||
        isPointOnScreen({ x: center.x, y: center.y + radius }) ||
        isPointOnScreen({ x: center.x, y: center.y - radius })
      ) {
        return true
      }

      // Check if the circle intersects the viewport
      // Convert to screen coordinates for viewport intersection test
      const screenCenter = applyToPoint(realToScreen, center)
      const scale = Math.abs(realToScreen.a) // Get the scale factor
      const screenRadius = radius * scale

      // Viewport boundaries
      const left = -OFFSCREEN_MARGIN
      const right = size.width + OFFSCREEN_MARGIN
      const top = -OFFSCREEN_MARGIN
      const bottom = size.height + OFFSCREEN_MARGIN

      // Check if the circle intersects with the viewport
      // Case 1: Circle center is inside the viewport horizontally but outside vertically
      if (screenCenter.x >= left && screenCenter.x <= right) {
        if (
          Math.abs(screenCenter.y - top) <= screenRadius ||
          Math.abs(screenCenter.y - bottom) <= screenRadius
        ) {
          return true
        }
      }

      // Case 2: Circle center is inside the viewport vertically but outside horizontally
      if (screenCenter.y >= top && screenCenter.y <= bottom) {
        if (
          Math.abs(screenCenter.x - left) <= screenRadius ||
          Math.abs(screenCenter.x - right) <= screenRadius
        ) {
          return true
        }
      }

      // Case 3: Circle center is outside the viewport, check corners
      const cornerDistanceSquared = (cornerX: number, cornerY: number) => {
        const dx = screenCenter.x - cornerX
        const dy = screenCenter.y - cornerY
        return dx * dx + dy * dy
      }

      const radiusSquared = screenRadius * screenRadius

      return (
        cornerDistanceSquared(left, top) <= radiusSquared ||
        cornerDistanceSquared(right, top) <= radiusSquared ||
        cornerDistanceSquared(left, bottom) <= radiusSquared ||
        cornerDistanceSquared(right, bottom) <= radiusSquared
      )
    }
  }, [isPointOnScreen, filterLayerAndStep, realToScreen, size])
}
