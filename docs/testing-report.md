# Luân Hồi Online — Comprehensive QA, Multiplayer & Performance Testing Report

**Document Version:** 1.0.0  
**Target System:** Luân Hồi Online (3D Social Multiplayer RPG · Merit Farming · Buddhist Wisdom · Celestial Ascension · 18 Levels of Hell)  
**Test Environment:** Windows 11 · Node.js v22 · Vite 5.4 (`http://localhost:5173`) · Express + `ws` Authoritative Server (`http://localhost:3001`) · Vitest v2.1.9 · Chrome DevTools MCP Multi-Context Browser Verification

---

## 1. Executive Summary

| Verification Domain | Test Cases / Checks | Result | Notes |
| :--- | :---: | :---: | :--- |
| **Automated Unit & Integration Tests (`tests/game.test.ts`)** | 19 / 19 | **PASS (100%)** | `npx vitest run` completed in `2.81s` with exit code `0`. |
| **TypeScript & Production Bundle Build (`npm run build`)** | Full compilation | **PASS** | `tsc --noEmit && vite build` succeeded with `0` errors. |
| **Live Multi-Session Browser & WebSocket Sync** | 2 isolated browser sessions + WS clients | **PASS** | Real-time avatar sync (`10Hz`), chat bubbles, emotes, and Community Ritual progress (`6/108`) verified across isolated contexts. |
| **3D GLB Models, PBR Textures, HDRI & Real Audio Assets** | 34 / 34 assets | **PASS (HTTP 200/206)** | 13 `.glb` models, 7 PBR textures, 3 HDRI environment maps, and 11 authentic Buddhist audio recordings verified on `http://localhost:5173/assets/*`. |
| **Server-Authoritative Anti-Cheat & Security** | 7 security vectors | **PASS** | Cooldown enforcement (`HTTP 429`), soft-cap diminishing returns, rank gating, coordinate clamping (`[-150, 150]`), `NaN`/`Infinity` rejection, and chat HTML/profanity sanitization verified. |

---

## 2. Automated Test Suite Results (`tests/game.test.ts`)

Command executed:
```bash
npx vitest run
```

Summary output:
- **Test Files:** `1 passed (1)` (`tests/game.test.ts`)
- **Tests:** `19 passed (19)`
- **Execution Time:** `2.81s` (total run duration `7.06s`)

### Suite-by-Suite Breakdown

#### Suite 1: Data Integrity & Lore Verification (4 Tests)
1. **12 Cultivation Stages (`RANKS`)**: Verified all 12 stages (`stage: 1..12`, from *Phàm Nhân* to *Thiên Đạo Cảnh*) exist in strictly ascending order of `minExp`, `minMerit`, and `minKarmaBalance`. Confirmed stages `1..6` have `grantsCelestialAccess === false` and stages `7..12` require a specific `requiredTribulationId` and grant `grantsCelestialAccess === true`.
2. **12 Merit Activities (`MERIT_ACTIVITIES`)**: Verified all 12 spiritual and communal activities (`bow_buddha`, `meditate_session`, `prayer_beads`, `offer_incense`, `offer_lotus`, `read_scripture`, `listen_dharma`, `help_npc`, `group_meditation`, `offer_lantern`, `clean_temple`, `prostration_108`) have positive `baseMerit`, `baseExp`, `senReward`, `cooldownMs >= 2000`, `dailySoftCap > 0`, and `0 < diminishingFactor < 1`.
3. **18 Levels of Hell (`HELL_LEVELS` 1..18)**: Verified all 18 levels have strictly descending negative `karmaThreshold` values (`-100` at Level 1 *Địa Ngục Vọng Ngôn* down to `-3500` at Level 18 *Địa Ngục Vô Gián / Avīci*), unique `codeName`, unique `themeSin`, unique `wardenNpc` names, valid hex `colorPalette` entries, non-empty `punishmentMechanic`, and 3-choice `redemptionQuest` dilemmas with an awakened (`isAwakened: true`) path.
4. **10 Wisdom Library Entries (`WISDOM_LIBRARY`)**: Verified all 10 core Buddhist teachings include authentic `traditionNote` (Nikāya/Āgama & Mahāyāna), scriptural `sourceCitation`, narrative stories, reflection questions, and 3-choice moral dilemmas (`compassionate`, `neutral`, `harmful`).

#### Suite 2: Server-Authoritative Merit Engine & Anti-Cheat Validation (4 Tests)
5. **Merit & Ledger Calculation**: Verified `performMeritActivity(playerId, 'bow_buddha')` increases `merit` (`+8`), `exp` (`+10`), `senCurrency` (`+2`), updates `karmaBalance` (`+8`), and appends an immutable `KarmaTransaction` (`type: 'merit'`, `sourceId: 'bow_buddha'`).
6. **Cooldown Anti-Cheat Rejection**: Verified repeating an activity before `cooldownMs` elapses is rejected by `EconomyEngine` with an anti-cheat cooldown error (and returns `HTTP 429` on `/api/economy/activity`).
7. **Daily Soft-Cap & Diminishing Returns**: Verified exceeding `dailySoftCap` (e.g., 40 daily repetitions for `bow_buddha`) sets `diminished: true` and scales down rewards according to `diminishingFactor` while preserving a positive minimum reward (`>= 1`).
8. **Cultivation Stage Requirement Gate**: Verified attempting `prostration_108` (`requiredRankStage: 3`) while at Stage 1 (*Phàm Nhân*) is rejected by the server.

