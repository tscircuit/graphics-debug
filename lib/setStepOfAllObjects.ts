import type { GraphicsObject } from "./types"

export function setStepOfAllObjects(
  graphics: GraphicsObject,
  step: number,
): GraphicsObject {
  if (graphics.points) {
    for (const p of graphics.points) {
      p.step = step
    }
  }
  if (graphics.lines) {
    for (const line of graphics.lines) {
      line.step = step
    }
  }
  if (graphics.infiniteLines) {
    for (const infiniteLine of graphics.infiniteLines) {
      infiniteLine.step = step
    }
  }
  if (graphics.polygons) {
    for (const polygon of graphics.polygons) {
      polygon.step = step
    }
  }
  if (graphics.rects) {
    for (const rect of graphics.rects) {
      rect.step = step
    }
  }
  if (graphics.circles) {
    for (const circle of graphics.circles) {
      circle.step = step
    }
  }
  if (graphics.texts) {
    for (const text of graphics.texts) {
      text.step = step
    }
  }
  return graphics
}
