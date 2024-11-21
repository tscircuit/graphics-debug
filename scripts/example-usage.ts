import Debug from "debug"

const debugGraphics = Debug("graphics-debug:example-usage:graphics")

debugGraphics(
  JSON.stringify({
    title: "Example Usage!",
    rects: [
      {
        center: { x: 0, y: 0 },
        width: 100,
        height: 100,
        color: "green",
      },
    ],
    points: [{ x: 50, y: 50, color: "red", label: "Test Output!" }],
  }),
)

debugGraphics(
  JSON.stringify({
    title: "More Example Usage!",
    lines: [
      {
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 5 },
        ],
      },
    ],
    circles: [{ center: { x: 2.5, y: 2.5 }, radius: 2.5, color: "blue" }],
    points: [{ x: 10, y: 10, color: "red", label: "B" }],
  }),
)