#### Suite 3: Karma System, Underworld Judgment & 18 Levels of Hell Redemption (4 Tests)
9. **Compassionate Wisdom Resolution**: Verified selecting `fnt_compassionate` in `wisdom_four_noble_truths` awards `+45` Merit, `+60` EXP, `0` negative karma, and records completion in `completedWisdomIds`.
10. **Harmful Choice & Automatic Underworld Judgment**: Verified selecting `fnt_harmful` adds `+150` `negativeKarma`, dropping `karmaBalance` to `-150` (`<= -100`), setting `judgmentTriggered: true`, updating `currentRealm` to `'underworld'`, assigning `hellSentenceLevel`, and relocating the player to `hell_instance_${assignedHellLevel}`.
11. **Deterministic 18-Level Hell Threshold Mapping**: Verified `evaluateAssignedHellLevel` and `getHellLevelForKarma` map `-100` to Level 1, `-500` to Level 3, `-1500` to Level 9 (*Địa Ngục Thiết Bạo*), and `-3500` to Level 18 (*Địa Ngục Vô Gián*).
12. **Underworld Redemption & Release to Human Realm**: Verified `performHellRedemption(playerId, 9, 0, 4)` with the awakened choice restores `>= 1500` karma, logs a `'redemption'` transaction in `karmaLedger`, sets `freed: true`, clears `hellSentenceLevel = 0`, and returns the player to `'human'` realm (`main_temple_1`).

#### Suite 4: Ascension & Celestial Tribulations (2 Tests)
13. **Non-Destructive Tribulation Failure**: Verified `completeTribulation(playerId, 'trib_lightning', false)` preserves the player's existing `rankStage` and `merit` while awarding `+25` consolation EXP.
14. **Stage 1→7 Progression & Celestial Realm Unlock**: Verified sequential ascension through Stages `1..6`, confirmed Stage 7 (*Phi Thăng Giả*) blocks ascension until `trib_lightning` (*Cửu Trùng Lôi Kiếp*) is cleared, and verified that clearing `trib_lightning` + calling `attemptAscension` promotes the player to Stage 7 with `unlockedCelestial: true` and `'celestial'` in `unlockedRealms`.

#### Suite 5: Multiplayer Room Management, Sharding, Queueing & Spatial Interest Management (5 Tests)
15. **Multi-Client Room State Synchronization**: Verified two players joining `main_temple_1` receive `welcome` and `player_joined` packets and appear in each other's synchronized room state.
16. **Coordinate Clamping & Spatial Interest Filtering**: Verified `validateAndClampMovement` clamps out-of-bounds coordinates (`(500, 0, 500)`) to `[-150, 150]`, rejects `NaN`/`Infinity` vectors, and filters out remote players beyond `SPATIAL_INTEREST_RADIUS` (`90` units).
17. **Meditation Hall Capacity Queue & Automatic Promotion**: Verified filling `meditation_hall_1` to capacity (`30` players) places the 31st player into `waitingQueue` (`room_queued`, `positionInQueue: 1`), and when a slot opens, automatically promotes the queued player into `meditation_hall_1` (`room_joined`).
18. **Automatic Room Sharding (`main_temple_1` → `main_temple_2`)**: Verified filling `main_temple_1` to capacity (`60` players) automatically spawns shard `main_temple_2` (`shardIndex: 2`) for the 61st player.
19. **Community Ritual Progression, Milestone Rewards & Chat Sanitization**: Verified `contribute_event` increments ritual progress, reaching `targetProgress` broadcasts `community_event_updated` (`milestoneReached: true`), grants `bonusMeritReward` to participants, rotates to the next ritual, and `sanitizeChatMessage` strips HTML tags and masks profanity.

---

## 3. Live Multi-Session Browser & WebSocket Verification

Using `chrome-devtools-mcp` across two isolated browser contexts (`Page 1` default session and `Page 2` `isolatedContext="player_two_session"`) alongside live Node WebSocket clients against `http://localhost:5173` and `http://localhost:3001`:

1. **REST Health & Persistence Check (`GET /api/health`)**:
   - Returned `HTTP 200 OK` with `status: "ok"`, `activeRoomsCount: 23` (main temple, meditation hall, heavenly court, tribulation arena, underworld judgment hall, and 18 isolated Hell instances `hell_instance_1`..`hell_instance_18`), and active persistence (`json-atomic` fallback / PostgreSQL hybrid ready).
