import { useMemo } from "react"

type Rect = {
  center: { x: number; y: number }
  width: number
  height: number
  layer?: string
  step?: number
}

export const useFilterRects = (
  isPointOnScreen: (point: { x: number; y: number }) => boolean,
  doesLineIntersectViewport: (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) => boolean,
  filterLayerAndStep: (obj: { layer?: string; step?: number }) => boolean,
) => {
  return useMemo(() => {
    return (rect: Rect) => {
      // First apply layer and step filters
      if (!filterLayerAndStep(rect)) return false

      // For rectangles, check if any corner or the center is visible
      const { center, width, height } = rect
      const halfWidth = width / 2
      const halfHeight = height / 2

      const topLeft = { x: center.x - halfWidth, y: center.y - halfHeight }
      const topRight = { x: center.x + halfWidth, y: center.y - halfHeight }
      const bottomLeft = { x: center.x - halfWidth, y: center.y + halfHeight }
      const bottomRight = { x: center.x + halfWidth, y: center.y + halfHeight }

      // Check if any corner or center is visible
      if (
        isPointOnScreen(center) ||
        isPointOnScreen(topLeft) ||
        isPointOnScreen(topRight) ||
        isPointOnScreen(bottomLeft) ||
        isPointOnScreen(bottomRight)
      ) {
        return true
      }

      // Check if any edge of the rectangle intersects the viewport
      return (
        doesLineIntersectViewport(topLeft, topRight) ||
        doesLineIntersectViewport(topRight, bottomRight) ||
        doesLineIntersectViewport(bottomRight, bottomLeft) ||
        doesLineIntersectViewport(bottomLeft, topLeft)
      )
    }
  }, [isPointOnScreen, doesLineIntersectViewport, filterLayerAndStep])
}
