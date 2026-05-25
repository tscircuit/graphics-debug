import { encode } from "fast-png"
import { parseToRgb } from "polished"

type Point = { x: number; y: number }
type Matrix = {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}
type RgbaColor = { r: number; g: number; b: number; a: number }

const IDENTITY_MATRIX: Matrix = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0,
}

const SAMPLE_OFFSETS = [0.25, 0.75]
const COLOR_CACHE = new Map<string, RgbaColor>()

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const multiplyMatrices = (left: Matrix, right: Matrix): Matrix => ({
  a: left.a * right.a + left.c * right.b,
  b: left.b * right.a + left.d * right.b,
  c: left.a * right.c + left.c * right.d,
  d: left.b * right.c + left.d * right.d,
  e: left.a * right.e + left.c * right.f + left.e,
  f: left.b * right.e + left.d * right.f + left.f,
})

const applyMatrix = (matrix: Matrix, point: Point): Point => ({
  x: matrix.a * point.x + matrix.c * point.y + matrix.e,
  y: matrix.b * point.x + matrix.d * point.y + matrix.f,
})

const distanceToSegmentSquared = (point: Point, start: Point, end: Point) => {
  const dx = end.x - start.x
  const dy = end.y - start.y

  if (dx === 0 && dy === 0) {
    const px = point.x - start.x
    const py = point.y - start.y
    return px * px + py * py
  }

  const t = clamp(
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy),
    0,
    1,
  )
  const closestX = start.x + dx * t
  const closestY = start.y + dy * t
  const px = point.x - closestX
  const py = point.y - closestY
  return px * px + py * py
}

const pointInPolygon = (point: Point, polygon: Point[]) => {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi || 1e-12) + xi

    if (intersects) inside = !inside
  }

  return inside
}

const parseColor = (value: string): RgbaColor => {
  const cached = COLOR_CACHE.get(value)
  if (cached) return cached

  if (value === "transparent") {
    const color = { r: 0, g: 0, b: 0, a: 0 }
    COLOR_CACHE.set(value, color)
    return color
  }

  const parsed = parseToRgb(value)
  const color = {
    r: parsed.red,
    g: parsed.green,
    b: parsed.blue,
    a: Math.round(("alpha" in parsed ? parsed.alpha : 1) * 255),
  }
  COLOR_CACHE.set(value, color)
  return color
}

const blendPixel = (
  data: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  color: RgbaColor,
  coverage: number,
) => {
  if (coverage <= 0 || x < 0 || y < 0 || x >= width || y >= height) return

  const index = (y * width + x) * 4
  const sourceAlpha = (color.a / 255) * coverage
  const destinationAlpha = data[index + 3] / 255
  const outputAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha)

  if (outputAlpha <= 0) return

  const destinationRed = data[index] / 255
  const destinationGreen = data[index + 1] / 255
  const destinationBlue = data[index + 2] / 255
  const sourceRed = color.r / 255
  const sourceGreen = color.g / 255
  const sourceBlue = color.b / 255

  const outputRed =
    (sourceRed * sourceAlpha +
      destinationRed * destinationAlpha * (1 - sourceAlpha)) /
    outputAlpha
  const outputGreen =
    (sourceGreen * sourceAlpha +
      destinationGreen * destinationAlpha * (1 - sourceAlpha)) /
    outputAlpha
  const outputBlue =
    (sourceBlue * sourceAlpha +
      destinationBlue * destinationAlpha * (1 - sourceAlpha)) /
    outputAlpha

  data[index] = Math.round(outputRed * 255)
  data[index + 1] = Math.round(outputGreen * 255)
  data[index + 2] = Math.round(outputBlue * 255)
  data[index + 3] = Math.round(outputAlpha * 255)
}

const forEachPixelInBounds = (
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  visit: (x: number, y: number) => void,
) => {
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
      visit(x, y)
    }
  }
}

