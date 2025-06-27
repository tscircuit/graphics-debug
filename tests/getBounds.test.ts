import { describe, expect, test } from "bun:test"
import {
  getBounds,
  FONT_SIZE_WIDTH_RATIO,
  FONT_SIZE_HEIGHT_RATIO,
} from "../lib"
import type { GraphicsObject } from "../lib/types"

describe("getBounds with text", () => {
  test("calculates text bounds using font size and default anchor", () => {
    const graphics: GraphicsObject = {
      texts: [{ x: 0, y: 0, text: "hello", fontSize: 10 }],
    }
    const bounds = getBounds(graphics)
    const width = "hello".length * 10 * FONT_SIZE_WIDTH_RATIO
    const height = 10 * FONT_SIZE_HEIGHT_RATIO
    expect(bounds.maxX).toBeCloseTo(width / 2)
    expect(bounds.minX).toBeCloseTo(-width / 2)
    expect(bounds.maxY).toBeCloseTo(height / 2)
    expect(bounds.minY).toBeCloseTo(-height / 2)
  })

  test("accounts for anchorSide", () => {
    const graphics: GraphicsObject = {
      texts: [
        { x: 0, y: 0, text: "hi", fontSize: 8, anchorSide: "bottom_right" },
      ],
    }
    const bounds = getBounds(graphics)
    const width = "hi".length * 8 * FONT_SIZE_WIDTH_RATIO
    const height = 8 * FONT_SIZE_HEIGHT_RATIO
    expect(bounds.maxX).toBeCloseTo(0)
    expect(bounds.minX).toBeCloseTo(-width)
    expect(bounds.maxY).toBeCloseTo(0)
    expect(bounds.minY).toBeCloseTo(-height)
  })
})
