import { GraphicsObject } from "lib/types"

export function getMaxStep(graphics: GraphicsObject) {
  // Helper function to safely get max step from an array
  const getMaxStepFromArray = (items?: any[]) => {
    if (!items || items.length === 0) return 0

    // Use reduce instead of spreading a potentially large array
    return items.reduce((max, item) => {
      const step = Number.isNaN(item.step) ? 0 : item.step || 0
      return Math.max(max, step)
    }, 0)
  }

  const maxPointStep = getMaxStepFromArray(graphics.points)
  const maxLineStep = getMaxStepFromArray(graphics.lines)
  const maxRectStep = getMaxStepFromArray(graphics.rects)
  const maxCircleStep = getMaxStepFromArray(graphics.circles)

  return Math.max(maxPointStep, maxLineStep, maxRectStep, maxCircleStep)
}
