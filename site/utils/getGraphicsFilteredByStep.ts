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
    points: graphics.points?.filter(
      (p) => p.step === undefined || p.step === selectedStep,
    ),
    lines: graphics.lines?.filter(
      (l) => l.step === undefined || l.step === selectedStep,
    ),
    arrows: graphics.arrows?.filter(
      (a) => a.step === undefined || a.step === selectedStep,
    ),
    rects: graphics.rects?.filter(
      (r) => r.step === undefined || r.step === selectedStep,
    ),
    circles: graphics.circles?.filter(
      (c) => c.step === undefined || c.step === selectedStep,
    ),
    texts: graphics.texts?.filter(
      (t) => t.step === undefined || t.step === selectedStep,
    ),
  }

  return filteredGraphics
}
