import type { GraphicsObject } from "./types"

export function setStepOfAllObjects(
  graphics: GraphicsObject,
  step: number,
): GraphicsObject {
  return {
    ...graphics,
    points: graphics.points?.map((p) => ({
      ...p,
      step,
    })),
    lines: graphics.lines?.map((line) => ({
      ...line,
      step,
    })),
    rects: graphics.rects?.map((rect) => ({
      ...rect,
      step,
    })),
    circles: graphics.circles?.map((circle) => ({
      ...circle,
      step,
    })),
    texts: graphics.texts?.map((text) => ({
      ...text,
      step,
    })),
  }
}
