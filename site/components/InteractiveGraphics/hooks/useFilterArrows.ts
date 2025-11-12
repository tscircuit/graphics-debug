import { useMemo } from "react"
import type { Arrow } from "lib/types"
import { getArrowGeometry } from "lib/arrowHelpers"

type FilterFn = (obj: { layer?: string; step?: number }) => boolean

type Point = { x: number; y: number }

type LineCheck = (p1: Point, p2: Point) => boolean

type PointCheck = (point: Point) => boolean

export const useFilterArrows = (
  isPointOnScreen: PointCheck,
  doesLineIntersectViewport: LineCheck,
  filterLayerAndStep: FilterFn,
) => {
  return useMemo(() => {
    return (arrow: Arrow) => {
      if (!filterLayerAndStep(arrow)) return false

      const geometry = getArrowGeometry(arrow)
      const { tail, headBase, tip, leftWing, rightWing } = geometry

      if (
        isPointOnScreen(tail) ||
        isPointOnScreen(headBase) ||
        isPointOnScreen(tip) ||
        isPointOnScreen(leftWing) ||
        isPointOnScreen(rightWing)
      ) {
        return true
      }

      const segments: Array<[Point, Point]> = [
        [tail, headBase],
        [headBase, leftWing],
        [leftWing, tip],
        [tip, rightWing],
        [rightWing, headBase],
      ]

      return segments.some(([p1, p2]) => doesLineIntersectViewport(p1, p2))
    }
  }, [isPointOnScreen, doesLineIntersectViewport, filterLayerAndStep])
}
