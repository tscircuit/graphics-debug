import type { Arrow, ArrowDirection } from "./types"

const SQRT_TWO = Math.sqrt(2)

const directionVectors: Record<ArrowDirection, { x: number; y: number }> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  "left-top": { x: -1 / SQRT_TWO, y: -1 / SQRT_TWO },
  "left-bottom": { x: -1 / SQRT_TWO, y: 1 / SQRT_TWO },
  "right-top": { x: 1 / SQRT_TWO, y: -1 / SQRT_TWO },
  "right-bottom": { x: 1 / SQRT_TWO, y: 1 / SQRT_TWO },
}

export const DEFAULT_ARROW_LENGTH = 30
export const DEFAULT_ARROW_SHAFT_WIDTH = 2
export const DEFAULT_ARROW_HEAD_LENGTH_RATIO = 0.3
export const DEFAULT_ARROW_HEAD_WIDTH = 12

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

export function getDirectionVector(direction: ArrowDirection) {
  return directionVectors[direction]
}

export function getArrowGeometry(arrow: Arrow): ArrowGeometry {
  const direction = getDirectionVector(arrow.direction)
  const length = arrow.length ?? DEFAULT_ARROW_LENGTH
  const shaftWidth = arrow.shaftWidth ?? DEFAULT_ARROW_SHAFT_WIDTH
  const defaultHeadLength = Math.max(
    length * DEFAULT_ARROW_HEAD_LENGTH_RATIO,
    shaftWidth * 2,
  )
  const headLength = arrow.headLength ?? defaultHeadLength
  const headWidth = arrow.headWidth ?? DEFAULT_ARROW_HEAD_WIDTH

  const magnitude = Math.hypot(direction.x, direction.y) || 1
  const ux = direction.x / magnitude
  const uy = direction.y / magnitude

  const tail = { x: arrow.start.x, y: arrow.start.y }
  const tip = { x: tail.x + ux * length, y: tail.y + uy * length }
  const headBase = { x: tip.x - ux * headLength, y: tip.y - uy * headLength }

  const perpX = -uy
  const perpY = ux

  const leftWing = {
    x: headBase.x + (perpX * headWidth) / 2,
    y: headBase.y + (perpY * headWidth) / 2,
  }

  const rightWing = {
    x: headBase.x - (perpX * headWidth) / 2,
    y: headBase.y - (perpY * headWidth) / 2,
  }

  return {
    tail,
    tip,
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
