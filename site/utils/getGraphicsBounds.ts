import { GraphicsObject } from "lib/types"
import { getArrowBoundingBox } from "lib/arrowHelpers"
import { getRectBounds } from "lib/rectGeometry"

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
    const rectBounds = getRectBounds(rect)
    bounds.minX = Math.min(bounds.minX, rectBounds.minX)
    bounds.minY = Math.min(bounds.minY, rectBounds.minY)
    bounds.maxX = Math.max(bounds.maxX, rectBounds.maxX)
    bounds.maxY = Math.max(bounds.maxY, rectBounds.maxY)
  }
  for (const polygon of graphics.polygons ?? []) {
    for (const point of polygon.points ?? []) {
      bounds.minX = Math.min(bounds.minX, point.x)
      bounds.minY = Math.min(bounds.minY, point.y)
      bounds.maxX = Math.max(bounds.maxX, point.x)
      bounds.maxY = Math.max(bounds.maxY, point.y)
    }
  }
  for (const point of graphics.points ?? []) {
    bounds.minX = Math.min(bounds.minX, point.x)
    bounds.minY = Math.min(bounds.minY, point.y)
    bounds.maxX = Math.max(bounds.maxX, point.x)
    bounds.maxY = Math.max(bounds.maxY, point.y)
  }
  for (const circle of graphics.circles ?? []) {
    bounds.minX = Math.min(bounds.minX, circle.center.x - circle.radius)
    bounds.minY = Math.min(bounds.minY, circle.center.y - circle.radius)
    bounds.maxX = Math.max(bounds.maxX, circle.center.x + circle.radius)
    bounds.maxY = Math.max(bounds.maxY, circle.center.y + circle.radius)
  }
  for (const arrow of graphics.arrows ?? []) {
    const arrowBounds = getArrowBoundingBox(arrow)
    bounds.minX = Math.min(bounds.minX, arrowBounds.minX)
    bounds.minY = Math.min(bounds.minY, arrowBounds.minY)
    bounds.maxX = Math.max(bounds.maxX, arrowBounds.maxX)
    bounds.maxY = Math.max(bounds.maxY, arrowBounds.maxY)
  }
  for (const text of graphics.texts ?? []) {
    bounds.minX = Math.min(bounds.minX, text.x)
    bounds.minY = Math.min(bounds.minY, text.y)
    bounds.maxX = Math.max(bounds.maxX, text.x)
    bounds.maxY = Math.max(bounds.maxY, text.y)
  }
  return bounds
}
