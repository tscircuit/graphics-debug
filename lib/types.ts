export interface Point {
  x: number
  y: number
  color?: string
  label?: string
}

export interface Line {
  points: { x: number; y: number; stroke?: number }[]
}

export interface Rect {
  center: { x: number; y: number }
  width: number
  height: number
  fill?: string
  stroke?: string
}

export interface Circle {
  center: { x: number; y: number }
  radius: number
  fill?: string
  stroke?: string
}

export interface GraphicsObject {
  graphics: {
    points?: Point[]
    lines?: Line[]
    rects?: Rect[]
    circles?: Circle[]
    coordinateSystem?: "cartesian" | "screen"
    title?: string
  }
}
