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
    polygons: [...(graphics1.polygons ?? []), ...(graphics2.polygons ?? [])],
    circles: [...(graphics1.circles ?? []), ...(graphics2.circles ?? [])],
    arrows: [...(graphics1.arrows ?? []), ...(graphics2.arrows ?? [])],
    texts: [...(graphics1.texts ?? []), ...(graphics2.texts ?? [])],
  }
}