const drawFilledPolygon = (
  data: Uint8Array,
  width: number,
  height: number,
  polygon: Point[],
  color: RgbaColor,
) => {
  if (polygon.length < 3) return

  const xs = polygon.map((point) => point.x)
  const ys = polygon.map((point) => point.y)

  forEachPixelInBounds(
    Math.min(...xs),
    Math.min(...ys),
    Math.max(...xs),
    Math.max(...ys),
    (x, y) => {
      let hits = 0
      for (const offsetY of SAMPLE_OFFSETS) {
        for (const offsetX of SAMPLE_OFFSETS) {
          if (pointInPolygon({ x: x + offsetX, y: y + offsetY }, polygon)) {
            hits += 1
          }
        }
      }
      blendPixel(data, width, height, x, y, color, hits / 4)
    },
  )
}

const drawStrokePolyline = (
  data: Uint8Array,
  width: number,
  height: number,
  points: Point[],
  strokeWidth: number,
  color: RgbaColor,
  closed: boolean,
) => {
  if (points.length < 2 || strokeWidth <= 0) return

  const radius = strokeWidth / 2

  const drawSegment = (start: Point, end: Point) => {
    const minX = Math.min(start.x, end.x) - radius - 1
    const maxX = Math.max(start.x, end.x) + radius + 1
    const minY = Math.min(start.y, end.y) - radius - 1
    const maxY = Math.max(start.y, end.y) + radius + 1

    forEachPixelInBounds(minX, minY, maxX, maxY, (x, y) => {
      let hits = 0
      for (const offsetY of SAMPLE_OFFSETS) {
        for (const offsetX of SAMPLE_OFFSETS) {
          const sample = { x: x + offsetX, y: y + offsetY }
          if (distanceToSegmentSquared(sample, start, end) <= radius * radius) {
            hits += 1
          }
        }
      }
      blendPixel(data, width, height, x, y, color, hits / 4)
    })
  }

  for (let i = 1; i < points.length; i++) {
    drawSegment(points[i - 1], points[i])
  }

  if (closed) {
    drawSegment(points[points.length - 1], points[0])
  }
}

const approximateArcPoints = (
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number,
  anticlockwise = false,
) => {
  let sweep = endAngle - startAngle
  if (!anticlockwise && sweep <= 0) sweep += Math.PI * 2
  if (anticlockwise && sweep >= 0) sweep -= Math.PI * 2

  const fullCircle = Math.abs(Math.abs(sweep) - Math.PI * 2) < 1e-3
  const steps = Math.max(16, Math.ceil(Math.abs(sweep) * Math.max(radius, 1)))
  const points: Point[] = []

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = startAngle + sweep * t
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    })
  }

  return { points, closed: fullCircle }
}

type PathSubpath = {
  points: Point[]
  closed: boolean
}

type SavedState = {
  transform: Matrix
  fillStyle: string
  strokeStyle: string
  lineWidth: number
  lineCap: string
  lineJoin: string
}

export interface RasterContext {
  beginPath(): void
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  closePath(): void
  stroke(): void
  fill(): void
  rect(x: number, y: number, width: number, height: number): void
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise?: boolean,
  ): void
  clearRect(x: number, y: number, width: number, height: number): void
  fillRect(x: number, y: number, width: number, height: number): void
  strokeRect(x: number, y: number, width: number, height: number): void
  save(): void
  restore(): void
  translate(x: number, y: number): void
  rotate(angleRadians: number): void
  fillStyle: string
  strokeStyle: string
  lineWidth: number
  lineCap: string
  lineJoin: string
}

class SoftwareRasterContext implements RasterContext {
  public fillStyle = "black"
  public strokeStyle = "black"
  public lineWidth = 1
  public lineCap = "butt"
  public lineJoin = "miter"

  private transform: Matrix = IDENTITY_MATRIX
  private readonly stack: SavedState[] = []
  private path: PathSubpath[] = []

