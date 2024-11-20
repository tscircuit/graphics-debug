import type { GraphicsObject } from "./types";

/**
 * Extracts graphics objects from a debug log string
 * Handles both well-formatted JSON and relaxed JSON syntax (unquoted keys)
 */
export function getGraphicsObjectsFromLogString(
	logString: string,
): GraphicsObject[] {
	const results: GraphicsObject[] = [];

	// Match { graphics: ... } patterns, allowing for other content on same line
	// Use a more precise regex that handles nested structures
	const graphicsRegex =
		/\{[\s]*(?:"graphics"|graphics)[\s]*:[\s]*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}[\s]*\}/g;
	const matches = logString.match(graphicsRegex);

	if (!matches) return results;

	for (const match of matches) {
		try {
			// First try parsing as regular JSON
			const parsed = JSON.parse(match);
			results.push(parsed);
		} catch (e) {
			try {
				// If that fails, fix JSON formatting issues:
				// 1. Add quotes around unquoted keys
				// 2. Handle potential trailing commas
				const fixed = match
					.replace(/(\b\w+)(?=\s*:)/g, '"$1"') // Quote unquoted keys more precisely
					.replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
					.replace(/:\s*'([^']*)'/g, ':"$1"'); // Convert single quotes to double quotes

				const parsed = JSON.parse(fixed);
				results.push(parsed);
			} catch (e) {
				// Skip invalid entries but log the error and the problematic match
				console.warn("Failed to parse graphics object:", match, e);
			}
		}
	}

	return results;
}
