import { describe, expect, test } from "bun:test"
import {
  stackGraphicsHorizontally,
  stackGraphicsVertically,
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
    expect(r2.center.x).toBeCloseTo(2.5)
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
    expect(r2.center.y).toBeCloseTo(2.5)
  })
})
