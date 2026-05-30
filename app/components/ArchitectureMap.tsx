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
  const dashArray = conn.style === "dashed" ? "6 4" : conn.style === "dotted" ? "2 4" : undefined;
  const labelWidth = Math.max(conn.label.length * 7 + 16, 70);
  const halfW = labelWidth / 2;
  const strokeColor = isHovered ? "#C41230" : "#94a3b8";
  const sw = isHovered ? 2 : 1.2;

  if (conn.waypoints && conn.waypoints.length > 0) {
    const firstWp = conn.waypoints[0];
    const lastWp = conn.waypoints[conn.waypoints.length - 1];
    const p1 = getEdgePoint(fromNode, firstWp);
    const p2 = getEdgePoint(toNode, lastWp);
    const allPts = [p1, ...conn.waypoints, p2];
    const pathD = allPts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x},${pt.y}`).join(" ");
    const midIdx = Math.floor(allPts.length / 2);
    const mx = allPts[midIdx].x;
    const my = allPts[midIdx].y;

    return (
      <g style={{ cursor: "pointer" }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={sw}
          strokeDasharray={dashArray} markerEnd="url(#arrowhead)" style={{ transition: "stroke 0.15s" }} />
        <path d={pathD} fill="none" stroke="transparent" strokeWidth={14} />
        <rect x={mx - halfW} y={my - 9} width={labelWidth} height={18} rx={3} fill={isHovered ? "#C41230" : "white"}
          stroke={isHovered ? "#C41230" : "#e2e8f0"} strokeWidth={0.5} style={{ transition: "fill 0.15s" }} />
        <text x={mx} y={my + 3.5} textAnchor="middle" fontSize={9} fontWeight={600}
          fill={isHovered ? "white" : "#64748b"} fontFamily="Arial, sans-serif"
          style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.15s" }}>{conn.label}</text>
      </g>
    );
  }

  const fromCenter = getCenter(fromNode);
  const toCenter = getCenter(toNode);
  const p1 = getEdgePoint(fromNode, toCenter);
  const p2 = getEdgePoint(toNode, fromCenter);
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;

  return (
    <g style={{ cursor: "pointer" }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        stroke={strokeColor} strokeWidth={sw}
        strokeDasharray={dashArray} markerEnd="url(#arrowhead)" style={{ transition: "stroke 0.15s, stroke-width 0.15s" }} />
      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth={14} />
      <rect x={mx - halfW} y={my - 9} width={labelWidth} height={18} rx={3} fill={isHovered ? "#C41230" : "white"}
        stroke={isHovered ? "#C41230" : "#e2e8f0"} strokeWidth={0.5} style={{ transition: "fill 0.15s" }} />
      <text x={mx} y={my + 3.5} textAnchor="middle" fontSize={9} fontWeight={600}
        fill={isHovered ? "white" : "#64748b"} fontFamily="Arial, sans-serif"
        style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.15s" }}>{conn.label}</text>
    </g>
  );
}

function PersonIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={0} cy={-5} r={3.5} />
      <path d="M-7,7 C-7,2 -4,-1 0,-1 C4,-1 7,2 7,7" />
    </g>
  );
}

function DatabaseIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} fill="none" stroke={color} strokeWidth={1.4}>
      <ellipse cx={0} cy={-6} rx={8} ry={3.5} />
      <line x1={-8} y1={-6} x2={-8} y2={6} />
      <line x1={8} y1={-6} x2={8} y2={6} />
      <ellipse cx={0} cy={6} rx={8} ry={3.5} />
    </g>
  );
}

function ComponentIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x={-7} y={-7} width={14} height={14} rx={2} />
      <line x1={-3} y1={-2} x2={3} y2={-2} />
      <line x1={-3} y1={2} x2={1} y2={2} />
    </g>
  );
}

function FilterIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-8,-7 L8,-7 L2,1 L2,7 L-2,9 L-2,1 Z" />
    </g>
  );
}

function NodeIcon({ icon, x, y, color }: { icon: string; x: number; y: number; color: string }) {
  if (icon === "person") return <PersonIcon x={x} y={y} color={color} />;
  if (icon === "data") return <DatabaseIcon x={x} y={y} color={color} />;
  if (icon === "filter") return <FilterIcon x={x} y={y} color={color} />;
  return <ComponentIcon x={x} y={y} color={color} />;
}

function NodeCard({ node, isHovered, onMouseEnter, onMouseLeave, onClick }: {
  node: Node; isHovered: boolean;
  onMouseEnter: () => void; onMouseLeave: () => void; onClick: () => void;
}) {
  const cx = node.x + node.w / 2;
  const iconY = node.y + 20;
  const labelY = node.y + node.h - 20;
  const typeY = node.y + node.h - 8;

  return (
    <g style={{ cursor: "pointer" }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
      {isHovered && (
        <rect x={node.x - 3} y={node.y - 3} width={node.w + 6} height={node.h + 6} rx={9}
          fill={node.bg} stroke={node.color} strokeWidth={1.5} opacity={0.4} />
      )}
      <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={6}
        fill={isHovered ? node.bg : "#fff"} stroke={node.border} strokeWidth={isHovered ? 1.5 : 1}
        style={{ transition: "fill 0.15s, stroke-width 0.15s" }} />
      <NodeIcon icon={node.icon} x={cx} y={iconY} color={node.color} />
      <text x={cx} y={labelY} textAnchor="middle"
        fontSize={11.5} fontWeight={700} fill={node.color} fontFamily="Arial, sans-serif"
        style={{ pointerEvents: "none", userSelect: "none" }}>{node.label}</text>
      <text x={cx} y={typeY} textAnchor="middle"
        fontSize={9} fill="#94a3b8" fontFamily="Arial, sans-serif"
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
          <marker id="arrowhead" viewBox="0 0 8 6" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Tier labels */}
          {[
            { y: 55, label: "OVERSIGHT" },
            { y: 210, label: "ENGINE" },
            { y: 365, label: "INPUT GATE" },
            { y: 520, label: "ACTORS" },
            { y: 645, label: "SUPPORT" },
          ].map((t) => (
            <text key={t.label} x={950} y={t.y} textAnchor="end" fontSize={9} fontWeight={700}
              fill="#cbd5e1" letterSpacing="0.12em" fontFamily="Arial, sans-serif"
              style={{ userSelect: "none" }}>{t.label}</text>
          ))}

          {/* Adjudication zone */}
          <rect x={8} y={8} width={205} height={105} rx={8} fill="none" stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4" />
          <text x={16} y={120} fontSize={8} fill="#cbd5e1" fontWeight={600} letterSpacing="0.1em" fontFamily="Arial, sans-serif" style={{ userSelect: "none" }}>ADJUDICATION</text>

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
