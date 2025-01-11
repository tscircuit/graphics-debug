import React, { useState } from "react"
import type { GraphicsObject, Point, Line, Rect, Circle } from "../../lib/types"

interface GraphicsDisplayProps {
  graphics: Array<{
    title: string
    svg: string
    graphicsObject?: GraphicsObject
  }>
}

interface TooltipInfo {
  x: number
  y: number
  items: Array<{
    type: string
    label?: string
    position: string
  }>
}

interface TableObject {
  type: string
  id: string
  properties: Record<string, any>
}

function flattenObject(obj: any, prefix = ""): Record<string, any> {
  const result: Record<string, any> = {}

  for (const key of Object.keys(obj)) {
    const propName = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(result, flattenObject(obj[key], propName))
    } else {
      result[propName] = obj[key]
    }
  }

  return result
}

function ObjectTable({
  objects,
  onHover,
  svgIndex,
}: {
  objects: TableObject[]
  onHover: (id: string) => void
  svgIndex: number
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
                onMouseEnter={() => {
                  return onHover(`${obj.type}-${svgIndex}-${idx}`)
                }}
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
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const svg = e.currentTarget.querySelector("svg")
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Get all elements under the cursor
    const elements = document
      .elementsFromPoint(e.clientX, e.clientY)
      .filter((el) => el instanceof SVGElement && el.hasAttribute("data-type"))
      .map((el) => el as SVGElement)

    if (elements.length > 0) {
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        items: elements.map((el) => {
          const type = el.getAttribute("data-type") || ""
          const label = el.getAttribute("data-label") || ""

          // Handle multi-point objects (like lines)
          const points = el.getAttribute("data-points")
          let position: string
          if (points) {
            position = points
              .split(" ")
              .map((p) => `(${p})`)
              .join(",")
            position = `[${position}]`
          } else {
            // Single point objects
            position = `(${el.getAttribute("data-x")}, ${el.getAttribute("data-y")})`
          }

          return { type, label, position }
        }),
      })
    } else {
      setTooltip(null)
    }
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  const processGraphicsObjects = (
    graphicsObject?: GraphicsObject,
  ): TableObject[] => {
    if (!graphicsObject) return []

    const objects: TableObject[] = []

    if (graphicsObject.points) {
      graphicsObject.points.forEach((point, idx) => {
        objects.push({
          type: "point",
          id: `point-${idx}`,
          properties: flattenObject(point),
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

    if (graphicsObject.rects) {
      graphicsObject.rects.forEach((rect, idx) => {
        objects.push({
          type: "rect",
          id: `rect-${idx}`,
          properties: flattenObject(rect),
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
              <div
                className="border rounded bg-white overflow-hidden relative"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{
                    __html: svg
                      .replace(/<svg([^>]*)>/, '<svg$1 class="w-full h-full">')
                      .replace(
                        /<(circle|rect|polyline|g)(\s[^>]*)?>/g,
                        (match, tag, attrs = "") => {
                          const types = {
                            circle: "circle",
                            rect: "rect",
                            polyline: "line",
                            g: "point",
                          }
                          const type = types[tag as keyof typeof types]
                          if (!type) return match
                          const [typeId, svgIndex, objIndex] =
                            highlightedId.split("-")
                          const dataId = `${type}-${index}-${objIndex || ""}`
                          const highlightClass =
                            dataId === highlightedId ? " highlight" : ""
                          return `<${tag}${attrs} data-id="${dataId}" class="${highlightClass}">`
                        },
                      ),
                  }}
                />
                {tooltip && (
                  <div
                    className="absolute bg-black bg-opacity-75 text-white p-2 rounded pointer-events-none"
                    style={{
                      position: "fixed",
                      left: `${tooltip.x}px`,
                      top: `${tooltip.y}px`,
                      zIndex: 50,
                    }}
                  >
                    {tooltip.items.map((item, i) => (
                      <div key={i}>
                        {item.type} {item.label && `(${item.label})`}:{" "}
                        {item.position}
                        {i < tooltip.items.length - 1 && (
                          <hr className="my-1 border-gray-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="overflow-auto max-h-[640px] border rounded-lg">
                <ObjectTable
                  objects={tableObjects}
                  onHover={setHighlightedId}
                  svgIndex={index}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
