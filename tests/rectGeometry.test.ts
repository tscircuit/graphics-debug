import { describe, expect, test } from "bun:test"
import type { Matrix } from "transformation-matrix"
import { getProjectedRectGeometry } from "../lib/rectGeometry"
import type { Rect } from "../lib/types"

const screenMatrix = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0,
} as Matrix

const cartesianMatrix = {
  a: 1,
  b: 0,
  c: 0,
  d: -1,
  e: 0,
  f: 0,
} as Matrix

describe("rectGeometry", () => {
  test("renders positive ccwRotationDegrees as visually counterclockwise on screen transforms", () => {
    const rect: Rect = {
      center: { x: 0, y: 0 },
      width: 10,
      height: 4,
      ccwRotationDegrees: 30,
    }

    const projected = getProjectedRectGeometry(rect, screenMatrix)
    expect(projected.angleDegrees).toBeCloseTo(-30)
    expect(projected.corners[1]!.y).toBeLessThan(projected.corners[0]!.y)
  })

  test("keeps positive ccwRotationDegrees visually counterclockwise with cartesian y-flip transforms", () => {
    const rect: Rect = {
      center: { x: 0, y: 0 },
      width: 10,
      height: 4,
      ccwRotationDegrees: 30,
    }

    const projected = getProjectedRectGeometry(rect, cartesianMatrix)
    expect(projected.angleDegrees).toBeCloseTo(-30)
    expect(projected.corners[1]!.y).toBeLessThan(projected.corners[0]!.y)
  })
})
