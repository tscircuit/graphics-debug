import { expect, test } from "bun:test"
import { applyObjectLimit } from "site/components/InteractiveGraphics/apply-object-limit"

test("object limit caps the total filtered objects across buckets", () => {
  const result = applyObjectLimit(
    {
      lines: [{ originalIndex: 0 }, { originalIndex: 1 }],
      rects: [{ originalIndex: 0 }, { originalIndex: 1 }],
      points: [{ originalIndex: 0 }, { originalIndex: 1 }],
    },
    3,
  )

  expect(result.totalFilteredObjects).toBe(6)
  expect(result.isLimitReached).toBe(true)
  expect(result.buckets.lines).toEqual([])
  expect(result.buckets.rects).toEqual([{ originalIndex: 1 }])
  expect(result.buckets.points).toEqual([
    { originalIndex: 0 },
    { originalIndex: 1 },
  ])
})

test("object limit leaves buckets unchanged when the total is below the cap", () => {
  const buckets = {
    lines: [{ originalIndex: 0 }],
    rects: [{ originalIndex: 0 }],
  }

  const result = applyObjectLimit(buckets, 3)

  expect(result.totalFilteredObjects).toBe(2)
  expect(result.isLimitReached).toBe(false)
  expect(result.buckets).toBe(buckets)
})

test("object limit can intentionally hide every object", () => {
  const result = applyObjectLimit(
    {
      lines: [{ originalIndex: 0 }],
      rects: [{ originalIndex: 0 }],
    },
    0,
  )

  expect(result.totalFilteredObjects).toBe(2)
  expect(result.isLimitReached).toBe(true)
  expect(result.buckets.lines).toEqual([])
  expect(result.buckets.rects).toEqual([])
})
