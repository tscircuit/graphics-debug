import type { Matrix } from "transformation-matrix"
import type { GraphicsObjectClickEvent } from "./InteractiveGraphics"

export type InteractiveState = {
  activeLayers: string[] | null
  activeStep: number | null
  realToScreen: Matrix
  onObjectClicked?: (event: GraphicsObjectClickEvent) => void
  setHoverTooltip?: (tooltip: HoverTooltip | null) => void
}

export type HoverTooltip = {
  text: string
  x: number
  y: number
}
