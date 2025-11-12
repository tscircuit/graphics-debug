import React from "react"
import { InteractiveGraphics } from "site/components/InteractiveGraphics/InteractiveGraphics"
import { arrowShowcaseGraphics } from "site/data/arrowShowcaseGraphics"

export default function ArrowDirectionsFixture() {
  return (
    <div style={{ padding: 24, display: "grid", gap: 24 }}>
      <header style={{ maxWidth: 720 }}>
        <h1>Arrow Direction Showcase</h1>
        <p>
          Explore the new eight-direction arrow primitives, including diagonal
          headings. Hover over each arrow to reveal its label and use the mouse
          wheel or drag gestures to inspect the geometry in detail.
        </p>
      </header>
      <div style={{ height: 520, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <InteractiveGraphics graphics={arrowShowcaseGraphics} />
      </div>
    </div>
  )
}
