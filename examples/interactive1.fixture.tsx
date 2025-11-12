import { InteractiveGraphics } from "site/components/InteractiveGraphics/InteractiveGraphics"
import exampleGraphics from "site/assets/exampleGraphics.json"
import type { GraphicsObject } from "../lib"

export default () => {
  return <InteractiveGraphics graphics={exampleGraphics as GraphicsObject} />
}
