import type { Arrow } from "./types"

const DEFAULT_ARROW_SHAFT_WIDTH = 2
const DEFAULT_ARROW_HEAD_WIDTH = 12
const DEFAULT_ARROW_HEAD_LENGTH = 12

export type ArrowGeometry = {
  tail: { x: number; y: number }
  tip: { x: number; y: number }
  headBase: { x: number; y: number }
  leftWing: { x: number; y: number }
  rightWing: { x: number; y: number }
  shaftWidth: number
  headLength: number
  headWidth: number
  length: number
}

export function getArrowGeometry(arrow: Arrow): ArrowGeometry {
  const tail = arrow.doubleSided ? arrow.end : arrow.start
  const tip = arrow.doubleSided ? arrow.start : arrow.end

  const vx = tip.x - tail.x
  const vy = tip.y - tail.y
  const length = Math.hypot(vx, vy)

  if (length === 0) {
    return {
      tail: { ...tail },
      tip: { ...tip },
      headBase: { ...tip },
      leftWing: { ...tip },
      rightWing: { ...tip },
      shaftWidth: DEFAULT_ARROW_SHAFT_WIDTH,
      headLength: 0,
      headWidth: DEFAULT_ARROW_HEAD_WIDTH,
      length,
    }
  }

  const ux = vx / length
  const uy = vy / length

  const shaftWidth = DEFAULT_ARROW_SHAFT_WIDTH
  const baseHeadLength = Math.min(DEFAULT_ARROW_HEAD_LENGTH, length * 0.5)
  const headLength = Math.min(length, Math.max(baseHeadLength, shaftWidth * 2))
  const headWidth = DEFAULT_ARROW_HEAD_WIDTH

  const headBase = {
    x: tip.x - ux * headLength,
    y: tip.y - uy * headLength,
  }

  const perpX = -uy
  const perpY = ux
  const wingOffsetX = (perpX * headWidth) / 2
  const wingOffsetY = (perpY * headWidth) / 2

  const leftWing = {
    x: headBase.x + wingOffsetX,
    y: headBase.y + wingOffsetY,
  }

  const rightWing = {
    x: headBase.x - wingOffsetX,
    y: headBase.y - wingOffsetY,
  }

  return {
    tail: { ...tail },
    tip: { ...tip },
    headBase,
    leftWing,
    rightWing,
    shaftWidth,
    headLength,
    headWidth,
    length,
  }
}

export function getArrowBoundingBox(arrow: Arrow) {
  const geometry = getArrowGeometry(arrow)
  const points = [
    geometry.tail,
    geometry.tip,
    geometry.leftWing,
    geometry.rightWing,
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
