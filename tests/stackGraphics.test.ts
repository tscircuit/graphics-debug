import { describe, expect, test } from "bun:test"
import {
  stackGraphicsHorizontally,
  stackGraphicsVertically,
  createGraphicsGrid,
} from "../lib/stackGraphics"
import type { GraphicsObject } from "../lib/types"

const rectGraphic = (): GraphicsObject => ({
  rects: [{ center: { x: 0, y: 0 }, width: 2, height: 2 }],
})

describe("stackGraphicsHorizontally", () => {
  test("stacks two graphics side by side", () => {
    const g1 = rectGraphic()
    const g2 = rectGraphic()
    const stacked = stackGraphicsHorizontally([g1, g2])
    expect(stacked.rects?.length).toBe(2)
    const [r1, r2] = stacked.rects!
    expect(r1.center.x).toBeCloseTo(0)
    expect(r2.center.x).toBeCloseTo(-2.5)
  })
})

describe("stackGraphicsVertically", () => {
  test("stacks two graphics vertically", () => {
    const g1 = rectGraphic()
    const g2 = rectGraphic()
    const stacked = stackGraphicsVertically([g1, g2])
    expect(stacked.rects?.length).toBe(2)
    const [r1, r2] = stacked.rects!
    expect(r1.center.y).toBeCloseTo(0)
    expect(r2.center.y).toBeCloseTo(-2.5)
  })
})

describe("createGraphicsGrid", () => {
  test("arranges graphics in a simple grid", () => {
    const g = rectGraphic()
    const grid = createGraphicsGrid([
      [g, g],
      [g, g],
    ])
    expect(grid.rects?.length).toBe(4)
    const [r1, r2, r3, r4] = grid.rects!
    expect(r1.center.x).toBeCloseTo(1)
    expect(r1.center.y).toBeCloseTo(1)
    expect(r2.center.x).toBeCloseTo(3)
    expect(r2.center.y).toBeCloseTo(1)
    expect(r3.center.x).toBeCloseTo(1)
    expect(r3.center.y).toBeCloseTo(3)
    expect(r4.center.x).toBeCloseTo(3)
    expect(r4.center.y).toBeCloseTo(3)
  })

  test("supports a gap between cells", () => {
    const g = rectGraphic()
    const grid = createGraphicsGrid(
      [
        [g, g],
        [g, g],
      ],
      { gap: 1 },
    )
    const [r1, r2, r3, r4] = grid.rects!
    expect(r1.center.x).toBeCloseTo(1)
    expect(r2.center.x).toBeCloseTo(4)
    expect(r3.center.y).toBeCloseTo(4)
    expect(r4.center.x).toBeCloseTo(4)
    expect(r4.center.y).toBeCloseTo(4)
  })

  test("supports a gap as a fraction of the cell width", () => {
    const g = rectGraphic()
    const grid = createGraphicsGrid(
      [
        [g, g],
        [g, g],
      ],
      { gapAsCellWidthFraction: 0.5 },
    )
    const [r1, r2] = grid.rects!
    expect(r2.center.x).toBeCloseTo(4)
  })
})
