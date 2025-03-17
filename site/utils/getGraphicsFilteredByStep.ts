import { GraphicsObject } from "lib/types"

export function getGraphicsFilteredByStep(
  graphics: GraphicsObject,
  {
    showLastStep,
    activeStep,
    maxStep,
  }: {
    showLastStep?: boolean
    activeStep?: number | null
    maxStep?: number | null
  },
) {
  const selectedStep = showLastStep ? maxStep : activeStep

  if (selectedStep === null) {
    return graphics
  }

  const filteredGraphics = {
    ...graphics,
    points: graphics.points?.filter((p) => p.step === selectedStep),
    lines: graphics.lines?.filter((l) => l.step === selectedStep),
    rects: graphics.rects?.filter((r) => r.step === selectedStep),
    circles: graphics.circles?.filter((c) => c.step === selectedStep),
  }

  return filteredGraphics
}
