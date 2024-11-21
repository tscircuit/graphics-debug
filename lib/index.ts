import { getGraphicsObjectsFromLogString } from "./getGraphicsObjectsFromLogString"
import { getSvgFromGraphicsObject } from "./getSvgFromGraphicsObject"

export type { Point, Line, Rect, Circle, GraphicsObject } from "./types"
export { getGraphicsObjectsFromLogString } from "./getGraphicsObjectsFromLogString"
export { getSvgFromGraphicsObject } from "./getSvgFromGraphicsObject"

export function getSvgFromLogString(logString: string): string {
  const objects = getGraphicsObjectsFromLogString(logString)
  if (objects.length === 0) return ""
  return getSvgFromGraphicsObject(objects[0])
}

export function getHtmlFromLogString(logString: string): string {
  const svgs = getSvgsFromLogString(logString)
  if (svgs.length === 0) return ""

  const sections = svgs
    .map(
      ({ title, svg }) => `
    <section>
      <h2>${title}</h2>
      ${svg}
    </section>
  `,
    )
    .join("\n")

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Graphics Debug Output</title>
  <style>
    body { font-family: system-ui; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    section { margin: 40px 0; }
    svg { max-width: 100%; height: auto; border: 1px solid #eee; }
  </style>
</head>
<body>
  <h1>Graphics Debug Output</h1>
  ${sections}
</body>
</html>`
}

export function getSvgsFromLogString(
  logString: string,
): Array<{ title: string; svg: string }> {
  const objects = getGraphicsObjectsFromLogString(logString)
  return objects.map((obj) => ({
    title: obj.graphics.title || "Untitled Graphic",
    svg: getSvgFromGraphicsObject(obj),
  }))
}
