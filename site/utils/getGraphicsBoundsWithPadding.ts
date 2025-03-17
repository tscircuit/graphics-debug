import { getBounds } from "lib/drawGraphicsToCanvas"
import { GraphicsObject } from "lib/types"

export function getGraphicsBoundsWithPadding(graphics: GraphicsObject) {
  const bounds = getBounds(graphics)
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  return {
    minX: bounds.minX - width / 10,
    minY: bounds.minY - height / 10,
    maxX: bounds.maxX + width / 10,
    maxY: bounds.maxY + height / 10,
  }
}
