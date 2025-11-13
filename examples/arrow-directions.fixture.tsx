import React from "react"
import { InteractiveGraphics } from "site/components/InteractiveGraphics/InteractiveGraphics"
import { arrowShowcaseGraphics } from "site/data/arrowShowcaseGraphics"

export default function ArrowDirectionsFixture() {
  return (
    <div style={{ padding: 24, display: "grid", gap: 24 }}>
      <header style={{ maxWidth: 720 }}>
        <h1>Arrow Showcase</h1>
        <p>
          This demo renders arrows using only a start point, an end point, and
          an optional flipped orientation. Colors are still supported, but all
          other arrow configuration has been removed.
        </p>
      </header>
      <div style={{ height: 520, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <InteractiveGraphics graphics={arrowShowcaseGraphics} />
      </div>
    </div>
  )
}
