"use client";
import MermaidDiagram from "./MermaidDiagram";

const CORE_LOOP_CHART = `flowchart LR
    A["All Actor<br>Decisions"]:::input --> RC["Reasonableness<br>Check"]:::check
    RC --> B["World Engine<br>(single API call)"]:::engine
    INJ["Queued<br>Injects"]:::inject --> B
    B --> C["Global Event +<br>Per-Team Updates"]:::output
    C --> D["Game Manager<br>Reviews"]:::gm
    D -->|"approves<br>or edits"| E["Updates Applied"]:::output
    E --> F["Delivered to<br>All Teams"]:::output
    E --> G["World State<br>(MD files)"]:::state
    G -.->|"next round"| A

    classDef input fill:#EDF1F7,stroke:#043673,stroke-width:2px,color:#333
    classDef engine fill:#FDE8EC,stroke:#C41230,stroke-width:2px,color:#333
    classDef output fill:#E8F5F5,stroke:#008285,stroke-width:2px,color:#333
    classDef state fill:#E8F5F5,stroke:#008285,stroke-width:2px,color:#333
    classDef gm fill:#EDF1F7,stroke:#043673,stroke-width:2px,color:#333
    classDef inject fill:#E8F2FA,stroke:#007BC0,stroke-width:2px,color:#333
    classDef check fill:#FEF3C7,stroke:#D4A017,stroke-width:2px,color:#333`;

const ROUND_CYCLE_CHART = `flowchart TB
    R1["Round starts<br>Teams receive current state<br>(role-filtered indicators)"]:::phase
    R2["AI actors generate<br>initial positions<br>(available for negotiation)"]:::ai
    R3["Deliberation phase<br>Teams consult advisors,<br>negotiate with each other<br>and with AI actors"]:::phase
    R4["Teams submit<br>decisions (free text)"]:::phase
    R5["AI actors finalize<br>decisions (informed by<br>negotiation transcripts)"]:::ai
    R6["Reasonableness check<br>Screens all submissions<br>(Haiku-class LLM)"]:::check
    R7["Engine processes<br>all valid decisions<br>(single API call)"]:::engine
    R8["Game Manager reviews<br>Can approve or edit"]:::gm
    R9["Results delivered<br>Global event + per-team<br>indicators + narrative"]:::output

    R1 --> R2 --> R3 --> R4 --> R5 --> R6 --> R7 --> R8 --> R9
    R9 -.->|"next round"| R1

    classDef phase fill:#EDF1F7,stroke:#043673,stroke-width:2px,color:#333
    classDef ai fill:#E8F2FA,stroke:#007BC0,stroke-width:2px,color:#333
    classDef engine fill:#FDE8EC,stroke:#C41230,stroke-width:2px,color:#333
    classDef gm fill:#EDF1F7,stroke:#043673,stroke-width:2px,color:#333
    classDef output fill:#E8F5F5,stroke:#008285,stroke-width:2px,color:#333
    classDef check fill:#FEF3C7,stroke:#D4A017,stroke-width:2px,color:#333`;

const LLM_ROLE_CHART = `flowchart TB
    RC["Reasonableness Check<br>(Haiku-class LLM)<br>Filters invalid input"]:::check

    subgraph INPUT["What the Engine Receives"]
        direction TB
        SP["System Prompt<br>Scenario rules, constraints,<br>actor definitions"]:::input
        WS["Full World State<br>Global + per-team<br>markdown files"]:::state
        TD["Valid Actor Decisions<br>Human teams + AI actors<br>(passed reasonableness check)"]:::input
        INJ["Queued Injects<br>Game Manager approved,<br>plain language"]:::inject
    end

    LLM["World Engine - Claude Opus<br>(single API call)"]:::engine

    subgraph OUTPUT["What the Engine Returns"]
        direction TB
        GE["Global Event<br>What happened in the world"]:::output
        GI["Global Indicator Updates<br>Shared values (e.g. oil price)"]:::output
        TI["Per-Team Indicator Updates<br>Each team changes differently"]:::output
        TN["Per-Team Narrative<br>Role-filtered briefing"]:::output
    end

    RC --> TD
    SP & WS & TD & INJ --> LLM
    LLM --> GE & GI & TI & TN

    classDef input fill:#EDF1F7,stroke:#043673,stroke-width:2px,color:#333
    classDef engine fill:#FDE8EC,stroke:#C41230,stroke-width:2px,color:#333
    classDef output fill:#E8F5F5,stroke:#008285,stroke-width:2px,color:#333
    classDef state fill:#E8F5F5,stroke:#008285,stroke-width:2px,color:#333
    classDef inject fill:#E8F2FA,stroke:#007BC0,stroke-width:2px,color:#333
    classDef check fill:#FEF3C7,stroke:#D4A017,stroke-width:2px,color:#333`;

