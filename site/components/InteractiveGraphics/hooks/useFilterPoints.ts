import { useMemo } from "react"

type Point = {
  x: number
  y: number
  layer?: string
  step?: number
}

type UseFilterPointsParams = {
  isPointOnScreen: (point: { x: number; y: number }) => boolean
  filterLayerAndStep: (obj: { layer?: string; step?: number }) => boolean
}

export const useFilterPoints = ({
  isPointOnScreen,
  filterLayerAndStep,
}: UseFilterPointsParams) => {
  return useMemo(() => {
    return (point: Point) => {
      // First apply layer and step filters
      if (!filterLayerAndStep(point)) return false

      // Then check if the point is visible
      return isPointOnScreen(point)
    }
  }, [isPointOnScreen, filterLayerAndStep])
}
