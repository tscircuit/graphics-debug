import { encode } from "fast-png"
import { Bitmap } from "pureimage/dist/bitmap.js"
import type { Context } from "pureimage/dist/context.js"
import { applyToPoint, type Matrix } from "transformation-matrix"
import { getArrowGeometry, getInlineLabelLayout } from "./arrowHelpers"
import { computeTransformFromViewbox, getBounds } from "./drawGraphicsToCanvas"
import {
  clipInfiniteLineToBounds,
  getViewportBoundsFromMatrix,
} from "./infiniteLineHelpers"
import { strokeAlphabetText } from "./strokeAlphabetText"
import type {
  GraphicsObject,
  NinePointAnchor,
  Point,
  TransformOptions,
} from "./types"

const DEFAULT_PNG_SIZE = 640
const DEFAULT_BACKGROUND_COLOR = "white"

type LabelType =
  | "points"
  | "lines"
  | "infiniteLines"
  | "rects"
  | "polygons"
  | "arrows"

export type PngRenderOptions = TransformOptions & {
  includeTextLabels?: boolean | LabelType[]
  backgroundColor?: string | null
  pngWidth?: number
  pngHeight?: number
}

const hasVisiblePaint = (value?: string) => {
  return Boolean(value && value !== "none" && value !== "transparent")
}

const shouldRenderLabel = (
  includeTextLabels: PngRenderOptions["includeTextLabels"],
  disableLabels: boolean | undefined,
  type: LabelType,
) => {
  if (disableLabels) return false
  if (typeof includeTextLabels === "boolean") return includeTextLabels
  if (Array.isArray(includeTextLabels)) return includeTextLabels.includes(type)
  return false
}

const parseStrokeDash = (
  strokeDash: string | number[],
  strokeScale: number,
): number[] => {
  if (typeof strokeDash === "string") {
    if (strokeDash.includes(",")) {
      return strokeDash
        .split(",")
        .map((part) => Number.parseFloat(part.trim()))
        .filter((value) => Number.isFinite(value) && value > 0)
    }

    const singleValue = Number.parseFloat(strokeDash.trim())
    return Number.isFinite(singleValue) && singleValue > 0 ? [singleValue] : []
  }

  return strokeDash
    .map((segment) => segment * strokeScale)
    .filter((value) => Number.isFinite(value) && value > 0)
}

const normalizeDashPattern = (dashPattern: number[]) => {
  if (dashPattern.length === 0) return dashPattern
  return dashPattern.length % 2 === 0
    ? dashPattern
    : [...dashPattern, ...dashPattern]
}

const withSuppressedPureImageWarnings = <T>(fn: () => T) => {
  const originalWarn = console.warn
  console.warn = (...args: unknown[]) => {
    if (args[0] === "can't project the same paths") {
      return
    }
    originalWarn(...args)
  }

  try {
    return fn()
  } finally {
    console.warn = originalWarn
  }
}

const strokePolyline = (
  ctx: Context,
  points: Point[],
  dashPattern: number[] | undefined,
) => {
  if (points.length < 2) return

  if (!dashPattern || dashPattern.length === 0) {
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    withSuppressedPureImageWarnings(() => ctx.stroke())
    return
  }

  const normalizedPattern = normalizeDashPattern(dashPattern)
  let patternIndex = 0
  let patternOffset = 0
  let isDrawing = true

  ctx.beginPath()

  for (let i = 1; i < points.length; i++) {
    const start = points[i - 1]
    const end = points[i]
    const dx = end.x - start.x
    const dy = end.y - start.y
    const segmentLength = Math.hypot(dx, dy)

    if (segmentLength === 0) continue

    let distanceAlongSegment = 0
    while (distanceAlongSegment < segmentLength) {
      const remainingPatternLength =
        normalizedPattern[patternIndex] - patternOffset
      const stepLength = Math.min(
        remainingPatternLength,
        segmentLength - distanceAlongSegment,
      )

      const t1 = distanceAlongSegment / segmentLength
      const t2 = (distanceAlongSegment + stepLength) / segmentLength
      const x1 = start.x + dx * t1
      const y1 = start.y + dy * t1
      const x2 = start.x + dx * t2
      const y2 = start.y + dy * t2

      if (isDrawing) {
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
      }

      distanceAlongSegment += stepLength
      patternOffset += stepLength

      if (patternOffset >= normalizedPattern[patternIndex] - 1e-6) {
        patternOffset = 0
        patternIndex = (patternIndex + 1) % normalizedPattern.length
        isDrawing = !isDrawing
      }
    }
  }

  withSuppressedPureImageWarnings(() => ctx.stroke())
}

