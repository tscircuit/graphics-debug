export {
  stackGraphicsHorizontally,
  stackGraphicsVertically,
  createGraphicsGrid,
}
import type { GraphicsObject } from "./types"
import { getBounds } from "./drawGraphicsToCanvas"
import { translateGraphics } from "./translateGraphics"
import { mergeGraphics } from "./mergeGraphics"

function stackGraphicsHorizontally(
  graphicsList: GraphicsObject[],
): GraphicsObject {
  if (graphicsList.length === 0) return {}
  let result = graphicsList[0]
  let prevBounds = getBounds(result)
  const baseMinY = prevBounds.minY
  for (let i = 1; i < graphicsList.length; i++) {
    const g = graphicsList[i]
    const bounds = getBounds(g)
    const prevWidth = prevBounds.maxX - prevBounds.minX
    const width = bounds.maxX - bounds.minX
    const padding = (prevWidth + width) / 8
    const dx = prevBounds.minX - padding - bounds.maxX
    const dy = baseMinY - bounds.minY
    const shifted = translateGraphics(g, dx, dy)
    result = mergeGraphics(result, shifted)
    prevBounds = getBounds(shifted)
  }
  return result
}

function stackGraphicsVertically(
  graphicsList: GraphicsObject[],
): GraphicsObject {
  if (graphicsList.length === 0) return {}
  let result = graphicsList[0]
  let prevBounds = getBounds(result)
  const baseMinX = prevBounds.minX
  for (let i = 1; i < graphicsList.length; i++) {
    const g = graphicsList[i]
    const bounds = getBounds(g)
    const prevHeight = prevBounds.maxY - prevBounds.minY
    const height = bounds.maxY - bounds.minY
    const padding = (prevHeight + height) / 8
    const dx = baseMinX - bounds.minX
    const dy = prevBounds.minY - padding - bounds.maxY
    const shifted = translateGraphics(g, dx, dy)
    result = mergeGraphics(result, shifted)
    prevBounds = getBounds(shifted)
  }
  return result
}

function createGraphicsGrid(
  graphicsRows: GraphicsObject[][],
  opts: { cellWidth?: number; cellHeight?: number } = {},
): GraphicsObject {
  if (graphicsRows.length === 0 || graphicsRows[0].length === 0) return {}

  let maxWidth = 0
  let maxHeight = 0
  for (const row of graphicsRows) {
    for (const g of row) {
      const b = getBounds(g)
      maxWidth = Math.max(maxWidth, b.maxX - b.minX)
      maxHeight = Math.max(maxHeight, b.maxY - b.minY)
    }
  }

  const cellWidth = opts.cellWidth ?? maxWidth
  const cellHeight = opts.cellHeight ?? maxHeight

  let result: GraphicsObject | null = null

  for (let r = 0; r < graphicsRows.length; r++) {
    const row = graphicsRows[r]
    for (let c = 0; c < row.length; c++) {
      const g = row[c]
      const b = getBounds(g)
      const dx = c * cellWidth - b.minX
      const dy = r * cellHeight - b.minY
      const shifted = translateGraphics(g, dx, dy)
      result = result ? mergeGraphics(result, shifted) : shifted
    }
  }

  return result ?? {}
}
