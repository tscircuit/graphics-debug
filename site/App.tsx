import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Token from "./pages/Token"
import ArrowShowcase from "./pages/ArrowShowcase"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/t/:token" element={<Token />} />
            <Route path="/examples/arrows" element={<ArrowShowcase />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
