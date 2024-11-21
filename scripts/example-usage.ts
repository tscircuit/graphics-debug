import Debug from "debug"

const debugGraphics = Debug("graphics-debug:example-usage:graphics")

debugGraphics({
  rects: [
    {
      centerX: 0,
      centerY: 0,
      width: 100,
      height: 100,
      color: "green",
    },
  ],
  points: [{ x: 50, y: 50, color: "red", label: "Test Output!" }],
})
