# Database Schema Specification — Luân Hồi Online

## 1. Persistence Architecture
The persistence layer supports two interchangeable drivers behind a unified repository interface (`server/database.ts`):
1. **PostgreSQL + Prisma ORM** (`prisma/schema.prisma`) for containerized production deployment via `docker-compose.yml`.
2. **Embedded Transactional Store** (`data/luanhoi-db.json` with atomic write-ahead flush) so local development and automated test suites run with zero external database setup barriers.

## 2. Core Entities

### `Player`
- `id` (UUID / String, PK)
- `username` (String, indexed)
- `appearance` (JSONB: `CharacterAppearance`)
- `merit` (Int, default `0`) — Công Đức
- `negativeKarma` (Int, default `0`) — Nghiệp Lực
- `karmaBalance` (Int, computed `merit - negativeKarma`)
- `exp` (Int, default `0`)
- `level` (Int, default `1`)
- `rankStage` (Int, default `1`)
- `senCurrency` (Int, default `50`)
- `tienNgoc` (Int, default `0`)
- `currentRealm` (`human` | `celestial` | `underworld`)
- `currentRoomId` (String)
- `hellSentenceLevel` (Int, `0` when free, `1..18` when under judgment)
- `completedHellLevels` (Int[])
- `completedTribulations` (String[])
- `unlockedRealms` (String[])
- `unlockedOutfits` / `unlockedAuras` / `unlockedTitles` (String[])
- `completedWisdomIds` / `achievements` (String[])
- `quests` (JSONB map of `QuestProgress`)
- `actionCooldowns` / `dailyActionCounts` (JSONB)
- `position` (JSONB `{x, y, z}`)
- `createdAt` / `updatedAt` (Timestamp)

### `KarmaTransaction`
- `id` (UUID, PK)
- `playerId` (FK -> `Player.id`, indexed)
- `timestamp` (BigInt)
- `type` (`merit` | `negative_karma` | `redemption`)
- `amount` (Int)
- `reason` (String)
- `sourceId` (String)
- `netKarmaAfter` (Int)
