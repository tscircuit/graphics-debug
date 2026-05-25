import type { GraphicsObject } from "../../lib"
import type { TableObject } from "../components/GraphicObjectsTable"
import { flattenObject } from "./flattenObject"

export const getTableItemsFromGraphicsObjects = (
  graphicsObject?: GraphicsObject,
): TableObject[] => {
  if (!graphicsObject) return []

  const objects: TableObject[] = []

  if (graphicsObject.points) {
    graphicsObject.points.forEach((point, idx) => {
      objects.push({
        type: "point",
        id: `point-${idx}`,
        properties: {
          ...flattenObject(point),
          x: undefined,
          y: undefined,
          "center.x": point.x,
          "center.y": point.y,
        },
      })
    })
  }

  if (graphicsObject.lines) {
    graphicsObject.lines.forEach((line, idx) => {
      objects.push({
        type: "line",
        id: `line-${idx}`,
        properties: {
          points: `[${line.points.map((p) => `(${p.x},${p.y})`).join(", ")}]`,
          strokeColor: line.strokeColor || "black",
          strokeWidth: line.strokeWidth || 1,
        },
      })
    })
  }

  if (graphicsObject.infiniteLines) {
    graphicsObject.infiniteLines.forEach((line, idx) => {
      objects.push({
        type: "infinite-line",
        id: `infinite-line-${idx}`,
        properties: flattenObject(line),
      })
    })
  }

  if (graphicsObject.rects) {
    graphicsObject.rects.forEach((rect, idx) => {
      objects.push({
        type: "rect",
        id: `rect-${idx}`,
        properties: flattenObject(rect),
      })
    })
  }

  if (graphicsObject.polygons) {
    graphicsObject.polygons.forEach((polygon, idx) => {
      objects.push({
        type: "polygon",
        id: `polygon-${idx}`,
        properties: {
          ...flattenObject(polygon),
          points: `[${polygon.points.map((p) => `(${p.x},${p.y})`).join(", ")}]`,
        },
      })
    })
  }

  if (graphicsObject.circles) {
    graphicsObject.circles.forEach((circle, idx) => {
      objects.push({
        type: "circle",
        id: `circle-${idx}`,
        properties: flattenObject(circle),
      })
    })
  }

  if (graphicsObject.texts) {
    graphicsObject.texts.forEach((text, idx) => {
      objects.push({
        type: "text",
        id: `text-${idx}`,
        properties: flattenObject(text),
      })
    })
  }

  return objects
}
