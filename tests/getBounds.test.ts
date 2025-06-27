import { describe, expect, test } from "bun:test"
import {
  getBounds,
  FONT_SIZE_WIDTH_RATIO,
  FONT_SIZE_HEIGHT_RATIO,
} from "../lib"

describe("getBounds with text", () => {
  test("calculates text bounds using font size", () => {
    const graphics = {
      texts: [{ x: 0, y: 0, text: "hello", fontSize: 10 }],
    }
    const bounds = getBounds(graphics)
    expect(bounds.maxX).toBeCloseTo("hello".length * 10 * FONT_SIZE_WIDTH_RATIO)
    expect(bounds.maxY).toBeCloseTo(10 * FONT_SIZE_HEIGHT_RATIO)
  })
})
