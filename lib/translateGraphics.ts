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
    polygons: graphics.polygons?.map((polygon) => ({
      ...polygon,
      points: polygon.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })),
    })),
    rects: graphics.rects?.map((rect) => ({
      ...rect,
      center: { x: rect.center.x + dx, y: rect.center.y + dy },
    })),
    circles: graphics.circles?.map((circle) => ({
      ...circle,
      center: { x: circle.center.x + dx, y: circle.center.y + dy },
    })),
    arrows: graphics.arrows?.map((arrow) => ({
      ...arrow,
      start: { x: arrow.start.x + dx, y: arrow.start.y + dy },
      end: { x: arrow.end.x + dx, y: arrow.end.y + dy },
    })),
    texts: graphics.texts?.map((text) => ({
      ...text,
      x: text.x + dx,
      y: text.y + dy,
    })),
  }
}
