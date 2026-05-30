import ArchitectureMap from "./components/ArchitectureMap";

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "#e2e8f0" }}>
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-sm" style={{ background: "#C41230" }} />
          <div>
            <h1 className="text-sm font-bold tracking-tight" style={{ color: "#043673" }}>World Engine Architecture</h1>
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>OGE Platform / CMIST, Carnegie Mellon University</p>
          </div>
        </div>
        <p className="text-[10px] font-medium" style={{ color: "#cbd5e1" }}>Click any node or connection for details</p>
      </header>
      <div className="flex-1 min-h-0">
        <ArchitectureMap />
      </div>
    </main>
  );
}