const renderText = (
  ctx: Context,
  {
    text,
    x,
    y,
    fontSize,
    color,
    anchorAlignment = "top_left",
    rotationRadians,
  }: {
    text: string
    x: number
    y: number
    fontSize: number
    color?: string
    anchorAlignment?: NinePointAnchor
    rotationRadians?: number
  },
) => {
  withSuppressedPureImageWarnings(() =>
    strokeAlphabetText({
      ctx,
      text,
      fontSize,
      startX: x,
      startY: y,
      color: color ?? "black",
      anchorAlignment: anchorAlignment ?? "top_left",
      rotationRadians,
    }),
  )
}

export async function getPngBufferFromGraphicsObject(
  graphics: GraphicsObject,
  {
    includeTextLabels = false,
    hideInlineLabels = false,
    backgroundColor = DEFAULT_BACKGROUND_COLOR,
    pngWidth = DEFAULT_PNG_SIZE,
    pngHeight = DEFAULT_PNG_SIZE,
    ...transformOptions
  }: PngRenderOptions = {},
): Promise<Uint8Array> {
  const image = new Bitmap(pngWidth, pngHeight)
  const ctx = image.getContext("2d")

  ctx.clearRect(0, 0, pngWidth, pngHeight)
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, pngWidth, pngHeight)
  }

  const yFlip =
    transformOptions.yFlip ?? graphics.coordinateSystem === "cartesian"
  const matrix: Matrix =
    transformOptions.transform ??
    computeTransformFromViewbox(
      transformOptions.viewbox ?? getBounds(graphics),
      pngWidth,
      pngHeight,
      {
        padding: transformOptions.padding ?? 40,
        yFlip,
      },
    )
  const strokeScale = Math.abs(matrix.a)

  for (const line of (graphics.lines || [])
    .map((value, originalIndex) => ({ value, originalIndex }))
    .sort(
      (a, b) =>
        (a.value.zIndex ?? 0) - (b.value.zIndex ?? 0) ||
        a.originalIndex - b.originalIndex,
    )
    .map(({ value }) => value)) {
    const projectedPoints = line.points.map((point) =>
      applyToPoint(matrix, point),
    )
    const dashPattern = line.strokeDash
      ? parseStrokeDash(line.strokeDash, strokeScale)
      : undefined

    ctx.strokeStyle = line.strokeColor || "black"
    ctx.lineWidth =
      line.strokeWidth === undefined
        ? 1
        : Math.max(line.strokeWidth * strokeScale, 1)
    strokePolyline(ctx, projectedPoints, dashPattern)

    if (
      shouldRenderLabel(
        includeTextLabels,
        transformOptions.disableLabels,
        "lines",
      ) &&
      line.label &&
      projectedPoints.length > 0
    ) {
      renderText(ctx, {
        text: line.label,
        x: projectedPoints[0].x + 5,
        y: projectedPoints[0].y - 5,
        fontSize: 12,
        color: line.strokeColor || "black",
      })
    }
  }

  if (graphics.infiniteLines) {
    const viewportBounds = getViewportBoundsFromMatrix(
      matrix,
      pngWidth,
      pngHeight,
    )
    for (const line of graphics.infiniteLines) {
      const segment = clipInfiniteLineToBounds(line, viewportBounds)
      if (!segment) continue

      const projectedPoints = segment.map((point) =>
        applyToPoint(matrix, point),
      )
      const dashPattern = line.strokeDash
        ? parseStrokeDash(line.strokeDash, strokeScale)
        : undefined

      ctx.strokeStyle = line.strokeColor || "black"
      ctx.lineWidth =
        line.strokeWidth === undefined
          ? 1
          : Math.max(line.strokeWidth * strokeScale, 1)
      strokePolyline(ctx, projectedPoints, dashPattern)

      if (
        shouldRenderLabel(
          includeTextLabels,
          transformOptions.disableLabels,
          "infiniteLines",
        ) &&
        line.label
      ) {
        renderText(ctx, {
          text: line.label,
          x: (projectedPoints[0].x + projectedPoints[1].x) / 2 + 5,
          y: (projectedPoints[0].y + projectedPoints[1].y) / 2 - 5,
          fontSize: 12,
          color: line.strokeColor || "black",
        })
      }
    }
  }

  for (const rect of graphics.rects || []) {
    const topLeft = applyToPoint(matrix, {
      x: rect.center.x - rect.width / 2,
      y: rect.center.y - rect.height / 2,
    })
    const bottomRight = applyToPoint(matrix, {
      x: rect.center.x + rect.width / 2,
      y: rect.center.y + rect.height / 2,
    })
    const x = Math.min(topLeft.x, bottomRight.x)
    const y = Math.min(topLeft.y, bottomRight.y)
    const width = Math.abs(bottomRight.x - topLeft.x)
    const height = Math.abs(bottomRight.y - topLeft.y)

    if (hasVisiblePaint(rect.fill)) {
      ctx.fillStyle = rect.fill!
      ctx.fillRect(x, y, width, height)
    }

    if (hasVisiblePaint(rect.stroke)) {
      ctx.strokeStyle = rect.stroke!
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, width, height)
    }

    if (
      shouldRenderLabel(
        includeTextLabels,
        transformOptions.disableLabels,
        "rects",
      ) &&
      rect.label
    ) {
      renderText(ctx, {
        text: rect.label,
        x: x + 5,
        y,
        fontSize: ((width + height) / 2) * 0.06,
        color: rect.stroke || "black",
      })
    }
  }

  for (const polygon of graphics.polygons || []) {
    if (polygon.points.length === 0) continue

    const projectedPoints = polygon.points.map((point) =>
      applyToPoint(matrix, point),
    )
    const minX = Math.min(...projectedPoints.map((point) => point.x))
    const minY = Math.min(...projectedPoints.map((point) => point.y))

    ctx.beginPath()
    ctx.moveTo(projectedPoints[0].x, projectedPoints[0].y)
    for (let i = 1; i < projectedPoints.length; i++) {
      ctx.lineTo(projectedPoints[i].x, projectedPoints[i].y)
    }
    ctx.closePath()

    if (hasVisiblePaint(polygon.fill)) {
      ctx.fillStyle = polygon.fill!
      withSuppressedPureImageWarnings(() => ctx.fill())
    }

    if (hasVisiblePaint(polygon.stroke)) {
      ctx.strokeStyle = polygon.stroke!
      ctx.lineWidth =
        polygon.strokeWidth === undefined
          ? 1
          : Math.max(polygon.strokeWidth * strokeScale, 1)
      withSuppressedPureImageWarnings(() => ctx.stroke())
    }

    if (
      shouldRenderLabel(
        includeTextLabels,
        transformOptions.disableLabels,
        "polygons",
      ) &&
      polygon.label
    ) {
      renderText(ctx, {
        text: polygon.label,
        x: minX + 5,
        y: minY,
        fontSize: 12,
        color: polygon.stroke || "black",
      })
    }
  }

  for (const circle of graphics.circles || []) {
    const projectedCenter = applyToPoint(matrix, circle.center)
    const scaledRadius = circle.radius * strokeScale

    ctx.beginPath()
    ctx.arc(projectedCenter.x, projectedCenter.y, scaledRadius, 0, Math.PI * 2)

    if (hasVisiblePaint(circle.fill)) {
      ctx.fillStyle = circle.fill!
      withSuppressedPureImageWarnings(() => ctx.fill())
    }

    if (hasVisiblePaint(circle.stroke)) {
      ctx.strokeStyle = circle.stroke!
      ctx.lineWidth = 1
      withSuppressedPureImageWarnings(() => ctx.stroke())
    }
  }

  for (const arrow of graphics.arrows || []) {
    const geometry = getArrowGeometry(arrow)
    const shaftStart = applyToPoint(matrix, geometry.shaftStart)
    const shaftEnd = applyToPoint(matrix, geometry.shaftEnd)
    const fontSize = 12
    const inlineLabelLayout = getInlineLabelLayout(shaftStart, shaftEnd, {
      fontSize,
      strokeWidth: geometry.shaftWidth,
      normalPadding: 6,
      alongOffset: arrow.label ? fontSize * 0.6 : 0,
    })
    const arrowLabelLayout = getInlineLabelLayout(shaftStart, shaftEnd, {
      fontSize,
      strokeWidth: geometry.shaftWidth,
      normalPadding: 12,
      alongOffset: arrow.inlineLabel ? -(fontSize * 0.6) : 0,
    })
    const color = arrow.color || "black"

    if (shaftStart.x !== shaftEnd.x || shaftStart.y !== shaftEnd.y) {
      ctx.strokeStyle = color
      ctx.lineWidth = geometry.shaftWidth
      strokePolyline(ctx, [shaftStart, shaftEnd], undefined)
    }

    ctx.fillStyle = color
    for (const head of geometry.heads) {
      const tip = applyToPoint(matrix, head.tip)
      const leftWing = applyToPoint(matrix, head.leftWing)
      const rightWing = applyToPoint(matrix, head.rightWing)

      ctx.beginPath()
      ctx.moveTo(tip.x, tip.y)
      ctx.lineTo(leftWing.x, leftWing.y)
      ctx.lineTo(rightWing.x, rightWing.y)
      ctx.closePath()
      withSuppressedPureImageWarnings(() => ctx.fill())
    }

    if (
      shouldRenderLabel(
        includeTextLabels,
        transformOptions.disableLabels,
        "arrows",
      ) &&
      arrow.label
    ) {
      renderText(ctx, {
        text: arrow.label,
        x: arrowLabelLayout.x,
        y: arrowLabelLayout.y,
        fontSize,
        color,
        anchorAlignment: "center",
      })
    }

    if (
      !transformOptions.disableLabels &&
      !hideInlineLabels &&
      arrow.inlineLabel
    ) {
      renderText(ctx, {
        text: arrow.inlineLabel,
        x: inlineLabelLayout.x,
        y: inlineLabelLayout.y,
        fontSize,
        color,
        anchorAlignment: "center",
        rotationRadians: inlineLabelLayout.angleRadians,
      })
    }
  }

  for (const text of graphics.texts || []) {
    const projected = applyToPoint(matrix, { x: text.x, y: text.y })
    renderText(ctx, {
      text: text.text,
      x: projected.x,
      y: projected.y,
      fontSize: (text.fontSize ?? 12) * strokeScale,
      color: text.color || "black",
      anchorAlignment: text.anchorSide ?? "center",
    })
  }

  for (const point of graphics.points || []) {
    const projected = applyToPoint(matrix, point)

    ctx.beginPath()
    ctx.arc(projected.x, projected.y, 3, 0, Math.PI * 2)
    ctx.fillStyle = point.color || "black"
    withSuppressedPureImageWarnings(() => ctx.fill())

    if (
      shouldRenderLabel(
        includeTextLabels,
        transformOptions.disableLabels,
        "points",
      ) &&
      point.label
    ) {
      renderText(ctx, {
        text: point.label,
        x: projected.x + 5,
        y: projected.y - 5,
        fontSize: 12,
        color: point.color || "black",
      })
    }
  }

  return encode({
    width: image.width,
    height: image.height,
    data: image.data,
  })
}
