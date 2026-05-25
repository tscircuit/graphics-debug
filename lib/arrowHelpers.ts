import type { Arrow } from "./types"

const DEFAULT_ARROW_SHAFT_WIDTH = 2
const DEFAULT_ARROW_HEAD_WIDTH = 12
const DEFAULT_ARROW_HEAD_LENGTH = 12

export type ArrowHeadGeometry = {
  tip: { x: number; y: number }
  base: { x: number; y: number }
  leftWing: { x: number; y: number }
  rightWing: { x: number; y: number }
}

export type ArrowGeometry = {
  shaftStart: { x: number; y: number }
  shaftEnd: { x: number; y: number }
  heads: ArrowHeadGeometry[]
  shaftWidth: number
  headLength: number
  headWidth: number
  length: number
}

export type InlineLabelLayout = {
  x: number
  y: number
  angleRadians: number
  angleDegrees: number
  direction: { x: number; y: number }
  normal: { x: number; y: number }
}

const createDegenerateHead = (point: {
  x: number
  y: number
}): ArrowHeadGeometry => ({
  tip: { ...point },
  base: { ...point },
  leftWing: { ...point },
  rightWing: { ...point },
})

const createHead = (
  tip: { x: number; y: number },
  base: { x: number; y: number },
  headWidth: number,
): ArrowHeadGeometry => {
  const dirX = tip.x - base.x
  const dirY = tip.y - base.y
  const length = Math.hypot(dirX, dirY)

  if (length === 0) {
    return createDegenerateHead(tip)
  }

  const dirUnitX = dirX / length
  const dirUnitY = dirY / length
  const perpX = -dirUnitY * (headWidth / 2)
  const perpY = dirUnitX * (headWidth / 2)

  return {
    tip: { ...tip },
    base: { ...base },
    leftWing: { x: base.x + perpX, y: base.y + perpY },
    rightWing: { x: base.x - perpX, y: base.y - perpY },
  }
}

export function getArrowGeometry(arrow: Arrow): ArrowGeometry {
  const { start, end } = arrow

  const vx = end.x - start.x
  const vy = end.y - start.y
  const length = Math.hypot(vx, vy)

  const shaftWidth = DEFAULT_ARROW_SHAFT_WIDTH
  const headWidth = DEFAULT_ARROW_HEAD_WIDTH

  if (length === 0) {
    const heads = arrow.doubleSided
      ? [createDegenerateHead(start), createDegenerateHead(start)]
      : [createDegenerateHead(start)]
    return {
      shaftStart: { ...start },
      shaftEnd: { ...start },
      heads,
      shaftWidth,
      headLength: 0,
      headWidth,
      length,
    }
  }

  const ux = vx / length
  const uy = vy / length

  const baseHeadLength = Math.min(DEFAULT_ARROW_HEAD_LENGTH, length * 0.5)
  const desiredHeadLength = Math.max(baseHeadLength, shaftWidth * 2)
  const maxHeadLength = arrow.doubleSided ? length / 2 : length
  const headLength = Math.min(desiredHeadLength, maxHeadLength)

  const endHeadBase = {
    x: end.x - ux * headLength,
    y: end.y - uy * headLength,
  }

  const heads: ArrowHeadGeometry[] = [createHead(end, endHeadBase, headWidth)]

  let shaftStart = { ...start }
  const shaftEnd = { ...endHeadBase }

  if (arrow.doubleSided) {
    const startHeadBase = {
      x: start.x + ux * headLength,
      y: start.y + uy * headLength,
    }

    heads.unshift(createHead(start, startHeadBase, headWidth))
    shaftStart = startHeadBase
  }

  return {
    shaftStart,
    shaftEnd,
    heads,
    shaftWidth,
    headLength,
    headWidth,
    length,
  }
}

export function getArrowBoundingBox(arrow: Arrow) {
  const geometry = getArrowGeometry(arrow)
  const points = [
    geometry.shaftStart,
    geometry.shaftEnd,
    ...geometry.heads.flatMap((head) => [
      head.tip,
      head.base,
      head.leftWing,
      head.rightWing,
    ]),
  ]

  return points.reduce(
    (acc, point) => ({
      minX: Math.min(acc.minX, point.x),
      maxX: Math.max(acc.maxX, point.x),
      minY: Math.min(acc.minY, point.y),
      maxY: Math.max(acc.maxY, point.y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )
}

export function getInlineLabelLayout(
  shaftStart: { x: number; y: number },
  shaftEnd: { x: number; y: number },
  {
    fontSize = 12,
    strokeWidth = 2,
    normalPadding = 6,
    alongOffset = 0,
  }: {
    fontSize?: number
    strokeWidth?: number
    normalPadding?: number
    alongOffset?: number
  } = {},
): InlineLabelLayout {
  const midpoint = {
    x: (shaftStart.x + shaftEnd.x) / 2,
    y: (shaftStart.y + shaftEnd.y) / 2,
  }
  const dx = shaftEnd.x - shaftStart.x
  const dy = shaftEnd.y - shaftStart.y
  const length = Math.hypot(dx, dy)

  if (length === 0) {
    return {
      x: midpoint.x + alongOffset,
      y: midpoint.y - (strokeWidth / 2 + fontSize * 0.65 + normalPadding),
      angleRadians: 0,
      angleDegrees: 0,
      direction: { x: 1, y: 0 },
      normal: { x: 0, y: -1 },
    }
  }

  let dirX = dx / length
  let dirY = dy / length
  let normalX = -dirY
  let normalY = dirX

  const isUpsideDown = dirX < 0 || (dirX === 0 && dirY < 0)
  if (isUpsideDown) {
    dirX = -dirX
    dirY = -dirY
    normalX = -normalX
    normalY = -normalY
  }

  const angleRadians = Math.atan2(dirY, dirX)
  const normalOffset = strokeWidth / 2 + fontSize * 0.65 + normalPadding

  return {
    x: midpoint.x + normalX * normalOffset + dirX * alongOffset,
    y: midpoint.y + normalY * normalOffset + dirY * alongOffset,
    angleRadians,
    angleDegrees: (angleRadians * 180) / Math.PI,
    direction: { x: dirX, y: dirY },
    normal: { x: normalX, y: normalY },
  }
}
