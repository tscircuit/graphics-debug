import React, { useState } from "react"
import type { GraphicsObject, Point, Line, Rect, Circle } from "../../lib/types"
import { GraphicObjectsTable } from "./GraphicObjectsTable"
import { getTableItemsFromGraphicsObjects } from "../utils/getTableItemsFromGraphicsObjects"
import { DimensionOverlay } from "./DimensionOverlay"

export interface GraphicsDisplayProps {
  graphics: Array<{
    title: string
    svg: string
    graphicsObject?: GraphicsObject
  }>
}

export interface TooltipInfo {
  x: number
  y: number
  items: Array<{
    type: string
    label?: string
    position: string
  }>
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

  return (
    <div className="space-y-8">
      {graphics.map(({ title, svg, graphicsObject }, index) => {
        const tableObjects = getTableItemsFromGraphicsObjects(graphicsObject)

        return (
          <div key={index} className="space-y-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div
                className="border rounded bg-white overflow-hidden relative"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <DimensionOverlay focusOnHover={true}>
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{
                      __html: svg
                        .replace(
                          /<svg([^>]*)>/,
                          '<svg$1 class="w-full h-full">',
                        )
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
                </DimensionOverlay>
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
                <GraphicObjectsTable
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