const WORLD_STATE_CHART = `flowchart TB
    subgraph GLOBAL["Global State (shared)"]
        direction TB
        IDX["index.md<br>Round, phase, constraints"]:::state
        SE["strategic_environment.md<br>Diplomatic, political, economic,<br>security context"]:::state
        SECTORS["Sector files (4 technology sectors)<br>batteries, semiconductors,<br>power electronics, network optics"]:::state
    end

    subgraph TEAM["Per-Team State (one per actor)"]
        direction TB
        T1["team_us.md<br>US indicators, resources, position"]:::team
        T2["team_china.md<br>China indicators, resources, position"]:::team
        TN2["team_[n].md<br>Additional actors"]:::team
    end

    subgraph PERSIST["Persistence"]
        direction TB
        LOG["decision_log.md<br>Recent rounds: full detail<br>Older rounds: summarized"]:::log
        SNAP["round_snapshots/<br>Full state saved each round"]:::log
        DB["Log DB (PostgreSQL)<br>Decisions, transcripts,<br>narratives, snapshots"]:::db
    end

    GLOBAL ~~~ TEAM
    TEAM ~~~ PERSIST

    classDef state fill:#E8F5F5,stroke:#008285,stroke-width:2px,color:#333
    classDef team fill:#EDF1F7,stroke:#043673,stroke-width:2px,color:#333
    classDef log fill:#E8F2FA,stroke:#007BC0,stroke-width:2px,color:#333
    classDef db fill:#F5F5F5,stroke:#999,stroke-width:2px,color:#333`;

const P: React.CSSProperties = {
  fontSize: 15,
  color: "#4D5051",
  lineHeight: 1.7,
  maxWidth: 720,
  marginBottom: 24,
};

function PageWrapper({
  num,
  title,
  description,
  children,
}: {
  num: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "white" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#C41230", letterSpacing: "0.5px" }}>{num}</span>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#043673", lineHeight: 1.2 }}>{title}</h2>
        </div>
        <div style={{ width: "100%", height: 2, background: "#C41230", marginBottom: 20 }} />
        <p style={P}>{description}</p>
        {children}
      </div>
    </div>
  );
}

