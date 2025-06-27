import { useMemo } from "react"

interface Text {
  x: number
  y: number
  layer?: string
  step?: number
}

export const useFilterTexts = (
  isPointOnScreen: (point: { x: number; y: number }) => boolean,
  filterLayerAndStep: (obj: { layer?: string; step?: number }) => boolean,
) => {
  return useMemo(() => {
    return (text: Text) => {
      if (!filterLayerAndStep(text)) return false
      return isPointOnScreen({ x: text.x, y: text.y })
    }
  }, [isPointOnScreen, filterLayerAndStep])
}
