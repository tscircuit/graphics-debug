import { lighten } from "polished"

export const safeLighten = (amount: number, color: string) => {
  try {
    return lighten(amount, color)
  } catch (e) {
    return color
  }
}
