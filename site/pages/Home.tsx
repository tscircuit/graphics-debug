import React, { useState } from "react"
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
      <div className="prose">
        <h1>Graphics Debug Viewer</h1>
        <p>Paste your debug output below to visualize graphics objects.</p>
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
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300                      
 disabled:cursor-not-allowed"
        >
          Visualize
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {graphics.length > 0 && <GraphicsDisplay graphics={graphics} />}
    </div>
  )
}
