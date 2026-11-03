import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { WebSocket } from 'ws';
import {
  ClientToServerMessage,
  MeritActivityId,
  ServerToClientMessage,
} from '../shared/types';
import {
  COSMETIC_CATALOG,
  KARMA_JUDGMENT_CONFIG,
  MERIT_ACTIVITIES,
  QUEST_DEFINITIONS,
  RANKS,
  TRIBULATIONS,
  evaluateAssignedHellLevel,
} from '../shared/gameData';
import {
  HELL_LEVELS,
  WISDOM_LIBRARY,
  WORLD_NPCS,
  getHellLevelForKarma,
} from '../shared/loreData';
import { GameDatabase, db } from '../server/database';
import { EconomyEngine } from '../server/economyEngine';
import {
  RoomManager,
  SPATIAL_INTEREST_RADIUS,
  WORLD_COORDINATE_LIMIT,
  sanitizeChatMessage,
} from '../server/roomManager';

/**
 * Lightweight mock WebSocket for deterministic multi-client RoomManager verification
 */
class MockWebSocket {
  public readyState = 1; // OPEN
  public sentMessages: ServerToClientMessage[] = [];

  public send(data: string): void {
    if (this.readyState === 1) {
      this.sentMessages.push(JSON.parse(data) as ServerToClientMessage);
    }
  }

  public close(): void {
    this.readyState = 3; // CLOSED
  }

  public on(): void {
    // No-op for direct handleClientMessage invocation
  }

  public clearMessages(): void {
    this.sentMessages = [];
  }

  public asWebSocket(): WebSocket {
    return this as unknown as WebSocket;
  }
}

const DEFAULT_DB_PATH = path.resolve(process.cwd(), 'data', 'luanhoi-db.json');
const TEMP_TEST_DB_PATH = path.resolve(
  process.cwd(),
  'data',
  `luanhoi-test-${process.pid}.json`
);

let originalDbBackup: string | null = null;

beforeAll(() => {
  if (fs.existsSync(DEFAULT_DB_PATH)) {
    originalDbBackup = fs.readFileSync(DEFAULT_DB_PATH, 'utf-8');
  }
});

afterAll(() => {
  if (fs.existsSync(TEMP_TEST_DB_PATH)) {
    try {
      fs.unlinkSync(TEMP_TEST_DB_PATH);
    } catch {
      // Ignore cleanup error
    }
  }
  if (originalDbBackup !== null) {
    fs.writeFileSync(DEFAULT_DB_PATH, originalDbBackup, 'utf-8');
  } else if (fs.existsSync(DEFAULT_DB_PATH)) {
    try {
      fs.unlinkSync(DEFAULT_DB_PATH);
    } catch {
      // Ignore cleanup error
    }
  }
});

