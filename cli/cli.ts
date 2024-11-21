#!/usr/bin/env node
import { parseArgs } from "node:util"
import { readFileSync } from "node:fs"
import { writeFileSync } from "node:fs"
import {
  getSvgsFromLogString,
  getHtmlFromLogString,
  getGraphicsObjectsFromLogString,
} from "../lib"

async function getInput(): Promise<string> {
  // Check if there's data being piped in
  if (process.stdin.isTTY) {
    console.error(
      "Error: No input provided. Pipe in content with graphics objects.",
    )
    process.exit(1)
  }

  const chunks = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk)
  }
  return chunks.join("")
}

async function main() {
  const { values } = parseArgs({
    options: {
      html: { type: "boolean" },
      url: { type: "boolean" },
      help: { type: "boolean" },
    },
  })

  if (values.help) {
    console.log(`
Usage: graphics-debug [options]

Options:
  --html    Output a single HTML file with all graphics
  --url     Print a url to view the graphics in a browser
  --help    Show this help message

Examples:
  cat debug.log | graphics-debug
  echo '{ graphics: { points: [{x: 0, y: 0}] } }' | graphics-debug --html
    `)
    process.exit(0)
  }

  const input = await getInput()

  if (values.html) {
    const html = getHtmlFromLogString(input)
    writeFileSync("graphicsdebug.debug.html", html)
    console.log('Wrote to "graphicsdebug.debug.html"')
  } else if (values.url) {
    const { url } = await fetch("https://gdstore.seve.workers.dev/store", {
      method: "POST",
      body: JSON.stringify({
        graphicsObjects: getGraphicsObjectsFromLogString(input),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json())

    const token = url.split("/get/").pop()

    console.log(`https://graphicsdebug.com/t/${token}`)
  } else {
    const svgs = getSvgsFromLogString(input)
    svgs.forEach((svg, i) => {
      const filename = `${svg.title.toLowerCase().replace(/\s+/g, "-")}-${i + 1}.debug.svg`
      writeFileSync(filename, svg.svg)
      console.log(`Wrote to "${filename}"`)
    })
  }
}

main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
