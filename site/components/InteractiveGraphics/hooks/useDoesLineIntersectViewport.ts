import { applyToPoint, type Matrix } from "transformation-matrix"
import { useMemo } from "react"

// Margin in pixels for determining if elements are off-screen
export const OFFSCREEN_MARGIN = 5

export const useDoesLineIntersectViewport = (
  realToScreen: Matrix,
  size: { width: number; height: number },
) => {
  return useMemo(() => {
    return (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      // Convert real-world points to screen coordinates
      const sp1 = applyToPoint(realToScreen, p1)
      const sp2 = applyToPoint(realToScreen, p2)

      // Viewport boundaries with margin
      const left = -OFFSCREEN_MARGIN
      const right = size.width + OFFSCREEN_MARGIN
      const top = -OFFSCREEN_MARGIN
      const bottom = size.height + OFFSCREEN_MARGIN

      // If either point is inside the viewport, the line intersects
      if (
        (sp1.x >= left && sp1.x <= right && sp1.y >= top && sp1.y <= bottom) ||
        (sp2.x >= left && sp2.x <= right && sp2.y >= top && sp2.y <= bottom)
      ) {
        return true
      }

      // Helper function to check if a line intersects with a line segment
      const intersects = (
        a1: { x: number; y: number },
        a2: { x: number; y: number },
        b1: { x: number; y: number },
        b2: { x: number; y: number },
      ) => {
        // Line segment A is (a1, a2), line segment B is (b1, b2)
        const det =
          (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x)

        // If lines are parallel or coincident, they don't intersect in a unique point
        if (det === 0) return false

        const lambda =
          ((b2.y - b1.y) * (b2.x - a1.x) + (b1.x - b2.x) * (b2.y - a1.y)) / det
        const gamma =
          ((a1.y - a2.y) * (b2.x - a1.x) + (a2.x - a1.x) * (b2.y - a1.y)) / det

        // Check if the intersection point is within both line segments
        return lambda >= 0 && lambda <= 1 && gamma >= 0 && gamma <= 1
      }

      // Check intersection with each edge of the viewport
      return (
        // Top edge
        intersects(sp1, sp2, { x: left, y: top }, { x: right, y: top }) ||
        // Right edge
        intersects(sp1, sp2, { x: right, y: top }, { x: right, y: bottom }) ||
        // Bottom edge
        intersects(sp1, sp2, { x: left, y: bottom }, { x: right, y: bottom }) ||
        // Left edge
        intersects(sp1, sp2, { x: left, y: top }, { x: left, y: bottom })
      )
    }
  }, [realToScreen, size])
}
