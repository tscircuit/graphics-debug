import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getSvgFromGraphicsObject } from "../../lib"
import { GraphicsDisplay } from "../components/GraphicsDisplay"

export default function Token() {
  const { token } = useParams<{ token: string }>()
  const [graphics, setGraphics] = useState<
    Array<{ title: string; svg: string; graphicsObject?: any }>
  >([])
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGraphics = async () => {
      try {
        const response = await fetch(
          `https://gdstore.seve.workers.dev/get/${token}`,
        )
        if (!response.ok) {
          throw new Error("Failed to fetch graphics data")
        }
        const { graphicsObjects } = await response.json()
        setGraphics(
          graphicsObjects.map((graphicsObject: any) => ({
            title: graphicsObject.title || "Untitled Graphic",
            svg: getSvgFromGraphicsObject(graphicsObject),
            graphicsObject,
          })),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    if (token) {
      fetchGraphics()
    }
  }, [token])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>
  }

  return (
    <div className="space-y-8">
      <div className="prose">
        <h1>Graphics Visualization</h1>
      </div>

      <GraphicsDisplay graphics={graphics} />
    </div>
  )
}