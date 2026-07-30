"use client";
import { useState, useMemo } from "react";
import ArchitectureMap from "./components/ArchitectureMap";
import WalkthroughPanel from "./components/WalkthroughPanel";
import { WALKTHROUGH_STEPS } from "./data/walkthrough";

export default function Home() {
  const [walkthroughActive, setWalkthroughActive] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const currentStep = walkthroughActive ? WALKTHROUGH_STEPS[walkthroughStep] : null;

  const activeNodes = useMemo(() => {
    if (!currentStep) return undefined;
    return new Set(currentStep.highlightNodes);
  }, [currentStep]);

  const activeConnections = useMemo(() => {
    if (!currentStep) return undefined;
    return new Set(currentStep.highlightConnections);
  }, [currentStep]);

  return (
    <main className="flex flex-col h-screen">
      <header className="shrink-0 flex items-center justify-between px-6 py-4" style={{ background: "#043673" }}>
        <div className="flex items-center gap-4">
          <img src="/cmist-logo.png" alt="CMIST Logo" className="h-12 w-auto brightness-0 invert" />
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white uppercase">World Engine Architecture</h1>
            <p className="text-sm font-medium text-white/70 tracking-wide">CMIST OGE</p>
          </div>
        </div>
        {!walkthroughActive && (
          <button
            onClick={() => { setWalkthroughStep(0); setWalkthroughActive(true); }}
            className="px-4 py-2 text-sm font-medium text-white border border-white/40 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            Walkthrough
          </button>
        )}
      </header>
      <div className="flex-1 min-h-0 flex">
        <div className="flex-1 min-h-0">
          <ArchitectureMap
            walkthroughActive={walkthroughActive}
            activeNodes={activeNodes}
            activeConnections={activeConnections}
          />
        </div>
        {walkthroughActive && currentStep && (
          <WalkthroughPanel
            step={walkthroughStep}
            totalSteps={WALKTHROUGH_STEPS.length}
            title={currentStep.title}
            body={currentStep.body}
            onPrev={() => setWalkthroughStep((s) => Math.max(0, s - 1))}
            onNext={() => {
              if (walkthroughStep >= WALKTHROUGH_STEPS.length - 1) {
                setWalkthroughActive(false);
              } else {
                setWalkthroughStep((s) => s + 1);
              }
            }}
            onSkip={() => setWalkthroughActive(false)}
          />
        )}
      </div>
    </main>
  );
}