  constructor(
    private readonly width: number,
    private readonly height: number,
    private readonly data: Uint8Array,
  ) {}

  beginPath(): void {
    this.path = []
  }

  moveTo(x: number, y: number): void {
    this.path.push({
      points: [applyMatrix(this.transform, { x, y })],
      closed: false,
    })
  }

  lineTo(x: number, y: number): void {
    if (this.path.length === 0) {
      this.moveTo(x, y)
      return
    }
    this.path[this.path.length - 1].points.push(
      applyMatrix(this.transform, { x, y }),
    )
  }

  closePath(): void {
    if (this.path.length > 0) {
      this.path[this.path.length - 1].closed = true
    }
  }

  rect(x: number, y: number, width: number, height: number): void {
    const corners = [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ].map((point) => applyMatrix(this.transform, point))

    this.path.push({ points: corners, closed: true })
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise = false,
  ): void {
    const { points, closed } = approximateArcPoints(
      { x, y },
      radius,
      startAngle,
      endAngle,
      anticlockwise,
    )
    this.path.push({
      points: points.map((point) => applyMatrix(this.transform, point)),
      closed,
    })
  }

  stroke(): void {
    const color = parseColor(this.strokeStyle)
    for (const subpath of this.path) {
      drawStrokePolyline(
        this.data,
        this.width,
        this.height,
        subpath.points,
        this.lineWidth,
        color,
        subpath.closed,
      )
    }
  }

  fill(): void {
    const color = parseColor(this.fillStyle)
    for (const subpath of this.path) {
      drawFilledPolygon(
        this.data,
        this.width,
        this.height,
        subpath.points,
        color,
      )
    }
  }

  clearRect(x: number, y: number, width: number, height: number): void {
    const startX = clamp(Math.floor(x), 0, this.width)
    const startY = clamp(Math.floor(y), 0, this.height)
    const endX = clamp(Math.ceil(x + width), 0, this.width)
    const endY = clamp(Math.ceil(y + height), 0, this.height)

    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        const index = (py * this.width + px) * 4
        this.data[index] = 0
        this.data[index + 1] = 0
        this.data[index + 2] = 0
        this.data[index + 3] = 0
      }
    }
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    drawFilledPolygon(
      this.data,
      this.width,
      this.height,
      [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ].map((point) => applyMatrix(this.transform, point)),
      parseColor(this.fillStyle),
    )
  }

  strokeRect(x: number, y: number, width: number, height: number): void {
    drawStrokePolyline(
      this.data,
      this.width,
      this.height,
      [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ].map((point) => applyMatrix(this.transform, point)),
      this.lineWidth,
      parseColor(this.strokeStyle),
      true,
    )
  }

  save(): void {
    this.stack.push({
      transform: { ...this.transform },
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      lineCap: this.lineCap,
      lineJoin: this.lineJoin,
    })
  }

  restore(): void {
    const state = this.stack.pop()
    if (!state) return
    this.transform = state.transform
    this.fillStyle = state.fillStyle
    this.strokeStyle = state.strokeStyle
    this.lineWidth = state.lineWidth
    this.lineCap = state.lineCap
    this.lineJoin = state.lineJoin
  }

  translate(x: number, y: number): void {
    this.transform = multiplyMatrices(this.transform, {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: x,
      f: y,
    })
  }

  rotate(angleRadians: number): void {
    const cos = Math.cos(angleRadians)
    const sin = Math.sin(angleRadians)
    this.transform = multiplyMatrices(this.transform, {
      a: cos,
      b: sin,
      c: -sin,
      d: cos,
      e: 0,
      f: 0,
    })
  }
}

export function createSoftwareRasterSurface(width: number, height: number) {
  const data = new Uint8Array(width * height * 4)
  const ctx = new SoftwareRasterContext(width, height, data)

  return {
    ctx,
    exportPng: async () =>
      encode({
        width,
        height,
        data,
      }),
  }
}
