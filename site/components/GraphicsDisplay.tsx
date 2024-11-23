import React, { useState } from "react"
import type { GraphicsObject, Point, Line, Rect, Circle } from "../../lib/types"

interface GraphicsDisplayProps {
  graphics: Array<{
    title: string
    svg: string
    graphicsObject?: GraphicsObject
  }>
}

interface TableObject {
  type: string
  id: string
  properties: Record<string, any>
}

function flattenObject(obj: any, prefix = ""): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const propName = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === "object" && obj[key] !== null) {
      return { ...acc, ...flattenObject(obj[key], propName) }
    }
    return { ...acc, [propName]: obj[key] }
  }, {})
}

function ObjectTable({
  objects,
  onHover,
}: {
  objects: TableObject[]
  onHover: (id: string) => void
}) {
  if (objects.length === 0) return null

  const allProperties = Array.from(
    new Set(objects.flatMap((obj) => Object.keys(obj.properties))),
  ).sort((a, b) => {
    if (a === "label") return -1
    if (b === "label") return 1
    return a.localeCompare(b)
  })

  return (
    <div className="ring-1 ring-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              {allProperties.map((prop) => (
                <th
                  key={prop}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {prop}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {objects.map((obj, idx) => (
              <tr
                key={`${obj.type}-${idx}`}
                className="hover:bg-gray-50 cursor-pointer"
                onMouseEnter={() => onHover(obj.id)}
                onMouseLeave={() => onHover("")}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {obj.type}
                </td>
                {allProperties.map((prop) => (
                  <td
                    key={prop}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {obj.properties[prop] !== undefined
                      ? String(obj.properties[prop])
                      : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function GraphicsDisplay({ graphics }: GraphicsDisplayProps) {
  const [highlightedId, setHighlightedId] = useState("")

  const processGraphicsObjects = (
    graphicsObject?: GraphicsObject,
  ): TableObject[] => {
    if (!graphicsObject) return []

    const objects: TableObject[] = []

    if (graphicsObject.points) {
      graphicsObject.points.forEach((point, idx) => {
        objects.push({
          type: "Point",
          id: `points-${idx}`,
          properties: flattenObject(point),
        })
      })
    }

    if (graphicsObject.lines) {
      graphicsObject.lines.forEach((line, idx) => {
        objects.push({
          type: "Line",
          id: `lines-${idx}`,
          properties: {
            points: `[${line.points.map((p) => `(${p.x},${p.y})`).join(", ")}]`,
            ...(line.points[0].stroke ? { stroke: line.points[0].stroke } : {}),
          },
        })
      })
    }

    if (graphicsObject.rects) {
      graphicsObject.rects.forEach((rect, idx) => {
        objects.push({
          type: "Rectangle",
          id: `rects-${idx}`,
          properties: flattenObject(rect),
        })
      })
    }

    if (graphicsObject.circles) {
      graphicsObject.circles.forEach((circle, idx) => {
        objects.push({
          type: "Circle",
          id: `circles-${idx}`,
          properties: flattenObject(circle),
        })
      })
    }

    return objects
  }

  return (
    <div className="space-y-8">
      {graphics.map(({ title, svg, graphicsObject }, index) => {
        const tableObjects = processGraphicsObjects(graphicsObject)

        return (
          <div key={index} className="space-y-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border rounded bg-white overflow-hidden">
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{
                    __html: svg
                      .replace(/<svg([^>]*)>/, '<svg$1 class="w-full h-full">')
                      .replace(
                        /<(circle|rect|polyline|g)(\s[^>]*)?>/g,
                        (match, tag, attrs = "") => {
                          const types = {
                            circle: "circles",
                            rect: "rects",
                            polyline: "lines",
                            g: "points",
                          }
                          const type = types[tag as keyof typeof types]
                          if (!type) return match

                          const dataId = `${type}-${highlightedId.split("-")[1] || ""}`
                          const highlightClass =
                            dataId === highlightedId ? " highlight" : ""
                          return `<${tag}${attrs} data-id="${dataId}" class="${highlightClass}">`
                        },
                      ),
                  }}
                />
              </div>
              <div className="overflow-auto max-h-[640px] border rounded-lg">
                <ObjectTable
                  objects={tableObjects}
                  onHover={setHighlightedId}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
