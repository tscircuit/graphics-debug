import { describe, expect, test } from "bun:test"
import { compareSvg, createSvgDiff } from "../lib/compare-svg"

const referenceSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
    <rect width="16" height="16" fill="#000" />
  </svg>
`

describe("compareSvg", () => {
  test("compares rendered pixels instead of SVG markup", async () => {
    const equivalentSvg =
      '<svg height="16" width="16" xmlns="http://www.w3.org/2000/svg"><rect fill="#000000" height="16" width="16"/></svg>'

    const result = await compareSvg(referenceSvg, equivalentSvg)

    expect(result.equal).toBe(true)
  })

  test("creates a PNG diff for visually different SVGs", async () => {
    const differentSvg = referenceSvg.replace("#000", "#fff")

    const result = await compareSvg(referenceSvg, differentSvg)
    const diff = await createSvgDiff({
      referenceSvg,
      currentSvg: differentSvg,
    })

    expect(result.equal).toBe(false)
    expect(Array.from(diff.slice(1, 4))).toEqual([80, 78, 71])
  })
})
