import { InteractiveGraphics } from "site/components/InteractiveGraphics/InteractiveGraphics"
import exampleGraphics from "site/assets/exampleGraphics.json"

export default () => {
  return (
    <InteractiveGraphics
      graphics={{
        rects: [
          {
            center: { x: 200, y: 100 },
            width: 50,
            height: 100,
            layer: "layer1",
            step: 0,
          },
          {
            center: { x: 250, y: 100 },
            width: 50,
            height: 100,
            layer: "layer1",
            step: 1,
          },
          {
            center: { x: 250, y: 100 },
            width: 50,
            height: 100,
            layer: "layer1",
            step: 2,
          },
        ],
        points: [
          {
            x: 0,
            y: 0,
            layer: "layer1",
          },
          {
            x: 50,
            y: 0,
            layer: "layer2",
          },
          {
            x: 100,
            y: 0,
            layer: "layer3",
          },
        ],
      }}
    />
  )
}
