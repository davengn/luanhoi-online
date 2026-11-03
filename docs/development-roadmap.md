# Development Roadmap & Multi-Agent Plan — Luân Hồi Online

## Phase 0 — Repository Audit & Architecture (Completed)
- Initialized repository, TypeScript configuration, Vite + Tailwind v4 setup, and shared contracts (`shared/types.ts`).
- Established REST API, WebSocket multiplayer protocol, and Prisma/SQLite database schemas.

## Phase 1 — Specialist Design, Lore & Asset Discovery (Parallel Subagents)
- **Agent 1 (`game-designer`)**: Author `docs/game-design.md` and `shared/gameData.ts` (12 cultivation stages, 12 merit activities with cooldowns/caps, 6 tribulations, quests, achievements, cosmetics).
- **Agent 2 (`lore-researcher`)**: Author `docs/lore-and-content.md` and `shared/loreData.ts` (all 18 Levels of Hell configurations, authentic Buddhist Wisdom Library entries, interactive moral dilemmas, NPCs).
- **Agent 3 (`art-director`)**: Author `docs/art-direction.md`, `docs/asset-manifest.md`, download/prepare CC0 3D GLB models & textures in `public/assets/`, and build `src/audio/soundEngine.ts`.

## Phase 2 — Backend Economy, Persistence & Multiplayer Server (Parallel Subagents)
- **Agent 6 (`economy-progression-dev`)**: Implement `server/database.ts` and `server/economyEngine.ts` (Merit, Karma, Ledger, 12 Ranks, 6 Tribulations, 18 Hell Redemptions).
- **Agent 5 (`multiplayer-backend-dev`)**: Implement `server/roomManager.ts` and `server/index.ts` (Express REST API + WebSocket real-time synchronization, room sharding, queue management, spatial interest management, community events).

## Phase 3 — 3D World Realms, Character System & Game HUD (Agent 4)
- **Agent 4 (`frontend-3d-dev`)**: Build `src/store/gameStore.ts`, 3D scenes (`HumanRealm.tsx`, `CelestialRealm.tsx`, `UnderworldRealm.tsx` with all 18 Hell levels, `PlayerController.tsx`, `RemotePlayers.tsx`, `CharacterModel.tsx`), and HUD/Modals (`MainHUD.tsx`, `Cinematics.tsx`, `WisdomModal.tsx`, `HellLedgerModal.tsx`, `TribulationModal.tsx`, `QuestsAndEventsModal.tsx`, `SocialAndShopModal.tsx`).

## Phase 4 — Integration, Multi-Session Browser Verification & QA (Agent 7 + Orchestrator)
- **Agent 7 (`qa-engineer`)**: Write and execute automated tests (`tests/game.test.ts`), verify multi-session WebSocket synchronization and anti-cheat rules, inspect live browser rendering and performance, and produce `docs/testing-report.md`.
