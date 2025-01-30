import React, { useState } from "react"
import {
  GraphicsDisplayProps,
  TooltipInfo,
} from "../components/GraphicsDisplay"

export function flattenObject(obj: any, prefix = ""): Record<string, any> {
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
