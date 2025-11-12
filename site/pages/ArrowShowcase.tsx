import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import { getSvgFromGraphicsObject } from "../../lib"
import { InteractiveGraphics } from "../components/InteractiveGraphics/InteractiveGraphics"
import { arrowShowcaseGraphics } from "../data/arrowShowcaseGraphics"

export default function ArrowShowcase() {
  const arrowSvg = useMemo(
    () => getSvgFromGraphicsObject(arrowShowcaseGraphics),
    [],
  )

  return (
    <div className="space-y-10">
      <div className="prose">
        <h1>Arrow Direction Showcase</h1>
        <p>
          This demo renders the eight canonical arrow directions, including the
          new diagonal variants. Hover over any arrow to reveal its label, drag to
          pan, and use the scroll wheel or trackpad to zoom in on specific
          geometry.
        </p>
        <Link to="/" className="text-blue-600 hover:text-blue-700">
          ← Back to the viewer
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="border rounded-lg bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Static SVG</h2>
            <p className="text-sm text-gray-600">
              Generated with <code>getSvgFromGraphicsObject</code>.
            </p>
          </div>
          <div
            className="p-6"
            dangerouslySetInnerHTML={{ __html: arrowSvg }}
          />
        </div>

        <div className="border rounded-lg bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Interactive Viewer</h2>
            <p className="text-sm text-gray-600">
              Powered by the <code>InteractiveGraphics</code> component.
            </p>
          </div>
          <div className="h-[520px]">
            <InteractiveGraphics graphics={arrowShowcaseGraphics} />
          </div>
        </div>
      </div>

      <div className="border rounded-lg bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Arrow JSON</h2>
          <p className="text-sm text-gray-600">
            The eight entries below demonstrate how to configure direction,
            length, and styling.
          </p>
        </div>
        <pre className="overflow-auto px-6 py-4 text-sm text-gray-800 bg-gray-50">
          {JSON.stringify(arrowShowcaseGraphics.arrows, null, 2)}
        </pre>
      </div>
    </div>
  )
}
