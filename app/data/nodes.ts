export interface Node {
  id: string;
  label: string;
  type: string;
  color: string;
  bg: string;
  border: string;
  x: number;
  y: number;
  w: number;
  h: number;
  icon: "person" | "component" | "data" | "filter";
  description: string;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  label: string;
  description: string;
  style: "solid" | "dashed" | "dotted";
  waypoints?: { x: number; y: number }[];
  labelOffset?: { dx: number; dy: number };
  lineOffset?: number;
  hideLabel?: boolean;
  anchorToEdge?: boolean;
}

export const NODES: Node[] = [
  {
    id: "gm",
    label: "Game Manager",
    type: "Professor / TA",
    color: "#043673",
    bg: "#EDF1F7",
    border: "#043673",
    x: 600,
    y: 30,
    w: 210,
    h: 84,
    icon: "person",
    description:
      "Full oversight of the game. Only role with complete visibility: all teams' indicators, full world state, backend event/inject tags. Reviews engine output each round (approve or edit) before it reaches players. Receives inject recommendations from White Cell Agent and decides whether to queue them. Can manually advance rounds. Decides when the game ends.",
  },
  {
    id: "whitecell",
    label: "White Cell Agent",
    type: "Claude LLM",
    color: "#007BC0",
    bg: "#E8F2FA",
    border: "#007BC0",
    x: 310,
    y: 30,
    w: 210,
    h: 84,
    icon: "component",
    description:
      "Separate AI agent that monitors game state continuously during each round. Recommends scenario injects to the Game Manager in plain language. Game Manager approves or rejects. Approved injects queue and fire only at round boundaries, processed through the World Engine to keep state consistent. Can propose at any time, but nothing changes until the round transition.",
  },
  {
    id: "engine",
    label: "World Engine",
    type: "Claude LLM",
    color: "#C41230",
    bg: "#FDE8EC",
    border: "#C41230",
    x: 430,
    y: 220,
    w: 210,
    h: 84,
    icon: "component",
    description:
      "Central simulation engine. Receives all actor decisions, the full world state, and any queued injects in a single API call per round. Returns structured JSON: one global event, global indicator updates, per-team indicator updates, and per-team narrative. Claude proposes JSON patches; the platform validates and applies them. The engine never sees advisor conversations.",
  },
  {
    id: "worldstate",
    label: "World State",
    type: "Markdown Files",
    color: "#008285",
    bg: "#E8F5F5",
    border: "#008285",
    x: 800,
    y: 220,
    w: 210,
    h: 84,
    icon: "data",
    description:
      "Single source of truth. Two layers: Global State (strategic environment, sector files, shared indicators) and Per-Team State (each team's indicators, resources, position). Snapshots saved each round for adjudication. Older rounds summarized to keep context manageable (context compaction). Updates exactly once per round, at the round transition, after Game Manager approval.",
  },
  {
    id: "logdb",
    label: "Log / Database",
    type: "PostgreSQL",
    color: "#333333",
    bg: "#F5F5F5",
    border: "#999",
    x: 80,
    y: 220,
    w: 200,
    h: 84,
    icon: "data",
    description:
      "Full-fidelity record of the game. Stores every decision, state snapshot (before/after), narrative, AI actor actions, event/inject tags, chat logs, and negotiation transcripts. Primary data source for the Adjudication Agent. Game Manager can view the decision log during gameplay.",
  },
  {
    id: "reasoncheck",
    label: "Reasonableness Check",
    type: "Lightweight Filter",
    color: "#92400e",
    bg: "#FEF3C7",
    border: "#D4A017",
    x: 430,
    y: 400,
    w: 210,
    h: 78,
    icon: "filter",
    description:
      "Pre-filter that screens all actor decisions before they reach the World Engine. Catches nonsensical input, out-of-character actions, or system-gaming attempts before burning an Opus API call. Can be rule-based or a lightweight LLM call (Haiku-class). Rejected decisions return to the submitting team with an explanation.",
  },
  {
    id: "team1",
    label: "Player / Team 1",
    type: "e.g. United States",
    color: "#043673",
    bg: "#EDF1F7",
    border: "#043673",
    x: 80,
    y: 570,
    w: 210,
    h: 84,
    icon: "person",
    description:
      "A team of students playing a specific geopolitical role (e.g., United States). Multiple players deliberate internally, consult role-specific advisors (State Dept, DoD, IC), negotiate with other teams and AI actors, and submit one collective free-text decision per round. They see role-filtered indicators and a per-team narrative. They do not see other teams' indicators or backend tags.",
  },
  {
    id: "ai_actors",
    label: "AI Actor(s)",
    type: "AI / Human",
    color: "#007BC0",
    bg: "#E8F2FA",
    border: "#007BC0",
    x: 430,
    y: 570,
    w: 210,
    h: 84,
    icon: "component",
    description:
      "AI-controlled actors filling team seats not occupied by humans. Processed identically to human teams by the engine. Generate initial negotiation positions early in the round so human teams can engage. Finalize decisions informed by negotiation transcripts. Single-team mode = all other seats are AI. Multi-team mode = mix of human and AI seats.",
  },
  {
    id: "team2",
    label: "Player / Team 2",
    type: "e.g. China",
    color: "#043673",
    bg: "#EDF1F7",
    border: "#043673",
    x: 800,
    y: 570,
    w: 210,
    h: 84,
    icon: "person",
    description:
      "A second team playing an opposing role (e.g., China). Same interface as Team 1 but with different role-specific advisors (PRC Leadership, PLA Military, MSS Intel, Ministry of Commerce) and different filtered indicators reflecting their position. Their decisions may directly conflict with Team 1's. The engine reconciles both in a single call.",
  },
  {
    id: "advisors_t1",
    label: "Advisors (T1)",
    type: "Per-team Agents",
    color: "#007BC0",
    bg: "#E8F2FA",
    border: "#007BC0",
    x: 80,
    y: 720,
    w: 190,
    h: 78,
    icon: "component",
    description:
      "Role-specific advisors for Team 1 (e.g., State Dept, Commerce, DHS for a US team). See a filtered slice of the world state matching their domain. Airgapped: the engine never sees these conversations, and nothing said here changes game state. Players must synthesize across advisors to get the full picture.",
  },
  {
    id: "advisors_t2",
    label: "Advisors (T2)",
    type: "Per-team Agents",
    color: "#007BC0",
    bg: "#E8F2FA",
    border: "#007BC0",
    x: 820,
    y: 720,
    w: 190,
    h: 78,
    icon: "component",
    description:
      "Role-specific advisors for Team 2 (e.g., Ministry of Foreign Affairs, Ministry of Commerce for a China team). Same airgapped behavior as Team 1 advisors, but with different roles matching Team 2's position. Already built into the OGE platform.",
  },
  {
    id: "adjudication",
    label: "Adjudication Agent",
    type: "Claude LLM",
    color: "#007BC0",
    bg: "#E8F2FA",
    border: "#007BC0",
    x: 20,
    y: 30,
    w: 210,
    h: 84,
    icon: "component",
    description:
      "Provides round-by-round and post-game analysis. During gameplay, it generates per-round evaluation and suggestions that the Game Manager can use to provide feedback to teams. After the game ends, it produces a full scorecard, per-team written analysis, and cross-team synthesis. Receives state snapshots, decisions, event/inject tags, chat logs, negotiation transcripts, and a RAG library of case studies. Output always goes to the Game Manager, never directly to players.",
  },
];

