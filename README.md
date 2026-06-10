# OGE Architecture Map

An interactive architecture diagram for the World Engine, the LLM-driven simulation core behind the Operational Gaming Environment (OGE), a geopolitical crisis-gaming platform developed with Carnegie Mellon's CMIST.

**Live demo:** https://oge-architecture-map.vercel.app

The app renders the full system as a clickable SVG canvas: 11 components (Game Manager, World Engine LLM, World State, Teams, AI Actors, Advisors, Reasonableness Filter, White Cell Agent, Adjudication Agent, and the log/database layer) connected by 21 data-flow edges. Clicking any node or edge opens a modal explaining what that component does, what model or storage backs it, and what data crosses the boundary (JSON state patches, filtered indicators, event and inject tags).

## Why a map

Multi-agent LLM systems are hard to reason about from prose alone. This diagram is the working reference for how a player decision travels through the engine: input gating, world-state mutation, AI-actor reactions, adjudication, and logging. Each tier (Oversight, Engine, Input Gate, Actors, Support) is visually separated so the control flow reads at a glance.

## Stack

- **Next.js (App Router)**, React, TypeScript
- **Tailwind CSS** for styling
- Hand-built SVG rendering with pan, zoom (0.4x to 3x), and per-edge waypoint routing, no diagram library
- Fully static: all nodes and connections are defined in `app/data/nodes.ts`, no backend or env vars

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Notable details

- Connection labels support per-edge offsets and custom waypoints so the 21 edges stay legible without a layout engine
- Component modals document the actual interfaces: model roles (which agents are Claude-backed), storage choices (Markdown files vs PostgreSQL), and the shape of data exchanged
- Smooth wheel zoom, pan-to-fit, and backdrop-blur modals, all in plain React state
