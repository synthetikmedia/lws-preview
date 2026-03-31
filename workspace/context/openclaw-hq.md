# OpenClaw HQ — Technical Spec & Implementation Plan

**Version:** 1.0  
**Author:** Devin ⚡  
**Date:** 2026-03-27  
**Status:** Ready to build

---

## 1. Recommended Tech Stack

### Winner: Tauri v2 + React + Tailwind CSS

**Why Tauri over Electron:**
- ~10MB final binary vs ~150MB for Electron — no bundled Chromium
- Uses the OS WebView (WebView2 on Windows — already installed on Win10/11)
- Rust backend = native filesystem, process, and IPC access without Node.js overhead
- Better performance, lower memory footprint
- Active development, Tauri v2 is stable and production-ready
- Cross-platform (Windows, macOS, Linux) with minimal extra work

**Why not Neutralinojs:**
- Smaller ecosystem, fewer UI libraries, less community support
- Doesn't justify the tradeoffs vs Tauri

**Full stack:**
| Layer | Choice | Reason |
|---|---|---|
| Desktop shell | Tauri v2 | Lightweight, Rust backend, WebView2 on Windows |
| UI framework | React 18 + Vite | Fast dev, huge ecosystem, great DX |
| Styling | Tailwind CSS v4 | Utility-first, easy dark mode, Vercel-like aesthetic |
| UI components | shadcn/ui (Radix primitives) | Headless, fully customizable, dark mode native |
| State management | Zustand | Minimal, no boilerplate, works great with Tauri events |
| Code editor (Config tab) | CodeMirror 6 | Best in-browser Markdown/YAML editor, lightweight |
| Markdown renderer | react-markdown + remark-gfm | For Docs tab rendering |
| HTTP client | fetch (native) | No axios needed for simple REST calls |
| WebSocket | native browser WebSocket | For real-time chat and agent status streams |
| Icons | Lucide React | Clean, minimal, MIT licensed |
| Monospace font | JetBrains Mono or Geist Mono | Dev aesthetic |

---

## 2. File / Folder Structure

