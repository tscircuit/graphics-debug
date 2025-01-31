import { GraphicsObject } from "lib/types"

export const getGraphicsBounds = (graphics: GraphicsObject) => {
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  }
  for (const line of graphics.lines ?? []) {
    for (const point of line.points ?? []) {
      bounds.minX = Math.min(bounds.minX, point.x)
      bounds.minY = Math.min(bounds.minY, point.y)
      bounds.maxX = Math.max(bounds.maxX, point.x)
      bounds.maxY = Math.max(bounds.maxY, point.y)
    }
  }
  for (const rect of graphics.rects ?? []) {
    const { center, width, height } = rect
    const halfWidth = width / 2
    const halfHeight = height / 2
    bounds.minX = Math.min(bounds.minX, center.x - halfWidth)
    bounds.minY = Math.min(bounds.minY, center.y - halfHeight)
    bounds.maxX = Math.max(bounds.maxX, center.x + halfWidth)
    bounds.maxY = Math.max(bounds.maxY, center.y + halfHeight)
  }
  for (const point of graphics.points ?? []) {
    bounds.minX = Math.min(bounds.minX, point.x)
    bounds.minY = Math.min(bounds.minY, point.y)
    bounds.maxX = Math.max(bounds.maxX, point.x)
    bounds.maxY = Math.max(bounds.maxY, point.y)
  }
  return bounds
}
