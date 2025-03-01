import { expect, test, beforeAll, afterAll } from "bun:test"
import * as fs from "node:fs"
import * as path from "node:path"
import "../lib/matcher"
import type { GraphicsObject } from "../lib/types"

const testGraphicsObject: GraphicsObject = {
  title: "Test Graphics Object",
  points: [
    { x: 10, y: 10, label: "Point A", color: "red" },
    { x: 50, y: 50, label: "Point B", color: "blue" },
  ],
  lines: [
    {
      points: [
        { x: 10, y: 10 },
        { x: 50, y: 50 },
      ],
      strokeColor: "green",
      strokeWidth: 2,
    },
  ],
  circles: [
    {
      center: { x: 30, y: 30 },
      radius: 15,
      fill: "rgba(255, 0, 0, 0.2)",
      stroke: "red",
    },
  ],
  coordinateSystem: "cartesian",
}

const snapshotDir = path.join(__dirname, "__snapshots__")
const snapshotPath = path.join(snapshotDir, "toMatchGraphicsSvg.snap.svg")

beforeAll(() => {
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true })
  }
})

afterAll(() => {
  if (fs.existsSync(snapshotPath)) {
    fs.unlinkSync(snapshotPath)
  }
  // Only remove directory if it's empty
  const files = fs.readdirSync(snapshotDir)
  if (files.length === 0) {
    fs.rmdirSync(snapshotDir)
  }
})

test("toMatchGraphicsSvg creates and matches snapshot", async () => {
  // First run: create snapshot
  await expect(testGraphicsObject).toMatchGraphicsSvg(import.meta.path)

  // Verify snapshot was created
  expect(fs.existsSync(snapshotPath)).toBe(true)

  // Second run: match existing snapshot
  await expect(testGraphicsObject).toMatchGraphicsSvg(import.meta.path)
})

test("toMatchGraphicsSvg with custom name", async () => {
  const customNamePath = path.join(snapshotDir, "custom-name.snap.svg")

  // Add cleanup for this specific test
  afterAll(() => {
    if (fs.existsSync(customNamePath)) {
      fs.unlinkSync(customNamePath)
    }
  })

  // Create and match with custom name
  await expect(testGraphicsObject).toMatchGraphicsSvg(
    import.meta.path,
    "custom-name",
  )
  expect(fs.existsSync(customNamePath)).toBe(true)
})
