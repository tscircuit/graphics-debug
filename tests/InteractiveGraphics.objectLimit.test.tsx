import { beforeAll, describe, expect, test } from "bun:test"
import { act } from "react"
import { createRoot } from "react-dom/client"
import * as jsdom from "jsdom"
import { InteractiveGraphics } from "../site/components/InteractiveGraphics/InteractiveGraphics"

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}

beforeAll(() => {
  const { JSDOM } = jsdom
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
  })

  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  global.document = dom.window.document
  global.window = dom.window as unknown as Window & typeof globalThis
  global.navigator = dom.window.navigator
  global.localStorage = dom.window.localStorage
  global.ResizeObserver = ResizeObserverMock as any
  ;(global.window as any).ResizeObserver = ResizeObserverMock
  ;(global.window as any).HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    strokeRect() {},
    fillText() {},
    measureText() {
      return { width: 0 }
    },
    setLineDash() {},
    save() {},
    restore() {},
    translate() {},
    scale() {},
  })
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
})

describe("InteractiveGraphics objectLimit", () => {
  test("shows limit message when filtered objects exceed objectLimit", async () => {
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    const graphics = {
      points: [
        { x: 0, y: 0, label: "A", step: 1 },
        { x: 10, y: 10, label: "B", step: 1 },
        { x: 20, y: 20, label: "C", step: 1 },
      ],
    }

    try {
      await act(async () => {
        root.render(
          <InteractiveGraphics graphics={graphics as any} objectLimit={2} />,
        )
      })

      expect(container.textContent).toContain("Display limited to 2 objects")
      expect(container.textContent).toContain("Received: 3")
    } finally {
      await act(async () => {
        root.unmount()
      })
      document.body.removeChild(container)
    }
  })
})
