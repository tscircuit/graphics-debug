import React, { useState } from "react"
import exampleGraphicsJson from "../assets/exampleGraphics.json"
import {
  getSvgsFromLogString,
  getGraphicsObjectsFromLogString,
} from "../../lib"
import { GraphicsDisplay } from "../components/GraphicsDisplay"

export default function Home() {
  const [input, setInput] = useState("")
  const [graphics, setGraphics] = useState<
    Array<{ title: string; svg: string; graphicsObject?: any }>
  >([])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const graphicsObjects = getGraphicsObjectsFromLogString(input)
      if (graphicsObjects.length === 0) {
        setError("No graphics objects found in the input")
        setGraphics([])
      } else {
        setError(null)
        const results = getSvgsFromLogString(input)
        setGraphics(
          results.map((result, i) => ({
            ...result,
            graphicsObject: graphicsObjects[i],
          })),
        )
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse graphics input",
      )
      setGraphics([])
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div className="prose">
          <h1>Graphics Debug Viewer</h1>
          <p>Paste your debug output below to visualize graphics objects.</p>
        </div>
        <a
          href="https://github.com/tscircuit/graphics-debug"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://img.shields.io/github/stars/tscircuit/graphics-debug?style=social"
            alt="GitHub stars"
          />
        </a>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError(null)
          }}
          className="w-full h-48 p-4 border rounded-lg shadow-sm"
          placeholder="Paste your graphics debug output here..."
        />
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            Visualize
          </button>
          <button
            type="button"
            onClick={() =>
              setInput(`:graphics ${JSON.stringify(exampleGraphicsJson)}`)
            }
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Load Example
          </button>
        </div>
      </form>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {graphics.length > 0 && (
        <>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            <strong>Tip:</strong> Press the{" "}
            <kbd className="px-2 py-1 bg-gray-200 rounded">d</kbd> key while
            hovering over a graphic to activate the dimension measurement tool.
            Click to finish measuring.
          </div>
          <GraphicsDisplay graphics={graphics} />
        </>
      )}
    </div>
  )
}