describe('Luân Hồi Online — Comprehensive Automated Test Suite', () => {
  /**
   * 1. DATA INTEGRITY & LORE VERIFICATION
   */
  describe('1. Data Integrity & Lore Verification', () => {
    it('verifies all 12 cultivation stages (RANKS) exist in strictly ascending order of minExp and minMerit', () => {
      expect(RANKS).toHaveLength(12);

      for (let i = 0; i < RANKS.length; i++) {
        const rank = RANKS[i];
        expect(rank.stage).toBe(i + 1);
        expect(rank.name.length).toBeGreaterThan(0);
        expect(rank.vietnameseTitle.length).toBeGreaterThan(0);
        expect(rank.auraColor).toMatch(/^#[0-9a-fA-F]{6}$/);

        if (i > 0) {
          const prev = RANKS[i - 1];
          expect(rank.minExp).toBeGreaterThan(prev.minExp);
          expect(rank.minMerit).toBeGreaterThan(prev.minMerit);
          expect(rank.minKarmaBalance).toBeGreaterThan(prev.minKarmaBalance);
        }

        if (rank.stage >= 7) {
          expect(rank.grantsCelestialAccess).toBe(true);
          expect(rank.requiredTribulationId).toBeDefined();
        } else {
          expect(rank.grantsCelestialAccess).toBe(false);
        }
      }
    });

    it('verifies all 12 MERIT_ACTIVITIES have valid positive cooldowns, soft caps, and diminishing factors', () => {
      const activityKeys = Object.keys(MERIT_ACTIVITIES) as MeritActivityId[];
      expect(activityKeys).toHaveLength(12);

      for (const key of activityKeys) {
        const cfg = MERIT_ACTIVITIES[key];
        expect(cfg.id).toBe(key);
        expect(cfg.name.length).toBeGreaterThan(3);
        expect(cfg.baseMerit).toBeGreaterThan(0);
        expect(cfg.baseExp).toBeGreaterThan(0);
        expect(cfg.senReward).toBeGreaterThan(0);
        expect(cfg.cooldownMs).toBeGreaterThanOrEqual(2000);
        expect(cfg.dailySoftCap).toBeGreaterThan(0);
        expect(cfg.diminishingFactor).toBeGreaterThan(0);
        expect(cfg.diminishingFactor).toBeLessThan(1);
        expect(cfg.requiredRankStage).toBeGreaterThanOrEqual(1);
        expect(cfg.requiredRankStage).toBeLessThanOrEqual(12);
      }
    });

    it('verifies all 18 Levels of Hell (HELL_LEVELS 1..18) have unique themes, palettes, wardens, mechanics, and awakened redemption choices', () => {
      expect(HELL_LEVELS).toHaveLength(18);
      expect(KARMA_JUDGMENT_CONFIG.levels).toHaveLength(18);

      const seenCodeNames = new Set<string>();
      const seenThemes = new Set<string>();
      const seenWardens = new Set<string>();

      for (let i = 0; i < HELL_LEVELS.length; i++) {
        const levelCfg = HELL_LEVELS[i];
        expect(levelCfg.level).toBe(i + 1);
        expect(levelCfg.karmaThreshold).toBeLessThanOrEqual(-100);

        if (i > 0) {
          expect(levelCfg.karmaThreshold).toBeLessThan(HELL_LEVELS[i - 1].karmaThreshold);
        }

        expect(seenCodeNames.has(levelCfg.codeName)).toBe(false);
        seenCodeNames.add(levelCfg.codeName);

        expect(seenThemes.has(levelCfg.themeSin)).toBe(false);
        seenThemes.add(levelCfg.themeSin);

        expect(seenWardens.has(levelCfg.wardenNpc.name)).toBe(false);
        seenWardens.add(levelCfg.wardenNpc.name);

        expect(levelCfg.colorPalette.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(levelCfg.colorPalette.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(levelCfg.colorPalette.fogColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(levelCfg.punishmentMechanic.length).toBeGreaterThan(10);
        expect(levelCfg.redemptionQuest.choices.length).toBeGreaterThanOrEqual(3);

        const awakenedChoices = levelCfg.redemptionQuest.choices.filter((c) => c.isAwakened);
        expect(awakenedChoices.length).toBeGreaterThanOrEqual(1);
        expect(awakenedChoices[0].karmaRestored).toBeGreaterThan(0);
      }

      expect(HELL_LEVELS[17].level).toBe(18);
      expect(HELL_LEVELS[17].vietnameseName).toContain('Vô Gián');
      expect(HELL_LEVELS[17].karmaThreshold).toBe(-3500);
    });

    it('verifies all 10 WISDOM_LIBRARY entries have authentic tradition notes, source citations, and 3-choice moral dilemmas', () => {
      expect(WISDOM_LIBRARY).toHaveLength(10);

      for (const entry of WISDOM_LIBRARY) {
        expect(entry.id).toMatch(/^wisdom_/);
        expect(entry.title.length).toBeGreaterThan(5);
        expect(entry.traditionNote.length).toBeGreaterThan(10);
        expect(entry.sourceCitation.length).toBeGreaterThan(10);
        expect(entry.summaryStory.length).toBeGreaterThan(50);
        expect(entry.reflectionQuestion.length).toBeGreaterThan(10);

        const { choices } = entry.dilemmaScenario;
        expect(choices).toHaveLength(3);

        const alignments = choices.map((c) => c.alignment);
        expect(alignments).toContain('compassionate');
        expect(alignments).toContain('neutral');
        expect(alignments).toContain('harmful');

        const compassionate = choices.find((c) => c.alignment === 'compassionate')!;
        const harmful = choices.find((c) => c.alignment === 'harmful')!;

        expect(compassionate.meritDelta).toBeGreaterThan(0);
        expect(compassionate.negativeKarmaDelta).toBe(0);
        expect(harmful.negativeKarmaDelta).toBeGreaterThan(0);
      }

      expect(WORLD_NPCS.length).toBeGreaterThanOrEqual(6);
      expect(COSMETIC_CATALOG.length).toBeGreaterThanOrEqual(15);
      expect(QUEST_DEFINITIONS.length).toBeGreaterThanOrEqual(12);
    });
  });

  /**
   * 2. SERVER-AUTHORITATIVE MERIT ENGINE & ANTI-CHEAT VALIDATION
   */
  describe('2. Server-Authoritative Merit Engine & Anti-Cheat Validation', () => {
    let testDb: GameDatabase;
    let engine: EconomyEngine;

    beforeAll(() => {
      testDb = new GameDatabase(TEMP_TEST_DB_PATH);
      engine = new EconomyEngine(testDb);
    });

    it('performing bow_buddha increases merit, exp, karmaBalance, and appends a KarmaTransaction', () => {
      const player = testDb.getOrCreatePlayer({
        playerId: 'qa_merit_player_1',
        username: 'Hành Giả Chánh Niệm',
      });
      expect(player.merit).toBe(0);
      expect(player.exp).toBe(0);

      const res = engine.performMeritActivity(player.id, 'bow_buddha');
      expect(res.meritEarned).toBe(MERIT_ACTIVITIES.bow_buddha.baseMerit);
      expect(res.expEarned).toBe(MERIT_ACTIVITIES.bow_buddha.baseExp);
      expect(res.diminished).toBe(false);
      expect(res.player.merit).toBe(8);
      expect(res.player.exp).toBe(10);
      expect(res.player.karmaBalance).toBe(8);
      expect(res.player.karmaLedger.length).toBeGreaterThanOrEqual(1);
      expect(res.player.karmaLedger[0].type).toBe('merit');
      expect(res.player.karmaLedger[0].sourceId).toBe('bow_buddha');
      expect(res.player.karmaLedger[0].amount).toBe(8);
    });

    it('rejects spamming the same activity before cooldownMs expires (anti-cheat cooldown check)', () => {
      const player = testDb.getOrCreatePlayer({
        playerId: 'qa_cooldown_player',
      });

      engine.performMeritActivity(player.id, 'offer_incense');

      // Immediate second call must throw anti-cheat cooldown error
      expect(() =>
        engine.performMeritActivity(player.id, 'offer_incense')
      ).toThrow(/chờ|tĩnh lặng/i);
    });

    it('applies diminishing returns (diminished: true) when exceeding dailySoftCap', () => {
      const player = testDb.getOrCreatePlayer({
        playerId: 'qa_softcap_player',
      });

      const softCap = MERIT_ACTIVITIES.bow_buddha.dailySoftCap;
      player.dailyActionCounts['bow_buddha'] = softCap;
      player.actionCooldowns['bow_buddha'] = 0;
      testDb.savePlayer(player);

      const res = engine.performMeritActivity(player.id, 'bow_buddha');
      expect(res.diminished).toBe(true);
      expect(res.meritEarned).toBeLessThan(MERIT_ACTIVITIES.bow_buddha.baseMerit);
      expect(res.meritEarned).toBeGreaterThanOrEqual(1);
    });

    it('rejects attempting an activity requiring a higher requiredRankStage than the player currently holds', () => {
      const player = testDb.getOrCreatePlayer({
        playerId: 'qa_rankcheck_player',
      });
      expect(player.rankStage).toBe(1);

      // prostration_108 requires rankStage 3
      expect(() =>
        engine.performMeritActivity(player.id, 'prostration_108')
      ).toThrow(/Cảnh giới chưa đủ/i);
    });
  });

  /**
   * 3. KARMA SYSTEM, UNDERWORLD JUDGMENT & 18 LEVELS OF HELL REDEMPTION
   */
  describe('3. Karma System, Underworld Judgment & 18 Levels of Hell Redemption', () => {
    let testDb: GameDatabase;
    let engine: EconomyEngine;

    beforeAll(() => {
      testDb = new GameDatabase(TEMP_TEST_DB_PATH);
      engine = new EconomyEngine(testDb);
    });

    it('choosing a compassionate option in resolveWisdomChoice grants Merit and EXP', () => {
      const player = testDb.getOrCreatePlayer({
        playerId: 'qa_wisdom_compassionate',
      });

      const result = engine.resolveWisdomChoice(
        player.id,
        'wisdom_four_noble_truths',
        'fnt_compassionate'
      );

      expect(result.outcome.meritDelta).toBeGreaterThan(0);
      expect(result.outcome.negativeKarmaDelta).toBe(0);
      expect(result.outcome.judgmentTriggered).toBe(false);
      expect(result.player.merit).toBe(result.outcome.meritDelta);
      expect(result.player.karmaBalance).toBe(result.outcome.meritDelta);
      expect(result.player.completedWisdomIds).toContain('wisdom_four_noble_truths');
    });

    it('choosing harmful options accumulates negativeKarma, lowers karmaBalance, and triggers Underworld Judgment when karmaBalance <= -100', () => {
      const player = testDb.getOrCreatePlayer({
        playerId: 'qa_wisdom_harmful',
      });

      // fnt_harmful inflicts 150 negativeKarma -> karmaBalance becomes -150 (<= -100)
      const result = engine.resolveWisdomChoice(
        player.id,
        'wisdom_four_noble_truths',
        'fnt_harmful'
      );

      expect(result.outcome.negativeKarmaDelta).toBe(150);
      expect(result.player.negativeKarma).toBe(150);
      expect(result.player.karmaBalance).toBe(-150);
      expect(result.outcome.judgmentTriggered).toBe(true);
      expect(result.outcome.assignedHellLevel).toBeGreaterThanOrEqual(1);
      expect(result.player.currentRealm).toBe('underworld');
      expect(result.player.hellSentenceLevel).toBe(result.outcome.assignedHellLevel);
      expect(result.player.currentRoomId).toBe(
        `hell_instance_${result.outcome.assignedHellLevel}`
      );
    });

    it('maps deeper negative karma balances (-100, -500, -1500, -3500) accurately to deeper Hell levels down to Level 18 Vô Gián', () => {
      const levelAtMinus100 = evaluateAssignedHellLevel(-100);
      const levelAtMinus500 = evaluateAssignedHellLevel(-500);
      const levelAtMinus1500 = evaluateAssignedHellLevel(-1500);
      const levelAtMinus3500 = evaluateAssignedHellLevel(-3500);

      expect(levelAtMinus100).toBe(1);
      expect(levelAtMinus500).toBeGreaterThan(levelAtMinus100);
      expect(levelAtMinus1500).toBe(9);
      expect(levelAtMinus3500).toBe(18);

      const loreLevel18 = getHellLevelForKarma(-3500);
      expect(loreLevel18).not.toBeNull();
      expect(loreLevel18?.level).toBe(18);
      expect(loreLevel18?.vietnameseName).toContain('Vô Gián');
    });

    it('performing performHellRedemption with an awakened choice restores karma, records a redemption ledger entry, and frees the player back to human realm', () => {
      const player = testDb.getOrCreatePlayer({
        playerId: 'qa_hell_redeem_player',
      });

      // Sentence player to Level 9 (-1500 karma)
      player.merit = 0;
      player.negativeKarma = 1500;
      player.karmaBalance = -1500;
      player.currentRealm = 'underworld';
      player.hellSentenceLevel = 9;
      player.currentRoomId = 'hell_instance_9';
      testDb.savePlayer(player);

      // Choice 0 is the awakened choice across HELL_LEVELS
      const redemption = engine.performHellRedemption(player.id, 9, 0, 4);

      expect(redemption.freed).toBe(true);
      expect(redemption.karmaRestored).toBeGreaterThanOrEqual(1500);
      expect(redemption.player.karmaBalance).toBeGreaterThanOrEqual(0);
      expect(redemption.player.hellSentenceLevel).toBe(0);
      expect(redemption.player.currentRealm).toBe('human');
      expect(redemption.player.currentRoomId).toBe('main_temple_1');
      expect(redemption.player.completedHellLevels).toContain(9);

      const latestTx = redemption.player.karmaLedger[0];
      expect(latestTx).toBeDefined();
      expect(latestTx.type).toBe('redemption');
      expect(latestTx.sourceId).toBe('hell_level_9');
    });
  });

  /**
   * 4. ASCENSION & CELESTIAL TRIBULATIONS
   */
  describe('4. Ascension & Celestial Tribulations', () => {
    let testDb: GameDatabase;
    let engine: EconomyEngine;

    beforeAll(() => {
      testDb = new GameDatabase(TEMP_TEST_DB_PATH);
      engine = new EconomyEngine(testDb);
    });

    it('failing a tribulation (success: false) preserves player progress and grants consolation EXP', () => {
      const player = testDb.getOrCreatePlayer({
        playerId: 'qa_trib_fail_player',
      });
      player.rankStage = 6;
      player.merit = 2200;
      player.karmaBalance = 2200;
      player.exp = 2100;
      testDb.savePlayer(player);

      const res = engine.completeTribulation(player.id, 'trib_lightning', false, 40);
      expect(res.rewardMerit).toBe(0);
      expect(res.rewardExp).toBe(25);
      expect(res.player.rankStage).toBe(6);
      expect(res.player.merit).toBe(2200);
      expect(res.player.exp).toBe(2125);
    });

    it('ascends through stages 1..7 when EXP, Merit, and required Tribulation (trib_lightning) are met, unlocking celestial realm', () => {
      const player = testDb.getOrCreatePlayer({
        playerId: 'qa_ascension_player',
      });
      // Give enough EXP and Merit for Stage 7 (minExp: 3200, minMerit: 3000)
      player.exp = 3500;
      player.merit = 3200;
      player.negativeKarma = 0;
      player.karmaBalance = 3200;
      testDb.savePlayer(player);

      // Ascend from Stage 1 up to Stage 6
      for (let targetStage = 2; targetStage <= 6; targetStage++) {
        const step = engine.attemptAscension(player.id);
        expect(step.newRank.stage).toBe(targetStage);
        expect(step.unlockedCelestial).toBe(false);
      }

      // Attempting Stage 7 without completing 'trib_lightning' must be rejected
      expect(() => engine.attemptAscension(player.id)).toThrow(/Lôi Kiếp|Độ Kiếp/i);

      // Record trib_lightning in completedTribulations or via completeTribulation
      // First test completeTribulation with lower stats so attemptAscension performs the Stage 6 -> 7 promotion
      player.exp = 2500;
      player.merit = 2500;
      player.karmaBalance = 2500;
      testDb.savePlayer(player);

      const tribRes = engine.completeTribulation(player.id, 'trib_lightning', true, 100);
      expect(tribRes.player.completedTribulations).toContain('trib_lightning');
      expect(tribRes.rewardMerit).toBe(TRIBULATIONS[0].rewardMerit);

      // Top up EXP & Merit to exceed Stage 7 requirements (3200 EXP, 3000 Merit)
      tribRes.player.exp = 3500;
      tribRes.player.merit = 3300;
      tribRes.player.karmaBalance = 3300;
      tribRes.player.rankStage = 6;
      testDb.savePlayer(tribRes.player);

      const ascendStage7 = engine.attemptAscension(player.id);
      expect(ascendStage7.newRank.stage).toBe(7);
      expect(ascendStage7.newRank.vietnameseTitle).toBe('Phi Thăng Giả');
      expect(ascendStage7.unlockedCelestial).toBe(true);
      expect(ascendStage7.player.unlockedRealms).toContain('celestial');
    });
  });

  /**
   * 5. MULTIPLAYER ROOM MANAGEMENT, SHARDING, QUEUEING & SPATIAL INTEREST MANAGEMENT
   */
  describe('5. Multiplayer Room Management, Sharding, Queueing & Spatial Interest Management', () => {
    it('synchronizes two or more players joining main_temple_1 so they see each other in room state', async () => {
      const manager = new RoomManager();
      try {
        const ws1 = new MockWebSocket();
        const ws2 = new MockWebSocket();

        await manager.handleClientMessage(ws1.asWebSocket(), {
          type: 'join_room',
          playerId: 'mp_sync_p1',
          roomType: 'main_temple',
          realm: 'human',
        });

        const welcome1 = ws1.sentMessages.find((m) => m.type === 'welcome');
        expect(welcome1).toBeDefined();
        if (welcome1?.type === 'welcome') {
          expect(welcome1.room.roomId).toBe('main_temple_1');
        }

        await manager.handleClientMessage(ws2.asWebSocket(), {
          type: 'join_room',
          playerId: 'mp_sync_p2',
          roomType: 'main_temple',
          realm: 'human',
        });

        const welcome2 = ws2.sentMessages.find((m) => m.type === 'welcome');
        expect(welcome2).toBeDefined();
        if (welcome2?.type === 'welcome') {
          expect(welcome2.room.roomId).toBe('main_temple_1');
          // Player 2 sees Player 1 in the room's synchronized player list
          expect(welcome2.players.some((p) => p.id === 'mp_sync_p1')).toBe(true);
        }

        // Player 1 receives player_joined broadcast for Player 2
        const joinedBroadcast = ws1.sentMessages.find(
          (m) => m.type === 'player_joined' && m.player.id === 'mp_sync_p2'
        );
        expect(joinedBroadcast).toBeDefined();
      } finally {
        manager.stopWorldTick();
      }
    });

    it('clamps out-of-bounds movement coordinates to [-150, 150] and filters players by spatial interest radius (90 units)', async () => {
      const manager = new RoomManager();
      try {
        // Direct unit validation of clamping & NaN rejection
        const clamped = manager.validateAndClampMovement(
          { x: 450, y: -300, z: 220 },
          1.25,
          'run'
        );
        expect(clamped).not.toBeNull();
        expect(clamped?.position).toEqual({
          x: WORLD_COORDINATE_LIMIT,
          y: -WORLD_COORDINATE_LIMIT,
          z: WORLD_COORDINATE_LIMIT,
        });

        const invalidNan = manager.validateAndClampMovement(
          { x: Number.NaN, y: 0, z: 0 },
          0,
          'walk'
        );
        expect(invalidNan).toBeNull();

        const ws1 = new MockWebSocket();
        const ws2 = new MockWebSocket();

        await manager.handleClientMessage(ws1.asWebSocket(), {
          type: 'join_room',
          playerId: 'spatial_p1',
          roomType: 'main_temple',
          realm: 'human',
        });
        await manager.handleClientMessage(ws2.asWebSocket(), {
          type: 'join_room',
          playerId: 'spatial_p2',
          roomType: 'main_temple',
          realm: 'human',
        });

        // Move spatial_p1 to origin (0, 0, 0)
        await manager.handleClientMessage(ws1.asWebSocket(), {
          type: 'move',
          position: { x: 0, y: 0, z: 0 },
          rotationY: 0,
          actionState: 'idle',
        });

        // Move spatial_p2 way out of bounds (500, 0, 500) -> clamped to (150, 0, 150), distance ~212 > 90
        await manager.handleClientMessage(ws2.asWebSocket(), {
          type: 'move',
          position: { x: 500, y: 0, z: 500 },
          rotationY: 0,
          actionState: 'run',
        });

        const p2Profile = db.getPlayer('spatial_p2');
        expect(p2Profile?.position).toEqual({ x: 150, y: 0, z: 150 });

        // Join a 3rd observer at (0, 0, 0) to inspect spatially filtered players near (0, 0, 0)
        const ws3 = new MockWebSocket();
        const p3 = db.getOrCreatePlayer({ playerId: 'spatial_p3' });
        p3.position = { x: 0, y: 0, z: 0 };
        db.savePlayer(p3);

        await manager.handleClientMessage(ws3.asWebSocket(), {
          type: 'join_room',
          playerId: 'spatial_p3',
          roomType: 'main_temple',
          realm: 'human',
        });

        const welcome3 = ws3.sentMessages.find((m) => m.type === 'welcome');
        expect(welcome3?.type).toBe('welcome');
        if (welcome3?.type === 'welcome') {
          // spatial_p1 at (0,0,0) is within 90 units -> visible
          expect(welcome3.players.some((p) => p.id === 'spatial_p1')).toBe(true);
          // spatial_p2 at (150,0,150) is ~212 units away (> SPATIAL_INTEREST_RADIUS = 90) -> filtered out
          expect(welcome3.players.some((p) => p.id === 'spatial_p2')).toBe(false);
        }
        expect(SPATIAL_INTEREST_RADIUS).toBe(90);
      } finally {
        manager.stopWorldTick();
      }
    });

    it('queues additional players when meditation_hall_1 is full and promotes queued player when a slot opens', async () => {
      const manager = new RoomManager();
      try {
        const sockets: MockWebSocket[] = [];
        const capacity = 30; // meditation_hall_1 maxCapacity

        for (let i = 1; i <= capacity; i++) {
          const ws = new MockWebSocket();
          sockets.push(ws);
          await manager.handleClientMessage(ws.asWebSocket(), {
            type: 'join_room',
            playerId: `med_hall_p_${i}`,
            roomType: 'meditation_hall',
            realm: 'human',
          });
        }

        const summaryBeforeQueue = manager.getRoomSummary('meditation_hall_1');
        expect(summaryBeforeQueue?.playerCount).toBe(capacity);
        expect(summaryBeforeQueue?.queueLength).toBe(0);

        // 31st player joins meditation_hall_1 -> placed in waitingQueue
        const wsQueued = new MockWebSocket();
        await manager.handleClientMessage(wsQueued.asWebSocket(), {
          type: 'join_room',
          playerId: 'med_hall_queued_31',
          roomType: 'meditation_hall',
          realm: 'human',
        });

        const queuedMsg = wsQueued.sentMessages.find((m) => m.type === 'room_queued');
        expect(queuedMsg).toBeDefined();
        if (queuedMsg?.type === 'room_queued') {
          expect(queuedMsg.roomId).toBe('meditation_hall_1');
          expect(queuedMsg.positionInQueue).toBe(1);
        }
        expect(manager.getRoomSummary('meditation_hall_1')?.queueLength).toBe(1);

        // Player 1 leaves meditation_hall_1 by joining main_temple -> queued player 31 is automatically promoted!
        await manager.handleClientMessage(sockets[0].asWebSocket(), {
          type: 'join_room',
          playerId: 'med_hall_p_1',
          roomType: 'main_temple',
          realm: 'human',
        });

        const promotedMsg = wsQueued.sentMessages.find((m) => m.type === 'room_joined');
        expect(promotedMsg).toBeDefined();
        if (promotedMsg?.type === 'room_joined') {
          expect(promotedMsg.room.roomId).toBe('meditation_hall_1');
        }
        expect(manager.getRoomSummary('meditation_hall_1')?.queueLength).toBe(0);
      } finally {
        manager.stopWorldTick();
      }
    });

    it('auto-shards main_temple_1 into main_temple_2 when capacity (60 players) is exceeded', async () => {
      const manager = new RoomManager();
      try {
        const capacity = 60; // main_temple_1 maxCapacity
        for (let i = 1; i <= capacity; i++) {
          const ws = new MockWebSocket();
          await manager.handleClientMessage(ws.asWebSocket(), {
            type: 'join_room',
            playerId: `shard_p_${i}`,
            roomType: 'main_temple',
            realm: 'human',
          });
        }

        // 61st player requesting main_temple auto-creates and joins main_temple_2
        const ws61 = new MockWebSocket();
        await manager.handleClientMessage(ws61.asWebSocket(), {
          type: 'join_room',
          playerId: 'shard_p_61',
          roomType: 'main_temple',
          realm: 'human',
        });

        const welcome61 = ws61.sentMessages.find((m) => m.type === 'welcome');
        expect(welcome61).toBeDefined();
        if (welcome61?.type === 'welcome') {
          expect(welcome61.room.roomId).toBe('main_temple_2');
          expect(welcome61.room.shardIndex).toBe(2);
        }

        const shard2Summary = manager.getRoomSummary('main_temple_2');
        expect(shard2Summary).toBeDefined();
        expect(shard2Summary?.shardIndex).toBe(2);
      } finally {
        manager.stopWorldTick();
      }
    });

    it('advances Community Ritual progress on contribute_event and grants milestone bonus rewards when reaching targetProgress', async () => {
      const manager = new RoomManager();
      try {
        const ws = new MockWebSocket();
        const playerId = 'ritual_contributor_1';

        await manager.handleClientMessage(ws.asWebSocket(), {
          type: 'join_room',
          playerId,
          roomType: 'main_temple',
          realm: 'human',
        });

        const initialPlayer = db.getPlayer(playerId)!;
        const initialMerit = initialPlayer.merit;

        const initialEvent = manager.getRoomCommunityEvent('main_temple_1')!;
        expect(initialEvent).toBeDefined();
        const target = initialEvent.targetProgress;
        const bonusReward = initialEvent.bonusMeritReward;

        // Contribute partial progress via WebSocket message
        const contributeMsg: ClientToServerMessage = {
          type: 'contribute_event',
          eventId: initialEvent.id,
          amount: 20,
        };
        await manager.handleClientMessage(ws.asWebSocket(), contributeMsg);

        const midEvent = manager.getRoomCommunityEvent('main_temple_1')!;
        expect(midEvent.currentProgress).toBe(20);

        // Complete the remaining progress to reach targetProgress
        const completedSnapshot = await manager.incrementRoomCommunityEvent(
          'main_temple_1',
          playerId,
          target
        );
        expect(completedSnapshot).toBeDefined();
        expect(completedSnapshot?.currentProgress).toBe(target);
        expect(completedSnapshot?.completedAt).toBeDefined();

        // Verify milestoneReached: true broadcast was sent
        const milestoneBroadcast = ws.sentMessages.find(
          (m) => m.type === 'community_event_updated' && m.milestoneReached === true
        );
        expect(milestoneBroadcast).toBeDefined();

        // Verify player received bonusMeritReward
        const updatedPlayer = db.getPlayer(playerId)!;
        expect(updatedPlayer.merit).toBe(initialMerit + bonusReward);

        // Verify sanitizeChatMessage strips HTML & profanity
        const sanitized = sanitizeChatMessage('<b>Nam Mô</b> A Di Đà Phật fuck');
        expect(sanitized).toBe('Nam Mô A Di Đà Phật ***');
      } finally {
        manager.stopWorldTick();
      }
    });
  });
});
