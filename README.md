# Miaunolog — WebMCP Challenge Edition

Miaunolog is a cat-behavior interpretation app that combines vocalization, body language, context, and cat-specific profile data.

For the OpenAI WebMCP Challenge, Miaunolog exposes the same client-side profile, decoder, and journal used by the human-facing app as structured WebMCP tools. A browser agent can read the active cat profile, run the existing behavior decoder, and write the resulting observation into the same local journal the person sees.

## Live demo

**App:** https://miaunolog-webmcp.vercel.app/

**WebMCP workspace:** https://miaunolog-webmcp.vercel.app/webmcp

## Human + agent workflow

The human workflow is:

`Cat profile → behavior + context → interpretation → journal`

The agent workflow uses the same state and the same decoder:

`get_cat_profile → interpret_cat_behavior → add_behavior_observation → live journal update`

This is the central idea of the project: **the person and the browser agent operate on one shared application state rather than parallel demo data.**

## WebMCP tools

### `get_cat_profile`
Read-only.

Reads the active or selected Miaunolog cat profile from the current browser session.

### `interpret_cat_behavior`
Read-only.

Maps agent-facing behavior inputs to Miaunolog's existing internal IDs and runs the existing `decode()` logic. It does not write to the journal.

### `add_behavior_observation`
Writes local application state.

Runs the same decoder and saves the resulting interpretation to the active or selected cat's existing local journal. The journal UI updates immediately through the `miaunolog-journal-change` event.

## Why WebMCP matters here

Without WebMCP, an agent would need to infer the app's controls and reproduce the workflow through UI interaction.

With WebMCP, Miaunolog exposes explicit, typed actions tied directly to its real application logic:

- profile lookup is deterministic;
- interpretation uses the existing decoder rather than a prompt-side imitation;
- journal writes use the existing persistence layer;
- the human sees the agent's write in the same UI immediately;
- no separate backend or agent-only data store is required.

## Demo scenario

Create or activate a cat profile, open `/webmcp`, then ask a WebMCP-capable browser agent:

> Read my active cat profile. Interpret a meow with flat ears at the window at night. If the result is defensive, add that observation to the journal with the note “WebMCP demo”.

In the validated challenge flow, Miaunolog returns a defensive interpretation (`Fear`, `High`, approximately `82% confidence`) and the observation appears live in the journal.

## Architecture

```text
Browser agent
    │
    ▼
document.modelContext
    │
    ├── get_cat_profile ──────────────┐
    │                                 │
    ├── interpret_cat_behavior ──► decode()
    │                                 │
    └── add_behavior_observation ─► decode()
                                      │
                                      ▼
                                 local journal
                                      │
                                      ▼
                               React UI live update
```

WebMCP registration is implemented in `src/lib/webmcp.ts` with `document.modelContext.registerTool(...)`.

The WebMCP layer is intentionally thin: it adapts structured agent-facing inputs to the existing Miaunolog domain model and reuses the existing application functions.

## Existing Miaunolog features

- rule-based decoder for sound + body language + context;
- defensive body signals retain priority over generic profile or sound cues;
- cat profiles with personalized weighting;
- 16-vocalization catalog;
- body-language reference;
- microphone recording and audio-file upload;
- local journal;
- local persistence with `localStorage` and `IndexedDB`.

## Privacy and persistence

Miaunolog is client-side for this challenge edition.

- Cat profiles and journal entries are stored locally in `localStorage`.
- Audio clips are stored locally in `IndexedDB`.
- The WebMCP tools reuse that local state.
- The challenge workflow does not require a backend.

## Running locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Testing WebMCP in Chrome

WebMCP is experimental. For local Chrome testing:

1. Open `chrome://flags/#enable-webmcp-testing`.
2. Enable **WebMCP testing**.
3. Relaunch Chrome.
4. Open `/webmcp`.

The page reports whether WebMCP is available in the current browser.

You can inspect registered tools from DevTools:

```js
(await document.modelContext.getTools()).map((tool) => tool.name)
```

Expected tools:

```text
add_behavior_observation
get_cat_profile
interpret_cat_behavior
```

## Stack

- Vite
- React 19
- TypeScript
- TanStack Router
- Tailwind CSS 4
- WebMCP Imperative API
- Vercel

## Challenge scope

This repository is a focused **Miaunolog WebMCP Edition** built from an existing Miaunolog prototype. The challenge work intentionally concentrates on the human-agent shared workflow rather than completing every planned feature of the broader application.

The WebMCP integration was validated end-to-end on the deployed app: tool discovery, profile read, decoder execution, journal write, and live UI update.