export const CONNECTIONS: Connection[] = [
  { id: "c1", from: "team1", to: "reasoncheck", label: "Submit decision", description: "One collective free-text decision per round.", style: "solid", lineOffset: -20, anchorToEdge: true },
  { id: "c2", from: "team2", to: "reasoncheck", label: "Submit decision", description: "One collective free-text decision per round, may directly conflict with Team 1.", style: "solid", lineOffset: 20, anchorToEdge: true },
  { id: "c3", from: "ai_actors", to: "reasoncheck", label: "Submit decision", description: "AI decisions informed by negotiation transcripts, same check as human teams.", style: "solid" },
  { id: "c4", from: "reasoncheck", to: "engine", label: "Validated decisions", description: "Decisions that pass the filter are forwarded for processing.", style: "solid" },
  { id: "c5", from: "gm", to: "engine", label: "Approve + injects", description: "Approves engine output and includes any queued injects for next processing.", style: "solid", lineOffset: 14, labelOffset: { dx: -14, dy: -8 } },
  { id: "c6", from: "engine", to: "gm", label: "Proposed output", description: "Global event + per-team updates sent for review before reaching players.", style: "solid", lineOffset: 14, labelOffset: { dx: 14, dy: 8 } },
  { id: "c7", from: "engine", to: "worldstate", label: "Apply updates", description: "After approval, platform applies JSON patches; snapshot saved; log appended.", style: "solid", lineOffset: 16 },
  { id: "c8", from: "worldstate", to: "engine", label: "Load state", description: "Full world state (global + per-team + decision log) loaded into context.", style: "solid", lineOffset: 16 },
  { id: "c9", from: "engine", to: "logdb", label: "Log round", description: "All decisions, output, snapshots, indicators changed, event/inject tags.", style: "solid" },
  { id: "c10", from: "worldstate", to: "team1", label: "Filtered state", description: "Updated indicators filtered to Team 1's role + global event + per-team narrative.", style: "solid", hideLabel: true },
  { id: "c11", from: "worldstate", to: "team2", label: "Filtered state", description: "Same structure, filtered to Team 2's role with different indicator values.", style: "solid", hideLabel: true },
  { id: "c12", from: "worldstate", to: "ai_actors", label: "Filtered state", description: "AI actors receive role-filtered state identical to human teams.", style: "solid", hideLabel: true },
  { id: "c13", from: "whitecell", to: "gm", label: "Recommend injects", description: "Plain-language inject recommendations; Game Manager approves or rejects.", style: "solid", hideLabel: true },
  { id: "c14", from: "worldstate", to: "whitecell", label: "Game state", description: "Full state for monitoring trends, stagnation, and missed opportunities.", style: "solid", waypoints: [{ x: 905, y: 20 }, { x: 415, y: 20 }], labelOffset: { dx: 370, dy: 0 } },
  { id: "c15", from: "team1", to: "advisors_t1", label: "Advisory chat", description: "Airgapped consultation; engine never sees these conversations.", style: "dashed" },
  { id: "c16", from: "team2", to: "advisors_t2", label: "Advisory chat", description: "Same airgapped behavior, different role-specific advisors.", style: "dashed" },
  { id: "c17", from: "team1", to: "team2", label: "Negotiate", description: "Teams negotiate via platform interface; transcripts captured in log.", style: "dashed", waypoints: [{ x: 535, y: 678 }] },
  { id: "c18", from: "team1", to: "ai_actors", label: "Negotiate", description: "AI actors generate positions early; transcripts feed into AI final decisions.", style: "dashed" },
  { id: "c19", from: "team2", to: "ai_actors", label: "Negotiate", description: "Same as above from Team 2's side.", style: "dashed" },
  { id: "c20", from: "logdb", to: "adjudication", label: "Game history", description: "State snapshots, decisions, tags, chats, transcripts fed round-by-round and post-game.", style: "solid" },
  { id: "c21", from: "adjudication", to: "gm", label: "Evaluation + suggestions", description: "Round-by-round feedback suggestions and post-game analysis delivered to Game Manager, who decides what to share with teams.", style: "solid", waypoints: [{ x: 125, y: 0 }, { x: 705, y: 0 }], labelOffset: { dx: -290, dy: 0 } },
  { id: "c22", from: "team1", to: "logdb", label: "Chat logs", description: "Negotiation transcripts, advisory conversations, and team deliberations captured by the platform for adjudication.", style: "dashed" },
  { id: "c23", from: "whitecell", to: "reasoncheck", label: "Inform filter", description: "White Cell provides behavioral context and monitoring input to inform the reasonableness screening.", style: "dashed", waypoints: [{ x: 350, y: 200 }, { x: 350, y: 400 }] },
];

