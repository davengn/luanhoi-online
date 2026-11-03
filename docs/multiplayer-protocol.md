# Multiplayer Protocol Specification — Luân Hồi Online

## 1. Transport & Connection Lifecycle
- **Endpoint**: `ws://<host>:3001/ws` (proxied via `/ws` in Vite dev server).
- **Handshake**:
  1. Client authenticates or creates a profile via `POST /api/auth/session`.
  2. Client opens WebSocket connection and immediately sends `join_room` with `playerId`, `roomType`, `realm`, and optional `hellLevel`.
  3. Server validates that the requested realm/room matches the player's eligibility (e.g., players sentenced to Hell are routed to their assigned `hell_instance`; players without rank stage >= 7 cannot enter `heavenly_court`).
  4. Server replies with `welcome` or `room_queued` (if the specific room is at capacity and not auto-sharded).

## 2. Room Types & Sharding Rules
| Room Type | Realm | Max Capacity | Auto-Shard | Description |
|---|---|---|---|---|
| `main_temple` | `human` | 60 | Yes | Main Phàm Giới Temple Complex |
| `meditation_hall` | `human` | 30 | No (Queue) | Focused quiet hall with meditation bonus |
| `heavenly_court` | `celestial` | 50 | Yes | Thiên Đình Floating Palaces |
| `tribulation_arena` | `celestial` | 8 | Yes (Party) | Co-op / Solo Celestial Trial Arena |
| `underworld_judgment` | `underworld` | 40 | Yes | Âm Phủ Judgment Hall & River Vọng Xuyên |
| `hell_instance` | `underworld` | 25 | Yes (Per Floor) | Isolated 18 Levels of Hell instances |
| `private_sanctuary` | `human` | 10 | Invitation | Personal/Private Meditation Sanctuary |

## 3. Spatial Interest Management & Tick Rate
- Client sends `move` packets throttled to 10–15 Hz when position or action state changes.
- Server validates movement speed (`maxDelta <= 25 units/sec`) to prevent teleportation exploits.
- Server broadcasts `world_state_delta` at 10 Hz containing only players within the same room shard and within the spatial interest radius (`85m`), sorted by proximity.

## 4. Synchronized Rituals & Broadcasts
- **Community Events (`contribute_event`)**: Synchronizes room-wide rituals (`108 Prostrations`, `Collective Meditation`, `Lotus Lantern Festival`, `Temple Cleaning`). When `currentProgress >= targetProgress`, all participants in the room receive a `community_event_updated` milestone broadcast and bonus Công Đức.
- **Ascension (`ascension_broadcast`)**: When a player ascends to a new stage, nearby players see a golden beam and banner announcement.
- **Karma Judgment (`karma_judgment_triggered`)**: When net karma drops below `-100`, the server triggers a judgment sequence and transfers the player to the appropriate underworld floor.
