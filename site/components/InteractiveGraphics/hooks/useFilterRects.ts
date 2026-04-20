import { getRectCornersForMatrix } from "lib/rectGeometry"
import { useMemo } from "react"
import type { Matrix } from "transformation-matrix"

type Rect = {
  center: { x: number; y: number }
  width: number
  height: number
  ccwRotationDegrees?: number
  layer?: string
  step?: number
}

type UseFilterRectsParams = {
  realToScreen: Matrix
  isPointOnScreen: (point: { x: number; y: number }) => boolean
  doesLineIntersectViewport: (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) => boolean
  filterLayerAndStep: (obj: { layer?: string; step?: number }) => boolean
}

export const useFilterRects = ({
  realToScreen,
  isPointOnScreen,
  doesLineIntersectViewport,
  filterLayerAndStep,
}: UseFilterRectsParams) => {
  return useMemo(() => {
    return (rect: Rect) => {
      // First apply layer and step filters
      if (!filterLayerAndStep(rect)) return false

      // For rectangles, check if any corner or the center is visible
      const { center } = rect
      const [topLeft, topRight, bottomRight, bottomLeft] =
        getRectCornersForMatrix(rect, realToScreen)

      // Check if any corner or center is visible
      if (
        isPointOnScreen(center) ||
        isPointOnScreen(topLeft) ||
        isPointOnScreen(topRight) ||
        isPointOnScreen(bottomRight) ||
        isPointOnScreen(bottomLeft)
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
  }, [
    realToScreen,
    isPointOnScreen,
    doesLineIntersectViewport,
    filterLayerAndStep,
  ])
}
