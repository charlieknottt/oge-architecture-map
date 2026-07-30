"use client";

interface WalkthroughPanelProps {
  step: number;
  totalSteps: number;
  title: string;
  body: string;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export default function WalkthroughPanel({ step, totalSteps, title, body, onPrev, onNext, onSkip }: WalkthroughPanelProps) {
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  return (
    <div className="w-[340px] shrink-0 flex flex-col bg-white"
      style={{ borderLeft: "1px solid #e2e8f0", animation: "slideInRight 0.3s ease-out" }}>
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#94a3b8" }}>
          Step {step + 1} of {totalSteps}
        </span>
        <button
          onClick={onSkip}
          className="text-sm font-medium px-3 py-1.5 rounded-md cursor-pointer hover:bg-red-50 transition-colors"
          style={{ color: "#C41230", border: "1px solid #C41230" }}
        >
          Skip
        </button>
      </div>

      <div className="mx-6 h-[2px]" style={{ background: "#C41230" }} />

      <div key={step} className="flex-1 px-6 pt-5 overflow-y-auto" style={{ animation: "fadeIn 0.3s ease" }}>
        <h2 className="text-xl font-bold mb-4 leading-tight" style={{ color: "#0f172a" }}>{title}</h2>
        <p className="text-[14px] leading-[1.8]" style={{ color: "#475569" }}>{body}</p>
      </div>

      <div className="px-6 pb-5 pt-4">
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors duration-300"
              style={{ background: i === step ? "#C41230" : "#e2e8f0" }}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="flex-1 py-2.5 text-sm font-medium rounded-md transition-colors"
            style={{
              color: isFirst ? "#cbd5e1" : "#043673",
              border: `1px solid ${isFirst ? "#e2e8f0" : "#043673"}`,
              background: "white",
              cursor: isFirst ? "not-allowed" : "pointer",
            }}
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-2.5 text-sm font-medium rounded-md text-white cursor-pointer transition-colors hover:opacity-90"
            style={{ background: "#043673" }}
          >
            {isLast ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
