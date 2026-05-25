import { getArrowGeometry } from "./arrowHelpers"
import { getProjectedRectGeometry } from "./rectGeometry"
import type {
  Arrow,
  Circle,
  GraphicsObject,
  InfiniteLine,
  Line,
  Point,
  Polygon,
  Rect,
} from "./types"
import { applyToPoint, type Matrix } from "transformation-matrix"

const DEFAULT_HIT_SLOP = 8

type ScreenPoint = { x: number; y: number }

const getScaleFactor = (matrix: Matrix) => Math.hypot(matrix.a, matrix.b) || 1
const getArrowLabel = (arrow: Arrow) =>
  [arrow.label, arrow.inlineLabel].filter(Boolean).join("\n")

const getDistanceBetweenPoints = (a: ScreenPoint, b: ScreenPoint) => {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

const getDistanceToSegment = (
  point: ScreenPoint,
  start: ScreenPoint,
  end: ScreenPoint,
) => {
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const segmentLengthSquared = deltaX * deltaX + deltaY * deltaY

  if (segmentLengthSquared === 0) {
    return getDistanceBetweenPoints(point, start)
  }

  const projection =
    ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) /
    segmentLengthSquared
  const clampedProjection = Math.max(0, Math.min(1, projection))

  return getDistanceBetweenPoints(point, {
    x: start.x + deltaX * clampedProjection,
    y: start.y + deltaY * clampedProjection,
  })
}

const getDistanceToInfiniteLine = (
  point: ScreenPoint,
  start: ScreenPoint,
  end: ScreenPoint,
) => {
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const lineLength = Math.hypot(deltaX, deltaY)

  if (lineLength === 0) {
    return getDistanceBetweenPoints(point, start)
  }

  return (
    Math.abs(
      deltaY * point.x - deltaX * point.y + end.x * start.y - end.y * start.x,
    ) / lineLength
  )
}

const isPointInPolygon = (point: ScreenPoint, polygon: ScreenPoint[]) => {
  let isInside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const current = polygon[i]
    const previous = polygon[j]
    const crossesEdge =
      current.y > point.y !== previous.y > point.y &&
      point.x <
        ((previous.x - current.x) * (point.y - current.y)) /
          (previous.y - current.y) +
          current.x

    if (crossesEdge) {
      isInside = !isInside
    }
  }

  return isInside
}

const isPointNearPolyline = (
  point: ScreenPoint,
  polyline: ScreenPoint[],
  threshold: number,
  closed = false,
) => {
  if (polyline.length === 0) return false

  const segmentCount = closed ? polyline.length : polyline.length - 1

  for (let index = 0; index < segmentCount; index += 1) {
    const start = polyline[index]
    const end = polyline[(index + 1) % polyline.length]
    if (getDistanceToSegment(point, start, end) <= threshold) {
      return true
    }
  }

  return false
}

const getStrokeHitWidth = (
  strokeWidth: number | undefined,
  matrix: Matrix,
  hitSlop: number,
) => {
  return Math.max(
    hitSlop,
    ((strokeWidth ?? 2) * getScaleFactor(matrix)) / 2 + 4,
  )
}

const projectPoint = (matrix: Matrix, point: Point): ScreenPoint => {
  return applyToPoint(matrix, point)
}

const isPointHit = (
  screenPoint: ScreenPoint,
  point: Point,
  matrix: Matrix,
  hitSlop: number,
) => {
  return (
    getDistanceBetweenPoints(screenPoint, projectPoint(matrix, point)) <=
    hitSlop
  )
}

const isLineHit = (
  screenPoint: ScreenPoint,
  line: Line,
  matrix: Matrix,
  hitSlop: number,
) => {
  if (line.points.length === 0) return false
  if (line.points.length === 1) {
    return isPointHit(screenPoint, line.points[0], matrix, hitSlop)
  }

  const screenPoints = line.points.map((point) => projectPoint(matrix, point))
  return isPointNearPolyline(
    screenPoint,
    screenPoints,
    getStrokeHitWidth(line.strokeWidth, matrix, hitSlop),
  )
}

const isInfiniteLineHit = (
  screenPoint: ScreenPoint,
  infiniteLine: InfiniteLine,
  matrix: Matrix,
  hitSlop: number,
) => {
  const { origin, directionVector } = infiniteLine

  if (directionVector.x === 0 && directionVector.y === 0) {
    return false
  }

  const start = projectPoint(matrix, origin)
  const end = projectPoint(matrix, {
    x: origin.x + directionVector.x,
    y: origin.y + directionVector.y,
  })

  return (
    getDistanceToInfiniteLine(screenPoint, start, end) <=
    getStrokeHitWidth(infiniteLine.strokeWidth, matrix, hitSlop)
  )
}

