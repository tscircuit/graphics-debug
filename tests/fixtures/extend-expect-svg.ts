import { expect, type MatcherResult } from "bun:test"
import * as fs from "node:fs"
import * as path from "node:path"
import { compareSvg, createSvgDiff } from "../../lib/compare-svg"

async function toMatchSvgSnapshot(
  this: unknown,
  receivedMaybePromise: string | Promise<string>,
  testPathOriginal: string,
  svgName?: string,
): Promise<MatcherResult> {
  const received = await receivedMaybePromise
  const testPath = testPathOriginal.replace(/\.test\.tsx?$/, "")
  const snapshotDir = path.join(path.dirname(testPath), "__snapshots__")
  const snapshotName = svgName
    ? `${path.basename(testPath)}-${svgName}.snap.svg`
    : `${path.basename(testPath)}.snap.svg`
  const filePath = path.join(snapshotDir, snapshotName)

  fs.mkdirSync(snapshotDir, { recursive: true })

  const updateSnapshot =
    process.argv.includes("--update-snapshots") ||
    process.argv.includes("-u") ||
    Boolean(process.env.BUN_UPDATE_SNAPSHOTS)

  if (!fs.existsSync(filePath) || updateSnapshot) {
    fs.writeFileSync(filePath, received)
    return {
      message: () => `Snapshot written at ${filePath}`,
      pass: true,
    }
  }

  const existingSnapshot = fs.readFileSync(filePath, "utf8")
  const result = await compareSvg(existingSnapshot, received, {
    strict: false,
    tolerance: 2,
  })

  if (result.equal) {
    return { message: () => "Snapshot matches", pass: true }
  }

  const diffPath = filePath.replace(".snap.svg", ".diff.png")
  const diff = await createSvgDiff({
    referenceSvg: existingSnapshot,
    currentSvg: received,
    highlightColor: "#ff00ff",
  })
  fs.writeFileSync(diffPath, diff)

  return {
    message: () => `Snapshot does not match. Diff saved at ${diffPath}`,
    pass: false,
  }
}

expect.extend({
  toMatchSvgSnapshot: toMatchSvgSnapshot as never,
})

declare module "bun:test" {
  interface Matchers<T = unknown> {
    toMatchSvgSnapshot(
      testPath: string,
      svgName?: string,
    ): Promise<MatcherResult>
  }
}
