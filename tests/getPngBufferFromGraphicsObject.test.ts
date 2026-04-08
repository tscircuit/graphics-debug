import { describe, expect, test } from "bun:test"
import { getPngBufferFromGraphicsObject } from "../lib/getPngBufferFromGraphicsObject"
import type { GraphicsObject } from "../lib/types"
import { expectPngToMatchSnapshot } from "./pngSnapshotHelpers"

const PNG_SIGNATURE = "89504e470d0a1a0a"
const TEST_SIZE = { pngWidth: 256, pngHeight: 256 }
const getHexSignature = (bytes: Uint8Array) =>
  Array.from(bytes.slice(0, 8))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

describe("getPngBufferFromGraphicsObject", () => {
  test("returns a valid png byte array", async () => {
    const png = await getPngBufferFromGraphicsObject(
      {
        rects: [
          {
            center: { x: 0, y: 0 },
            width: 10,
            height: 10,
            fill: "red",
            stroke: "black",
          },
        ],
      },
      TEST_SIZE,
    )

    expect(png).toBeInstanceOf(Uint8Array)
    expect(getHexSignature(png)).toBe(PNG_SIGNATURE)
    expect(png.byteLength).toBeGreaterThan(100)
  })

  test("renders points and labels to a png snapshot", async () => {
    const graphics: GraphicsObject = {
      points: [
        { x: -2, y: -1, color: "red", label: "A" },
        { x: 2, y: 1, color: "blue", label: "B" },
      ],
    }

    const png = await getPngBufferFromGraphicsObject(graphics, {
      ...TEST_SIZE,
      includeTextLabels: ["points"],
    })

    await expectPngToMatchSnapshot(
      png,
      import.meta.path,
      "getPngBufferFromGraphicsObject-points",
    )
  })

  test("renders lines and infinite lines to a png snapshot", async () => {
    const graphics: GraphicsObject = {
      lines: [
        {
          points: [
            { x: -6, y: -4 },
            { x: 0, y: 3 },
            { x: 6, y: -2 },
          ],
          strokeColor: "#1d4ed8",
          strokeWidth: 0.2,
          label: "polyline",
        },
        {
          points: [
            { x: -6, y: 4 },
            { x: 6, y: 4 },
          ],
          strokeColor: "#047857",
          strokeWidth: 0.12,
          strokeDash: [0.25, 0.2],
        },
      ],
      infiniteLines: [
        {
          origin: { x: 0, y: 0 },
          directionVector: { x: 1, y: 0.3 },
          strokeColor: "#7c3aed",
          strokeWidth: 0.08,
          strokeDash: "5,3",
          label: "guide",
        },
      ],
    }

    const png = await getPngBufferFromGraphicsObject(graphics, {
      ...TEST_SIZE,
      includeTextLabels: ["lines", "infiniteLines"],
    })

    await expectPngToMatchSnapshot(
      png,
      import.meta.path,
      "getPngBufferFromGraphicsObject-lines",
    )
  })

  test("renders filled shapes to a png snapshot", async () => {
    const graphics: GraphicsObject = {
      rects: [
        {
          center: { x: -2.5, y: -0.5 },
          width: 3.5,
          height: 5,
          fill: "#fef08a",
          stroke: "#854d0e",
          label: "R1",
        },
      ],
      circles: [
        {
          center: { x: 3, y: 1.5 },
          radius: 2.1,
          fill: "rgba(59, 130, 246, 0.35)",
          stroke: "#1d4ed8",
        },
      ],
      polygons: [
        {
          points: [
            { x: -0.5, y: 5.5 },
            { x: 1.5, y: 2.2 },
            { x: 3.2, y: 5.3 },
          ],
          fill: "#fca5a5",
          stroke: "#991b1b",
          strokeWidth: 0.08,
          label: "Tri",
        },
      ],
    }

    const png = await getPngBufferFromGraphicsObject(graphics, {
      ...TEST_SIZE,
      includeTextLabels: ["rects", "polygons"],
    })

    await expectPngToMatchSnapshot(
      png,
      import.meta.path,
      "getPngBufferFromGraphicsObject-shapes",
    )
  })

  test("renders arrows and inline labels to a png snapshot", async () => {
    const graphics: GraphicsObject = {
      arrows: [
        {
          start: { x: -6, y: -2 },
          end: { x: 6, y: 3 },
          color: "#dc2626",
          label: "flow",
          inlineLabel: "A1",
        },
        {
          start: { x: -5, y: 5.5 },
          end: { x: 5, y: 5.5 },
          color: "#2563eb",
          doubleSided: true,
        },
      ],
    }

    const png = await getPngBufferFromGraphicsObject(graphics, {
      ...TEST_SIZE,
      includeTextLabels: ["arrows"],
    })

    await expectPngToMatchSnapshot(
      png,
      import.meta.path,
      "getPngBufferFromGraphicsObject-arrows",
    )
  })

  test("renders text anchors and cartesian coordinates to a png snapshot", async () => {
    const graphics: GraphicsObject = {
      coordinateSystem: "cartesian",
      rects: [
        {
          center: { x: 0, y: 3.5 },
          width: 4,
          height: 2,
          fill: "#bfdbfe",
          stroke: "#1d4ed8",
        },
        {
          center: { x: 0, y: -3.5 },
          width: 4,
          height: 2,
          fill: "#fde68a",
          stroke: "#b45309",
        },
      ],
      texts: [
        {
          x: 0,
          y: 0,
          text: "center",
          color: "#111827",
          fontSize: 0.18,
        },
        {
          x: -5,
          y: 6,
          text: "top-left",
          color: "#111827",
          fontSize: 0.14,
          anchorSide: "top_left",
        },
        {
          x: 5,
          y: -6,
          text: "bottom-right",
          color: "#111827",
          fontSize: 0.14,
          anchorSide: "bottom_right",
        },
      ],
    }

    const png = await getPngBufferFromGraphicsObject(graphics, TEST_SIZE)

    await expectPngToMatchSnapshot(
      png,
      import.meta.path,
      "getPngBufferFromGraphicsObject-texts-cartesian",
    )
  })
})