const isRectHit = (
  screenPoint: ScreenPoint,
  rect: Rect,
  matrix: Matrix,
  hitSlop: number,
) => {
  const corners = getProjectedRectGeometry(rect, matrix).corners

  return (
    isPointInPolygon(screenPoint, corners) ||
    isPointNearPolyline(screenPoint, corners, hitSlop, true)
  )
}

const isCircleHit = (
  screenPoint: ScreenPoint,
  circle: Circle,
  matrix: Matrix,
  hitSlop: number,
) => {
  const center = projectPoint(matrix, circle.center)
  const radius = circle.radius * getScaleFactor(matrix)
  return getDistanceBetweenPoints(screenPoint, center) <= radius + hitSlop
}

const isPolygonHit = (
  screenPoint: ScreenPoint,
  polygon: Polygon,
  matrix: Matrix,
  hitSlop: number,
) => {
  if (polygon.points.length === 0) return false
  if (polygon.points.length === 1) {
    return isPointHit(screenPoint, polygon.points[0], matrix, hitSlop)
  }

  const screenPoints = polygon.points.map((point) =>
    projectPoint(matrix, point),
  )

  return (
    isPointInPolygon(screenPoint, screenPoints) ||
    isPointNearPolyline(screenPoint, screenPoints, hitSlop, true)
  )
}

const isArrowHit = (
  screenPoint: ScreenPoint,
  arrow: Arrow,
  matrix: Matrix,
  hitSlop: number,
) => {
  const geometry = getArrowGeometry(arrow)
  const shaftStart = projectPoint(matrix, geometry.shaftStart)
  const shaftEnd = projectPoint(matrix, geometry.shaftEnd)
  const shaftHitWidth = Math.max(
    hitSlop,
    (geometry.shaftWidth * getScaleFactor(matrix)) / 2 + 4,
  )

  if (
    getDistanceToSegment(screenPoint, shaftStart, shaftEnd) <= shaftHitWidth
  ) {
    return true
  }

  return geometry.heads.some((head) => {
    const headPoints = [head.tip, head.leftWing, head.rightWing].map((point) =>
      projectPoint(matrix, point),
    )
    return isPointInPolygon(screenPoint, headPoints)
  })
}

export function getCanvasObjectLabelAtPoint(
  graphics: GraphicsObject,
  matrix: Matrix,
  screenPoint: ScreenPoint,
  options: { hitSlop?: number } = {},
) {
  const hitSlop = options.hitSlop ?? DEFAULT_HIT_SLOP

  for (let index = (graphics.points?.length ?? 0) - 1; index >= 0; index -= 1) {
    const point = graphics.points?.[index]
    if (!point?.label) continue
    if (isPointHit(screenPoint, point, matrix, hitSlop)) {
      return point.label
    }
  }

  for (
    let index = (graphics.infiniteLines?.length ?? 0) - 1;
    index >= 0;
    index -= 1
  ) {
    const infiniteLine = graphics.infiniteLines?.[index]
    if (!infiniteLine?.label) continue
    if (isInfiniteLineHit(screenPoint, infiniteLine, matrix, hitSlop)) {
      return infiniteLine.label
    }
  }

  const sortedLines =
    graphics.lines
      ?.map((line, originalIndex) => ({ line, originalIndex }))
      .sort(
        (a, b) =>
          (a.line.zIndex ?? 0) - (b.line.zIndex ?? 0) ||
          a.originalIndex - b.originalIndex,
      ) ?? []

  for (let index = sortedLines.length - 1; index >= 0; index -= 1) {
    const line = sortedLines[index]?.line
    if (!line?.label) continue
    if (isLineHit(screenPoint, line, matrix, hitSlop)) {
      return line.label
    }
  }

  for (let index = (graphics.arrows?.length ?? 0) - 1; index >= 0; index -= 1) {
    const arrow = graphics.arrows?.[index]
    const label = arrow ? getArrowLabel(arrow) : ""
    if (!arrow || !label) continue
    if (isArrowHit(screenPoint, arrow, matrix, hitSlop)) {
      return label
    }
  }

  for (
    let index = (graphics.polygons?.length ?? 0) - 1;
    index >= 0;
    index -= 1
  ) {
    const polygon = graphics.polygons?.[index]
    if (!polygon?.label) continue
    if (isPolygonHit(screenPoint, polygon, matrix, hitSlop)) {
      return polygon.label
    }
  }

  for (
    let index = (graphics.circles?.length ?? 0) - 1;
    index >= 0;
    index -= 1
  ) {
    const circle = graphics.circles?.[index]
    if (!circle?.label) continue
    if (isCircleHit(screenPoint, circle, matrix, hitSlop)) {
      return circle.label
    }
  }

  for (let index = (graphics.rects?.length ?? 0) - 1; index >= 0; index -= 1) {
    const rect = graphics.rects?.[index]
    if (!rect?.label) continue
    if (isRectHit(screenPoint, rect, matrix, hitSlop)) {
      return rect.label
    }
  }

  return null
}
