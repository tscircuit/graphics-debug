import React from "react"
import ReactDOM from "react-dom/client"

function App() {
  return (
    <div>
      <h1>Graphics Debug</h1>
      <p>Paste your debug output here to visualize graphics</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
