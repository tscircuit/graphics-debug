import { GraphicsObject } from "lib/types"

export function getMaxStep(graphics: GraphicsObject) {
  const maxPointStep = Math.max(
    0,
    ...(graphics.points?.map((p) => (Number.isNaN(p.step) ? 0 : p.step || 0)) ??
      []),
  )
  const maxLineStep = Math.max(
    0,
    ...(graphics.lines?.map((l) => (Number.isNaN(l.step) ? 0 : l.step || 0)) ??
      []),
  )
  const maxRectStep = Math.max(
    0,
    ...(graphics.rects?.map((r) => (Number.isNaN(r.step) ? 0 : r.step || 0)) ??
      []),
  )
  const maxCircleStep = Math.max(
    0,
    ...(graphics.circles?.map((c) =>
      Number.isNaN(c.step) ? 0 : c.step || 0,
    ) ?? []),
  )
  return Math.max(maxPointStep, maxLineStep, maxRectStep, maxCircleStep)
}
