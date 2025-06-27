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
  strokeDash?: string | number[]
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

export type NinePointAnchor =
  | "center"
  | "top_left"
  | "top_center"
  | "top_right"
  | "center_left"
  | "center_right"
  | "bottom_left"
  | "bottom_center"
  | "bottom_right"

export interface Text {
  x: number
  y: number
  text: string
  anchorSide?: NinePointAnchor
  color?: string
  fontSize?: number
  layer?: string
  step?: number
}

export interface GraphicsObject {
  points?: Point[]
  lines?: Line[]
  rects?: Rect[]
  circles?: Circle[]
  texts?: Text[]
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
  disableLabels?: boolean
}