```
openclaw-hq/
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri app entry point
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── files.rs          # Read/write workspace files
│   │   │   ├── agents.rs         # Query OpenClaw gateway for agent status
│   │   │   └── config.rs         # Load/save routing rules
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json           # App metadata, window config, permissions
│
├── src/                          # React frontend
│   ├── main.tsx                  # React entry
│   ├── App.tsx                   # Root layout + tab router
│   ├── index.css                 # Tailwind base + custom CSS vars
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx       # Left tab navigation
│   │   │   ├── TopBar.tsx        # App header (connection status, window controls)
│   │   │   └── StatusDot.tsx     # Online/offline indicator
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatTab.tsx       # Main chat container
│   │   │   ├── MessageList.tsx   # Scrollable message history
│   │   │   ├── MessageBubble.tsx # Individual message (user/assistant)
│   │   │   ├── ChatInput.tsx     # Textarea + send button
│   │   │   └── TypingIndicator.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectsTab.tsx   # Agent monitor container
│   │   │   ├── AgentCard.tsx     # Single agent status card
│   │   │   ├── AgentList.tsx     # List of active + recent agents
│   │   │   ├── ModelBadge.tsx    # Haiku / Sonnet / Opus pill badge
│   │   │   └── StatusBadge.tsx   # Running / Complete / Stuck badge
│   │   │
│   │   ├── config/
│   │   │   ├── ConfigTab.tsx     # Config container with sub-sections
│   │   │   ├── FileEditor.tsx    # CodeMirror wrapper for MEMORY.md / SOUL.md
│   │   │   ├── RoutingRules.tsx  # Visual editor for model routing rules
│   │   │   └── SaveButton.tsx    # Floating save indicator
│   │   │
│   │   ├── docs/
│   │   │   ├── DocsTab.tsx       # Docs browser container
│   │   │   ├── FileTree.tsx      # Left panel: memory/ directory tree
│   │   │   ├── DocViewer.tsx     # Right panel: rendered markdown
│   │   │   └── SearchBar.tsx     # Filter/search docs
│   │   │
│   │   ├── updates/
│   │   │   ├── UpdatesTab.tsx    # Updates feed container
│   │   │   ├── UpdateCard.tsx    # Single update/digest entry
│   │   │   └── UpdateFeed.tsx    # Scrollable chronological list
│   │   │
│   │   └── shared/
│   │       ├── Spinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBanner.tsx
│   │       └── Tooltip.tsx
│   │
│   ├── hooks/
│   │   ├── useGateway.ts         # WebSocket connection to OpenClaw gateway
│   │   ├── useAgents.ts          # Polling/streaming agent list
│   │   ├── useFiles.ts           # Tauri FS commands wrapper
│   │   ├── useChat.ts            # Chat session management
│   │   └── useUpdates.ts         # Updates feed state
│   │
│   ├── store/
│   │   ├── chatStore.ts          # Zustand: messages, session state
│   │   ├── agentStore.ts         # Zustand: agent list, last refresh
│   │   ├── configStore.ts        # Zustand: routing rules, file contents
│   │   └── uiStore.ts            # Zustand: active tab, sidebar state
│   │
│   ├── lib/
│   │   ├── gateway.ts            # HTTP + WS client for OpenClaw gateway
│   │   ├── markdown.ts           # Markdown parse/render utils
│   │   └── constants.ts          # Paths, endpoints, defaults
│   │
│   └── types/
│       ├── agent.ts              # Agent, SubAgent, AgentStatus types
│       ├── chat.ts               # Message, Session types
│       ├── config.ts             # RoutingRule, WorkspaceFile types
│       └── update.ts             # UpdateEntry type
│
├── public/
│   ├── icon.ico
│   └── icon.png
│
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 3. UI Component Breakdown

### Global Layout

```
┌─────────────────────────────────────────────────────┐
│ TopBar: [⚡ OpenClaw HQ]          [● Connected]  [─□✕]│
├────────┬────────────────────────────────────────────┤
│        │                                            │
│  Side  │                                            │
│  bar   │         Active Tab Content                 │
│        │                                            │
│  Chat  │                                            │
│  Proj  │                                            │
│  Conf  │                                            │
│  Docs  │                                            │
│  Upd   │                                            │
│        │                                            │
└────────┴────────────────────────────────────────────┘
```

**Sidebar:** Vertical icon+label nav, ~60px wide collapsed / 180px expanded. Active tab highlighted with accent color (e.g. `#7c3aed` purple or `#10b981` green — pick one brand color).

