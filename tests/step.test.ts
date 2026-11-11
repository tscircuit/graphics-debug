import { describe, expect, test } from "bun:test"
import { setStepOfAllObjects } from "../lib/setStepOfAllObjects"
import type { Arrow, GraphicsObject } from "../lib/types"
import { getGraphicsFilteredByStep } from "../site/utils/getGraphicsFilteredByStep"
import { getMaxStep } from "../site/utils/getMaxStep"
import { getTableItemsFromGraphicsObjects } from "../site/utils/getTableItemsFromGraphicsObjects"

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

  test("supports layer and step properties on arrows and includes arrows in table items", () => {
    const arrow: Arrow = {
      start: { x: 1, y: 2 },
      end: { x: 3, y: 4 },
      color: "red",
      label: "vec",
      inlineLabel: "10mm",
      layer: "top",
      step: 2,
    }
    const graphics: GraphicsObject = {
      arrows: [arrow],
    }

    const tableItems = getTableItemsFromGraphicsObjects(graphics)
    expect(tableItems).toEqual([
      {
        type: "arrow",
        id: "arrow-0",
        properties: {
          "start.x": 1,
          "start.y": 2,
          "end.x": 3,
          "end.y": 4,
          color: "red",
          label: "vec",
          inlineLabel: "10mm",
          layer: "top",
          step: 2,
        },
      },
    ])
  })
})
