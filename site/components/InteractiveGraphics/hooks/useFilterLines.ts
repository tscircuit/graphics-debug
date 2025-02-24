import { useMemo } from "react"

type Line = {
  points: Array<{ x: number; y: number }>
  layer?: string
  step?: number
  closed?: boolean
}

export const useFilterLines = (
  isPointOnScreen: (point: { x: number; y: number }) => boolean,
  doesLineIntersectViewport: (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) => boolean,
  filterLayerAndStep: (obj: { layer?: string; step?: number }) => boolean,
) => {
  return useMemo(() => {
    return (line: Line) => {
      // First apply layer and step filters
      if (!filterLayerAndStep(line)) return false

      // Then check if any point of the line is visible
      if (line.points.some((p) => isPointOnScreen(p))) {
        return true
      }

      // If no points are visible, check if any line segment intersects the viewport
      for (let i = 0; i < line.points.length - 1; i++) {
        if (doesLineIntersectViewport(line.points[i], line.points[i + 1])) {
          return true
        }
      }

      // If it's a closed shape (polyline), check the last segment too
      if (line.points.length > 2 && line.closed) {
        if (
          doesLineIntersectViewport(
            line.points[line.points.length - 1],
            line.points[0],
          )
        ) {
          return true
        }
      }

      return false
    }
  }, [isPointOnScreen, doesLineIntersectViewport, filterLayerAndStep])
}
