import { describe, expect, test } from "bun:test"
import {
  applyObjectLimit,
  isObjectLimitReached,
} from "../lib/applyObjectLimit"

describe("applyObjectLimit", () => {
  test("returns arrays unchanged when no limit is set", () => {
    const arrays = [[1, 2, 3], [4, 5], [6]]
    const result = applyObjectLimit(arrays, undefined)
    expect(result).toBe(arrays) // same reference, no copy
  })

  test("returns arrays unchanged when total is within limit", () => {
    const arrays = [[1, 2], [3, 4], [5]]
    const result = applyObjectLimit(arrays, 10)
    expect(result).toBe(arrays)
  })

  test("slices arrays proportionally when limit is exceeded", () => {
    // 100 of each type, limit = 100 total → each type gets ~33
    const a = Array.from({ length: 100 }, (_, i) => i)
    const b = Array.from({ length: 100 }, (_, i) => i + 100)
    const c = Array.from({ length: 100 }, (_, i) => i + 200)

    const [ra, rb, rc] = applyObjectLimit([a, b, c], 100)

    const total = ra.length + rb.length + rc.length
    // Allow for rounding: total should be close to 100
    expect(total).toBeGreaterThan(90)
    expect(total).toBeLessThanOrEqual(110)

    // Each type should have roughly equal share
    expect(ra.length).toBeGreaterThan(20)
    expect(rb.length).toBeGreaterThan(20)
    expect(rc.length).toBeGreaterThan(20)
  })

  test("takes the LAST N elements (most recent objects kept)", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const [result] = applyObjectLimit([items], 4)
    // slice(-4) → last 4
    expect(result).toEqual([7, 8, 9, 10])
  })

  test("allocates at least 1 item per non-empty type", () => {
    // 1 item in each of 5 types, limit = 3 → each should still get 1
    const arrays = [[1], [2], [3], [4], [5]]
    const result = applyObjectLimit(arrays, 3)
    for (const arr of result) {
      expect(arr.length).toBeGreaterThanOrEqual(1)
    }
  })

  test("handles empty arrays without error", () => {
    const arrays = [[], [1, 2, 3], []]
    const result = applyObjectLimit(arrays, 2)
    expect(result[0]).toHaveLength(0)
    expect(result[2]).toHaveLength(0)
    expect(result[1].length).toBeGreaterThan(0)
  })
})

describe("isObjectLimitReached", () => {
  test("returns false when no limit is set", () => {
    expect(isObjectLimitReached([[1, 2, 3]], undefined)).toBe(false)
  })

  test("returns false when total is at or below limit", () => {
    expect(isObjectLimitReached([[1, 2], [3]], 3)).toBe(false)
    expect(isObjectLimitReached([[1, 2], [3]], 10)).toBe(false)
  })

  test("returns true when total exceeds limit", () => {
    expect(isObjectLimitReached([[1, 2, 3], [4, 5]], 4)).toBe(true)
  })

  test("is based on pre-limit count, not post-limit count", () => {
    // 5 items in type A + 5 in type B = 10 total, limit = 8 → reached
    const a = [1, 2, 3, 4, 5]
    const b = [6, 7, 8, 9, 10]
    expect(isObjectLimitReached([a, b], 8)).toBe(true)
  })
})
