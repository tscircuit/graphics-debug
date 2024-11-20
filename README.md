# graphics-debug

Module for debugging graphics, turn log output into meaningful markdown and SVG diagrams.

Just pipe in output with graphics JSON objects into `graphics-debug` (or `gd`) to get a markdown file
with all your graphics drawn-in.

```bash
echo '{ graphics: { points: [{x: 0, y: 0, label: "hello world" }], title: "test graphic" } }' | graphics-debug
# wrote to "test-graphic.debug.md"
```

Don't have access to the cli? Paste into the online version: https://graphicsdebug.com

## Format

The `graphics` json object is very simple, here's the basic schema:

```typescript
interface GraphicsObject {
  graphics: {
    points?: { x: number; y: number; color?: string; label?: string }[]
    lines?: { points: { x: number; y: number; stroke?: number }[] }[]
    rects?: Array<{
      center: { x: number; y: number }
      width: number
      height: number
      fill?: string
      stroke?: string
    }>
    circles?: Array<{
      center: { x: number; y: number }
      radius: number
      fill?: string
      stroke?: string
    }>
    title?: string
  }
}
```

When emiting a graphics object, keep the `{ graphics }` object on a single line,
`graphics-debug` won't parse multi-line `{ graphics }` objects. You can have
other content on same line as the `{ graphics }` object. This means you can't
use `console.log` to emit graphics objects, use the [debug](https://www.npmjs.com/package/debug)
library or `console.log(JSON.stringify(...))` instead.

## Library Usage

### Process Log Strings into Markdown or SVGs

```tsx
import {
  getSvgFromLogString,
  getMarkdownFromLogString,
  getSvgsFromLogString,
} from "graphics-debug"

const logString = `
hello world! This is some other content that will be ignored
here's some graphics: { graphics: { points: [{x: 0, y: 0, label: "hello world" }], title: "test graphic" } }
`

const svg = getSvgFromLogString(logString)
const markdown = getMarkdownFromLogString(logString)

// If you want to parse for multiple SVGs
const svgs = getSvgsFromLogString(logString)
// Array<{ title: string; svg: string }>
```
