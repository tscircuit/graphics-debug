import type { GraphicsObject } from "../lib"
import { InteractiveGraphics3d } from "site/components/InteractiveGraphics3d"

const depths = [20, 40, 60]
const colors = [
  "#4a90e2",
  "#50e3c2",
  "#f5a623",
  "#bd10e0",
  "#f8333c",
  "#2d9cdb",
]

const rects = Array.from({ length: 4 }, (_, x) =>
  Array.from({ length: 4 }, (_, y) => ({ x, y })),
)
  .flat()
  .map(({ x, y }, index) => {
    const depth = depths[(x + y) % depths.length]
    const color = colors[index % colors.length]
    const centerX = (x - 1.5) * 45
    const centerY = (y - 1.5) * 45
    const centerZ = (x - y) * 20

    return {
      center: { x: centerX, y: centerY, z: centerZ },
      width: 30,
      height: 30,
      depth,
      fill: color,
      label: `Rect (${x}, ${y}) depth ${depth}`,
    }
  })

const graphics: GraphicsObject = {
  title: "Interactive 3D Rect Grid",
  rects3d: rects,
}

export default function InteractiveGraphics3dFixture() {
  return <InteractiveGraphics3d graphics={graphics} />
}
