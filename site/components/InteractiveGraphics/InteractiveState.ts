import type { Matrix } from "transformation-matrix"

export type InteractiveState = {
  activeLayers: string[] | null
  activeStep: number | null
  realToScreen: Matrix
}
