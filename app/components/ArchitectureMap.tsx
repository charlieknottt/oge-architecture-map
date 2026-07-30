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

function ConnectionLine({ conn, fromNode, toNode, isHovered, onMouseEnter, onMouseLeave, onClick, mode = "all" }: {
  conn: Connection; fromNode: Node; toNode: Node; isHovered: boolean;
  onMouseEnter: () => void; onMouseLeave: () => void; onClick: () => void;
  mode?: "all" | "line" | "label";
}) {
  const showLine = mode === "line" || mode === "all";
  const showLabel = mode === "label" || mode === "all";
  const dashArray = conn.style === "dashed" ? "6 4" : conn.style === "dotted" ? "2 4" : undefined;
  const labelWidth = Math.max(conn.label.length * 8 + 14, 50);
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
    const ldx = conn.labelOffset?.dx || 0;
    const ldy = conn.labelOffset?.dy || 0;
    const mx = allPts[midIdx].x + ldx;
    const my = allPts[midIdx].y + ldy;

    return (
      <g style={{ cursor: "pointer" }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
        {showLine && (
          <>
            <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={sw}
              strokeDasharray={dashArray} markerEnd="url(#arrowhead)" style={{ transition: "stroke 0.15s" }} />
            <path d={pathD} fill="none" stroke="transparent" strokeWidth={14} />
          </>
        )}
        {showLabel && !conn.hideLabel && (
          <>
            <rect x={mx - halfW} y={my - 11} width={labelWidth} height={22} rx={3} fill={isHovered ? "#C41230" : "white"}
              stroke={isHovered ? "#C41230" : "#e2e8f0"} strokeWidth={0.5} style={{ transition: "fill 0.15s" }} />
            <text x={mx} y={my + 3.5} textAnchor="middle" fontSize={13} fontWeight={600}
              fill={isHovered ? "white" : "#334155"} fontFamily="Arial, sans-serif"
              style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.15s" }}>{conn.label}</text>
          </>
        )}
      </g>
    );
  }

  const lo = conn.lineOffset || 0;
  const fromCenter = getCenter(fromNode);
  const toCenter = getCenter(toNode);
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len * lo;
  const ny = dx / len * lo;
  const fc = { x: fromCenter.x + nx, y: fromCenter.y + ny };
  const tc = { x: toCenter.x + nx, y: toCenter.y + ny };
  const p1 = getEdgePoint(fromNode, tc);
  const p2 = getEdgePoint(toNode, fc);
  if (!conn.anchorToEdge) {
    p1.x += nx; p1.y += ny;
    p2.x += nx; p2.y += ny;
  }
  const ldx = conn.labelOffset?.dx || 0;
  const ldy = conn.labelOffset?.dy || 0;
  const mx = (p1.x + p2.x) / 2 + ldx;
  const my = (p1.y + p2.y) / 2 + ldy;

  return (
    <g style={{ cursor: "pointer" }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
      {showLine && (
        <>
          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={strokeColor} strokeWidth={sw}
            strokeDasharray={dashArray} markerEnd="url(#arrowhead)" style={{ transition: "stroke 0.15s, stroke-width 0.15s" }} />
          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth={14} />
        </>
      )}
      {showLabel && !conn.hideLabel && (
        <>
          <rect x={mx - halfW} y={my - 11} width={labelWidth} height={22} rx={3} fill={isHovered ? "#C41230" : "white"}
            stroke={isHovered ? "#C41230" : "#e2e8f0"} strokeWidth={0.5} style={{ transition: "fill 0.15s" }} />
          <text x={mx} y={my + 3.5} textAnchor="middle" fontSize={11} fontWeight={600}
            fill={isHovered ? "white" : "#334155"} fontFamily="Arial, sans-serif"
            style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.15s" }}>{conn.label}</text>
        </>
      )}
    </g>
  );
}

function PersonIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(1.6)`} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={0} cy={-5} r={3.5} fill="none" stroke={color} strokeWidth={1.3} />
      <path d="M-7,7 C-7,2 -4,-1 0,-1 C4,-1 7,2 7,7" fill="none" stroke={color} strokeWidth={1.3} />
    </g>
  );
}

function DatabaseIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(1.5)`}>
      <ellipse cx={0} cy={-6} rx={8} ry={3.5} fill="none" stroke={color} strokeWidth={1.3} />
      <line x1={-8} y1={-6} x2={-8} y2={6} stroke={color} strokeWidth={1.3} />
      <line x1={8} y1={-6} x2={8} y2={6} stroke={color} strokeWidth={1.3} />
      <ellipse cx={0} cy={6} rx={8} ry={3.5} fill="none" stroke={color} strokeWidth={1.3} />
    </g>
  );
}

function ComponentIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(1.5)`} strokeLinecap="round" strokeLinejoin="round">
      <rect x={-8} y={-8} width={16} height={16} rx={3} fill="none" stroke={color} strokeWidth={1.3} />
      <circle cx={0} cy={0} r={3} fill="none" stroke={color} strokeWidth={1} />
      <line x1={0} y1={-5.5} x2={0} y2={-3} stroke={color} strokeWidth={1} />
      <line x1={0} y1={3} x2={0} y2={5.5} stroke={color} strokeWidth={1} />
      <line x1={-5.5} y1={0} x2={-3} y2={0} stroke={color} strokeWidth={1} />
      <line x1={3} y1={0} x2={5.5} y2={0} stroke={color} strokeWidth={1} />
    </g>
  );
}

function FilterIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(1.5)`} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-8,-7 L8,-7 L2,1 L2,7 L-2,9 L-2,1 Z" fill="none" stroke={color} strokeWidth={1.3} />
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
  const labelY = node.y + node.h - 14;

  return (
    <g style={{ cursor: "pointer" }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
      {isHovered && (
        <rect x={node.x - 3} y={node.y - 3} width={node.w + 6} height={node.h + 6} rx={9}
          fill={node.bg} stroke={node.color} strokeWidth={1.5} opacity={0.4} />
      )}
      <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={6}
        fill={node.bg} stroke={node.border} strokeWidth={isHovered ? 1.5 : 1}
        style={{ transition: "stroke-width 0.15s" }} />
      <NodeIcon icon={node.icon} x={cx} y={iconY} color={node.color} />
      <text x={cx} y={labelY} textAnchor="middle"
        fontSize={16} fontWeight={700} fill={node.color} fontFamily="Arial, sans-serif"
        style={{ pointerEvents: "none", userSelect: "none" }}>{node.label}</text>
    </g>
  );
}

