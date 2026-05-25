import { type Matrix, applyToPoint, inverse } from "transformation-matrix"
import type { InfiniteLine, Point, Viewbox } from "./types"

const EPSILON = 1e-9

const isWithin = (value: number, min: number, max: number) => {
  return value >= min - EPSILON && value <= max + EPSILON
}

const dedupePoints = (points: Point[]) => {
  const unique: Point[] = []
  for (const point of points) {
    if (
      !unique.some(
        (other) =>
          Math.abs(other.x - point.x) < EPSILON &&
          Math.abs(other.y - point.y) < EPSILON,
      )
    ) {
      unique.push(point)
    }
  }
  return unique
}

export function clipInfiniteLineToBounds(
  infiniteLine: InfiniteLine,
  bounds: Viewbox,
): [Point, Point] | null {
  const { origin, directionVector } = infiniteLine

  if (
    Math.abs(directionVector.x) < EPSILON &&
    Math.abs(directionVector.y) < EPSILON
  ) {
    return null
  }

  const intersections: Point[] = []

  if (Math.abs(directionVector.x) >= EPSILON) {
    const tAtMinX = (bounds.minX - origin.x) / directionVector.x
    const yAtMinX = origin.y + tAtMinX * directionVector.y
    if (isWithin(yAtMinX, bounds.minY, bounds.maxY)) {
      intersections.push({ x: bounds.minX, y: yAtMinX })
    }

    const tAtMaxX = (bounds.maxX - origin.x) / directionVector.x
    const yAtMaxX = origin.y + tAtMaxX * directionVector.y
    if (isWithin(yAtMaxX, bounds.minY, bounds.maxY)) {
      intersections.push({ x: bounds.maxX, y: yAtMaxX })
    }
  }

  if (Math.abs(directionVector.y) >= EPSILON) {
    const tAtMinY = (bounds.minY - origin.y) / directionVector.y
    const xAtMinY = origin.x + tAtMinY * directionVector.x
    if (isWithin(xAtMinY, bounds.minX, bounds.maxX)) {
      intersections.push({ x: xAtMinY, y: bounds.minY })
    }

    const tAtMaxY = (bounds.maxY - origin.y) / directionVector.y
    const xAtMaxY = origin.x + tAtMaxY * directionVector.x
    if (isWithin(xAtMaxY, bounds.minX, bounds.maxX)) {
      intersections.push({ x: xAtMaxY, y: bounds.maxY })
    }
  }

  const uniqueIntersections = dedupePoints(intersections)

  if (uniqueIntersections.length < 2) {
    return null
  }

  let first = uniqueIntersections[0]
  let second = uniqueIntersections[1]
  let maxDistanceSquared = (first.x - second.x) ** 2 + (first.y - second.y) ** 2

  for (let i = 0; i < uniqueIntersections.length; i++) {
    for (let j = i + 1; j < uniqueIntersections.length; j++) {
      const a = uniqueIntersections[i]
      const b = uniqueIntersections[j]
      const distanceSquared = (a.x - b.x) ** 2 + (a.y - b.y) ** 2
      if (distanceSquared > maxDistanceSquared) {
        first = a
        second = b
        maxDistanceSquared = distanceSquared
      }
    }
  }

  return [first, second]
}

export function getViewportBoundsFromMatrix(
  matrix: Matrix,
  width: number,
  height: number,
): Viewbox {
  const screenToReal = inverse(matrix)
  const corners = [
    applyToPoint(screenToReal, { x: 0, y: 0 }),
    applyToPoint(screenToReal, { x: width, y: 0 }),
    applyToPoint(screenToReal, { x: 0, y: height }),
    applyToPoint(screenToReal, { x: width, y: height }),
  ]

  return {
    minX: Math.min(...corners.map((p) => p.x)),
    maxX: Math.max(...corners.map((p) => p.x)),
    minY: Math.min(...corners.map((p) => p.y)),
    maxY: Math.max(...corners.map((p) => p.y)),
  }
}
