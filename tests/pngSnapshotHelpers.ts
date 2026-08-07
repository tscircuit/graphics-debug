import { expect } from "bun:test"
import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import * as path from "node:path"
import looksSame from "@tscircuit/image-utils/looks-same"

const shouldUpdateSnapshots = () => {
  return (
    process.argv.includes("--update-snapshots") ||
    process.argv.includes("-u") ||
    Boolean(process.env["BUN_UPDATE_SNAPSHOTS"])
  )
}

export async function expectPngToMatchSnapshot(
  received: Uint8Array,
  testPathOriginal: string,
  snapshotName: string,
) {
  const testPath = testPathOriginal.replace(/\.test\.tsx?$/, "")
  const snapshotDir = path.join(path.dirname(testPath), "__snapshots__")
  const snapshotPath = path.join(snapshotDir, `${snapshotName}.snap.png`)

  await mkdir(snapshotDir, { recursive: true })

  if (!existsSync(snapshotPath) || shouldUpdateSnapshots()) {
    await writeFile(snapshotPath, received)
    return
  }

  const reference = await readFile(snapshotPath)
  const result = await looksSame(reference, Buffer.from(received), {
    tolerance: 2.3,
  })

  if (result.equal) {
    return
  }

  const diffPath = snapshotPath.replace(".snap.png", ".diff.png")
  const diff = await looksSame.createDiff({
    reference,
    current: Buffer.from(received),
    highlightColor: "#ff00ff",
    tolerance: 2.3,
  })
  await writeFile(diffPath, diff)

  throw new Error(`PNG snapshot does not match. Diff saved at ${diffPath}`)
}
