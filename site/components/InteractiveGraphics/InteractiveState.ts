import type { Matrix } from "transformation-matrix"
import type { GraphicsObjectClickEvent } from "./InteractiveGraphics"

export type InteractiveState = {
  activeLayers: string[] | null
  activeStep: number | null
  realToScreen: Matrix
  onObjectClicked?: (event: GraphicsObjectClickEvent) => void
}
