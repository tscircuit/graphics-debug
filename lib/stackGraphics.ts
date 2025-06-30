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
  opts: { titles?: string[] } = {},
): GraphicsObject {
  if (graphicsList.length === 0) return {}
  let giantG = graphicsList[0]
  let prevBounds = getBounds(giantG)
  const baseMinY = prevBounds.minY
  const boundsList = [prevBounds]
  for (let i = 1; i < graphicsList.length; i++) {
    const newG = graphicsList[i]
    const bounds = getBounds(newG)
    const prevWidth = prevBounds.maxX - prevBounds.minX
    const width = bounds.maxX - bounds.minX
    const padding = (prevWidth + width) / 8
    // Place the next graphic to the right of the previous one
    const dx = prevBounds.maxX + padding - bounds.minX
    const dy = baseMinY - bounds.minY
    const shifted = translateGraphics(newG, dx, dy)
    giantG = mergeGraphics(giantG, shifted)
    prevBounds = getBounds(shifted)
    boundsList.push(prevBounds)
  }
  if (opts.titles && opts.titles.length > 0) {
    const overall = getBounds(giantG)
    const totalWidth = overall.maxX - overall.minX
    const fontSize = totalWidth * 0.025
    const texts = opts.titles.slice(0, boundsList.length).map((title, idx) => {
      const b = boundsList[idx]
      const centerX = (b.minX + b.maxX) / 2
      return {
        x: centerX,
        y: b.maxY + fontSize,
        text: title,
        fontSize,
        anchorSide: "bottom_center" as const,
      }
    })
    giantG = mergeGraphics(giantG, { texts })
  }
  return giantG
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
  opts: {
    cellWidth?: number
    cellHeight?: number
    gap?: number
    gapAsCellWidthFraction?: number
  } = {},
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
  const gap =
    opts.gap ??
    (opts.gapAsCellWidthFraction !== undefined
      ? opts.gapAsCellWidthFraction * cellWidth
      : 0)

  let result: GraphicsObject | null = null

  for (let r = 0; r < graphicsRows.length; r++) {
    const row = graphicsRows[r]
    for (let c = 0; c < row.length; c++) {
      const g = row[c]
      const b = getBounds(g)
      const dx = c * (cellWidth + gap) - b.minX
      const dy = -r * (cellHeight + gap) - b.minY
      const shifted = translateGraphics(g, dx, dy)
      result = result ? mergeGraphics(result, shifted) : shifted
    }
  }

  return result ?? {}
}
