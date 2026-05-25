import React from "react"
import { GraphicsObject, getSvgFromGraphicsObject } from "../lib"

const graphicsWithLabels: GraphicsObject = {
  title: "SVG Label Rendering Test",
  points: [
    { x: 10, y: 10, label: "Point 1", color: "red" },
    { x: 30, y: 10, label: "Point 2", color: "red" },
  ],
  lines: [
    {
      points: [
        { x: 10, y: 30 },
        { x: 50, y: 30 },
      ],
      strokeColor: "blue",
      label: "Line A",
    },
  ],
  rects: [
    {
      center: { x: 30, y: 50 },
      width: 30,
      height: 10,
      fill: "rgba(0, 255, 0, 0.3)",
      stroke: "green",
      label: "Rect X",
    },
  ],
  arrows: [
    {
      start: { x: 10, y: 70 },
      end: { x: 50, y: 85 },
      color: "#0f766e",
      label: "Force",
      inlineLabel: "F",
    },
  ],
  coordinateSystem: "screen", // Use screen to simplify coordinates for SVG
}

const SvgDisplay: React.FC<{ title: string; svgString: string }> = ({
  title,
  svgString,
}) => (
  <div
    style={{ marginBottom: "20px", border: "1px solid #eee", padding: "10px" }}
  >
    <h3>{title}</h3>
    <div dangerouslySetInnerHTML={{ __html: svgString }} />
  </div>
)

export default function SvgLabelRenderingFixture() {
  const svgAllLabels = getSvgFromGraphicsObject(graphicsWithLabels, {
    includeTextLabels: true,
  })
  const svgNoLabels = getSvgFromGraphicsObject(graphicsWithLabels, {
    includeTextLabels: false,
  })
  const svgPointLabels = getSvgFromGraphicsObject(graphicsWithLabels, {
    includeTextLabels: ["points"],
  })
  const svgLineLabels = getSvgFromGraphicsObject(graphicsWithLabels, {
    includeTextLabels: ["lines"],
  })
  const svgRectLabels = getSvgFromGraphicsObject(graphicsWithLabels, {
    includeTextLabels: ["rects"],
  })
  const svgPointAndRectLabels = getSvgFromGraphicsObject(graphicsWithLabels, {
    includeTextLabels: ["points", "rects"],
  })
  const svgArrowDefaultInline = getSvgFromGraphicsObject(graphicsWithLabels)
  const svgArrowWithAllLabels = getSvgFromGraphicsObject(graphicsWithLabels, {
    includeTextLabels: ["arrows"],
  })
  const svgArrowWithoutInline = getSvgFromGraphicsObject(graphicsWithLabels, {
    includeTextLabels: ["arrows"],
    hideInlineLabels: true,
  })

  return (
    <div style={{ padding: "20px" }}>
      <h2>SVG Label Rendering Test</h2>
      <p>
        This fixture tests the <code>includeTextLabels</code> option for{" "}
        <code>getSvgFromGraphicsObject</code>.
      </p>

      <SvgDisplay title="Labels: All (true)" svgString={svgAllLabels} />
      <SvgDisplay title="Labels: None (false)" svgString={svgNoLabels} />
      <SvgDisplay title="Labels: Points Only" svgString={svgPointLabels} />
      <SvgDisplay title="Labels: Lines Only" svgString={svgLineLabels} />
      <SvgDisplay title="Labels: Rects Only" svgString={svgRectLabels} />
      <SvgDisplay
        title="Labels: Points and Rects"
        svgString={svgPointAndRectLabels}
      />
      <SvgDisplay
        title="Arrows: Inline Labels By Default"
        svgString={svgArrowDefaultInline}
      />
      <SvgDisplay
        title="Arrows: Standard + Inline Labels"
        svgString={svgArrowWithAllLabels}
      />
      <SvgDisplay
        title="Arrows: hideInlineLabels=true"
        svgString={svgArrowWithoutInline}
      />
    </div>
  )
}
