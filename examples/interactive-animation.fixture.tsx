import React, { useState, useCallback } from "react"
import { InteractiveGraphics } from "../site/components/InteractiveGraphics/InteractiveGraphics"
import { GraphicsObject } from "../lib"

export default () => {
  const [position, setPosition] = useState(0)

  const updatePosition = useCallback(() => {
    setPosition((prev) => (prev + 1) % 4)
  }, [])

  // Create a sample graphics object with animationKey elements
  const graphics: GraphicsObject = {
    points: [
      // Animated point that moves in a square pattern
      {
        x: position === 0 || position === 3 ? 0 : 100,
        y: position === 0 || position === 1 ? 0 : 100,
        color: "#ff0000",
        label: "Animated Point",
        animationKey: "point1",
      },
      // Static point for comparison
      {
        x: 150,
        y: 50,
        color: "#0000ff",
        label: "Static Point",
      },
    ],
    lines: [
      // Animated line with changing points
      {
        points: [
          { x: position * 20, y: 0 },
          { x: 100, y: 100 - position * 20 },
        ],
        strokeColor: "#00aa00",
        strokeWidth: 2,
        label: "Animated Line",
        animationKey: "line1",
      },
      // Static line for comparison
      {
        points: [
          { x: 150, y: 150 },
          { x: 200, y: 200 },
        ],
        strokeColor: "#aa00aa",
        strokeWidth: 2,
        label: "Static Line",
      },
    ],
  }

  return (
    <div>
      <h2>Animation Demo</h2>
      <p>
        Elements with animationKey will animate smoothly when their positions
        change.
      </p>
      <button
        onClick={updatePosition}
        style={{ margin: "10px 0", padding: "5px 10px" }}
      >
        Move Elements
      </button>
      <div style={{ border: "1px solid #ccc", padding: 10 }}>
        <InteractiveGraphics graphics={graphics} />
      </div>
    </div>
  )
}
