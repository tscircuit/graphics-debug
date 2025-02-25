export interface Point {
  x: number
  y: number
  color?: string
  label?: string
  layer?: string
  step?: number
}

export interface Line {
  points: { x: number; y: number }[]
  strokeWidth?: number
  strokeColor?: string
  strokeDash?: string
  layer?: string
  step?: number
  label?: string
}

export interface Rect {
  center: { x: number; y: number }
  width: number
  height: number
  fill?: string
  stroke?: string
  color?: string
  layer?: string
  step?: number
  label?: string
}

export interface Circle {
  center: { x: number; y: number }
  radius: number
  fill?: string
  stroke?: string
  layer?: string
  step?: number
  label?: string
}

export interface GraphicsObject {
  points?: Point[]
  lines?: Line[]
  rects?: Rect[]
  circles?: Circle[]
  coordinateSystem?: "cartesian" | "screen"
  title?: string
}

export interface Viewbox {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface CenterViewbox {
  center: { x: number; y: number }
  width: number
  height: number
}

export type TransformOptions = {
  transform?: import("transformation-matrix").Matrix
  viewbox?: Viewbox | CenterViewbox
  padding?: number
  yFlip?: boolean
}
