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

export interface InfiniteLine {
  directionVector: { x: number; y: number }
  origin: { x: number; y: number }
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

export interface Polygon {
  points: { x: number; y: number }[]
  fill?: string
  stroke?: string
  strokeWidth?: number
  color?: string
  layer?: string
  step?: number
  label?: string
}

export interface Arrow {
  start: { x: number; y: number }
  end: { x: number; y: number }
  doubleSided?: boolean
  color?: string
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
  infiniteLines?: InfiniteLine[]
  rects?: Rect[]
  circles?: Circle[]
  polygons?: Polygon[]
  arrows?: Arrow[]
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
