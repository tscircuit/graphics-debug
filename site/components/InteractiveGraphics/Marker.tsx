import { Matrix, applyToPoint } from "transformation-matrix"

export type MarkerPoint = {
  x: number
  y: number
}

type MarkerProps = {
  marker: MarkerPoint
  index: number
  transform: Matrix
}

export const Marker = ({ marker, transform }: MarkerProps) => {
  const [screenX, screenY] = applyToPoint(transform, [marker.x, marker.y])

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 900,
      }}
    >
      <g transform={`translate(${screenX}, ${screenY})`}>
        <circle
          r={7}
          fill="rgba(255, 0, 0, 0.5)"
          stroke="rgba(255, 0, 0, 0.8)"
          strokeWidth={2}
        />
        <circle r={2} fill="rgba(255, 0, 0, 0.9)" />
      </g>
    </svg>
  )
}
