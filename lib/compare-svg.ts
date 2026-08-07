import { Resvg } from "@resvg/resvg-js"
import looksSame from "@tscircuit/image-utils/looks-same"

type CompareSvgOptions = {
  strict?: boolean
  tolerance?: number
  ignoreCaret?: boolean
  ignoreAntialiasing?: boolean
  antialiasingTolerance?: number
  pixelRatio?: number
  percentThreshold?: number
}

const renderSvgToPng = (svg: string | Uint8Array) => {
  return new Resvg(typeof svg === "string" ? svg : Buffer.from(svg))
    .render()
    .asPng()
}

export const compareSvg = async (
  referenceSvg: string | Uint8Array,
  currentSvg: string | Uint8Array,
  options: CompareSvgOptions = {},
) => {
  return looksSame(
    renderSvgToPng(referenceSvg),
    renderSvgToPng(currentSvg),
    options,
  )
}

export const createSvgDiff = async ({
  referenceSvg,
  currentSvg,
  highlightColor,
  ...options
}: CompareSvgOptions & {
  referenceSvg: string | Uint8Array
  currentSvg: string | Uint8Array
  highlightColor?: string
}) => {
  return looksSame.createDiff({
    reference: renderSvgToPng(referenceSvg),
    current: renderSvgToPng(currentSvg),
    highlightColor,
    ...options,
  })
}
