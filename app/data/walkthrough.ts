export interface WalkthroughStep {
  title: string;
  body: string;
  highlightNodes: string[];
  highlightConnections: string[];
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    title: "The World Engine",
    body: "A five-tier simulation architecture for geopolitical wargaming. Player decisions flow downward through validation and processing. Consequences flow back up as role-filtered state updates. Every actor in the game, whether human teams or AI-controlled nations, is processed in a single Claude API call per round, ensuring that competing decisions are reconciled atomically rather than in separate calls that could produce contradictions.",
    highlightNodes: ["gm", "whitecell", "engine", "worldstate", "logdb", "reasoncheck", "team1", "ai_actors", "team2", "advisors_t1", "advisors_t2", "adjudication"],
    highlightConnections: ["c1","c2","c3","c4","c5","c6","c7","c8","c9","c10","c11","c12","c13","c14","c15","c16","c17","c18","c19","c20","c21","c22","c23"],
  },
  {
    title: "Players Deliberate",
    body: "Players assume geopolitical roles and consult AI advisors that each see only a filtered slice of the world state. A State Department advisor sees diplomatic channels but not congressional support levels. A Commerce advisor sees trade data but not military readiness. Players synthesize across advisors, negotiate with opposing teams and AI-controlled actors, then submit one collective free-text decision per round. The information asymmetry forces the same analytical tradeoffs real policymakers face.",
    highlightNodes: ["team1", "team2", "ai_actors", "advisors_t1", "advisors_t2"],
    highlightConnections: ["c15", "c16", "c17", "c18", "c19"],
  },
  {
    title: "The Reasonableness Check",
    body: "Before any decision reaches the engine, a lightweight filter screens for nonsensical input, out-of-character actions, or system-gaming attempts. This gate prevents expensive Opus API calls on invalid input. The filter can be rule-based or a Haiku-class LLM call. Rejected decisions return to the submitting team with an explanation, keeping the engine focused on processing genuine strategic decisions.",
    highlightNodes: ["team1", "team2", "ai_actors", "reasoncheck", "whitecell"],
    highlightConnections: ["c1", "c2", "c3", "c23"],
  },
  {
    title: "One Call, All Consequences",
    body: "The engine receives all actor decisions, the full world state, and any queued injects in a single API call. The world state is stored as markdown files, which Claude reads natively with zero serialization overhead. Claude proposes structured JSON patches. The platform validates them against constraint rules (max 15-point indicator swing, max 7 indicators changed per round) and applies them deterministically. One call means competing decisions are reconciled in the same context window.",
    highlightNodes: ["reasoncheck", "engine", "worldstate", "logdb"],
    highlightConnections: ["c4", "c7", "c8", "c9"],
  },
  {
    title: "Oversight and Control",
    body: "The Game Manager reviews every engine output before it reaches players. They hold the only complete view: all teams' indicators, the full world state, and backend event/inject tags. The White Cell Agent monitors continuously for stagnation or missed opportunities and recommends scenario injects in plain language. Approved injects queue and fire only at round boundaries, processed through the engine to keep state consistent. Players never know whether a development came from their decisions or was injected by the Game Manager.",
    highlightNodes: ["gm", "whitecell", "engine", "worldstate", "reasoncheck"],
    highlightConnections: ["c5", "c6", "c13", "c14", "c23"],
  },
  {
    title: "The Loop Closes",
    body: "After approval, updated state flows back to each team filtered by role. The same strategic landscape produces different indicator values depending on each team's position. Every decision, snapshot, narrative, and transcript is logged to PostgreSQL. The Adjudication Agent uses this full-fidelity record alongside a RAG library of case studies and policy documents for round-by-round evaluation during gameplay and comprehensive post-game analysis.",
    highlightNodes: ["worldstate", "team1", "team2", "ai_actors", "adjudication", "logdb"],
    highlightConnections: ["c10", "c11", "c12", "c20", "c21", "c22"],
  },
];
