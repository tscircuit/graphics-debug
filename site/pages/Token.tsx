import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getSvgsFromLogString } from "../../lib"

export default function Token() {
  const { token } = useParams<{ token: string }>()
  const [graphics, setGraphics] = useState<
    Array<{ title: string; svg: string }>
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
        const data = await response.text()
        const results = getSvgsFromLogString(data)
        setGraphics(results)
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

      {graphics.length > 0 ? (
        <div className="space-y-8">
          {graphics.map(({ title, svg }, index) => (
            <div key={index} className="space-y-2">
              <h2 className="text-xl font-semibold">{title}</h2>
              <div
                className="border rounded p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>No graphics found</p>
      )}
    </div>
  )
}