export default function ArchitectureMap({ walkthroughActive = false, activeNodes, activeConnections }: {
  walkthroughActive?: boolean;
  activeNodes?: Set<string>;
  activeConnections?: Set<string>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 960, height: 700 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredConn, setHoveredConn] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ title: string; subtitle: string; description: string; color: string } | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setDims({ width: r.width, height: r.height });
    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setDims({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
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

  const noOp = useCallback(() => {}, []);

  useEffect(() => {
    if (walkthroughActive) {
      setPopup(null);
      setHoveredNode(null);
      setHoveredConn(null);
    }
  }, [walkthroughActive]);

  const getNodeOpacity = (nodeId: string) => {
    if (!walkthroughActive || !activeNodes) return 1;
    return activeNodes.has(nodeId) ? 1 : 0.15;
  };

  const getConnOpacity = (connId: string) => {
    if (!walkthroughActive || !activeConnections) return 1;
    return activeConnections.has(connId) ? 1 : 0.15;
  };

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
          {/* Tier scaffolding */}
          {(() => {
            const tiers = [
              { y1: 15, y2: 150, label: "OVERSIGHT" },
              { y1: 150, y2: 340, label: "ENGINE" },
              { y1: 340, y2: 510, label: "INPUT GATE" },
              { y1: 510, y2: 690, label: "ACTORS" },
              { y1: 690, y2: 820, label: "SUPPORT" },
            ];
            const railX = 1130;
            return (
              <g>
                <line x1={railX} y1={tiers[0].y1} x2={railX} y2={tiers[tiers.length - 1].y2} stroke="#043673" strokeWidth={2} opacity={0.3} />
                {tiers.map((t) => (
                  <g key={t.label}>
                    <line x1={railX - 16} y1={t.y1} x2={railX} y2={t.y1} stroke="#043673" strokeWidth={1.5} opacity={0.3} />
                    <text x={railX - 22} y={(t.y1 + t.y2) / 2 + 4} textAnchor="end" fontSize={14} fontWeight={800}
                      fill="#1e293b" opacity={0.7} letterSpacing="0.14em" fontFamily="Arial, sans-serif"
                      style={{ userSelect: "none" }}>{t.label}</text>
                  </g>
                ))}
                <line x1={railX - 16} y1={tiers[tiers.length - 1].y2} x2={railX} y2={tiers[tiers.length - 1].y2} stroke="#043673" strokeWidth={1.5} opacity={0.3} />
              </g>
            );
          })()}

          {/* Adjudication zone */}
          <g style={{ opacity: getNodeOpacity("adjudication"), transition: "opacity 0.4s ease" }}>
            <rect x={8} y={8} width={240} height={115} rx={8} fill="none" stroke="#334155" strokeWidth={1} strokeDasharray="4 4" />
            <text x={16} y={138} fontSize={10} fill="#334155" fontWeight={600} letterSpacing="0.1em" fontFamily="Arial, sans-serif" style={{ userSelect: "none" }}>ADJUDICATION</text>
          </g>

          {/* Connection lines (first pass) */}
          {CONNECTIONS.map((conn) => {
            const from = nodeMap[conn.from];
            const to = nodeMap[conn.to];
            if (!from || !to) return null;
            return (
              <g key={`${conn.id}-line`} style={{ opacity: getConnOpacity(conn.id), transition: "opacity 0.4s ease" }}>
                <ConnectionLine mode="line" conn={conn} fromNode={from} toNode={to}
                  isHovered={walkthroughActive ? false : hoveredConn === conn.id}
                  onMouseEnter={walkthroughActive ? noOp : () => setHoveredConn(conn.id)}
                  onMouseLeave={walkthroughActive ? noOp : () => setHoveredConn(null)}
                  onClick={walkthroughActive ? noOp : () => setPopup({ title: conn.label, subtitle: `${from.label} → ${to.label}`, description: conn.description, color: "#C41230" })} />
              </g>
            );
          })}

          {/* Filtered state fan label */}
          <g style={{ opacity: walkthroughActive && activeConnections ? (activeConnections.has("c10") || activeConnections.has("c11") || activeConnections.has("c12") ? 1 : 0.15) : 1, transition: "opacity 0.4s ease" }}>
            <g style={{ cursor: walkthroughActive ? "default" : "pointer" }}
              onClick={walkthroughActive ? undefined : () => setPopup({ title: "Filtered state", subtitle: "World State → All Actors", description: "Updated indicators filtered to each actor's role, plus the global event and per-team narrative. Human teams and AI actors receive the same filtered view, consistent with multi-actor parity.", color: "#008285" })}>
              <rect x={776} y={314} width={148} height={22} rx={3} fill="white" stroke="#e2e8f0" strokeWidth={0.5} />
              <text x={850} y={328.5} textAnchor="middle" fontSize={13} fontWeight={600} fill="#334155" fontFamily="Arial, sans-serif"
                style={{ pointerEvents: "none", userSelect: "none" }}>Filtered state</text>
            </g>
          </g>

          {/* Recommend injects label */}
          <g style={{ opacity: getConnOpacity("c13"), transition: "opacity 0.4s ease" }}>
            <g style={{ cursor: walkthroughActive ? "default" : "pointer" }}
              onMouseEnter={walkthroughActive ? undefined : () => setHoveredConn("c13")}
              onMouseLeave={walkthroughActive ? undefined : () => setHoveredConn(null)}
              onClick={walkthroughActive ? undefined : () => setPopup({ title: "Recommend injects", subtitle: "White Cell Agent → Game Manager", description: "Plain-language inject recommendations; Game Manager approves or rejects.", color: "#007BC0" })}>
              <rect x={524} y={57} width={82} height={30} rx={3} fill={hoveredConn === "c13" ? "#C41230" : "white"}
                stroke={hoveredConn === "c13" ? "#C41230" : "#e2e8f0"} strokeWidth={0.5} style={{ transition: "fill 0.15s" }} />
              <text x={565} y={70} textAnchor="middle" fontSize={10} fontWeight={600}
                fill={hoveredConn === "c13" ? "white" : "#334155"} fontFamily="Arial, sans-serif"
                style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.15s" }}>Recommend</text>
              <text x={565} y={82} textAnchor="middle" fontSize={10} fontWeight={600}
                fill={hoveredConn === "c13" ? "white" : "#334155"} fontFamily="Arial, sans-serif"
                style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.15s" }}>injects</text>
            </g>
          </g>

          {/* Connection labels (second pass - on top of all lines) */}
          {CONNECTIONS.map((conn) => {
            const from = nodeMap[conn.from];
            const to = nodeMap[conn.to];
            if (!from || !to) return null;
            return (
              <g key={`${conn.id}-label`} style={{ opacity: getConnOpacity(conn.id), transition: "opacity 0.4s ease" }}>
                <ConnectionLine mode="label" conn={conn} fromNode={from} toNode={to}
                  isHovered={walkthroughActive ? false : hoveredConn === conn.id}
                  onMouseEnter={walkthroughActive ? noOp : () => setHoveredConn(conn.id)}
                  onMouseLeave={walkthroughActive ? noOp : () => setHoveredConn(null)}
                  onClick={walkthroughActive ? noOp : () => setPopup({ title: conn.label, subtitle: `${from.label} → ${to.label}`, description: conn.description, color: "#C41230" })} />
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => (
            <g key={node.id} style={{ opacity: getNodeOpacity(node.id), transition: "opacity 0.4s ease" }}>
              <NodeCard node={node}
                isHovered={walkthroughActive ? false : hoveredNode === node.id}
                onMouseEnter={walkthroughActive ? noOp : () => setHoveredNode(node.id)}
                onMouseLeave={walkthroughActive ? noOp : () => setHoveredNode(null)}
                onClick={walkthroughActive ? noOp : () => setPopup({ title: node.label, subtitle: node.type, description: node.description, color: node.color })} />
            </g>
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

      {popup && !walkthroughActive && (
        <div className="popup-overlay">
          <Popup title={popup.title} subtitle={popup.subtitle} description={popup.description} color={popup.color} onClose={() => setPopup(null)} />
        </div>
      )}
    </div>
  );
}
