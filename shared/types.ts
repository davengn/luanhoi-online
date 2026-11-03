/**
 * SHARED TYPES & TECHNICAL CONTRACTS — LUÂN HỒI ONLINE
 * Strictly enforced across Frontend (React/R3F), Multiplayer Server (WS/RoomManager),
 * and Economy & Progression Engine.
 */

export type RealmId = 'human' | 'celestial' | 'underworld';

export type RoomType =
  | 'main_temple'
  | 'meditation_hall'
  | 'heavenly_court'
  | 'tribulation_arena'
  | 'underworld_judgment'
  | 'hell_instance'
  | 'private_sanctuary';

export type CharacterArchetype =
  | 'pilgrim'
  | 'novice_monk'
  | 'guardian'
  | 'celestial_attendant'
  | 'immortal'
  | 'underworld_envoy';

export type PlayerActionState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'bow'
  | 'prostrate'
  | 'meditate'
  | 'pray_beads'
  | 'offer_incense'
  | 'offer_lotus'
  | 'celebrate'
  | 'cheer'
  | 'greet_chaptay'
  | 'ascend'
  | 'tribulation';

export interface CharacterAppearance {
  archetype: CharacterArchetype;
  robeColor: string;
  trimColor: string;
  hairstyle: 'topknot' | 'shaved' | 'flowing' | 'crowned' | 'braided';
  hairColor: string;
  auraId: string;
  accessoryId: 'none' | 'mala_beads' | 'lotus_halo' | 'celestial_ribbon' | 'dharma_staff' | 'incense_censer';
  titleId: string;
  nameplateStyle: 'wood' | 'jade' | 'gold' | 'celestial' | 'karmic_fire';
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface KarmaTransaction {
  id: string;
  timestamp: number;
  type: 'merit' | 'negative_karma' | 'redemption';
  amount: number;
  reason: string;
  sourceId: string;
  netKarmaAfter: number;
}

export interface QuestProgress {
  questId: string;
  currentCount: number;
  targetCount: number;
  completed: boolean;
  claimed: boolean;
  resetCycle: 'daily' | 'weekly' | 'story' | 'redemption';
}

export interface PlayerProfile {
  id: string;
  username: string;
  appearance: CharacterAppearance;
  // Core Currencies & Progression
  merit: number;             // Công Đức
  negativeKarma: number;     // Nghiệp Lực
  karmaBalance: number;      // Total Merit - Total Negative Karma
  exp: number;               // Kinh Nghiệm
  level: number;             // Level 1..100
  rankStage: number;         // 1..12 (Phàm Nhân -> Thiên Đạo Cảnh)
  senCurrency: number;       // Sen (Cosmetic/Collectible currency)
  tienNgoc: number;          // Tiên Ngọc (High-level achievement currency)
  // Realm & Underworld state
  currentRealm: RealmId;
  currentRoomId: string;
  hellSentenceLevel: number; // 0 if free, 1..18 if sentenced to Underworld
  completedHellLevels: number[];
  completedTribulations: string[];
  unlockedRealms: RealmId[];
  // Collections & Progress
  unlockedOutfits: string[];
  unlockedAuras: string[];
  unlockedTitles: string[];
  completedWisdomIds: string[];
  achievements: string[];
  quests: Record<string, QuestProgress>;
  karmaLedger: KarmaTransaction[];
  actionCooldowns: Record<string, number>;
  dailyActionCounts: Record<string, number>;
  position: Vector3D;
  rotationY: number;
  createdAt: number;
  updatedAt: number;
}

export interface RemotePlayerState {
  id: string;
  username: string;
  appearance: CharacterAppearance;
  rankStage: number;
  level: number;
  merit: number;
  karmaBalance: number;
  currentRealm: RealmId;
  hellSentenceLevel: number;
  position: Vector3D;
  rotationY: number;
  actionState: PlayerActionState;
  activeEmote?: string;
  chatBubble?: {
    text: string;
    expiresAt: number;
  };
}

export interface RankDefinition {
  stage: number;
  name: string;
  vietnameseTitle: string;
  minExp: number;
  minMerit: number;
  minKarmaBalance: number;
  requiredQuests: string[];
  requiredTribulationId?: string;
  unlockDescription: string;
  auraColor: string;
  grantsCelestialAccess: boolean;
}

export type MeritActivityId =
  | 'bow_buddha'
  | 'meditate_session'
  | 'prayer_beads'
  | 'offer_incense'
  | 'offer_lotus'
  | 'read_scripture'
  | 'listen_dharma'
  | 'help_npc'
  | 'group_meditation'
  | 'offer_lantern'
  | 'clean_temple'
  | 'prostration_108';

export interface MeritActivityConfig {
  id: MeritActivityId;
  name: string;
  description: string;
  baseMerit: number;
  baseExp: number;
  senReward: number;
  cooldownMs: number;
  dailySoftCap: number;
  diminishingFactor: number; // e.g., 0.5 after soft cap
  requiredRankStage: number;
  actionState: PlayerActionState;
  vfxType: 'golden_particles' | 'lotus_bloom' | 'bell_ripple' | 'incense_smoke' | 'sky_lantern' | 'aura_surge';
  zoneHint: string;
}

export interface TribulationDefinition {
  id: string;
  name: string;
  vietnameseName: string;
  type: 'lightning' | 'fire' | 'heart_demon' | 'wind' | 'karma' | 'final_heavenly';
  requiredRankStage: number;
  recommendedPartySize: number;
  durationSeconds: number;
  description: string;
  hazardMechanic: string;
  rewardMerit: number;
  rewardExp: number;
  rewardTienNgoc: number;
  unlockRankStage: number;
  unlockAuraId: string;
  unlockTitle: string;
}

export interface HellLevelConfig {
  level: number; // 1..18
  codeName: string;
  vietnameseName: string;
  englishSubtitle: string;
  karmaThreshold: number; // e.g., -100 for Level 1 down to -3500 for Level 18
  themeSin: string;
  environmentDescription: string;
  architectureStyle: string;
  colorPalette: {
    primary: string;
    secondary: string;
    fogColor: string;
    ambientLight: string;
    accentGlow: string;
  };
  ambientSoundProfile: 'whisper_echo' | 'desert_wind' | 'volcanic_storm' | 'mirror_chime' | 'collapsing_stone' | 'blizzard_howl' | 'fire_roar' | 'shifting_vault' | 'iron_chains' | 'illusion_hum' | 'dark_forest' | 'impossible_tower' | 'ruined_city' | 'swamp_miasma' | 'judgment_scale' | 'endless_fog' | 'shadow_chains' | 'avici_void';
  wardenNpc: {
    name: string;
    title: string;
    dialogueIntro: string;
    dialogueRedemption: string;
  };
  punishmentMechanic: string;
  challengeType: 'truth_labyrinth' | 'greed_renunciation' | 'anger_quell' | 'mirror_reflection' | 'bridge_of_vows' | 'soul_warmth' | 'mantra_shield' | 'return_relics' | 'unshackle_peace' | 'pierce_illusion' | 'memory_gratitude' | 'humility_descent' | 'rebuild_sanctuary' | 'lotus_purity' | 'scales_of_justice' | 'lamp_of_wisdom' | 'sever_attachment' | 'avici_awakening';
  redemptionQuest: {
    title: string;
    objective: string;
    requiredActions: number;
    reflectionPrompt: string;
    choices: {
      text: string;
      isAwakened: boolean;
      karmaRestored: number;
      feedback: string;
    }[];
  };
  exitKarmaBalance: number;
}

export interface WisdomEntry {
  id: string;
  title: string;
  category: 'four_noble_truths' | 'eightfold_path' | 'five_precepts' | 'compassion' | 'forgiveness' | 'mindfulness' | 'impermanence' | 'non_attachment' | 'karma_causality' | 'gratitude';
  traditionNote: string; // e.g. "Early Buddhist Nikāya / Āgama & Mahāyāna shared teaching"
  summaryStory: string;
  sourceCitation: string;
  dilemmaScenario: {
    npcName: string;
    situation: string;
    choices: {
      id: string;
      label: string;
      alignment: 'compassionate' | 'neutral' | 'harmful';
      meritDelta: number;
      negativeKarmaDelta: number;
      expDelta: number;
      consequenceText: string;
      teachingExplanation: string;
    }[];
  };
  reflectionQuestion: string;
}

export interface CommunityEventState {
  id: string;
  name: string;
  description: string;
  type: 'prostration_108' | 'collective_meditation' | 'lotus_lantern_festival' | 'temple_cleaning';
  currentProgress: number;
  targetProgress: number;
  activeParticipants: number;
  completedAt?: number;
  bonusMeritReward: number;
}

export interface RoomSummary {
  roomId: string;
  name: string;
  roomType: RoomType;
  realm: RealmId;
  hellLevel?: number;
  playerCount: number;
  maxCapacity: number;
  queueLength: number;
  shardIndex: number;
}

// WebSocket Protocol Messages
export type ClientToServerMessage =
  | { type: 'join_room'; playerId: string; roomType: RoomType; realm: RealmId; hellLevel?: number; preferredRoomId?: string }
  | { type: 'move'; position: Vector3D; rotationY: number; actionState: PlayerActionState }
  | { type: 'perform_activity'; activityId: MeritActivityId; targetPosition?: Vector3D }
  | { type: 'emote'; emoteId: string; actionState: PlayerActionState }
  | { type: 'quick_chat'; presetId: string; customText?: string }
  | { type: 'contribute_event'; eventId: string; amount?: number }
  | { type: 'ping'; clientTime: number };

export type ServerToClientMessage =
  | { type: 'welcome'; player: PlayerProfile; room: RoomSummary; players: RemotePlayerState[]; communityEvent: CommunityEventState }
  | { type: 'room_joined'; room: RoomSummary; players: RemotePlayerState[]; communityEvent: CommunityEventState }
  | { type: 'room_queued'; roomId: string; positionInQueue: number }
  | { type: 'world_state_delta'; players: RemotePlayerState[]; onlineTotal: number; roomPlayerCount: number }
  | { type: 'player_joined'; player: RemotePlayerState }
  | { type: 'player_left'; playerId: string }
  | { type: 'player_emote'; playerId: string; emoteId: string; actionState: PlayerActionState }
  | { type: 'player_chat'; playerId: string; username: string; text: string }
  | { type: 'profile_updated'; profile: PlayerProfile; feedback?: { title: string; meritDelta?: number; karmaDelta?: number; expDelta?: number; vfxType?: string } }
  | { type: 'ascension_broadcast'; playerId: string; username: string; newRankName: string; stage: number }
  | { type: 'karma_judgment_triggered'; playerId: string; assignedHellLevel: number; hellName: string; karmaBalance: number }
  | { type: 'hell_redemption_completed'; playerId: string; freedFromLevel: number; newKarmaBalance: number }
  | { type: 'community_event_updated'; event: CommunityEventState; milestoneReached?: boolean }
  | { type: 'error_notice'; message: string; code: string }
  | { type: 'pong'; clientTime: number; serverTime: number };
