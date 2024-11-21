import React, { useRef, useEffect } from "react"

export interface SVGRendererProps {
  title: string;
  svg: string;
}

const SVGRenderer: React.FC<SVGRendererProps> = ({ title, svg }) => {
    const containerRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      if (containerRef.current) {
        // Clear any existing content
        containerRef.current.innerHTML = '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svg.trim();
        
        // Extract the SVG element
        const svgElement = tempDiv.querySelector('svg');
        
        if (svgElement) {
          const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
          
          // Process script tags to ensure CDATA is correctly handled
          const scripts = clonedSvg.querySelectorAll('script');
          scripts.forEach(script => {
            const newScript = document.createElement('script');
            const scriptContent = script.textContent || script.innerHTML;
            const cdataSection = document.createTextNode(scriptContent);
            newScript.appendChild(cdataSection);
            script.parentNode?.replaceChild(newScript, script);
          });
          
          containerRef.current.appendChild(clonedSvg);
        }
      }
    }, [svg]);
  
    return (
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div 
          ref={containerRef} 
          className="border rounded p-4 bg-white"
        />
      </div>
    );
  };

export default SVGRenderer;