export type { Point, Line, Rect, Circle, GraphicsObject } from './types'
export { getGraphicsObjectsFromLogString } from './getGraphicsObjectsFromLogString'
export { getSvgFromGraphicsObject } from './getSvgFromGraphicsObject'

export function getSvgFromLogString(logString: string): string {
  const objects = getGraphicsObjectsFromLogString(logString)
  if (objects.length === 0) return ''
  return getSvgFromGraphicsObject(objects[0])
}

export function getMarkdownFromLogString(logString: string): string {
  const svg = getSvgFromLogString(logString)
  if (!svg) return ''
  return `# Debug Graphics\n\n${svg}`
}

export function getSvgsFromLogString(logString: string): Array<{ title: string; svg: string }> {
  const objects = getGraphicsObjectsFromLogString(logString)
  return objects.map(obj => ({
    title: obj.graphics.title || 'Untitled Graphic',
    svg: getSvgFromGraphicsObject(obj)
  }))
}
