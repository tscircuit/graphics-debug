# graphics-debug

Module for debugging graphics, turn log output into meaningful markdown and SVG diagrams.

Just pipe in output with graphics JSON objects into `graphics-debug` (or `gd`) to get a markdown file
with all your graphics drawn-in.

```bash
echo '{ graphics: { points: [{x: 0, y: 0, label: "hello world" }], title: "test graphic" } }' | graphics-debug
# wrote to "test-graphic.debug.md"
```
