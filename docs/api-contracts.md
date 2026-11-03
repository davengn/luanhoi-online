# REST API Contracts — Luân Hồi Online

All stateful progression, merit farming, moral choices, tribulations, and underworld redemption actions are **server-authoritative**. The client never mutates `merit`, `negativeKarma`, `exp`, or `rankStage` directly.

## 1. Endpoints (`http://localhost:3001/api`)

### `GET /api/health`
Returns server status, active rooms, total connected players, and persistence status.

### `POST /api/auth/session`
Creates or resumes a persistent player profile.
- **Request**: `{ playerId?: string, username?: string, appearance?: Partial<CharacterAppearance> }`
- **Response**: `{ player: PlayerProfile, availableRooms: RoomSummary[] }`

### `GET /api/player/:id`
Fetches the latest server-authoritative `PlayerProfile` and `KarmaTransaction[]` ledger.

### `POST /api/player/:id/customize`
Updates character appearance or unlocks cosmetics using earned `senCurrency` or `tienNgoc`.
- **Request**: `{ appearance?: Partial<CharacterAppearance>, unlockItemId?: string, unlockType?: 'outfit' | 'aura' | 'title' }`
- **Response**: `{ player: PlayerProfile, message: string }`

### `POST /api/economy/activity`
Executes a validated merit-farming activity (`bow_buddha`, `meditate_session`, `prayer_beads`, `offer_incense`, `offer_lotus`, `read_scripture`, `listen_dharma`, `help_npc`, `group_meditation`, `offer_lantern`, `clean_temple`, `prostration_108`).
- Enforces cooldowns (`cooldownMs`), daily soft caps (`dailySoftCap`), and diminishing returns (`diminishingFactor`).
- **Request**: `{ playerId: string, activityId: MeritActivityId }`
- **Response**: `{ player: PlayerProfile, meritEarned: number, expEarned: number, senEarned: number, diminished: boolean, message: string }`

### `POST /api/economy/wisdom-choice`
Resolves an interactive Wisdom Library moral dilemma or story choice.
- Can grant `merit` (compassionate choice) or accumulate `negativeKarma` (harmful/deceptive choice).
- Automatically evaluates Karma Judgment threshold (`karmaBalance <= -100`).
- **Request**: `{ playerId: string, wisdomId: string, choiceId: string }`
- **Response**: `{ player: PlayerProfile, outcome: { meritDelta: number, negativeKarmaDelta: number, expDelta: number, judgmentTriggered: boolean, assignedHellLevel: number, explanation: string } }`

### `POST /api/economy/ascend`
Validates and performs rank ascension to the next cultivation stage (`1..12`).
- Checks `minExp`, `minMerit`, `minKarmaBalance`, and required tribulations.
- **Request**: `{ playerId: string }`
- **Response**: `{ player: PlayerProfile, newRank: RankDefinition, unlockedCelestial: boolean }`

### `POST /api/economy/tribulation`
Completes or records a Celestial Tribulation trial (`lightning`, `fire`, `heart_demon`, `wind`, `karma`, `final_heavenly`).
- **Request**: `{ playerId: string, tribulationId: string, success: boolean, score: number }`
- **Response**: `{ player: PlayerProfile, rewardMerit: number, rewardExp: number, rewardTienNgoc: number, message: string }`

### `POST /api/economy/hell-redemption`
Completes a redemption action or wisdom awakening inside one of the 18 Levels of Hell.
- Reduces `negativeKarma`, records a `redemption` transaction in the Karma Ledger, and frees the player back to `human` realm once `karmaBalance >= exitKarmaBalance`.
- **Request**: `{ playerId: string, hellLevel: number, choiceIndex?: number, actionProgress?: number }`
- **Response**: `{ player: PlayerProfile,karmaRestored: number, freed: boolean, message: string }`

### `POST /api/economy/quest-claim`
Claims rewards for a completed daily, weekly, or story quest.
- **Request**: `{ playerId: string, questId: string }`
- **Response**: `{ player: PlayerProfile, rewardMerit: number, rewardExp: number, rewardSen: number }`

### `GET /api/rooms`
Lists all active multiplayer room shards, player counts, and queue depths.
