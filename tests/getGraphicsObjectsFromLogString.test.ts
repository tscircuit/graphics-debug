import { describe, expect, test } from "bun:test"
import { getGraphicsObjectsFromLogString } from "../lib/getGraphicsObjectsFromLogString"
import type { GraphicsObject } from "../lib/types"

describe("getGraphicsObjectsFromLogString", () => {
  test("should parse well-formatted JSON graphics objects", () => {
    const logString = `
      some log content
      {"graphics": {"points": [{"x": 0, "y": 0, "label": "A"}], "title": "test"}}
      more content
    `
    const expected: GraphicsObject[] = [{
      graphics: {
        points: [{ x: 0, y: 0, label: "A" }],
        title: "test"
      }
    }]
    
    expect(getGraphicsObjectsFromLogString(logString)).toEqual(expected)
  })

  test("should parse relaxed JSON syntax with unquoted keys", () => {
    const logString = `
      debug log
      {graphics: {points: [{x: 1, y: 2}], title: "relaxed"}}
      other content
    `
    const expected: GraphicsObject[] = [{
      graphics: {
        points: [{ x: 1, y: 2 }],
        title: "relaxed"
      }
    }]
    
    expect(getGraphicsObjectsFromLogString(logString)).toEqual(expected)
  })

  test("should handle multiple graphics objects", () => {
    const logString = `
      {graphics: {points: [{x: 0, y: 0}]}}
      some content
      {graphics: {circles: [{center: {x: 1, y: 1}, radius: 5}]}}
    `
    const expected: GraphicsObject[] = [
      { graphics: { points: [{ x: 0, y: 0 }] }},
      { graphics: { circles: [{ center: { x: 1, y: 1 }, radius: 5 }] }}
    ]
    
    expect(getGraphicsObjectsFromLogString(logString)).toEqual(expected)
  })

  test("should return empty array for invalid input", () => {
    const logString = "no graphics objects here"
    expect(getGraphicsObjectsFromLogString(logString)).toEqual([])
  })

  test("should handle text before the graphics object", () => {
    const logString = `Debug [2024-01-01 12:00:00] Some logging text here
      and more text {graphics: {points: [{x: 1, y: 2}], title: "test"}}`
    const expected: GraphicsObject[] = [{
      graphics: {
        points: [{ x: 1, y: 2 }],
        title: "test"
      }
    }]
    
    expect(getGraphicsObjectsFromLogString(logString)).toEqual(expected)
  })
})
