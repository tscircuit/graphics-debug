import { expect, type MatcherResult } from "bun:test"
import * as fs from "node:fs"
import * as path from "node:path"
import { compareSvg, createSvgDiff } from "./compare-svg"
import { GraphicsObject } from "./types"
import { getSvgFromGraphicsObject } from "./getSvgFromGraphicsObject"

/**
 * Custom matcher for Bun tests to compare GraphicsObjects as SVGs
 *
 * @param this Matcher context
 * @param receivedMaybePromise GraphicsObject or Promise<GraphicsObject> to test
 * @param testPathOriginal Path to the test file
 * @param svgName Optional name for the snapshot
 * @returns Matcher result
 */
async function toMatchGraphicsSvg(
  // biome-ignore lint/suspicious/noExplicitAny: bun doesn't expose matcher type
  this: any,
  receivedMaybePromise: GraphicsObject | Promise<GraphicsObject>,
  testPathOriginal: string,
  opts: { backgroundColor?: string; svgName?: string } = {},
): Promise<MatcherResult> {
  const received = await receivedMaybePromise
  const testPath = testPathOriginal.replace(/\.test\.tsx?$/, "")
  const snapshotDir = path.join(path.dirname(testPath), "__snapshots__")
  const snapshotName = opts.svgName
    ? `${opts.svgName}.snap.svg`
    : `${path.basename(testPath)}.snap.svg`
  const filePath = path.join(snapshotDir, snapshotName)

  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true })
  }

  // Convert GraphicsObject to SVG
  const receivedSvg = getSvgFromGraphicsObject(received, {
    backgroundColor: opts.backgroundColor,
  })

  const updateSnapshot =
    process.argv.includes("--update-snapshots") ||
    process.argv.includes("-u") ||
    Boolean(process.env["BUN_UPDATE_SNAPSHOTS"])

  if (!fs.existsSync(filePath) || updateSnapshot) {
    console.log("Writing snapshot to", filePath)
    fs.writeFileSync(filePath, receivedSvg)
    return {
      message: () => `Snapshot created at ${filePath}`,
      pass: true,
    }
  }

  const existingSnapshot = fs.readFileSync(filePath, "utf-8")

  const result = await compareSvg(existingSnapshot, receivedSvg, {
    strict: false,
    tolerance: 2,
  })

  if (result.equal) {
    return {
      message: () => "Snapshot matches",
      pass: true,
    }
  }

  const diffPath = filePath.replace(".snap.svg", ".diff.png")
  const diff = await createSvgDiff({
    referenceSvg: existingSnapshot,
    currentSvg: receivedSvg,
    highlightColor: "#ff00ff",
  })
  fs.writeFileSync(diffPath, diff)

  return {
    message: () => `Snapshot does not match. Diff saved at ${diffPath}`,
    pass: false,
  }
}

// Add the custom matcher to the expect object
expect.extend({
  // biome-ignore lint/suspicious/noExplicitAny: bun's types don't expose matcher type
  toMatchGraphicsSvg: toMatchGraphicsSvg as any,
})

// Extend the TypeScript interface for the matcher
declare module "bun:test" {
  interface Matchers<T = unknown> {
    toMatchGraphicsSvg(
      testPath: string,
      opts?: { backgroundColor?: string; svgName?: string },
    ): Promise<MatcherResult>
  }
}
