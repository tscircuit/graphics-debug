import type { Rect } from "lib/types"

// Sort rectangles so larger ones render first so smaller ones appear on top
export const sortRectsByArea = <T extends Rect>(rects: T[]): T[] =>
  rects.slice().sort((a, b) => b.width * b.height - a.width * a.height)
