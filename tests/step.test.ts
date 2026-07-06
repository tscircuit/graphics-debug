import { describe, expect, test } from "bun:test"
import { setStepOfAllObjects } from "../lib/setStepOfAllObjects"
import type { GraphicsObject } from "../lib/types"
import { getGraphicsFilteredByStep } from "../site/utils/getGraphicsFilteredByStep"
import { getMaxStep } from "../site/utils/getMaxStep"

describe("step utilities", () => {
  test("filters arrows by step", () => {
    const graphics: GraphicsObject = {
      arrows: [
        {
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          step: 1,
        },
        {
          start: { x: 0, y: 0 },
          end: { x: 2, y: 0 },
          step: 2,
        },
        {
          start: { x: 0, y: 0 },
          end: { x: 3, y: 0 },
        },
      ],
    }

    const [stepOneArrow, stepTwoArrow, unsteppedArrow] = graphics.arrows ?? []

    expect(
      getGraphicsFilteredByStep(graphics, {
        activeStep: 2,
        maxStep: 2,
        showLastStep: false,
      }).arrows,
    ).toEqual([stepTwoArrow, unsteppedArrow])
  })

  test("uses arrow steps when showing the last step", () => {
    const graphics: GraphicsObject = {
      arrows: [
        {
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          step: 3,
        },
      ],
      points: [{ x: 0, y: 0, step: 1 }],
    }

    const maxStep = getMaxStep(graphics)

    expect(maxStep).toBe(3)
    expect(
      getGraphicsFilteredByStep(graphics, {
        activeStep: 1,
        maxStep,
        showLastStep: true,
      }).arrows,
    ).toEqual(graphics.arrows)
  })

  test("sets arrow steps with all other objects", () => {
    const graphics: GraphicsObject = {
      arrows: [
        {
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
        },
      ],
    }

    expect(setStepOfAllObjects(graphics, 4).arrows?.[0].step).toBe(4)
  })
})
