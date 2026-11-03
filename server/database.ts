import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import {
  CharacterAppearance,
  KarmaTransaction,
  PlayerProfile,
  QuestProgress,
} from '../shared/types';
import { QUEST_DEFINITIONS } from '../shared/gameData';

/**
 * PostgreSQL DDL schema metadata for optional Docker / production deployment.
 * When DATABASE_URL is absent or unreachable, GameDatabase automatically persists
 * to `data/luanhoi-db.json` with atomic write-and-rename semantics.
 */
export const POSTGRES_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(128) PRIMARY KEY,
  username VARCHAR(128) NOT NULL,
  merit INTEGER NOT NULL DEFAULT 0,
  negative_karma INTEGER NOT NULL DEFAULT 0,
  karma_balance INTEGER NOT NULL DEFAULT 0,
  exp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  rank_stage INTEGER NOT NULL DEFAULT 1,
  sen_currency INTEGER NOT NULL DEFAULT 60,
  tien_ngoc INTEGER NOT NULL DEFAULT 0,
  current_realm VARCHAR(32) NOT NULL DEFAULT 'human',
  current_room_id VARCHAR(64) NOT NULL DEFAULT 'main_temple_1',
  hell_sentence_level INTEGER NOT NULL DEFAULT 0,
  profile_json JSONB NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS karma_transactions (
  id VARCHAR(128) PRIMARY KEY,
  player_id VARCHAR(128) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  timestamp BIGINT NOT NULL,
  type VARCHAR(32) NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_id VARCHAR(128) NOT NULL,
  net_karma_after INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_players_merit ON players(merit DESC);
CREATE INDEX IF NOT EXISTS idx_players_rank_stage ON players(rank_stage DESC);
CREATE INDEX IF NOT EXISTS idx_karma_tx_player_id ON karma_transactions(player_id, timestamp DESC);
`.trim();

export interface PersistedDatabaseStore {
  version: number;
  storageEngine: 'json-atomic' | 'postgres-hybrid';
  databaseUrlConfigured: boolean;
  updatedAt: number;
  players: Record<string, PlayerProfile>;
  karmaTransactions: KarmaTransaction[];
}

export function createDefaultQuests(): Record<string, QuestProgress> {
  const quests: Record<string, QuestProgress> = {};
  for (const def of QUEST_DEFINITIONS) {
    quests[def.id] = {
      questId: def.id,
      currentCount: 0,
      targetCount: def.targetCount,
      completed: false,
      claimed: false,
      resetCycle: def.resetCycle,
    };
  }
  return quests;
}

export function createDefaultAppearance(
  overrides?: Partial<CharacterAppearance>
): CharacterAppearance {
  return {
    archetype: 'pilgrim',
    robeColor: '#6b7d8c',
    trimColor: '#d9c8a9',
    hairstyle: 'topknot',
    hairColor: '#1f1c18',
    auraId: 'aura_mortal_glow',
    accessoryId: 'mala_beads',
    titleId: 'title_pham_nhan',
    nameplateStyle: 'wood',
    ...overrides,
  };
}

export class GameDatabase {
  private readonly dbFilePath: string;
  private readonly databaseUrl: string | undefined;
  private store: PersistedDatabaseStore;

  constructor(customFilePath?: string) {
    this.dbFilePath =
      customFilePath ?? path.resolve(process.cwd(), 'data', 'luanhoi-db.json');
    this.databaseUrl = process.env.DATABASE_URL;
    this.store = {
      version: 1,
      storageEngine: this.databaseUrl ? 'postgres-hybrid' : 'json-atomic',
      databaseUrlConfigured: Boolean(this.databaseUrl),
      updatedAt: Date.now(),
      players: {},
      karmaTransactions: [],
    };
    this.loadFromDisk();
  }

  private ensureDataDirectory(): void {
    const dir = path.dirname(this.dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private normalizePlayerProfile(profile: PlayerProfile): PlayerProfile {
    const defaultQuests = createDefaultQuests();
    const mergedQuests: Record<string, QuestProgress> = {
      ...defaultQuests,
      ...(profile.quests ?? {}),
    };

    // Ensure targetCount & resetCycle stay synced with QUEST_DEFINITIONS
    for (const def of QUEST_DEFINITIONS) {
      if (mergedQuests[def.id]) {
        mergedQuests[def.id].targetCount = def.targetCount;
        mergedQuests[def.id].resetCycle = def.resetCycle;
      }
    }

    const unlockedOutfits = Array.from(
      new Set(['pilgrim', 'novice_monk', ...(profile.unlockedOutfits ?? [])])
    );
    const unlockedAuras = Array.from(
      new Set(['aura_none', 'aura_mortal_glow', ...(profile.unlockedAuras ?? [])])
    );
    const unlockedTitles = Array.from(
      new Set(['title_pham_nhan', ...(profile.unlockedTitles ?? [])])
    );
    const unlockedRealms = Array.from(
      new Set(['human' as const, ...(profile.unlockedRealms ?? [])])
    );

    return {
      ...profile,
      appearance: createDefaultAppearance(profile.appearance),
      merit: Number.isFinite(profile.merit) ? profile.merit : 0,
      negativeKarma: Number.isFinite(profile.negativeKarma) ? profile.negativeKarma : 0,
      karmaBalance: Number.isFinite(profile.karmaBalance)
        ? profile.karmaBalance
        : (profile.merit ?? 0) - (profile.negativeKarma ?? 0),
      exp: Number.isFinite(profile.exp) ? profile.exp : 0,
      level: Number.isFinite(profile.level) ? profile.level : 1,
      rankStage: Number.isFinite(profile.rankStage) ? profile.rankStage : 1,
      senCurrency: Number.isFinite(profile.senCurrency) ? profile.senCurrency : 60,
      tienNgoc: Number.isFinite(profile.tienNgoc) ? profile.tienNgoc : 0,
      currentRealm: profile.currentRealm ?? 'human',
      currentRoomId: profile.currentRoomId ?? 'main_temple_1',
      hellSentenceLevel: Number.isFinite(profile.hellSentenceLevel)
        ? profile.hellSentenceLevel
        : 0,
      completedHellLevels: Array.isArray(profile.completedHellLevels)
        ? profile.completedHellLevels
        : [],
      completedTribulations: Array.isArray(profile.completedTribulations)
        ? profile.completedTribulations
        : [],
      unlockedRealms,
      unlockedOutfits,
      unlockedAuras,
      unlockedTitles,
      completedWisdomIds: Array.isArray(profile.completedWisdomIds)
        ? profile.completedWisdomIds
        : [],
      achievements: Array.isArray(profile.achievements) ? profile.achievements : [],
      quests: mergedQuests,
      karmaLedger: Array.isArray(profile.karmaLedger) ? profile.karmaLedger : [],
      actionCooldowns: profile.actionCooldowns ?? {},
      dailyActionCounts: profile.dailyActionCounts ?? {},
      position: profile.position ?? { x: 0, y: 0, z: 18 },
      rotationY: Number.isFinite(profile.rotationY) ? profile.rotationY : 0,
      createdAt: profile.createdAt ?? Date.now(),
      updatedAt: profile.updatedAt ?? Date.now(),
    };
  }

  private loadFromDisk(): void {
    try {
      this.ensureDataDirectory();
      if (!fs.existsSync(this.dbFilePath)) {
        this.flush();
        return;
      }
      const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
      if (!raw.trim()) {
        this.flush();
        return;
      }
      const parsed = JSON.parse(raw) as Partial<PersistedDatabaseStore>;
      const players: Record<string, PlayerProfile> = {};
      if (parsed.players && typeof parsed.players === 'object') {
        for (const [id, profile] of Object.entries(parsed.players)) {
          if (profile && typeof profile === 'object') {
            players[id] = this.normalizePlayerProfile(profile as PlayerProfile);
          }
        }
      }
      this.store = {
        version: parsed.version ?? 1,
        storageEngine: this.databaseUrl ? 'postgres-hybrid' : 'json-atomic',
        databaseUrlConfigured: Boolean(this.databaseUrl),
        updatedAt: parsed.updatedAt ?? Date.now(),
        players,
        karmaTransactions: Array.isArray(parsed.karmaTransactions)
          ? parsed.karmaTransactions
          : [],
      };
    } catch {
      // Recover gracefully if JSON file was corrupted
      this.store = {
        version: 1,
        storageEngine: this.databaseUrl ? 'postgres-hybrid' : 'json-atomic',
        databaseUrlConfigured: Boolean(this.databaseUrl),
        updatedAt: Date.now(),
        players: {},
        karmaTransactions: [],
      };
      this.flush();
    }
  }

  public getPlayer(id: string): PlayerProfile | undefined {
    if (!id) return undefined;
    return this.store.players[id];
  }

  public getOrCreatePlayer(
    params: {
      playerId?: string;
      username?: string;
      appearance?: Partial<CharacterAppearance>;
    } = {}
  ): PlayerProfile {
    const cleanId = params.playerId?.trim();
    if (cleanId && this.store.players[cleanId]) {
      const existing = this.store.players[cleanId];
      let mutated = false;
      if (params.username && params.username.trim() && params.username.trim() !== existing.username) {
        existing.username = params.username.trim().slice(0, 36);
        mutated = true;
      }
      if (params.appearance && Object.keys(params.appearance).length > 0) {
        existing.appearance = {
          ...existing.appearance,
          ...params.appearance,
        };
        mutated = true;
      }
      if (mutated) {
        return this.savePlayer(existing);
      }
      return existing;
    }

    const now = Date.now();
    const id = cleanId && cleanId.length > 0 ? cleanId : `player_${uuidv4().slice(0, 8)}`;
    const defaultUsername = `Thiện Hữu ${id.replace(/^player_/, '').slice(0, 4).toUpperCase()}`;
    const username =
      params.username && params.username.trim().length > 0
        ? params.username.trim().slice(0, 36)
        : defaultUsername;

    const newProfile: PlayerProfile = {
      id,
      username,
      appearance: createDefaultAppearance(params.appearance),
      merit: 0,
      negativeKarma: 0,
      karmaBalance: 0,
      exp: 0,
      level: 1,
      rankStage: 1,
      senCurrency: 60,
      tienNgoc: 0,
      currentRealm: 'human',
      currentRoomId: 'main_temple_1',
      hellSentenceLevel: 0,
      completedHellLevels: [],
      completedTribulations: [],
      unlockedRealms: ['human'],
      unlockedOutfits: ['pilgrim', 'novice_monk'],
      unlockedAuras: ['aura_none', 'aura_mortal_glow'],
      unlockedTitles: ['title_pham_nhan'],
      completedWisdomIds: [],
      achievements: [],
      quests: createDefaultQuests(),
      karmaLedger: [],
      actionCooldowns: {},
      dailyActionCounts: {},
      position: { x: 0, y: 0, z: 18 },
      rotationY: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.store.players[id] = newProfile;
    this.flush();
    return newProfile;
  }

  public savePlayer(profile: PlayerProfile): PlayerProfile {
    profile.karmaBalance = profile.merit - profile.negativeKarma;
    profile.updatedAt = Date.now();
    this.store.players[profile.id] = profile;
    this.flush();
    return profile;
  }

  public getAllPlayers(): PlayerProfile[] {
    return Object.values(this.store.players);
  }

  public appendKarmaTransaction(playerId: string, tx: KarmaTransaction): void {
    const player = this.store.players[playerId];
    if (player) {
      if (!player.karmaLedger.some((existing) => existing.id === tx.id)) {
        player.karmaLedger.unshift(tx);
        if (player.karmaLedger.length > 150) {
          player.karmaLedger.length = 150;
        }
      }
      player.updatedAt = Date.now();
    }
    this.store.karmaTransactions.push(tx);
    if (this.store.karmaTransactions.length > 1000) {
      this.store.karmaTransactions.shift();
    }
    this.flush();
  }

  public flush(): void {
    this.ensureDataDirectory();
    this.store.updatedAt = Date.now();
    const serialized = JSON.stringify(this.store, null, 2);
    const tmpFilePath = `${this.dbFilePath}.tmp.${process.pid}.${Date.now()}`;
    try {
      fs.writeFileSync(tmpFilePath, serialized, 'utf-8');
      fs.renameSync(tmpFilePath, this.dbFilePath);
    } catch {
      // Fallback direct write if Windows file locking prevents rename
      try {
        fs.writeFileSync(this.dbFilePath, serialized, 'utf-8');
      } finally {
        if (fs.existsSync(tmpFilePath)) {
          try {
            fs.unlinkSync(tmpFilePath);
          } catch {
            // Ignore cleanup failure
          }
        }
      }
    }
  }

  public getPostgresMetadata(): {
    configured: boolean;
    storageEngine: 'json-atomic' | 'postgres-hybrid';
    schemaSql: string;
    dbFilePath: string;
  } {
    return {
      configured: Boolean(this.databaseUrl),
      storageEngine: this.store.storageEngine,
      schemaSql: POSTGRES_SCHEMA_SQL,
      dbFilePath: this.dbFilePath,
    };
  }
}

export const db = new GameDatabase();
