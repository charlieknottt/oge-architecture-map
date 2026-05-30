"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { NODES, CONNECTIONS, Node, Connection } from "../data/nodes";
import Popup from "./Popup";

function getCenter(n: Node) {
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

function getEdgePoint(n: Node, target: { x: number; y: number }) {
  const c = getCenter(n);
  const dx = target.x - c.x;
  const dy = target.y - c.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const hw = n.w / 2;
  const hh = n.h / 2;
  if (absDx === 0 && absDy === 0) return c;
  const scale = Math.min(hw / (absDx || 1), hh / (absDy || 1));
  return { x: c.x + dx * scale, y: c.y + dy * scale };
}

function ConnectionLine({ conn, fromNode, toNode, isHovered, onMouseEnter, onMouseLeave, onClick }: {
  conn: Connection; fromNode: Node; toNode: Node; isHovered: boolean;
  onMouseEnter: () => void; onMouseLeave: () => void; onClick: () => void;
}) {
  const fromCenter = getCenter(fromNode);
  const toCenter = getCenter(toNode);
  const p1 = getEdgePoint(fromNode, toCenter);
  const p2 = getEdgePoint(toNode, fromCenter);
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dashArray = conn.style === "dashed" ? "6 4" : conn.style === "dotted" ? "2 4" : undefined;

  return (
    <g style={{ cursor: "pointer" }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        stroke={isHovered ? "#C41230" : "#94a3b8"} strokeWidth={isHovered ? 2 : 1.2}
        strokeDasharray={dashArray} markerEnd="url(#arrow)" style={{ transition: "stroke 0.15s, stroke-width 0.15s" }} />
      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth={14} />
      <rect x={mx - 48} y={my - 9} width={96} height={18} rx={3} fill={isHovered ? "#C41230" : "white"}
        stroke={isHovered ? "#C41230" : "#e2e8f0"} strokeWidth={0.5} style={{ transition: "fill 0.15s" }} />
      <text x={mx} y={my + 3.5} textAnchor="middle" fontSize={9} fontWeight={600}
        fill={isHovered ? "white" : "#64748b"} fontFamily="Arial, sans-serif"
        style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.15s" }}>{conn.label}</text>
    </g>
  );
}

function NodeCard({ node, isHovered, onMouseEnter, onMouseLeave, onClick }: {
  node: Node; isHovered: boolean;
  onMouseEnter: () => void; onMouseLeave: () => void; onClick: () => void;
}) {
  return (
    <g style={{ cursor: "pointer" }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
      {isHovered && (
        <rect x={node.x - 3} y={node.y - 3} width={node.w + 6} height={node.h + 6} rx={9}
          fill="none" stroke={node.color} strokeWidth={2} opacity={0.25} />
      )}
      <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={6}
        fill={node.bg} stroke={node.border} strokeWidth={isHovered ? 2 : 1.5}
        style={{ transition: "stroke-width 0.15s" }} />
      {node.icon === "person" && (
        <g transform={`translate(${node.x + 12}, ${node.y + node.h / 2})`}>
          <circle r={5} fill={node.color} />
          <circle r={1.8} cy={-1.5} fill="white" />
          <path d="M-3.2,2.5 C-3.2,0.5 -1.5,-0.5 0,-0.5 C1.5,-0.5 3.2,0.5 3.2,2.5 Z" fill="white" />
        </g>
      )}
      <text x={node.x + (node.icon === "person" ? 26 : 12)} y={node.y + (node.h / 2) - 5}
        fontSize={12} fontWeight={700} fill={node.color} fontFamily="Arial, sans-serif"
        style={{ pointerEvents: "none", userSelect: "none" }}>{node.label}</text>
      <text x={node.x + (node.icon === "person" ? 26 : 12)} y={node.y + (node.h / 2) + 10}
        fontSize={9.5} fill="#64748b" fontFamily="Arial, sans-serif"
        style={{ pointerEvents: "none", userSelect: "none" }}>{node.type}</text>
    </g>
  );
}

export default function ArchitectureMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 960, height: 700 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredConn, setHoveredConn] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ title: string; subtitle: string; description: string; color: string } | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ width: r.width, height: r.height });
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function handleWheel(e: WheelEvent) {
      if ((e.target as HTMLElement).closest(".popup-overlay")) return;
      e.preventDefault();
      const d = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 150);
      const factor = Math.pow(0.998, d);
      setTransform((p) => {
        const ns = Math.min(Math.max(p.scale * factor, 0.4), 3);
        const rect = el!.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        return { x: mx - (mx - p.x) * (ns / p.scale), y: my - (my - p.y) * (ns / p.scale), scale: ns };
      });
    }
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest(".popup-overlay")) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  }, [transform.x, transform.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setTransform((p) => ({ ...p, x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y }));
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const nodeMap = useMemo(() => {
    const m: Record<string, Node> = {};
    NODES.forEach((n) => { m[n.id] = n; });
    return m;
  }, []);

  const zoomTo = useCallback((factor: number) => {
    setTransform((p) => {
      const ns = Math.min(Math.max(p.scale * factor, 0.4), 3);
      const cx = dims.width / 2, cy = dims.height / 2;
      return { x: cx - (cx - p.x) * (ns / p.scale), y: cy - (cy - p.y) * (ns / p.scale), scale: ns };
    });
  }, [dims]);

  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ cursor: isPanning ? "grabbing" : "grab", overflow: "hidden" }}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <svg width={dims.width} height={dims.height} viewBox={`0 0 ${dims.width} ${dims.height}`} className="absolute inset-0">
        <rect width={dims.width} height={dims.height} fill="#FAFBFC" />
        <defs>
          <marker id="arrow" viewBox="0 0 8 6" markerWidth="7" markerHeight="5" refX="7" refY="3" orient="auto-start-reverse">
            <path d="M0,0 L8,3 L0,6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Tier labels */}
          {[
            { y: 60, label: "OVERSIGHT" },
            { y: 200, label: "ENGINE" },
            { y: 340, label: "INPUT GATE" },
            { y: 480, label: "ACTORS" },
            { y: 600, label: "SUPPORT" },
          ].map((t) => (
            <text key={t.label} x={920} y={t.y} textAnchor="end" fontSize={9} fontWeight={700}
              fill="#cbd5e1" letterSpacing="0.12em" fontFamily="Arial, sans-serif"
              style={{ userSelect: "none" }}>{t.label}</text>
          ))}

          {/* Post-game zone */}
          <rect x={8} y={8} width={180} height={175} rx={8} fill="none" stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4" />
          <text x={16} y={185} fontSize={8} fill="#cbd5e1" fontWeight={600} letterSpacing="0.1em" fontFamily="Arial, sans-serif" style={{ userSelect: "none" }}>POST-GAME</text>

          {/* Connections */}
          {CONNECTIONS.map((conn) => {
            const from = nodeMap[conn.from];
            const to = nodeMap[conn.to];
            if (!from || !to) return null;
            return (
              <ConnectionLine key={conn.id} conn={conn} fromNode={from} toNode={to}
                isHovered={hoveredConn === conn.id}
                onMouseEnter={() => setHoveredConn(conn.id)}
                onMouseLeave={() => setHoveredConn(null)}
                onClick={() => setPopup({ title: conn.label, subtitle: `${from.label} → ${to.label}`, description: conn.description, color: "#C41230" })} />
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => (
            <NodeCard key={node.id} node={node}
              isHovered={hoveredNode === node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setPopup({ title: node.label, subtitle: node.type, description: node.description, color: node.color })} />
          ))}
        </g>
      </svg>

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-4 flex flex-col z-40 rounded-lg overflow-hidden bg-white" style={{ border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {[
          { label: "+", action: () => zoomTo(1.25), ariaLabel: "Zoom in" },
          { label: "fit", action: () => setTransform({ x: 0, y: 0, scale: 1 }), ariaLabel: "Fit" },
          { label: "−", action: () => zoomTo(0.8), ariaLabel: "Zoom out" },
        ].map((b, i) => (
          <button key={i} onClick={b.action} aria-label={b.ariaLabel}
            className="w-9 h-9 flex items-center justify-center cursor-pointer text-sm font-medium hover:bg-slate-50 transition-colors"
            style={{ color: "#64748b", borderTop: i ? "1px solid #e2e8f0" : "none" }}>{b.label}</button>
        ))}
        <div className="text-center text-[10px] py-1 font-medium" style={{ color: "#94a3b8", borderTop: "1px solid #e2e8f0" }}>
          {Math.round(transform.scale * 100)}%
        </div>
      </div>

      {popup && (
        <div className="popup-overlay">
          <Popup title={popup.title} subtitle={popup.subtitle} description={popup.description} color={popup.color} onClose={() => setPopup(null)} />
        </div>
      )}
    </div>
  );
}