function AgentCard({
  title,
  type,
  color,
  bg,
  borderColor,
  items,
}: {
  title: string;
  type: string;
  color: string;
  bg: string;
  borderColor: string;
  items: string[];
}) {
  return (
    <div style={{ borderRadius: 6, padding: 20, border: `2px solid ${borderColor}`, background: bg }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 4 }}>{title}</h3>
      <div style={{ fontSize: 11, color, marginBottom: 12 }}>{type}</div>
      <ul style={{ listStyle: "none", fontSize: 13, color: "#4D5051", padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ padding: "3px 0 3px 16px", position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 10,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: color,
              }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FlowContent({ tabId }: { tabId: string }) {
  switch (tabId) {
    case "core-loop":
      return (
        <PageWrapper
          num="01"
          title="Core Loop"
          description="Each round, all actors (human teams and AI actors) submit decisions. A reasonableness check screens each submission before it reaches the engine, filtering out nonsensical input and system-gaming attempts. Valid decisions enter the World Engine in a single API call, producing one global event and per-team updates. The Game Manager reviews and approves the output. Updated state and narrative are delivered to all teams."
        >
          <MermaidDiagram chart={CORE_LOOP_CHART} />
        </PageWrapper>
      );

    case "round-cycle":
      return (
        <PageWrapper
          num="02"
          title="Round Cycle"
          description="A round has distinct phases. AI actors generate positions early so human teams can negotiate with them. After all teams submit, a reasonableness check screens every submission. The round closes when the timer expires, all teams submit, or the Game Manager manually advances."
        >
          <MermaidDiagram chart={ROUND_CYCLE_CHART} />
        </PageWrapper>
      );

    case "llm-role":
      return (
        <PageWrapper
          num="03"
          title="What the LLM Does"
          description="Before reaching the engine, all actor decisions pass through a Reasonableness Check (Haiku-class LLM) that filters invalid input. The World Engine (Claude Opus) then receives valid decisions, the full world state, and any queued injects in one call. It returns a global event, indicator updates, and per-team narrative. One call, one context window, everything stays consistent."
        >
          <MermaidDiagram chart={LLM_ROLE_CHART} />
        </PageWrapper>
      );

    case "world-state":
      return (
        <PageWrapper
          num="04"
          title="World State"
          description="Two layers of markdown files: a global state that all teams share, and per-team state files reflecting each team's position. Snapshots are saved each round for post-game adjudication. Older rounds are summarized to keep context manageable. A PostgreSQL database stores the full-fidelity record of every decision, transcript, and state change."
        >
          <MermaidDiagram chart={WORLD_STATE_CHART} />
        </PageWrapper>
      );

    case "ai-agents":
      return (
        <PageWrapper
          num="05"
          title="Four AI Agents"
          description="Four distinct AI agents with separate concerns. Each has its own prompt context and API calls. They never share a context window."
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, margin: "16px 0 24px" }}>
            <AgentCard
              title="World Engine"
              type="[Core / Claude Opus]"
              color="#C41230"
              bg="#FDE8EC"
              borderColor="#C41230"
              items={[
                "Processes all valid actor decisions",
                "Receives world state + injects in single call",
                "Returns global event + per-team narrative",
                "One API call per round",
              ]}
            />
            <AgentCard
              title="Reasonableness Check"
              type="[Gate / Haiku-class LLM]"
              color="#92400e"
              bg="#FEF3C7"
              borderColor="#D4A017"
              items={[
                "Screens all submissions before the engine",
                "Catches nonsensical or out-of-character input",
                "Prevents expensive Opus calls on invalid input",
                "Can be rule-based or lightweight LLM",
              ]}
            />
            <AgentCard
              title="White Cell Agent"
              type="[Advisory / Claude LLM]"
              color="#008285"
              bg="#E8F5F5"
              borderColor="#008285"
              items={[
                "Monitors game state continuously each round",
                "Recommends scenario injects to Game Manager",
                "Injects fire only at round boundaries",
                "Game Manager approves or rejects",
              ]}
            />
            <AgentCard
              title="Adjudication Agent"
              type="[Analysis / Claude LLM]"
              color="#007BC0"
              bg="#E8F2FA"
              borderColor="#007BC0"
              items={[
                "Analyzes full game history post-game",
                "Sequential multi-call analysis",
                "Full history + RAG library of case studies",
                "Cross-team evaluation and scoring",
              ]}
            />
          </div>
        </PageWrapper>
      );

    case "events-injects":
      return (
        <PageWrapper
          num="06"
          title="Events vs. Injects"
          description="Events are consequences of player decisions, generated by the engine. Injects are scenario developments the Game Manager pushes in, described in plain language. Both go through the World Engine so the world state stays consistent. Players cannot tell which is which. The distinction is tagged in the backend log for post-game analysis."
        >
          <div style={{ background: "#043673", color: "white", padding: "8px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", borderRadius: "6px 6px 0 0", marginTop: 8 }}>
            Comparison
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, margin: "0 0 24px", background: "white", border: "1px solid #E0E0E0", borderTop: "none", borderRadius: "0 0 6px 6px", overflow: "hidden" }}>
            <tbody>
              {[
                ["Events", "Generated by the engine in response to player decisions. Organic consequences."],
                ["Injects", "Recommended by White Cell Agent, approved by Game Manager. Described in plain language, engine handles indicator math."],
                ["Both", "Processed through the World Engine to maintain world state consistency."],
                ["Player view", "Indistinguishable. Players see scenario developments without knowing the source."],
                ["Backend", 'Tagged as "event" or "inject" in the decision log for post-game analysis.'],
              ].map(([label, desc], i, arr) => (
                <tr key={i}>
                  <td style={{ padding: "8px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none", fontWeight: 600, color: "#043673", whiteSpace: "nowrap", width: 130 }}>
                    {label}
                  </td>
                  <td style={{ padding: "8px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none", color: "#4D5051" }}>
                    {desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PageWrapper>
      );

    default:
      return null;
  }
}
