import exampleGraphics from "site/assets/exampleGraphics.json"
import { InteractiveGraphics } from "site/components/InteractiveGraphics/InteractiveGraphics"
import type { GraphicsObject } from "../lib"

export default () => {
  return (
    <InteractiveGraphics
      graphics={{
        ...(exampleGraphics as GraphicsObject),
        infiniteLines: [
          {
            origin: { x: 0, y: 0 },
            directionVector: { x: 1, y: 0 },
            strokeColor: "#666",
            strokeDash: [4, 4],
          },
        ],
      }}
    />
  )
}
