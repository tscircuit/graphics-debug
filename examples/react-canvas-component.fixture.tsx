import React from "react"
import { CanvasGraphics } from "../site/components/CanvasGraphics/CanvasGraphics"
import { GraphicsObject } from "../lib"

// Example graphics object
const complexExample: GraphicsObject = {
  title: "React Canvas Component Example",
  points: [
    { x: 0, y: 0, label: "Origin" },
    { x: 100, y: 0, label: "X-Axis (100)", color: "red" },
    { x: 0, y: 100, label: "Y-Axis (100)", color: "green" },
    { x: -50, y: 75, label: "Point A", color: "blue" },
    { x: 75, y: -30, label: "Point B", color: "purple" },
  ],
  lines: [
    {
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      strokeColor: "red",
      strokeWidth: 1,
    },
    {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
      ],
      strokeColor: "green",
      strokeWidth: 1,
    },
    {
      points: [
        { x: -50, y: -50 },
        { x: 50, y: 50 },
      ],
      strokeColor: "blue",
      strokeWidth: 2,
      strokeDash: "5,5",
    },
  ],
  rects: [
    {
      center: { x: 50, y: 50 },
      width: 60,
      height: 40,
      fill: "rgba(255, 0, 0, 0.2)",
      stroke: "red",
    },
    {
      center: { x: -30, y: 30 },
      width: 30,
      height: 60,
      fill: "rgba(0, 0, 255, 0.2)",
      stroke: "blue",
    },
  ],
  circles: [
    {
      center: { x: 25, y: 25 },
      radius: 15,
      fill: "rgba(0, 255, 0, 0.2)",
      stroke: "green",
    },
    {
      center: { x: -25, y: -25 },
      radius: 20,
      fill: "rgba(128, 0, 128, 0.2)",
      stroke: "purple",
    },
  ],
  coordinateSystem: "cartesian",
}

export default function ReactCanvasExample() {
  return (
    <div style={{ padding: 20 }}>
      <h2>React Canvas Graphics Component Example</h2>
      <p>Interactive canvas rendering with mouse panning/zooming</p>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px" }}>
          <h3>Default (with grid)</h3>
          <CanvasGraphics 
            graphics={complexExample} 
            height={300}
          />
        </div>
        
        <div style={{ flex: "1 1 300px" }}>
          <h3>Without grid</h3>
          <CanvasGraphics 
            graphics={complexExample} 
            height={300}
            withGrid={false}
          />
        </div>
      </div>
      
      <h3>Usage Example</h3>
      <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
{`// Import the component
import { CanvasGraphics } from "graphics-debug/react";

// Define a graphics object
const graphics = {
  points: [{ x: 0, y: 0, label: "Origin" }],
  lines: [{ 
    points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
    strokeColor: "red" 
  }],
  // ... other elements
};

// Use the component in your React app
function MyGraphicsViewer() {
  return (
    <CanvasGraphics
      graphics={graphics}
      height={500}
      withGrid={true} // Optional: show coordinate grid
    />
  );
}`}
      </pre>
    </div>
  )
}