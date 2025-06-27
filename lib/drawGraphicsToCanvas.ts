import {
  compose,
  scale,
  translate,
  applyToPoint,
  type Matrix,
} from "transformation-matrix"
import type {
  GraphicsObject,
  Viewbox,
  CenterViewbox,
  TransformOptions,
} from "./types"
import { defaultColors } from "site/components/InteractiveGraphics/defaultColors"

/**
 * Computes a transformation matrix based on a provided viewbox
 * Handles both min/max style viewboxes and center/width/height style viewboxes
 */
export function computeTransformFromViewbox(
  viewbox: Viewbox | CenterViewbox,
  canvasWidth: number,
  canvasHeight: number,
  options: { padding?: number; yFlip?: boolean } = {},
): Matrix {
  const padding = options.padding ?? 40
  const yFlip = options.yFlip ?? false

  // Convert CenterViewbox to Viewbox if needed
  let bounds: Viewbox
  if ("center" in viewbox) {
    const halfWidth = viewbox.width / 2
    const halfHeight = viewbox.height / 2
    bounds = {
      minX: viewbox.center.x - halfWidth,
      maxX: viewbox.center.x + halfWidth,
      minY: viewbox.center.y - halfHeight,
      maxY: viewbox.center.y + halfHeight,
    }
  } else {
    bounds = viewbox
  }

  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY

  const scale_factor = Math.min(
    (canvasWidth - 2 * padding) / width,
    (canvasHeight - 2 * padding) / height,
  )

  return compose(
    translate(canvasWidth / 2, canvasHeight / 2),
    scale(scale_factor, yFlip ? -scale_factor : scale_factor),
    translate(-(bounds.minX + width / 2), -(bounds.minY + height / 2)),
  )
}

/**
 * Computes bounds for a graphics object
 */
export function getBounds(graphics: GraphicsObject): Viewbox {
  const points = [
    ...(graphics.points || []),
    ...(graphics.lines || []).flatMap((line) => line.points),
    ...(graphics.rects || []).flatMap((rect) => {
      const halfWidth = rect.width / 2
      const halfHeight = rect.height / 2
      return [
        { x: rect.center.x - halfWidth, y: rect.center.y - halfHeight },
        { x: rect.center.x + halfWidth, y: rect.center.y - halfHeight },
        { x: rect.center.x - halfWidth, y: rect.center.y + halfHeight },
        { x: rect.center.x + halfWidth, y: rect.center.y + halfHeight },
      ]
    }),
    ...(graphics.circles || []).flatMap((circle) => [
      { x: circle.center.x - circle.radius, y: circle.center.y }, // left
      { x: circle.center.x + circle.radius, y: circle.center.y }, // right
      { x: circle.center.x, y: circle.center.y - circle.radius }, // top
      { x: circle.center.x, y: circle.center.y + circle.radius }, // bottom
    ]),
    ...(graphics.texts || []).map((text) => text.position),
  ]

  if (points.length === 0) {
    return { minX: -1, maxX: 1, minY: -1, maxY: 1 }
  }

  return points.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      maxX: Math.max(bounds.maxX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )
}

/**
 * Draws a graphics object onto a canvas or context
 * @param graphics - The graphics object to draw
 * @param target - The canvas element or 2D context to draw on
 * @param options - Options for controlling the transform and rendering
 */
