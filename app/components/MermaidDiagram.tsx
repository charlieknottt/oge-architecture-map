"use client";
import { useEffect, useRef } from "react";

let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;

function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((mod) => {
      mod.default.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          primaryColor: "#EDF1F7",
          primaryTextColor: "#333",
          primaryBorderColor: "#043673",
          lineColor: "#4D5051",
          secondaryColor: "#E8F2FA",
          tertiaryColor: "#E8F5F5",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "13px",
          nodeBorder: "#043673",
          mainBkg: "#EDF1F7",
          clusterBkg: "#FAFAFA",
          clusterBorder: "#E0E0E0",
          edgeLabelBackground: "#fff",
          nodeTextColor: "#333",
          titleColor: "#043673",
        },
        flowchart: { curve: "linear", padding: 16, htmlLabels: true, useMaxWidth: true },
      });
      return mod.default;
    });
  }
  return mermaidPromise;
}

export default function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef(`md-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    let cancelled = false;
    getMermaid().then(async (mermaid) => {
      if (cancelled || !ref.current) return;
      try {
        const { svg } = await mermaid.render(idRef.current, chart);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        console.error("Mermaid render error:", e);
      }
    });
    return () => { cancelled = true; };
  }, [chart]);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        justifyContent: "center",
        background: "#F5F5F5",
        border: "1px solid #E0E0E0",
        borderRadius: 6,
        padding: 24,
        margin: "16px 0 24px",
        overflowX: "auto",
      }}
    />
  );
}
