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
  strokeWidth?: number // new optional line thickness
  strokeColor?: string // new optional line color
  layer?: string
  step?: number
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
}

export interface Circle {
  center: { x: number; y: number }
  radius: number
  fill?: string
  stroke?: string
  layer?: string
  step?: number
}

export interface GraphicsObject {
  points?: Point[]
  lines?: Line[]
  rects?: Rect[]
  circles?: Circle[]
  coordinateSystem?: "cartesian" | "screen"
  title?: string
}
