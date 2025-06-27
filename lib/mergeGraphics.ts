import type { GraphicsObject } from "./types"

export const mergeGraphics = (
  graphics1: GraphicsObject,
  graphics2: GraphicsObject,
): GraphicsObject => {
  return {
    ...graphics1,
    rects: [...(graphics1.rects ?? []), ...(graphics2.rects ?? [])],
    points: [...(graphics1.points ?? []), ...(graphics2.points ?? [])],
    lines: [...(graphics1.lines ?? []), ...(graphics2.lines ?? [])],
    circles: [...(graphics1.circles ?? []), ...(graphics2.circles ?? [])],
    texts: [...(graphics1.texts ?? []), ...(graphics2.texts ?? [])],
  }
}
