import React, { useState } from "react"
import type { GraphicsObject } from "../../lib"
import { flattenObject } from "../utils/flattenObject"
import { getTableItemsFromGraphicsObjects } from "../utils/getTableItemsFromGraphicsObjects"

export interface TableObject {
  type: string
  id: string
  properties: Record<string, any>
}

export function GraphicObjectsTable({
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