2. **Multi-Session Browser Verification (`http://localhost:5173`)**:
   - **Session 1 (`Thiện Hữu B10B`)**: Loaded 3D Chùa Linh Sơn scene, NPCs (*Thiền Sư Tuệ Minh*, *Tịnh Tâm Sư Cô*, *Hộ Pháp Kim Cang*), and ambient disciples (*Thiền Sinh An Nhiên*, *Đạo Hữu Minh Tâm*, *Cư Sĩ Tịnh Liên*).
   - Clicking **`[1] 🙏 Lễ Phật`** on Session 1 updated HUD metrics in real time (`Công Đức: 0 → 8`, `Nhân Quả: +0 → +8`, `EXP: 0/100 → 10/100`, `Sen: 60 → 62`), displayed the golden reward toast, played `temple_bell.ogg` + `rin_temple_chime.ogg`, and advanced the room's Community Ritual (*Đại Lễ 108 Lạy Sám Hối Cộng Đồng*) from `0/108` to `6/108`.
   - **Session 2 (`Thiện Hữu F4D8` in isolated browser context)**: Connected to `Chùa Linh Sơn — Đại Hùng Bảo Điện #1`, rendered `Thiện Hữu B10B` in the 3D scene and in the nearby players bar (`6 Đạo Hữu`), and displayed the synchronized Community Ritual progress at `6/108` (`1 đạo hữu cộng tu`).

---

## 4. Asset & Audio Integrity Audit

All 34 local assets in `public/assets/` were verified on disk and via HTTP `HEAD`/`GET` against `http://localhost:5173/assets/...`:

- **13 3D `.glb` Models (`public/assets/models/`, HTTP 200)**:
  - `buddha_statue.glb` (`112,520 B`), `temple_pagoda.glb` (`32,708 B`), `monk_pilgrim.glb` (`32,148 B`), `incense_burner.glb` (`34,720 B`), `lotus_flower.glb` (`88,632 B`), `stone_lantern.glb` (`15,412 B`), `dharma_bell.glb` (`23,296 B`), `prayer_wheel.glb` (`18,740 B`), `reincarnation_wheel.glb` (`23,844 B`), `celestial_gate.glb` (`21,848 B`), `hell_pillar.glb` (`14,552 B`), `khronos_lantern.glb` (`9,564,264 B`), `khronos_vase.glb` (`8,966,700 B`).
- **7 PBR Textures (`public/assets/textures/`, HTTP 200)**:
  - `temple_stone_albedo.png`, `temple_stone_normal.png`, `temple_wood_lacquer.png`, `gold_leaf_metallic.png`, `celestial_jade_marble.png`, `underworld_obsidian_lava.png`, `waternormals.jpg`.
- **3 HDRI Environment Maps (`public/assets/hdri/`, HTTP 200)**:
  - `human_golden_hour_env.png`, `celestial_aether_env.png`, `underworld_abyss_env.png`.
- **11 Real Buddhist Audio Recordings (`public/assets/audio/`, HTTP 200/206)**:
  - `buddham_saranam_chant.ogg` (`3.95 MB`), `buddhist_temple_ambience.ogg` (`2.38 MB`), `heart_sutra_chant.ogg` (`1.12 MB`), `temple_wind_chimes.ogg` (`1.42 MB`), `singing_bowl_long.ogg` (`911 KB`), `rin_temple_chime.ogg` (`549 KB`), `thunder_tribulation.ogg` (`411 KB`), `wooden_fish_claves.ogg` (`255 KB`), `temple_gong.ogg` (`148 KB`), `temple_bell.ogg` (`108 KB`), `wooden_fish_mo.wav` (`24.7 KB`).

---

## 5. Performance, Bundle Optimization & Anti-Cheat Audit

- **3D Rendering & Quality Scaler**: HUD provides instant switching between **Thấp (Low)**, **Vừa (Medium)**, and **Cao (High)** graphics presets, dynamically scaling WebGL pixel ratio (`dpr`), shadow maps, and particle density for smooth frame rates across integrated and discrete GPUs.
- **Spatial Interest Management**: `RoomManager` ticks at `10Hz` (`100ms`) and filters remote player updates to a `90`-unit radius (`SPATIAL_INTEREST_RADIUS = 90`), preventing `O(N²)` broadcast bottlenecks in crowded rooms.
- **Server-Authoritative Anti-Cheat**:
  - Clients cannot directly mutate `merit`, `exp`, `karmaBalance`, `senCurrency`, `tienNgoc`, or `rankStage`; all mutations occur exclusively through validated server actions.
  - Cooldowns (`cooldownMs - 200ms` network grace) and daily soft caps (`dailySoftCap`) prevent macro/packet-spamming exploits.
  - Movement packets are validated for finite numbers and clamped to `[-150, 150]`.
  - Underworld sentences (`hellSentenceLevel > 0`) are enforced server-side on `join_room` so sentenced players cannot bypass Hell redemption by requesting another realm.
