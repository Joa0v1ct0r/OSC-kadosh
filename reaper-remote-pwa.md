# Plan: REAPER Remote PWA

Professional web interface for live audio control via OSC WebSocket bridge.

---

## 📋 Overview
- **Project Type**: WEB (PWA)
- **Primary Goal**: Low-latency, high-precision remote control for REAPER.
- **Target Audience**: Live audio engineers (Tablet focus).
- **Core aesthetic**: Technical Digital Console (Obsidian #0B0B0B, Sharp edges).

---

## 🎯 Success Criteria
- [ ] Sub-10ms UI-to-State latency.
- [ ] Functional 4-band EQ with realtime Canvas visualization (<50ms update).
- [ ] Safe-stop "Hold to Confirm" (1s) with radial progress.
- [ ] Robust WebSocket reconnection & state sync (Bidirectional).
- [ ] Full PWA capabilities (Landscape lock, no-sleep hint).

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **State/Comm**: Native WebSocket + React Context/Hooks
- **Animation**: Framer Motion (for meters and interaction feedback)
- **Visuals**: HTML5 Canvas (EQ Curve)
- **Fonts**: Inter (UI) + JetBrains Mono (Technical values)

---

## 🏗️ File Structure
```text
src/
├── api/
│   ├── websocket.ts       // WS Client & Message Dispatcher
│   └── mapping.ts         // Dynamic Plugin Parameter Mapping
├── components/
│   ├── transport/         // Transport Bar & Hold-to-confirm
│   ├── mixer/             // Channel Strip, Faders, Meters
│   ├── eq/                // EQ Panel & Canvas Curve
│   └── ui/                // Raw components (Buttons, Sliders)
├── hooks/
│   ├── useReaperState.ts  // Main hook for state sync
│   └── useHoldAction.ts   // Operational safety logic
├── store/
│   └── mixerStore.ts      // Local state management
└── styles/
    └── index.css          // Global console theme
```

---

## 📝 Task Breakdown

### Phase 1: Foundation & Communication
- [ ] **Task 1.1**: Initialize Vite project with Tailwind v4 and TypeScript.
- [ ] **Task 1.2**: Implement `WebSocketService` with reconnection logic and message queuing.
- [ ] **Task 1.3**: Create `MappingEngine` for dynamic OSC paths and PARAM_INDEX resolution.

### Phase 2: Design System & Core UI
- [ ] **Task 2.1**: Configure Theme (Colors: #0B0B0B, #1DB954, #FFD400, #FF3B3B).
- [ ] **Task 2.2**: Build `AudioFader` component (340px, precision-focused, linear-to-db scaling).
- [ ] **Task 2.3**: Build `LevelMeter` with peak hold simulation.

### Phase 3: Layout Implementation
- [ ] **Task 3.1**: `TransportBar` with "Hold to Stop" logic (1s) and radial indicator.
- [ ] **Task 3.2**: `HorizontalMixer` supporting 12+ channels with scroll optimization.
- [ ] **Task 3.3**: Channel selection and routing logic for the Plugin Panel.

### Phase 4: Advanced Plugin Control (DSP Panel)
- [ ] **Task 4.1**: `EQPanel` UI for 4 bands (Frequency, Gain, Q).
- [ ] **Task 4.2**: Implement `EQVisualizer` using Canvas for mathematical curve rendering.
- [ ] **Task 4.3**: Integrate Bidirectional OSC updates for EQ params.

### Phase 5: PWA & Operational Safety
- [ ] **Task 5.1**: Configure `manifest.json` and basic Service Worker.
- [ ] **Task 5.2**: Implement "Connection Lost" emergency overlay and double-click protection.
- [ ] **Task 5.3**: Responsive adjustments for Smartphone view.

---

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass (Tailwind v4 warnings ignored)
- Security: ✅ No critical issues (Local network only)
- Build: ✅ Success (Verified build)
- Date: 2026-02-18
