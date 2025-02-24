import React, { useRef, useEffect } from "react"
import { drawGraphicsToCanvas, GraphicsObject } from "../lib"

// Simple example graphics object
const simpleGraphics: GraphicsObject = {
  title: "Basic Canvas Example",
  points: [
    { x: 0, y: 0, label: "Origin" },
    { x: 100, y: 100, label: "Point A", color: "red" },
    { x: 100, y: 0, label: "Point B", color: "blue" },
    { x: 0, y: 100, label: "Point C", color: "green" },
  ],
  lines: [
    {
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ],
      strokeColor: "red",
      strokeWidth: 2,
    },
    {
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      strokeColor: "blue",
      strokeWidth: 2,
    },
    {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
      ],
      strokeColor: "green",
      strokeWidth: 2,
    },
  ],
  rects: [
    {
      center: { x: 50, y: 50 },
      width: 40,
      height: 40,
      fill: "rgba(200, 200, 200, 0.5)",
      stroke: "black",
    },
  ],
  circles: [
    {
      center: { x: 70, y: 70 },
      radius: 20,
      fill: "rgba(255, 0, 0, 0.3)",
      stroke: "red",
    },
  ],
  coordinateSystem: "cartesian",
}

export default function BasicCanvasExample() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Set canvas size
    canvasRef.current.width = 600
    canvasRef.current.height = 600

    // Draw graphics object to canvas
    // The transform will be automatically computed based on the content
    drawGraphicsToCanvas(simpleGraphics, canvasRef.current)
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h2>Basic Canvas Renderer Example</h2>
      <p>Simple static rendering with auto-computed transform</p>
      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid #ccc",
          width: 600,
          height: 600,
        }}
      />
      
      <h3>Usage Example</h3>
      <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
{`// Import the function
import { drawGraphicsToCanvas } from "graphics-debug";

// Get a reference to your canvas
const canvas = document.getElementById("myCanvas");

// Define a graphics object
const graphics = {
  points: [{ x: 0, y: 0, label: "Origin" }],
  lines: [{ 
    points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
    strokeColor: "red" 
  }],
  // ... other elements
};

// Draw to canvas with auto-computed transform
drawGraphicsToCanvas(graphics, canvas);

// Or specify a custom viewbox
drawGraphicsToCanvas(graphics, canvas, {
  viewbox: { minX: -50, maxX: 150, minY: -50, maxY: 150 }
});

// Or use an existing transform matrix
import { computeTransformFromViewbox } from "graphics-debug";
const transform = computeTransformFromViewbox(
  { minX: -10, maxX: 110, minY: -10, maxY: 110 },
  canvas.width,
  canvas.height
);
drawGraphicsToCanvas(graphics, canvas, { transform });`}
      </pre>
    </div>
  )
}