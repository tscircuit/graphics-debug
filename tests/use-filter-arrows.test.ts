import { expect, test } from "bun:test"
import type { Arrow } from "lib/types"
import { isArrowVisible } from "site/components/InteractiveGraphics/hooks/useFilterArrows"

const visibleArrow: Arrow = {
  start: { x: 0, y: 0 },
  end: { x: 10, y: 0 },
  layer: "top",
  step: 2,
}

test("isArrowVisible excludes arrows rejected by layer and step filters", () => {
  const isVisible = isArrowVisible(visibleArrow, {
    isPointOnScreen: () => true,
    doesLineIntersectViewport: () => true,
    filterLayerAndStep: () => false,
  })

  expect(isVisible).toBe(false)
})

test("isArrowVisible keeps arrows that pass layer and step filters", () => {
  const isVisible = isArrowVisible(visibleArrow, {
    isPointOnScreen: () => true,
    doesLineIntersectViewport: () => false,
    filterLayerAndStep: () => true,
  })

  expect(isVisible).toBe(true)
})