export function drawGraphicsToCanvas(
  graphics: GraphicsObject,
  target: HTMLCanvasElement | CanvasRenderingContext2D,
  options: TransformOptions = {},
): void {
  // Get the context
  const ctx =
    target instanceof HTMLCanvasElement ? target.getContext("2d") : target

  if (!ctx) {
    throw new Error("Could not get 2D context from canvas")
  }

  // Get canvas dimensions
  const canvasWidth =
    target instanceof HTMLCanvasElement ? target.width : target.canvas.width

  const canvasHeight =
    target instanceof HTMLCanvasElement ? target.height : target.canvas.height

  // Get or compute the transform matrix
  let matrix: Matrix

  if (options.transform) {
    matrix = options.transform
  } else if (options.viewbox) {
    matrix = computeTransformFromViewbox(
      options.viewbox,
      canvasWidth,
      canvasHeight,
      {
        padding: options.padding,
        yFlip: options.yFlip,
      },
    )
  } else {
    // Auto-compute bounds and transform if not provided
    const bounds = getBounds(graphics)
    const yFlip = graphics.coordinateSystem === "cartesian"
    matrix = computeTransformFromViewbox(bounds, canvasWidth, canvasHeight, {
      padding: options.padding ?? 40,
      yFlip,
    })
  }

  // Clear the canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Save the current transform state
  ctx.save()

  // Draw the graphics elements
  // Draw rectangles
  if (graphics.rects && graphics.rects.length > 0) {
    graphics.rects.forEach((rect) => {
      const halfWidth = rect.width / 2
      const halfHeight = rect.height / 2

      const topLeft = applyToPoint(matrix, {
        x: rect.center.x - halfWidth,
        y: rect.center.y - halfHeight,
      })

      const bottomRight = applyToPoint(matrix, {
        x: rect.center.x + halfWidth,
        y: rect.center.y + halfHeight,
      })

      const width = Math.abs(bottomRight.x - topLeft.x)
      const height = Math.abs(bottomRight.y - topLeft.y)

      ctx.beginPath()
      ctx.rect(
        Math.min(topLeft.x, bottomRight.x),
        Math.min(topLeft.y, bottomRight.y),
        width,
        height,
      )

      if (rect.fill) {
        ctx.fillStyle = rect.fill
        ctx.fill()
      }

      if (rect.stroke) {
        ctx.strokeStyle = rect.stroke
        ctx.stroke()
      }
    })
  }

  // Draw circles
  if (graphics.circles && graphics.circles.length > 0) {
    graphics.circles.forEach((circle) => {
      const projected = applyToPoint(matrix, circle.center)
      const scaledRadius = circle.radius * Math.abs(matrix.a) // Use matrix scale factor

      ctx.beginPath()
      ctx.arc(projected.x, projected.y, scaledRadius, 0, 2 * Math.PI)

      if (circle.fill) {
        ctx.fillStyle = circle.fill
        ctx.fill()
      }

      if (circle.stroke) {
        ctx.strokeStyle = circle.stroke ?? "transparent"
        ctx.stroke()
      }
    })
  }

  // Draw lines
  if (graphics.lines && graphics.lines.length > 0) {
    graphics.lines.forEach((line, lineIndex) => {
      if (line.points.length === 0) return

      ctx.beginPath()

      const firstPoint = applyToPoint(matrix, line.points[0])
      ctx.moveTo(firstPoint.x, firstPoint.y)

      for (let i = 1; i < line.points.length; i++) {
        const projected = applyToPoint(matrix, line.points[i])
        ctx.lineTo(projected.x, projected.y)
      }

      ctx.strokeStyle =
        line.strokeColor || defaultColors[lineIndex % defaultColors.length]
      if (line.strokeWidth) {
        ctx.lineWidth = line.strokeWidth * matrix.a
      } else {
        ctx.lineWidth = 2
      }
      ctx.lineCap = "round"

      if (line.strokeDash) {
        if (typeof line.strokeDash === "string") {
          // Convert string to array of numbers, handling single values properly
          let dashArray: number[]

          // If the string contains commas, split and convert to numbers
          if (line.strokeDash.includes(",")) {
            dashArray = line.strokeDash
              .split(",")
              .map((s) => parseFloat(s.trim()))
              .filter((n) => !Number.isNaN(n))
          } else {
            // Handle single value case
            const value = parseFloat(line.strokeDash.trim())
            dashArray = !Number.isNaN(value) ? [value] : []
          }

          // Scale dash values based on transform matrix
          ctx.setLineDash(dashArray)
        } else {
          // Handle array format
          ctx.setLineDash(line.strokeDash.map((n) => n * Math.abs(matrix.a)))
        }
      } else {
        ctx.setLineDash([])
      }

      ctx.stroke()
    })
  }

  // Draw points
  if (graphics.points && graphics.points.length > 0) {
    graphics.points.forEach((point, pointIndex) => {
      const projected = applyToPoint(matrix, point)

      // Draw point as a small circle
      ctx.beginPath()
      ctx.arc(projected.x, projected.y, 3, 0, 2 * Math.PI)
      ctx.fillStyle =
        point.color || defaultColors[pointIndex % defaultColors.length]
      ctx.fill()

      // Draw label if present and labels aren't disabled
      if (point.label && !options.disableLabels) {
        ctx.fillStyle = point.color || "black"
        ctx.font = "12px sans-serif"
        ctx.fillText(point.label, projected.x + 5, projected.y - 5)
      }
    })
  }

  // Draw texts
  if (graphics.texts && graphics.texts.length > 0) {
    graphics.texts.forEach((text) => {
      const projected = applyToPoint(matrix, text.position)
      ctx.fillStyle = text.color || "black"
      ctx.font = `${text.fontSize ?? 12}px sans-serif`
      ctx.fillText(text.text, projected.x, projected.y)
    })
  }

  // Restore the original transform
  ctx.restore()
}
