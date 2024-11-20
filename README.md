# graphics-debug

Module for debugging graphics, turn log output into meaningful markdown and SVG diagrams.

Just pipe in output with graphics JSON objects into `graphics-debug` (or `gd`) to get an html file
with all your graphics drawn-in.

```bash
echo '{ graphics: { points: [{x: 0, y: 0, label: "hello world" }], title: "test graphic" } }' | graphics-debug
# wrote to "test-graphic.debug.md"
```

Don't have access to the cli? Paste into the online version: `TBA`

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

### Writing `graphics-debug` compatible logs

The best way to write `graphics-debug` compatible logs is to use the [`debug` library](https://www.npmjs.com/package/debug).

```tsx
import Debug from "debug"

const debugGraphics = Debug("mypackage:graphics")

const A = { x: 0, y: 0, label: "A" }
const B = { x: 1, y: 1, label: "B" }

debugGraphics({
  graphics: {
    points: [A, B],
    title: "initial points for my algorithm",
  },
})

// ... do some algorithm stuff e.g....
const C = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2, label: "C" }

debugGraphics({
  graphics: {
    points: [A, B, C],
    title: "final points for my algorithm",
  },
})
```

To see the output, you'll need to run `DEBUG=mypackage:graphics` in your terminal
before running the program. This makes it easy to turn on/off the graphics output

You can also use `debugGraphics.enabled` to conditionally emit graphics based,
this is useful if it's expensive to compute the graphics object.

### Process Log Strings into HTML or SVGs

```tsx
import {
  getSvgFromLogString,
  getHtmlFromLogString,
  getSvgsFromLogString,
} from "graphics-debug"

const logString = `
hello world! This is some other content that will be ignored
here's some graphics: { graphics: { points: [{x: 0, y: 0, label: "hello world" }], title: "test graphic" } }
`

const svg = getSvgFromLogString(logString)
const html = getHtmlFromLogString(logString)

// If you want to parse for multiple SVGs
const svgs = getSvgsFromLogString(logString)
// Array<{ title: string; svg: string }>
```

### Extract `graphics` objects from a Debug Log

```tsx
import { getGraphicsObjectsFromLogString } from "graphics-debug"

const graphicsObjects = getGraphicsObjectsFromLogString(logString)
// Array<GraphicsObject>
```
