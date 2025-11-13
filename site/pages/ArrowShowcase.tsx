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
        <h1>Arrow Showcase</h1>
        <p>
          Arrows are now defined entirely by a start point, an end point, an
          optional flipped orientation, and a color. This page shows the simplified
          data rendered both statically and inside the interactive viewer.
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
            Each entry below only includes <code>start</code>, <code>end</code>,
            <code>flipped</code>, and <code>color</code> properties.
          </p>
        </div>
        <pre className="overflow-auto px-6 py-4 text-sm text-gray-800 bg-gray-50">
          {JSON.stringify(arrowShowcaseGraphics.arrows, null, 2)}
        </pre>
      </div>
    </div>
  )
}
