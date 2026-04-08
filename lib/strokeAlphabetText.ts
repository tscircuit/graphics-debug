import {
  glyphAdvanceRatio,
  glyphLineAlphabet,
  kerningRatio,
  textMetrics,
} from "@tscircuit/alphabet"
import type { NinePointAnchor } from "./types"

export interface StrokeAlphabetContext {
  beginPath(): void
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  stroke(): void
  save(): void
  restore(): void
  translate(x: number, y: number): void
  rotate(angleRadians: number): void
  strokeStyle: string
  lineWidth: number
}

export type AlphabetLayout = {
  width: number
  height: number
  glyphWidth: number
  letterSpacing: number
  spaceWidth: number
  strokeWidth: number
  lineHeight: number
  lines: string[]
  lineWidths: number[]
}

const getAdvanceRatio = (char: string): number =>
  glyphAdvanceRatio[char] ??
  (char === " " ? textMetrics.spaceWidthRatio : textMetrics.glyphWidthRatio)

export function getAlphabetAdvanceWidth(
  char: string,
  nextChar: string | undefined,
  fontSize: number,
): number {
  const advanceRatio = getAdvanceRatio(char)
  const letterSpacingRatio = nextChar ? textMetrics.letterSpacingRatio : 0
  const kerningAdjustmentRatio = nextChar
    ? (kerningRatio[char]?.[nextChar] ?? 0)
    : 0

  return fontSize * (advanceRatio + letterSpacingRatio + kerningAdjustmentRatio)
}

export function getAlphabetLayout(
  text: string,
  fontSize: number,
): AlphabetLayout {
  const glyphWidth = fontSize * textMetrics.glyphWidthRatio
  const letterSpacing = fontSize * textMetrics.letterSpacingRatio
  const spaceWidth = fontSize * textMetrics.spaceWidthRatio
  const strokeWidth = fontSize * textMetrics.strokeWidthRatio
  const lineHeight = fontSize * textMetrics.lineHeightRatio

  const lines = text.replace(/\\n/g, "\n").split("\n")
  const lineWidths = lines.map((line) => {
    const characters = Array.from(line)
    return characters.reduce(
      (sum, char, index) =>
        sum + getAlphabetAdvanceWidth(char, characters[index + 1], fontSize),
      0,
    )
  })

  const width = lineWidths.reduce(
    (maxWidth, lineWidth) => Math.max(maxWidth, lineWidth),
    0,
  )
  const height =
    lines.length > 1 ? fontSize + (lines.length - 1) * lineHeight : fontSize

  return {
    width,
    height,
    glyphWidth,
    letterSpacing,
    spaceWidth,
    strokeWidth,
    lineHeight,
    lines,
    lineWidths,
  }
}

export function getTextStartPosition(
  alignment: NinePointAnchor,
  layout: AlphabetLayout,
): { x: number; y: number } {
  const totalWidth = layout.width + layout.strokeWidth
  const totalHeight = layout.height + layout.strokeWidth

  let x = 0
  let y = 0

  if (
    alignment === "center" ||
    alignment === "top_center" ||
    alignment === "bottom_center"
  ) {
    x = -totalWidth / 2
  } else if (
    alignment === "top_right" ||
    alignment === "bottom_right" ||
    alignment === "center_right"
  ) {
    x = -totalWidth
  }

  if (
    alignment === "center" ||
    alignment === "center_left" ||
    alignment === "center_right"
  ) {
    y = -totalHeight / 2
  } else if (
    alignment === "bottom_left" ||
    alignment === "bottom_right" ||
    alignment === "bottom_center"
  ) {
    y = -totalHeight
  }

  return { x, y }
}

export function getLineStartX({
  alignment,
  lineWidth,
  maxWidth,
  strokeWidth,
}: {
  alignment: NinePointAnchor
  lineWidth: number
  maxWidth: number
  strokeWidth: number
}): number {
  const totalLineWidth = lineWidth + strokeWidth
  const totalMaxWidth = maxWidth + strokeWidth

  if (
    alignment === "top_left" ||
    alignment === "bottom_left" ||
    alignment === "center_left"
  ) {
    return 0
  }

  if (
    alignment === "top_right" ||
    alignment === "bottom_right" ||
    alignment === "center_right"
  ) {
    return totalMaxWidth - totalLineWidth
  }

  return (totalMaxWidth - totalLineWidth) / 2
}

export function strokeAlphabetLine({
  ctx,
  line,
  fontSize,
  startX,
  startY,
  layout,
}: {
  ctx: StrokeAlphabetContext
  line: string
  fontSize: number
  startX: number
  startY: number
  layout: AlphabetLayout
}): void {
  const height = fontSize
  const glyphScaleX = fontSize
  const characters = Array.from(line)
  let cursor = startX + layout.strokeWidth / 2

  characters.forEach((char, index) => {
    const glyphLines = glyphLineAlphabet[char]

    if (glyphLines?.length) {
      ctx.beginPath()
      for (const glyph of glyphLines) {
        const x1 = cursor + glyph.x1 * glyphScaleX
        const y1 = startY + (1 - glyph.y1) * height
        const x2 = cursor + glyph.x2 * glyphScaleX
        const y2 = startY + (1 - glyph.y2) * height
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
      }
      ctx.stroke()
    }

    cursor += getAlphabetAdvanceWidth(char, characters[index + 1], fontSize)
  })
}

export function strokeAlphabetText({
  ctx,
  text,
  fontSize,
  startX,
  startY,
  color,
  anchorAlignment = "center",
  rotationRadians,
}: {
  ctx: StrokeAlphabetContext
  text: string
  fontSize: number
  startX: number
  startY: number
  color: string
  anchorAlignment?: NinePointAnchor
  rotationRadians?: number
}): void {
  if (!text) return

  const layout = getAlphabetLayout(text, fontSize)
  const startPosition = getTextStartPosition(anchorAlignment, layout)
  const { lines, lineWidths, lineHeight, width, strokeWidth } = layout

  ctx.save()
  ctx.translate(startX, startY)
  if (rotationRadians) {
    ctx.rotate(rotationRadians)
  }

  ctx.strokeStyle = color
  ctx.lineWidth = strokeWidth

  lines.forEach((line, lineIndex) => {
    const lineStartX =
      startPosition.x +
      getLineStartX({
        alignment: anchorAlignment,
        lineWidth: lineWidths[lineIndex]!,
        maxWidth: width,
        strokeWidth,
      })
    const lineStartY = startPosition.y + lineIndex * lineHeight

    strokeAlphabetLine({
      ctx,
      line,
      fontSize,
      startX: lineStartX,
      startY: lineStartY,
      layout,
    })
  })

  ctx.restore()
}
