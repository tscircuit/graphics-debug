import { describe, expect, test } from "bun:test"
import {
  FONT_SIZE_HEIGHT_RATIO,
  FONT_SIZE_WIDTH_RATIO,
  getBounds,
} from "../lib"
import { getArrowBoundingBox } from "../lib/arrowHelpers"
import type { Arrow, GraphicsObject } from "../lib/types"

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

  test("includes arrow dimensions", () => {
    const arrow: Arrow = {
      start: { x: 0, y: 0 },
      end: { x: 12, y: 12 },
    }
    const graphics: GraphicsObject = {
      arrows: [arrow],
    }
    const bounds = getBounds(graphics)
    const arrowBounds = getArrowBoundingBox(arrow)
    expect(bounds.minX).toBeCloseTo(arrowBounds.minX)
    expect(bounds.maxX).toBeCloseTo(arrowBounds.maxX)
    expect(bounds.minY).toBeCloseTo(arrowBounds.minY)
    expect(bounds.maxY).toBeCloseTo(arrowBounds.maxY)
  })

  test("ignores infinite lines when computing bounds", () => {
    const graphicsWithRect: GraphicsObject = {
      rects: [{ center: { x: 0, y: 0 }, width: 10, height: 10 }],
    }
    const graphicsWithRectAndInfiniteLine: GraphicsObject = {
      ...graphicsWithRect,
      infiniteLines: [
        {
          origin: { x: 1000, y: 1000 },
          directionVector: { x: 1, y: 1 },
        },
      ],
    }

    expect(getBounds(graphicsWithRectAndInfiniteLine)).toEqual(
      getBounds(graphicsWithRect),
    )
  })
})
