import { useMemo } from "react"

type Arrow = {
  start: { x: number; y: number }
  end: { x: number; y: number }
  layer?: string
  step?: number
}

export const useFilterArrows = (
  isPointOnScreen: (point: { x: number; y: number }) => boolean,
  doesLineIntersectViewport: (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) => boolean,
  filterLayerAndStep: (obj: { layer?: string; step?: number }) => boolean,
) => {
  return useMemo(() => {
    return (arrow: Arrow) => {
      if (!filterLayerAndStep(arrow)) return false

      if (isPointOnScreen(arrow.start) || isPointOnScreen(arrow.end)) {
        return true
      }

      return doesLineIntersectViewport(arrow.start, arrow.end)
    }
  }, [doesLineIntersectViewport, filterLayerAndStep, isPointOnScreen])
}
