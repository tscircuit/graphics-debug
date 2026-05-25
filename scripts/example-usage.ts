import Debug from "debug"

const debugGraphics = Debug("my-package:graphics")

debugGraphics(
  JSON.stringify({
    title: "Example Usage",
    rects: [
      {
        center: { x: 0, y: 0 },
        width: 100,
        height: 100,
        color: "green",
      },
    ],
    polygons: [
      {
        points: [
          { x: -60, y: -40 },
          { x: -20, y: -40 },
          { x: -40, y: -10 },
        ],
        fill: "gold",
        stroke: "black",
        label: "Triangle",
      },
    ],
    points: [{ x: 50, y: 50, color: "red", label: "Test Output!" }],
  }),
)

debugGraphics(
  JSON.stringify({
    title: "More Example Usage",
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
