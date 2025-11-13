import { useMemo } from "react"
import type { Arrow } from "lib/types"
import { getArrowGeometry } from "lib/arrowHelpers"

type Point = { x: number; y: number }

type LineCheck = (p1: Point, p2: Point) => boolean

type PointCheck = (point: Point) => boolean

export const useFilterArrows = (
  isPointOnScreen: PointCheck,
  doesLineIntersectViewport: LineCheck,
) => {
  return useMemo(() => {
    return (arrow: Arrow) => {
      const geometry = getArrowGeometry(arrow)
      const { shaftStart, shaftEnd, heads } = geometry

      if (
        isPointOnScreen(shaftStart) ||
        isPointOnScreen(shaftEnd) ||
        heads.some(
          (head) =>
            isPointOnScreen(head.tip) ||
            isPointOnScreen(head.leftWing) ||
            isPointOnScreen(head.rightWing) ||
            isPointOnScreen(head.base),
        )
      ) {
        return true
      }

      const segments: Array<[Point, Point]> = [
        [shaftStart, shaftEnd],
        ...heads.flatMap((head) => [
          [head.base, head.leftWing] as [Point, Point],
          [head.leftWing, head.tip] as [Point, Point],
          [head.tip, head.rightWing] as [Point, Point],
          [head.rightWing, head.base] as [Point, Point],
        ]),
      ]

      return segments.some(([p1, p2]) => doesLineIntersectViewport(p1, p2))
    }
  }, [isPointOnScreen, doesLineIntersectViewport])
}