**TopBar:** App name left, gateway connection status right, custom window drag region (since we're using `decorations: false` in Tauri for a frameless look).

**Color palette (dark mode only):**
```
Background:    #0a0a0a (near-black)
Surface:       #111111 (cards, sidebar)
Border:        #1f1f1f
Muted text:    #6b7280
Primary text:  #f9fafb
Accent:        #7c3aed (purple) or #10b981 (green) — TBD
Success:       #22c55e
Warning:       #f59e0b
Error:         #ef4444
```

---

### Tab 1: Chat

**Layout:** Split — message list fills available height, input pinned to bottom.

**MessageBubble:**
- User messages: right-aligned, accent background
- Assistant messages: left-aligned, surface background, full markdown rendering
- Timestamps on hover
- Copy button on hover (copies raw markdown)
- Code blocks with syntax highlighting (use `rehype-highlight`)

**ChatInput:**
- Multi-line textarea (auto-expand up to 5 lines)
- `Enter` to send, `Shift+Enter` for newline
- Paste image support (future)
- Clear button when text present

**Connection behavior:**
- If gateway is offline: show "Devin is offline" banner with reconnect button
- Auto-reconnect with exponential backoff

---

### Tab 2: Projects (Agent Monitor)

**Layout:** Header row with refresh/auto-refresh toggle, scrollable card grid below.

**AgentCard fields:**
```
┌─────────────────────────────────────────────────────┐
│ [● Running]  agent:main:subagent:abc123     [Sonnet] │
│ Task: "Fetch GitHub issues for owner/repo"           │
│ Started: 2 min ago   ETA: ~5 min                     │
│ Depth: 1/3                                           │
└─────────────────────────────────────────────────────┘
```

**StatusBadge colors:**
- `running` → pulsing green dot
- `complete` → static gray dot
- `stuck` → amber dot (detected if no activity for >10min while running)
- `error` → red dot

**ModelBadge:**
- `haiku` → blue pill
- `sonnet` → purple pill  
- `opus` → gold pill

**Data source:** Poll `/api/sessions` (or equivalent) on the OpenClaw gateway every 5 seconds. Toggle for live auto-refresh.

---

### Tab 3: Config

**Layout:** Left sub-nav (MEMORY.md, SOUL.md, Routing Rules), right editor pane.

**FileEditor (MEMORY.md / SOUL.md):**
- CodeMirror 6 with Markdown mode
- Line numbers, soft wrap
- Save button (Ctrl+S shortcut)
- Unsaved changes indicator in tab
- Writes directly to filesystem via Tauri `fs` commands

**RoutingRules editor:**
```
┌─────────────────────────────────────────────────────┐
│ Agent Model Routing Rules                      [+ Add]│
├─────────────────────────────────────────────────────┤
│ When task contains:  "web research"   → haiku   [✕] │
│ When task contains:  "planning"       → opus    [✕] │
│ When task contains:  "coding"         → sonnet  [✕] │
│ Default model:       sonnet                         │
└─────────────────────────────────────────────────────┘
```

**Routing rules persistence:**
- Save to `C:\Users\canaa\.openclaw\workspace\context\routing-rules.json`
- Format:
  ```json
  {
    "rules": [
      { "keyword": "web research", "model": "claude-haiku-4-5" },
      { "keyword": "planning", "model": "claude-opus-4-6" },
      { "keyword": "coding", "model": "claude-sonnet-4-6" }
    ],
    "default": "claude-sonnet-4-6"
  }
  ```
- Devin reads this file during agent spawning to pick model automatically

---

### Tab 4: Docs

**Layout:** Two-panel — file tree left (~240px), rendered doc right.

**FileTree:**
- Lists all `.md` files in `memory/` directory
- Grouped by date (most recent first)
- Shows filename, date, size
- Click to load in viewer

**DocViewer:**
- Full markdown rendering (react-markdown + remark-gfm)
- Styled to match dark theme
- Scrollable, respects long documents
- "Open in editor" button (opens in system default or Config tab)

**SearchBar:**
- Filters FileTree in real-time by filename
- Future: full-text search via Rust grep

---

### Tab 5: Updates

**Layout:** Full-height scrollable feed, newest at top.

**UpdateCard:**
```
┌─────────────────────────────────────────────────────┐
│ 📧 Email Digest          Thu Mar 27, 2026 09:15 AM   │
│─────────────────────────────────────────────────────│
│ 3 new emails from overnight. No urgent items.        │
│ Stripe payout: $47.20 received. One spam filtered.  │
└─────────────────────────────────────────────────────┘
```

**Sources:**
- Heartbeat notes (Devin writes structured entries to `memory/updates.jsonl`)
- Email digest entries
- Daily summary files

**Format:** Devin appends to `memory/updates.jsonl` (newline-delimited JSON). App reads and renders this file, polling every 60 seconds.

---

## 4. API / Integration Points

### 4.1 OpenClaw Gateway (HTTP + WebSocket)

The gateway runs locally on `http://localhost:PORT` (default: check OpenClaw config).

**Endpoints to use:**

| Feature | Method | Endpoint | Notes |
|---|---|---|---|
| Send chat message | POST | `/v1/sessions/{id}/message` | Or WebSocket |
| Stream chat response | WS | `ws://localhost/v1/chat/stream` | SSE or WS |
| List sessions/agents | GET | `/v1/sessions` | Poll every 5s for Projects tab |
| Get session detail | GET | `/v1/sessions/{id}` | Agent card details |
| Gateway health | GET | `/health` | Connection status check |

> **Action required before build:** Map the actual OpenClaw gateway API by checking its source or docs. The endpoints above are assumed — verify with `openclaw gateway --help` or inspect the gateway source.

**Gateway port discovery:**
- Read from `openclaw.json` config OR use a fixed default
- Path: `C:\Users\canaa\AppData\Roaming\openclaw\openclaw.json` (typical location)
- Expose as a setting in Config tab

### 4.2 Filesystem (via Tauri `fs` plugin)

**Files read/written:**

| File | Tab | Operation |
|---|---|---|
| `workspace/MEMORY.md` | Config | Read + Write |
| `workspace/SOUL.md` | Config | Read + Write |
| `workspace/context/routing-rules.json` | Config | Read + Write |
| `workspace/memory/*.md` | Docs | Read only |
| `workspace/memory/updates.jsonl` | Updates | Read only (Devin writes) |

**Tauri permissions needed in `tauri.conf.json`:**
```json
{
  "plugins": {
    "fs": {
      "scope": {
        "allow": ["C:\\Users\\canaa\\.openclaw\\workspace\\**"]
      }
    }
  }
}
```

### 4.3 Updates Feed (JSONL format)

Devin writes structured update entries to `memory/updates.jsonl`:
```jsonl
{"ts": 1743000000, "type": "email_digest", "summary": "3 new emails...", "detail": "..."}
{"ts": 1743003600, "type": "heartbeat_note", "summary": "Daily brief ready", "detail": "..."}
{"ts": 1743007200, "type": "daily_summary", "summary": "Completed 4 tasks today", "detail": "..."}
```

App reads, parses, and renders this feed. Devin's heartbeat pipeline should be updated to write to this file.

---

## 5. Implementation Phases

### Phase 1 — Foundation (Week 1)
**Goal:** App boots, looks right, connects to gateway.

- [ ] Initialize Tauri v2 + React + Vite + Tailwind project
- [ ] Configure dark theme CSS variables
- [ ] Build Sidebar + TopBar layout
- [ ] Tab routing (no content yet, just shells)
- [ ] Gateway connection hook (`useGateway.ts`) with status indicator
- [ ] Gateway port config (read from file or env)
- [ ] **Deliverable:** App opens, tabs switch, connection dot shows online/offline

### Phase 2 — Chat Tab (Week 1-2)
**Goal:** Working real-time chat with Devin.

- [ ] `useChat` hook with WebSocket/SSE to gateway
- [ ] MessageList + MessageBubble with markdown rendering
- [ ] ChatInput with send + keyboard shortcuts
- [ ] Streaming response support (tokens appear as they arrive)
- [ ] Auto-scroll to bottom on new message
- [ ] Session persistence (load last N messages on open)
- [ ] **Deliverable:** Full working chat interface

### Phase 3 — Projects Tab (Week 2)
**Goal:** Live agent monitor.

- [ ] `/v1/sessions` polling hook
- [ ] AgentCard component with all fields
- [ ] StatusBadge + ModelBadge
- [ ] Auto-refresh toggle (5s interval)
- [ ] "Stuck" detection logic (no activity >10min)
- [ ] **Deliverable:** Real-time agent dashboard

### Phase 4 — Config Tab (Week 2-3)
**Goal:** Edit workspace files and routing rules in-app.

- [ ] Tauri `fs` plugin setup with proper scopes
- [ ] `useFiles` hook (read/write/watch)
- [ ] CodeMirror 6 integration for MEMORY.md / SOUL.md
- [ ] Unsaved changes tracking + Ctrl+S handler
- [ ] RoutingRules visual editor
- [ ] Save routing-rules.json
- [ ] **Deliverable:** Can edit config files without leaving the app

### Phase 5 — Docs Tab (Week 3)
**Goal:** Browse and read memory files.

- [ ] Tauri `readDir` to list `memory/*.md`
- [ ] FileTree component with date grouping
- [ ] DocViewer with styled markdown rendering
- [ ] Real-time filter search
- [ ] **Deliverable:** Full doc browser

### Phase 6 — Updates Tab (Week 3-4)
**Goal:** Updates feed working end-to-end.

- [ ] Define `updates.jsonl` schema (finalize with Devin's heartbeat system)
- [ ] Update Devin's heartbeat to write entries to this file
- [ ] UpdateFeed reader with 60s polling
- [ ] UpdateCard rendering by type
- [ ] **Deliverable:** Rolling updates history

### Phase 7 — Polish (Week 4)
- [ ] Window controls (frameless mode with custom title bar)
- [ ] App icon + branding
- [ ] Keyboard shortcuts (Ctrl+1-5 for tabs)
- [ ] Tray icon (optional: run minimized to tray)
- [ ] Error states / empty states for all tabs
- [ ] Bundle + installer (Tauri `cargo tauri build`)
- [ ] **Deliverable:** Shippable v1.0

---

## 6. Gotchas & Risks

### 🔴 Critical

**1. Gateway API shape is unknown**  
Before writing any network code, audit the actual OpenClaw gateway endpoints. Run `openclaw gateway --help` and inspect the source or network traffic. Wrong assumptions here will break Chat and Projects tabs.

**2. Tauri WebView2 on Windows**  
WebView2 is pre-installed on Windows 10/11 (October 2020+). If targeting older machines, bundle the WebView2 bootstrapper. Check: `Get-ItemProperty "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"`.

**3. File write permissions**  
Tauri's `fs` plugin uses an allowlist. Too broad = security risk; too narrow = broken. Scope it to `C:\Users\canaa\.openclaw\workspace\**` and test all write paths explicitly before shipping.

### 🟡 Medium Risk

**4. Streaming chat responses**  
OpenClaw may use SSE (Server-Sent Events) or WebSocket for streaming. SSE doesn't work natively in Tauri's WebView the same way — may need a small Rust proxy command to bridge it. Test early.

**5. Large memory/ directories**  
If `memory/` grows to hundreds of files, `readDir` + initial render will be slow. Add virtualization (react-virtual) to FileTree if needed. Non-blocking for v1 but watch for it.

**6. JSONL updates file size**  
`updates.jsonl` will grow unbounded. Add a trim step (keep last 500 entries) to the reader. Don't let it become a performance problem.

**7. Hot reload vs production paths**  
File paths in dev (Vite server) and production (Tauri bundle) behave differently. Use `import.meta.env.DEV` checks or Tauri's `path` API consistently — never hardcode relative paths.

### 🟢 Low Risk / Nice to Know

**8. CodeMirror bundle size**  
CodeMirror 6 is modular but can add ~300KB. Import only what you need (markdown language + basic setup). Use dynamic import if Config tab is rarely opened.

**9. Cross-platform paths**  
Windows uses `\`, macOS/Linux use `/`. Use Tauri's `path` plugin (e.g., `appDataDir()`) instead of hardcoded paths for any future cross-platform work.

**10. Window state persistence**  
Tauri doesn't save window size/position by default. Use `tauri-plugin-window-state` to persist this — small QoL win.

---

## 7. Quick Start Commands

```bash
# Install Tauri CLI + scaffold
cargo install tauri-cli
npm create tauri-app@latest openclaw-hq -- --template react-ts

cd openclaw-hq
npm install

# Add dependencies
npm install tailwindcss @tailwindcss/vite
npm install zustand
npm install lucide-react
npm install react-markdown remark-gfm rehype-highlight
npm install @codemirror/view @codemirror/state @codemirror/lang-markdown @codemirror/theme-one-dark

# Add Tauri plugins
cargo add tauri-plugin-fs
cargo add tauri-plugin-shell
cargo add tauri-plugin-window-state

# Dev server
npm run tauri dev

# Production build
npm run tauri build
```

---

## 8. Devin Integration Notes

The routing-rules.json file written by the Config tab should be read by Devin during subagent spawning. Suggested integration point in `AGENTS.md`:

> When spawning a subagent, check `context/routing-rules.json` for keyword matches against the task description. Use the matched model; fall back to `default` if no match.

This closes the loop between the UI config and actual agent behavior without modifying OpenClaw internals.

---

*Spec complete. Ready to scaffold.*
