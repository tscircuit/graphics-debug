import { useMemo } from "react"

type Point = {
  x: number
  y: number
  layer?: string
  step?: number
}

export const useFilterPoints = (
  isPointOnScreen: (point: { x: number; y: number }) => boolean,
  filterLayerAndStep: (obj: { layer?: string; step?: number }) => boolean,
) => {
  return useMemo(() => {
    return (point: Point) => {
      // First apply layer and step filters
      if (!filterLayerAndStep(point)) return false

      // Then check if the point is visible
      return isPointOnScreen(point)
    }
  }, [isPointOnScreen, filterLayerAndStep])
}
