import { describe, expect, test, beforeAll } from "bun:test";
import { createRoot } from "react-dom/client";
import SVGRenderer from "../site/components/SVGRenderer";
import "bun-match-svg";
import * as jsdom from 'jsdom';
import { getSvgsFromLogString } from "../lib";

// Setup global DOM environment
beforeAll(() => {
  const { JSDOM } = jsdom;
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  
  global.document = dom.window.document;
  global.window = dom.window as unknown as Window & typeof globalThis;
  global.navigator = dom.window.navigator;
});

describe("SVGRenderer", () => {
  test("snapshot matches expected SVG output", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    
    const logString = `:graphics {"title":"More Example Usage","lines":[{"points":[{"x":0,"y":0},{"x":5,"y":5}]}],"circles":[{"center":{"x":2.5,"y":2.5},"radius":2.5,"color":"blue"}],"points":[{"x":10,"y":10,"color":"red","label":"B"}]}`;
    const graphics = getSvgsFromLogString(logString);
    
    const root = createRoot(container);
    
    return new Promise<void>((resolve) => {
      // Render the SVGs
      root.render(
        graphics.length > 0 ? (
          <div className="space-y-8">
            {graphics.map(({ title, svg }, index) => (
              <SVGRenderer key={index} title={title} svg={svg} />
            ))}
          </div>
        ) : null
      );
      
      // Use setTimeout to allow rendering to complete
      setTimeout(() => {
        try {
          const renderedSvgs = container.querySelectorAll("svg");
          expect(renderedSvgs.length).toBeGreaterThan(0);
          const firstRenderedSvg = renderedSvgs[0]?.outerHTML;
          // Perform snapshot test
          expect(firstRenderedSvg).toMatchSvgSnapshot(import.meta.path, "renderer-graphics");
          root.unmount();
          document.body.removeChild(container);
          resolve();
        } catch (error) {
          root.unmount();
          document.body.removeChild(container);
          throw error;
        }
      }, 0);
    });
  });
});