import { expect, test } from "bun:test"
import { applyObjectLimitToBuckets } from "site/components/InteractiveGraphics/applyObjectLimitToBuckets"

test("applies one global object limit across buckets", () => {
  const result = applyObjectLimitToBuckets(
    {
      lines: ["line-1", "line-2", "line-3"],
      rects: ["rect-1", "rect-2"],
      points: ["point-1"],
    },
    4,
  )

  expect(result.totalFilteredObjects).toBe(6)
  expect(result.isLimitReached).toBe(true)
  expect(result.buckets.lines).toEqual(["line-1", "line-2", "line-3"])
  expect(result.buckets.rects).toEqual(["rect-1"])
  expect(result.buckets.points).toEqual([])
})

test("reports pre-limit filtered count without limiting when under the cap", () => {
  const result = applyObjectLimitToBuckets(
    {
      lines: ["line-1"],
      rects: ["rect-1"],
      points: [],
    },
    3,
  )

  expect(result.totalFilteredObjects).toBe(2)
  expect(result.isLimitReached).toBe(false)
  expect(result.buckets.lines).toEqual(["line-1"])
  expect(result.buckets.rects).toEqual(["rect-1"])
})
