import { applyToPoint, type Matrix } from "transformation-matrix"
import type { Point, Rect, Viewbox } from "./types"

type XYPoint = { x: number; y: number }

const getDistanceBetweenPoints = (a: XYPoint, b: XYPoint) => {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export const getRectRotationRadians = (
  rect: Pick<Rect, "ccwRotationDegrees">,
) => {
  return ((rect.ccwRotationDegrees ?? 0) * Math.PI) / 180
}

const getScreenRotationMultiplier = (matrix: Matrix) => {
  // Screen coordinates have +Y downward. Orientation-preserving transforms
  // therefore need the math angle inverted to look visually CCW.
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c
  return determinant < 0 ? 1 : -1
}

export const getRectRotationRadiansForMatrix = (
  rect: Pick<Rect, "ccwRotationDegrees">,
  matrix: Matrix,
) => {
  return getRectRotationRadians(rect) * getScreenRotationMultiplier(matrix)
}
const rotatePoint = (point: XYPoint, angleRadians: number): XYPoint => {
  const cos = Math.cos(angleRadians)
  const sin = Math.sin(angleRadians)

  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
  }
}

export const getRectCorners = (
  rect: Pick<Rect, "center" | "width" | "height" | "ccwRotationDegrees">,
): Point[] => {
  return getRectCornersWithAngle(rect, getRectRotationRadians(rect))
}

export const getRectCornersForMatrix = (
  rect: Pick<Rect, "center" | "width" | "height" | "ccwRotationDegrees">,
  matrix: Matrix,
): Point[] => {
  return getRectCornersWithAngle(
    rect,
    getRectRotationRadiansForMatrix(rect, matrix),
  )
}

const getRectCornersWithAngle = (
  rect: Pick<Rect, "center" | "width" | "height" | "ccwRotationDegrees">,
  angleRadians: number,
): Point[] => {
  const halfWidth = rect.width / 2
  const halfHeight = rect.height / 2

  return [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
  ].map((corner) => {
    const rotatedCorner = rotatePoint(corner, angleRadians)
    return {
      x: rect.center.x + rotatedCorner.x,
      y: rect.center.y + rotatedCorner.y,
    }
  })
}

export const getRectBounds = (
  rect: Pick<Rect, "center" | "width" | "height" | "ccwRotationDegrees">,
): Viewbox => {
  const corners = getRectCorners(rect)

  return corners.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      maxX: Math.max(bounds.maxX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    },
  )
}

export const getProjectedRectGeometry = (
  rect: Pick<Rect, "center" | "width" | "height" | "ccwRotationDegrees">,
  matrix: Matrix,
) => {
  const corners = getRectCornersForMatrix(rect, matrix).map((point) =>
    applyToPoint(matrix, point),
  )
  const center = applyToPoint(matrix, rect.center)
  const width = getDistanceBetweenPoints(corners[0], corners[1])
  const height = getDistanceBetweenPoints(corners[1], corners[2])
  const angleRadians =
    corners.length >= 2
      ? Math.atan2(corners[1].y - corners[0].y, corners[1].x - corners[0].x)
      : 0
  const angleDegrees = (angleRadians * 180) / Math.PI

  const bounds = corners.reduce(
    (result, point) => ({
      minX: Math.min(result.minX, point.x),
      maxX: Math.max(result.maxX, point.x),
      minY: Math.min(result.minY, point.y),
      maxY: Math.max(result.maxY, point.y),
    }),
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    },
  )

  return {
    center,
    corners,
    width,
    height,
    angleRadians,
    angleDegrees,
    bounds,
  }
}
