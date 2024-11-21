import type { GraphicsObject } from "./types"

/**
 * Extracts graphics objects from a debug log string
 * Handles both well-formatted JSON and relaxed JSON syntax (unquoted keys)
 */
export function getGraphicsObjectsFromLogString(
  logString: string,
): GraphicsObject[] {
  const results: GraphicsObject[] = []

  // Match both {graphics: ...} and :graphics {...} patterns
  const graphicsRegex =
    /(?:\{[\s]*(?:"graphics"|graphics)[\s]*:[\s]*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}[\s]*\})|(?::graphics\s+\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/g
  const matches = logString.match(graphicsRegex)

  if (!matches) return results

  for (const match of matches) {
    try {
      // First try parsing as regular JSON
      // Extract just the JSON part if it's a debug line
      const jsonPart = match.includes(":graphics")
        ? match.substring(match.indexOf("{"))
        : match

      const parsed = JSON.parse(jsonPart)

      // Wrap non-graphics objects in a graphics wrapper
      if (parsed.graphics) {
        results.push(parsed.graphics)
      } else {
        results.push(parsed)
      }
    } catch (e) {
      try {
        // If that fails, fix JSON formatting issues:
        // 1. Add quotes around unquoted keys
        // 2. Handle potential trailing commas
        const fixed = match
          .replace(/(\b\w+)(?=\s*:)/g, '"$1"') // Quote unquoted keys more precisely
          .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
          .replace(/:\s*'([^']*)'/g, ':"$1"') // Convert single quotes to double quotes

        const parsed = JSON.parse(fixed)
        if (parsed.graphics) {
          results.push(parsed.graphics)
        } else {
          results.push(parsed)
        }
      } catch (e) {
        // Skip invalid entries but log the error and the problematic match
        console.warn("Failed to parse graphics object:", match, e)
      }
    }
  }

  return results
}
