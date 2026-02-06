import { useMemo } from "react"

type Polygon = {
  points: { x: number; y: number }[]
  layer?: string
  step?: number
}

type UseFilterPolygonsParams = {
  isPointOnScreen: (point: { x: number; y: number }) => boolean
  doesLineIntersectViewport: (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) => boolean
  filterLayerAndStep: (obj: { layer?: string; step?: number }) => boolean
}

export const useFilterPolygons = ({
  isPointOnScreen,
  doesLineIntersectViewport,
  filterLayerAndStep,
}: UseFilterPolygonsParams) => {
  return useMemo(() => {
    return (polygon: Polygon) => {
      if (!filterLayerAndStep(polygon)) return false

      if (!polygon.points || polygon.points.length === 0) return false

      if (polygon.points.some((point) => isPointOnScreen(point))) {
        return true
      }

      for (let i = 0; i < polygon.points.length; i++) {
        const start = polygon.points[i]
        const end = polygon.points[(i + 1) % polygon.points.length]
        if (doesLineIntersectViewport(start, end)) return true
      }

      return false
    }
  }, [isPointOnScreen, doesLineIntersectViewport, filterLayerAndStep])
}
