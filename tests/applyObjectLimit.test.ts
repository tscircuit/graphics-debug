import { describe, expect, test } from "bun:test"
import { applyObjectLimit } from "site/utils/applyObjectLimit"

const order = [
  "arrows",
  "infiniteLines",
  "lines",
  "rects",
  "polygons",
  "circles",
  "texts",
  "points",
] as const

const emptyBuckets = () => ({
  arrows: [] as number[],
  infiniteLines: [] as number[],
  lines: [] as number[],
  rects: [] as number[],
  polygons: [] as number[],
  circles: [] as number[],
  texts: [] as number[],
  points: [] as number[],
})

describe("applyObjectLimit", () => {
  test("returns buckets unchanged when limit is undefined", () => {
    const buckets = { ...emptyBuckets(), lines: [1, 2, 3], points: [4, 5] }
    const result = applyObjectLimit(buckets, order, undefined)
    expect(result).toBe(buckets)
  })

  test("returns buckets unchanged when limit is zero", () => {
    const buckets = { ...emptyBuckets(), lines: [1, 2, 3] }
    const result = applyObjectLimit(buckets, order, 0)
    expect(result).toBe(buckets)
  })

  test("returns buckets unchanged when total does not exceed limit", () => {
    const buckets = { ...emptyBuckets(), lines: [1, 2], points: [3] }
    const result = applyObjectLimit(buckets, order, 5)
    expect(result).toBe(buckets)
  })

  test("caps total objects at limit when only one bucket exceeds it", () => {
    const buckets = { ...emptyBuckets(), points: [1, 2, 3, 4, 5] }
    const result = applyObjectLimit(buckets, order, 3)
    expect(result.points).toEqual([3, 4, 5])
  })

  test("fills budget from the last bucket backwards across types", () => {
    const buckets = {
      ...emptyBuckets(),
      arrows: [10, 11, 12],
      lines: [20, 21],
      points: [30],
    }
    const result = applyObjectLimit(buckets, order, 4)
    expect(result.points).toEqual([30])
    expect(result.lines).toEqual([20, 21])
    expect(result.arrows).toEqual([12])
    expect(result.infiniteLines).toEqual([])
    expect(result.rects).toEqual([])
    expect(result.polygons).toEqual([])
    expect(result.circles).toEqual([])
    expect(result.texts).toEqual([])
  })

  test("earlier buckets are dropped entirely when later buckets exhaust budget", () => {
    const buckets = {
      ...emptyBuckets(),
      arrows: [1, 2],
      lines: [3, 4],
      points: [5, 6, 7],
    }
    const result = applyObjectLimit(buckets, order, 3)
    expect(result.points).toEqual([5, 6, 7])
    expect(result.lines).toEqual([])
    expect(result.arrows).toEqual([])
  })

  test("does not mutate the input buckets", () => {
    const buckets = {
      ...emptyBuckets(),
      arrows: [1, 2, 3],
      points: [4, 5],
    }
    const snapshot = {
      ...buckets,
      arrows: [...buckets.arrows],
      points: [...buckets.points],
    }
    applyObjectLimit(buckets, order, 2)
    expect(buckets.arrows).toEqual(snapshot.arrows)
    expect(buckets.points).toEqual(snapshot.points)
  })

  test("limit equal to total returns all objects", () => {
    const buckets = { ...emptyBuckets(), lines: [1, 2], points: [3, 4] }
    const result = applyObjectLimit(buckets, order, 4)
    expect(result.lines).toEqual([1, 2])
    expect(result.points).toEqual([3, 4])
  })

  test("preserves order within each kept bucket", () => {
    const buckets = {
      ...emptyBuckets(),
      lines: [100, 200, 300, 400],
    }
    const result = applyObjectLimit(buckets, order, 2)
    expect(result.lines).toEqual([300, 400])
  })
})
