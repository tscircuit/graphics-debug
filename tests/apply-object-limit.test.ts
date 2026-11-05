import { expect, test, describe } from "bun:test"
import { applyObjectLimit } from "site/utils/applyObjectLimit"

describe("applyObjectLimit", () => {
  test("returns buckets unchanged when total <= limit", () => {
    const buckets = [[1, 2], [3, 4], [5]]
    const result = applyObjectLimit(buckets, 10)
    expect(result).toBe(buckets)
  })

  test("applies global limit across buckets from the end", () => {
    const buckets = [[1, 2, 3], [4, 5, 6], [7]]
    const result = applyObjectLimit(buckets, 3)
    // limit=3: take 1 from [7], then 2 from [4,5,6] -> [[],[5,6],[7]]
    expect(result[0]).toEqual([])
    expect(result[1]).toEqual([5, 6])
    expect(result[2]).toEqual([7])
    const total = result.reduce((sum, b) => sum + b.length, 0)
    expect(total).toBe(3)
  })

  test("single bucket gets capped to limit", () => {
    const buckets = [[1, 2, 3, 4, 5]]
    const result = applyObjectLimit(buckets, 3)
    expect(result[0]).toEqual([3, 4, 5])
  })

  test("zero limit empties all buckets", () => {
    const buckets = [
      [1, 2],
      [3, 4],
    ]
    const result = applyObjectLimit(buckets, 0)
    expect(result[0]).toEqual([])
    expect(result[1]).toEqual([])
  })

  test("preserves order within buckets", () => {
    const buckets = [
      [10, 20, 30],
      [40, 50],
    ]
    const result = applyObjectLimit(buckets, 3)
    // last 3: take all [40,50] + last 1 from [10,20,30]=[30] -> [[30],[40,50]]
    expect(result[0]).toEqual([30])
    expect(result[1]).toEqual([40, 50])
  })

  test("limit exactly equals total returns original buckets", () => {
    const buckets = [[1, 2], [3]]
    const result = applyObjectLimit(buckets, 3)
    expect(result).toBe(buckets)
  })

  test("first buckets become empty when limit fits only last buckets", () => {
    const buckets = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
    const result = applyObjectLimit(buckets, 2)
    expect(result[0]).toEqual([])
    expect(result[1]).toEqual([])
    expect(result[2]).toEqual([8, 9])
    const total = result.reduce((sum, b) => sum + b.length, 0)
    expect(total).toBe(2)
  })
})
