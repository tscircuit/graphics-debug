export { stackGraphicsHorizontally, stackGraphicsVertically }
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
    const dx = prevBounds.maxX + padding - bounds.minX
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
    const dy = prevBounds.maxY + padding - bounds.minY
    const shifted = translateGraphics(g, dx, dy)
    result = mergeGraphics(result, shifted)
    prevBounds = getBounds(shifted)
  }
  return result
}
