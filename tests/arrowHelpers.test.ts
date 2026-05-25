import { describe, expect, test } from "bun:test"
import { getInlineLabelLayout } from "../lib/arrowHelpers"

describe("getInlineLabelLayout", () => {
  test("offsets label from shaft midpoint and aligns angle with shaft", () => {
    const layout = getInlineLabelLayout({ x: 0, y: 0 }, { x: 10, y: 0 })
    const expectedOffset = 2 / 2 + 12 * 0.65 + 6

    expect(layout.x).toBeCloseTo(5)
    expect(layout.y).toBeCloseTo(expectedOffset)
    expect(layout.angleDegrees).toBeCloseTo(0)
  })

  test("keeps text upright and flips normal for reversed arrows", () => {
    const layout = getInlineLabelLayout({ x: 10, y: 0 }, { x: 0, y: 0 })

    expect(layout.angleDegrees).toBeCloseTo(0)
    expect(layout.y).toBeCloseTo(14.8)
    expect(layout.normal.y).toBeCloseTo(1)
  })

  test("increases offset when font or stroke gets larger", () => {
    const small = getInlineLabelLayout(
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      {
        fontSize: 10,
        strokeWidth: 2,
      },
    )
    const large = getInlineLabelLayout(
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      {
        fontSize: 16,
        strokeWidth: 6,
      },
    )

    expect(large.y).toBeGreaterThan(small.y)
  })
})
