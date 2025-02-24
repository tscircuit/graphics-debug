import { applyToPoint, type Matrix } from "transformation-matrix"
import { useMemo } from "react"
import { OFFSCREEN_MARGIN } from "./useDoesLineIntersectViewport"

export const useIsPointOnScreen = (
  realToScreen: Matrix,
  size: { width: number; height: number },
) => {
  return useMemo(() => {
    return (point: { x: number; y: number }) => {
      const screenPoint = applyToPoint(realToScreen, point)
      return (
        screenPoint.x >= -OFFSCREEN_MARGIN &&
        screenPoint.x <= size.width + OFFSCREEN_MARGIN &&
        screenPoint.y >= -OFFSCREEN_MARGIN &&
        screenPoint.y <= size.height + OFFSCREEN_MARGIN
      )
    }
  }, [realToScreen, size])
}
