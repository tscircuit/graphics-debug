import type { GraphicsObject } from "./types"

export function translateGraphics(
  graphics: GraphicsObject,
  dx: number,
  dy: number,
): GraphicsObject {
  return {
    ...graphics,
    points: graphics.points?.map((p) => ({
      ...p,
      x: p.x + dx,
      y: p.y + dy,
    })),
    lines: graphics.lines?.map((line) => ({
      ...line,
      points: line.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })),
    })),
    rects: graphics.rects?.map((rect) => ({
      ...rect,
      center: { x: rect.center.x + dx, y: rect.center.y + dy },
    })),
    circles: graphics.circles?.map((circle) => ({
      ...circle,
      center: { x: circle.center.x + dx, y: circle.center.y + dy },
    })),
  }
}