export const PRINCIPLES = [
  { title: "Scenario-agnostic", text: "Nothing hard-coded for any scenario. Rules injected temporarily, deleted when game ends." },
  { title: "LLM proposes, platform applies", text: "Claude returns structured JSON. Platform validates and writes updates." },
  { title: "Human in the loop", text: "Game Manager reviews every state transition before it reaches players." },
  { title: "One state change per round", text: "World state updates exactly once, at the round transition, after approval." },
  { title: "Multi-actor parity", text: "Human teams and AI actors processed identically. Single-team mode = AI filling other seats." },
  { title: "Role-filtered visibility", text: "Players see only what their role would know. Full dashboard is Game Manager only." },
  { title: "Controlled hallucination", text: "Guard the big things, let small variations add realism." },
  { title: "Context compaction", text: "Older rounds summarized, recent rounds in full detail." },
  { title: "No auto-ending", text: "Game ends when the professor decides learning objectives are met." },
];

export const ROUND_STEPS = [
  "Round starts. All teams receive role-filtered state.",
  "AI actors generate initial negotiation positions.",
  "Deliberation: teams consult advisors, negotiate with each other and AI actors.",
  "White Cell monitors state, sends inject recommendations to Game Manager.",
  "Teams submit decisions (one collective free-text decision per team).",
  "AI actors finalize decisions informed by negotiation transcripts.",
  "Round closes: timer expires, all submit early, or Game Manager advances.",
  "All decisions pass through reasonableness check.",
  "Engine processes all validated decisions + queued injects in a single API call.",
  "Game Manager reviews engine output, approves or edits.",
  "World state updates once. Snapshot saved. Log written. Results delivered.",
];
