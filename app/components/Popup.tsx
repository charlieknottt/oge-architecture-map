"use client";
import { useEffect } from "react";

interface PopupProps {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  onClose: () => void;
}

export default function Popup({ title, subtitle, description, color, onClose }: PopupProps) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}
      style={{ animation: "fadeIn 0.15s ease-out" }}>
      <div className="absolute inset-0" style={{ background: "rgba(4,54,115,0.18)", backdropFilter: "blur(2px)" }} />
      <div className="relative w-full max-w-[480px] bg-white rounded-lg overflow-hidden"
        style={{ boxShadow: "0 16px 40px -8px rgba(4,54,115,0.15), 0 0 0 1px rgba(4,54,115,0.06)", animation: "modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="px-6 pt-5 pb-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "#94a3b8" }}>{subtitle}</p>
                <h2 className="text-lg font-semibold leading-tight" style={{ color: "#0f172a" }}>{title}</h2>
              </div>
              <button onClick={onClose} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-slate-100 transition-colors" style={{ color: "#94a3b8" }} aria-label="Close">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="w-8 h-0.5 mb-4" style={{ background: color }} />
            <p className="text-[13.5px] leading-[1.7]" style={{ color: "#475569" }}>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
