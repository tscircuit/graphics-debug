import { useEffect, useRef, useState } from "react"
import type { Matrix } from "transformation-matrix"
import { applyToPoint, identity, inverse } from "transformation-matrix"

interface Props {
  transform?: Matrix
  children: any
  focusOnHover?: boolean
}

export const DimensionOverlay = ({
  children,
  transform,
  focusOnHover = false,
}: Props) => {
  if (!transform) transform = identity()
  const [dimensionToolVisible, setDimensionToolVisible] = useState(false)
  const [dimensionToolStretching, setDimensionToolStretching] = useState(false)
  // Start of dimension tool line in real-world coordinates (not screen)
  const [dStart, setDStart] = useState({ x: 0, y: 0 })
  // End of dimension tool line in real-world coordinates (not screen)
  const [dEnd, setDEnd] = useState({ x: 0, y: 0 })
  const mousePosRef = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  useEffect(() => {
    const container = containerRef.current

    const down = (e: KeyboardEvent) => {
      if (e.key === "d") {
        setDStart({ x: mousePosRef.current.x, y: mousePosRef.current.y })
        setDEnd({ x: mousePosRef.current.x, y: mousePosRef.current.y })
        setDimensionToolVisible((visible: boolean) => !visible)
        setDimensionToolStretching(true)
      }
      if (e.key === "Escape") {
        setDimensionToolVisible(false)
        setDimensionToolStretching(false)
      }
    }

    const addKeyListener = () => {
      window.addEventListener("keydown", down)
    }

    const removeKeyListener = () => {
      window.removeEventListener("keydown", down)
    }

    addKeyListener()

    if (container) {
      container.addEventListener("focus", addKeyListener)
      container.addEventListener("blur", removeKeyListener)
      container.addEventListener("mouseenter", addKeyListener)
      container.addEventListener("mouseleave", removeKeyListener)
    }
    return () => {
      if (container) {
        container.removeEventListener("focus", addKeyListener)
        container.removeEventListener("blur", removeKeyListener)
        container.removeEventListener("mouseenter", addKeyListener)
        container.removeEventListener("mouseleave", removeKeyListener)
      }
      removeKeyListener()
    }
  }, [])

  const screenDStart = applyToPoint(transform, dStart)
  const screenDEnd = applyToPoint(transform, dEnd)

  const arrowScreenBounds = {
    left: Math.min(screenDStart.x, screenDEnd.x),
    right: Math.max(screenDStart.x, screenDEnd.x),
    top: Math.min(screenDStart.y, screenDEnd.y),
    bottom: Math.max(screenDStart.y, screenDEnd.y),
    flipX: screenDStart.x > screenDEnd.x,
    flipY: screenDStart.y > screenDEnd.y,
    width: 0,
    height: 0,
  }
  arrowScreenBounds.width = arrowScreenBounds.right - arrowScreenBounds.left
  arrowScreenBounds.height = arrowScreenBounds.bottom - arrowScreenBounds.top

  const distance = Math.sqrt(
    Math.pow(dEnd.x - dStart.x, 2) + Math.pow(dEnd.y - dStart.y, 2)
  )

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={{ position: "relative" }}
      onMouseEnter={() => {
        if (focusOnHover && containerRef.current) {
          containerRef.current.focus()
        }
      }}
      onMouseLeave={() => {
        if (containerRef.current) {
          containerRef.current.blur()
        }
      }}
      onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const rwPoint = applyToPoint(inverse(transform!), { x, y })
        mousePosRef.current.x = rwPoint.x
        mousePosRef.current.y = rwPoint.y

        if (dimensionToolStretching) {
          setDEnd({ x: rwPoint.x, y: rwPoint.y })
        }
      }}
      onMouseDown={() => {
        if (dimensionToolStretching) {
          setDimensionToolStretching(false)
        } else if (dimensionToolVisible) {
          setDimensionToolVisible(false)
        }
      }}
    >
      {children}
      {dimensionToolVisible && (
        <>
          {/* Horizontal measurement text */}
          <div
            style={{
              position: "absolute",
              left: arrowScreenBounds.left,
              width: arrowScreenBounds.width,
              textAlign: "center",
              top: screenDStart.y - 20,
              color: "red",
              mixBlendMode: "difference",
              pointerEvents: "none",
              fontSize: 12,
              fontFamily: "sans-serif",
              zIndex: 1000,
            }}
          >
            {Math.abs(dStart.x - dEnd.x).toFixed(2)}
          </div>
          
          {/* Vertical measurement text */}
          <div
            style={{
              position: "absolute",
              left: screenDEnd.x + 5,
              top: arrowScreenBounds.top + arrowScreenBounds.height / 2 - 10,
              color: "red",
              pointerEvents: "none",
              mixBlendMode: "difference",
              fontSize: 12,
              fontFamily: "sans-serif",
              zIndex: 1000,
            }}
          >
            {Math.abs(dStart.y - dEnd.y).toFixed(2)}
          </div>
          
          {/* SVG for drawing the triangle */}
          <svg
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              pointerEvents: "none",
              mixBlendMode: "difference",
              zIndex: 1000,
              width: "100%",
              height: "100%",
            }}
          >
            {/* Direct line from start to end */}
            <line
              x1={screenDStart.x}
              y1={screenDStart.y}
              x2={screenDEnd.x}
              y2={screenDEnd.y}
              strokeWidth={1.5}
              fill="none"
              stroke="red"
            />
            
            {/* Horizontal dotted line */}
            <line
              x1={screenDStart.x}
              y1={screenDStart.y}
              x2={screenDEnd.x}
              y2={screenDStart.y}
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="3,3"
              stroke="red"
            />
            
            {/* Vertical dotted line */}
            <line
              x1={screenDEnd.x}
              y1={screenDStart.y}
              x2={screenDEnd.x}
              y2={screenDEnd.y}
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="3,3"
              stroke="red"
            />
            
            {/* Small circles at each point */}
            <circle cx={screenDStart.x} cy={screenDStart.y} r="2" fill="red" />
            <circle cx={screenDEnd.x} cy={screenDEnd.y} r="2" fill="red" />
          </svg>
          
          {/* Coordinates and distance display */}
          <div
            style={{
              right: 10,
              bottom: 10,
              position: "absolute",
              color: "red",
              padding: "4px 8px",
              fontFamily: "monospace",
              fontSize: 12,
              zIndex: 1000,
            }}
          >
            ({dStart.x.toFixed(2)},{dStart.y.toFixed(2)})<br />
            ({dEnd.x.toFixed(2)},{dEnd.y.toFixed(2)})<br />
            dist: {distance.toFixed(2)}
          </div>
        </>
      )}
    </div>
  )
}
