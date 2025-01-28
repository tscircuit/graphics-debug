// biome-ignore lint/style/useImportType: <explanation>
import React, { useState } from "react"
import {
  getSvgsFromLogString,
  getGraphicsObjectsFromLogString,
} from "../../lib"
import { GraphicsDisplay } from "../components/GraphicsDisplay"
import exampleData from "../example.json"

export default function Home() {
  const [input, setInput] = useState("")
  const [graphics, setGraphics] = useState<
    Array<{ title: string; svg: string; graphicsObject?: any }>
  >([])
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

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

  const exampleJson = exampleData.examples
    .map((example) => `:graphics ${JSON.stringify(example)}`)
    .join(" ")

  const handleCopy = () => {
    navigator.clipboard.writeText("npm install graphics-debug")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Graphics Debug Viewer
        </h1>
        <div className="flex gap-3">
          <a
            href="https://github.com/tscircuit/graphics-debug"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/graphics-debug"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
            </svg>
            npm
          </a>
        </div>
      </header>

      <p className="text-lg">Paste your debug output below to visualize graphics objects.</p>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Installation
        </h2>
        <div className="relative bg-gray-50 rounded-lg p-4 w-fit pr-16">
          <pre className="font-mono text-sm text-gray-800 overflow-x-auto">
            npm install graphics-debug
          </pre>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            className={`absolute right-2 top-4 px-3 py-1 text-xs rounded-md transition-colors ${
              copied
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </section>

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
            onClick={() => {
              setInput(exampleJson)
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            See Example
          </button>
        </div>
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
