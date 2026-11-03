import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import {
  CharacterAppearance,
  KarmaTransaction,
  MeritActivityId,
  PlayerProfile,
} from '../shared/types';
import {
  MERIT_ACTIVITIES,
  RANKS,
  TRIBULATIONS,
  QUEST_DEFINITIONS,
  evaluateAssignedHellLevel,
} from '../shared/gameData';
import { getHellLevelByNumber } from '../shared/loreData';
import { db } from './database';
import { economyEngine } from './economyEngine';
import { roomManager } from './roomManager';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

/**
 * 1. GET /api/health
 * Returns server status, active rooms, total connected players, and persistence status.
 */
app.get('/api/health', (_req: Request, res: Response) => {
  const rooms = roomManager.getRoomSummaries();
  const pgMeta = db.getPostgresMetadata();
  res.json({
    status: 'ok',
    service: 'luanhoi-online-server',
    timestamp: Date.now(),
    uptimeSeconds: Math.floor(process.uptime()),
    onlineTotal: roomManager.getTotalOnlineCount(),
    connectedPlayers: roomManager.getConnectedPlayerCount(),
    activeRoomsCount: rooms.length,
    rooms,
    persistence: {
      status: 'connected',
      storageEngine: pgMeta.storageEngine,
      databaseUrlConfigured: pgMeta.configured,
      totalSavedProfiles: db.getAllPlayers().length,
    },
  });
});

/**
 * 2. POST /api/auth/session
 * Creates or resumes a persistent player profile.
 * Request: `{ playerId?: string, username?: string, appearance?: Partial<CharacterAppearance> }`
 * Response: `{ player: PlayerProfile, availableRooms: RoomSummary[] }`
 */
app.post('/api/auth/session', (req: Request, res: Response) => {
  try {
    const { playerId, username, appearance } = (req.body ?? {}) as {
      playerId?: string;
      username?: string;
      appearance?: Partial<CharacterAppearance>;
    };

    const player = db.getOrCreatePlayer({
      playerId,
      username,
      appearance,
    });

    const availableRooms = roomManager.getRoomSummaries();
    res.json({
      player,
      availableRooms,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'SESSION_INIT_FAILED',
      message: err?.message || 'Không thể khởi tạo phiên đăng nhập.',
    });
  }
});

/**
 * 3. GET /api/player/:id
 * Fetches the latest server-authoritative `PlayerProfile` and `KarmaTransaction[]` ledger.
 */
app.get('/api/player/:id', (req: Request, res: Response) => {
  const playerId = String(req.params.id || '').trim();
  const player = db.getPlayer(playerId);
  if (!player) {
    res.status(404).json({
      error: 'PLAYER_NOT_FOUND',
      message: `Không tìm thấy hồ sơ đạo hữu (${playerId}).`,
    });
    return;
  }

  res.json({
    ...player,
    player,
    karmaLedger: player.karmaLedger,
  });
});

/**
 * 4. POST /api/player/:id/customize
 * Updates character appearance or unlocks cosmetics using earned `senCurrency` or `tienNgoc`.
 */
app.post('/api/player/:id/customize', async (req: Request, res: Response) => {
  const playerId = String(req.params.id || '').trim();
  if (!playerId) {
    res.status(400).json({
      error: 'MISSING_PLAYER_ID',
      message: 'Thiếu định danh đạo hữu (playerId).',
    });
    return;
  }

  try {
    const result: any = await Promise.resolve(
      economyEngine.customizeCharacter(playerId, req.body ?? {})
    );

    if (result && result.success === false) {
      res.status(400).json({
        error: result.code || 'CUSTOMIZE_REJECTED',
        message: result.message || result.error || 'Không thể cập nhật ngoại hình.',
        player: result.player ?? db.getPlayer(playerId),
      });
      return;
    }

    const player: PlayerProfile | undefined = result?.player ?? result ?? db.getPlayer(playerId);
    if (!player) {
      res.status(404).json({
        error: 'PLAYER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ đạo hữu.',
      });
      return;
    }

    const message: string =
      result?.message || 'Đã cập nhật pháp phục và diện mạo thành công.';

    roomManager.syncPlayerProfile(player);
    roomManager.sendToPlayer(player.id, {
      type: 'profile_updated',
      profile: player,
      feedback: {
        title: message,
      },
    });

    res.json({
      ...(typeof result === 'object' ? result : {}),
      player,
      message,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'CUSTOMIZE_FAILED',
      message: err?.message || 'Không thể cập nhật ngoại hình lúc này.',
    });
  }
});

/**
 * 5. POST /api/economy/activity
 * Executes a validated merit-farming activity.
 * Also triggers WebSocket `profile_updated` and increments room community event!
 */
app.post('/api/economy/activity', async (req: Request, res: Response) => {
  const { playerId, activityId } = (req.body ?? {}) as {
    playerId?: string;
    activityId?: MeritActivityId;
  };

  if (!playerId || !activityId) {
    res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'Cần cung cấp đầy đủ playerId và activityId.',
    });
    return;
  }

  try {
    const result: any = await Promise.resolve(
      economyEngine.performMeritActivity(playerId, activityId)
    );

    if (result && result.success === false) {
      res.status(429).json({
        error: result.code || 'ACTIVITY_REJECTED',
        message: result.message || result.error || 'Hoạt động đang trong thời gian chờ.',
        player: result.player ?? db.getPlayer(playerId),
      });
      return;
    }

    const player: PlayerProfile | undefined = result?.player ?? db.getPlayer(playerId);
    if (!player) {
      res.status(404).json({
        error: 'PLAYER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ đạo hữu.',
      });
      return;
    }

    const cfg = MERIT_ACTIVITIES[activityId];
    const meritEarned: number = result?.meritEarned ?? result?.meritDelta ?? cfg?.baseMerit ?? 0;
    const expEarned: number = result?.expEarned ?? result?.expDelta ?? cfg?.baseExp ?? 0;
    const senEarned: number = result?.senEarned ?? result?.senDelta ?? cfg?.senReward ?? 0;
    const diminished: boolean = Boolean(result?.diminished ?? result?.isSoftCapped ?? false);
    const vfxType: string = result?.vfxType ?? cfg?.vfxType ?? 'golden_particles';
    const message: string =
      result?.message ||
      `Thực hành ${cfg?.name || activityId}: +${meritEarned} Công Đức, +${expEarned} Kinh Nghiệm.`;

    roomManager.syncPlayerProfile(player, cfg?.actionState);

    roomManager.sendToPlayer(player.id, {
      type: 'profile_updated',
      profile: player,
      feedback: {
        title: message,
        meritDelta: meritEarned,
        expDelta: expEarned,
        vfxType,
      },
    });

    // Also broadcast emote animation to nearby players in the room
    if (cfg?.actionState) {
      roomManager.broadcastToRoom(roomManager.getPlayerRoomId(player.id), {
        type: 'player_emote',
        playerId: player.id,
        emoteId: activityId,
        actionState: cfg.actionState,
      });
    }

    // Increment room Community Ritual progress
    await roomManager.recordActivityContribution(player.id, activityId);

    res.json({
      ...(typeof result === 'object' ? result : {}),
      player,
      meritEarned,
      expEarned,
      senEarned,
      diminished,
      message,
    });
  } catch (err: any) {
    const status = /cooldown|chờ|hồi/i.test(err?.message || '') ? 429 : 400;
    res.status(status).json({
      error: 'ACTIVITY_FAILED',
      message: err?.message || 'Không thể thực hiện hoạt động tích công đức.',
    });
  }
});

/**
 * 6. POST /api/economy/wisdom-choice
 * Resolves an interactive Wisdom Library moral dilemma or story choice.
 * If `judgmentTriggered`, also broadcasts `karma_judgment_triggered` and moves player to `hell_instance_${assignedHellLevel}`!
 */
app.post('/api/economy/wisdom-choice', async (req: Request, res: Response) => {
  const { playerId, wisdomId, choiceId } = (req.body ?? {}) as {
    playerId?: string;
    wisdomId?: string;
    choiceId?: string;
  };

  if (!playerId || !wisdomId || !choiceId) {
    res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'Cần cung cấp đầy đủ playerId, wisdomId và choiceId.',
    });
    return;
  }

  try {
    const result: any = await Promise.resolve(
      economyEngine.resolveWisdomChoice(playerId, wisdomId, choiceId)
    );

    if (result && result.success === false) {
      res.status(400).json({
        error: result.code || 'WISDOM_CHOICE_REJECTED',
        message: result.message || result.error || 'Không thể xử lý lựa chọn.',
      });
      return;
    }

    let player: PlayerProfile | undefined = result?.player ?? db.getPlayer(playerId);
    if (!player) {
      res.status(404).json({
        error: 'PLAYER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ đạo hữu.',
      });
      return;
    }

    const rawOutcome = result?.outcome ?? result ?? {};
    const meritDelta: number = rawOutcome.meritDelta ?? result?.meritDelta ?? 0;
    const negativeKarmaDelta: number =
      rawOutcome.negativeKarmaDelta ?? result?.negativeKarmaDelta ?? 0;
    const expDelta: number = rawOutcome.expDelta ?? result?.expDelta ?? 0;

    const assignedHellLevel: number =
      rawOutcome.assignedHellLevel ??
      result?.assignedHellLevel ??
      (player.hellSentenceLevel > 0
        ? player.hellSentenceLevel
        : evaluateAssignedHellLevel(player.karmaBalance));

    const judgmentTriggered: boolean = Boolean(
      rawOutcome.judgmentTriggered ??
        result?.judgmentTriggered ??
        (assignedHellLevel > 0 && player.karmaBalance <= -100)
    );

    const explanation: string =
      rawOutcome.explanation ??
      rawOutcome.teachingExplanation ??
      result?.explanation ??
      result?.teachingExplanation ??
      result?.message ??
      '';

    if (judgmentTriggered && assignedHellLevel > 0) {
      const hellCfg = getHellLevelByNumber(assignedHellLevel);
      const hellName = hellCfg?.vietnameseName || `Địa Ngục Tầng ${assignedHellLevel}`;
      const previousRoomId = roomManager.getPlayerRoomId(player.id);

      // Move player to hell_instance_${assignedHellLevel}
      roomManager.movePlayerToHellInstance(player.id, assignedHellLevel);
      player = db.getPlayer(player.id) ?? player;

      const judgmentMsg = {
        type: 'karma_judgment_triggered' as const,
        playerId: player.id,
        assignedHellLevel,
        hellName,
        karmaBalance: player.karmaBalance,
      };

      roomManager.sendToPlayer(player.id, judgmentMsg);
      roomManager.broadcastToRoom(previousRoomId, judgmentMsg, player.id);
    } else {
      roomManager.syncPlayerProfile(player);
    }

    roomManager.sendToPlayer(player.id, {
      type: 'profile_updated',
      profile: player,
      feedback: {
        title: explanation || 'Đã ghi nhận lựa chọn trong Sổ Nhân Quả.',
        meritDelta,
        karmaDelta: meritDelta - negativeKarmaDelta,
        expDelta,
        vfxType: negativeKarmaDelta > 0 ? 'bell_ripple' : 'lotus_bloom',
      },
    });

    const outcome = {
      meritDelta,
      negativeKarmaDelta,
      expDelta,
      judgmentTriggered,
      assignedHellLevel,
      consequenceText: rawOutcome.consequenceText ?? result?.consequenceText ?? '',
      explanation,
    };

    res.json({
      ...(typeof result === 'object' ? result : {}),
      player,
      outcome,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'WISDOM_CHOICE_FAILED',
      message: err?.message || 'Không thể xử lý tình huống đạo đức.',
    });
  }
});

/**
 * 7. POST /api/economy/ascend
 * Validates and performs rank ascension to the next cultivation stage (1..12).
 * Broadcasts `ascension_broadcast` to the room!
 */
app.post('/api/economy/ascend', async (req: Request, res: Response) => {
  const { playerId } = (req.body ?? {}) as { playerId?: string };
  if (!playerId) {
    res.status(400).json({
      error: 'MISSING_PLAYER_ID',
      message: 'Cần cung cấp playerId để thăng cấp cảnh giới.',
    });
    return;
  }

  try {
    const result: any = await Promise.resolve(economyEngine.attemptAscension(playerId));

    if (result && result.success === false) {
      res.status(400).json({
        error: result.code || 'ASCENSION_REQUIREMENTS_NOT_MET',
        message:
          result.message ||
          result.error ||
          'Chưa đủ điều kiện Công Đức, Kinh Nghiệm hoặc Độ Kiếp để thăng cấp.',
        player: result.player ?? db.getPlayer(playerId),
      });
      return;
    }

    const player: PlayerProfile | undefined = result?.player ?? db.getPlayer(playerId);
    if (!player) {
      res.status(404).json({
        error: 'PLAYER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ đạo hữu.',
      });
      return;
    }

    const newRank =
      result?.newRank ??
      RANKS.find((r) => r.stage === player.rankStage) ??
      RANKS[0];
    const unlockedCelestial: boolean = Boolean(
      result?.unlockedCelestial ?? newRank.grantsCelestialAccess
    );

    roomManager.syncPlayerProfile(player, 'ascend');

    const roomId = roomManager.getPlayerRoomId(player.id);
    roomManager.broadcastToRoom(roomId, {
      type: 'ascension_broadcast',
      playerId: player.id,
      username: player.username,
      newRankName: newRank.vietnameseTitle || newRank.name,
      stage: newRank.stage,
    });

    roomManager.sendToPlayer(player.id, {
      type: 'profile_updated',
      profile: player,
      feedback: {
        title:
          result?.message ||
          `Thăng cấp cảnh giới: ${newRank.vietnameseTitle} (Cấp ${newRank.stage})!`,
        vfxType: 'aura_surge',
      },
    });

    res.json({
      ...(typeof result === 'object' ? result : {}),
      player,
      newRank,
      unlockedCelestial,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'ASCENSION_FAILED',
      message: err?.message || 'Chưa đủ điều kiện để thăng cấp cảnh giới.',
    });
  }
});

/**
 * 8. POST /api/economy/tribulation
 * Completes or records a Celestial Tribulation trial.
 */
app.post('/api/economy/tribulation', async (req: Request, res: Response) => {
  const { playerId, tribulationId, success, score } = (req.body ?? {}) as {
    playerId?: string;
    tribulationId?: string;
    success?: boolean;
    score?: number;
  };

  if (!playerId || !tribulationId) {
    res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'Cần cung cấp playerId và tribulationId.',
    });
    return;
  }

  try {
    const result: any = await Promise.resolve(
      economyEngine.completeTribulation(
        playerId,
        tribulationId,
        Boolean(success ?? true),
        Number(score ?? 100)
      )
    );

    if (result && result.success === false && !result.player) {
      res.status(400).json({
        error: result.code || 'TRIBULATION_REJECTED',
        message: result.message || result.error || 'Không thể hoàn thành Thiên Kiếp.',
      });
      return;
    }

    const player: PlayerProfile | undefined = result?.player ?? db.getPlayer(playerId);
    if (!player) {
      res.status(404).json({
        error: 'PLAYER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ đạo hữu.',
      });
      return;
    }

    const tribDef = TRIBULATIONS.find((t) => t.id === tribulationId);
    const rewardMerit: number =
      result?.rewardMerit ?? (success ? tribDef?.rewardMerit ?? 0 : 0);
    const rewardExp: number =
      result?.rewardExp ?? (success ? tribDef?.rewardExp ?? 0 : 0);
    const rewardTienNgoc: number =
      result?.rewardTienNgoc ?? (success ? tribDef?.rewardTienNgoc ?? 0 : 0);
    const message: string =
      result?.message ||
      (success
        ? `Vượt qua ${tribDef?.vietnameseName || tribulationId} thành công!`
        : `Độ kiếp chưa thành công, hãy tĩnh tâm củng cố công đức.`);

    roomManager.syncPlayerProfile(player, success ? 'celebrate' : 'meditate');
    roomManager.sendToPlayer(player.id, {
      type: 'profile_updated',
      profile: player,
      feedback: {
        title: message,
        meritDelta: rewardMerit,
        expDelta: rewardExp,
        vfxType: success ? 'aura_surge' : 'bell_ripple',
      },
    });

    res.json({
      ...(typeof result === 'object' ? result : {}),
      player,
      rewardMerit,
      rewardExp,
      rewardTienNgoc,
      message,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'TRIBULATION_FAILED',
      message: err?.message || 'Không thể ghi nhận kết quả Độ Kiếp.',
    });
  }
});

/**
 * 9. POST /api/economy/hell-redemption
 * Completes a redemption action or wisdom awakening inside one of the 18 Levels of Hell.
 * If `freed`, broadcasts `hell_redemption_completed` and moves player back to `main_temple_1`!
 */
app.post('/api/economy/hell-redemption', async (req: Request, res: Response) => {
  const { playerId, hellLevel, choiceIndex, actionProgress } = (req.body ?? {}) as {
    playerId?: string;
    hellLevel?: number;
    choiceIndex?: number;
    actionProgress?: number;
  };

  if (!playerId || hellLevel === undefined) {
    res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'Cần cung cấp playerId và hellLevel.',
    });
    return;
  }

  try {
    const numericLevel = Number(hellLevel) || 1;
    const result: any = await Promise.resolve(
      economyEngine.performHellRedemption(
        playerId,
        numericLevel,
        choiceIndex,
        actionProgress
      )
    );

    if (result && result.success === false && !result.player) {
      res.status(400).json({
        error: result.code || 'REDEMPTION_REJECTED',
        message: result.message || result.error || 'Chưa hoàn thành thử thách chuộc lỗi.',
      });
      return;
    }

    let player: PlayerProfile | undefined = result?.player ?? db.getPlayer(playerId);
    if (!player) {
      res.status(404).json({
        error: 'PLAYER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ đạo hữu.',
      });
      return;
    }

    const karmaRestored: number = result?.karmaRestored ?? 0;
    const freed: boolean = Boolean(
      result?.freed ?? (player.hellSentenceLevel === 0 && player.karmaBalance >= 0)
    );
    const message: string =
      result?.message ||
      (freed
        ? 'Tâm thành sám hối, nghiệp chướng tiêu trừ! Đạo hữu được trở về Chùa Linh Sơn.'
        : 'Đã ghi nhận bước sám hối. Hãy tiếp tục quán chiếu chân lý.');

    if (freed) {
      const previousRoomId = roomManager.getPlayerRoomId(player.id);
      roomManager.movePlayerToMainTemple(player.id);
      player = db.getPlayer(player.id) ?? player;

      const redemptionMsg = {
        type: 'hell_redemption_completed' as const,
        playerId: player.id,
        freedFromLevel: numericLevel,
        newKarmaBalance: player.karmaBalance,
      };

      roomManager.sendToPlayer(player.id, redemptionMsg);
      roomManager.broadcastToRoom(previousRoomId, redemptionMsg, player.id);
      roomManager.broadcastToRoom('main_temple_1', redemptionMsg, player.id);
    } else {
      roomManager.syncPlayerProfile(player);
    }

    roomManager.sendToPlayer(player.id, {
      type: 'profile_updated',
      profile: player,
      feedback: {
        title: message,
        karmaDelta: karmaRestored,
        vfxType: freed ? 'lotus_bloom' : 'bell_ripple',
      },
    });

    res.json({
      ...(typeof result === 'object' ? result : {}),
      player,
      karmaRestored,
      freed,
      message,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'HELL_REDEMPTION_FAILED',
      message: err?.message || 'Không thể thực hiện bước sám hối lúc này.',
    });
  }
});

/**
 * 10. POST /api/economy/quest-claim
 * Claims rewards for a completed daily, weekly, or story quest.
 */
app.post('/api/economy/quest-claim', async (req: Request, res: Response) => {
  const { playerId, questId } = (req.body ?? {}) as {
    playerId?: string;
    questId?: string;
  };

  if (!playerId || !questId) {
    res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'Cần cung cấp playerId và questId.',
    });
    return;
  }

  try {
    const result: any = await Promise.resolve(
      economyEngine.claimQuestReward(playerId, questId)
    );

    if (result && result.success === false) {
      res.status(400).json({
        error: result.code || 'QUEST_CLAIM_REJECTED',
        message: result.message || result.error || 'Chưa đủ điều kiện nhận thưởng nhiệm vụ.',
        player: result.player ?? db.getPlayer(playerId),
      });
      return;
    }

    const player: PlayerProfile | undefined = result?.player ?? db.getPlayer(playerId);
    if (!player) {
      res.status(404).json({
        error: 'PLAYER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ đạo hữu.',
      });
      return;
    }

    const questDef = QUEST_DEFINITIONS.find((q) => q.id === questId);
    const rewardMerit: number = result?.rewardMerit ?? questDef?.rewardMerit ?? 0;
    const rewardExp: number = result?.rewardExp ?? questDef?.rewardExp ?? 0;
    const rewardSen: number = result?.rewardSen ?? questDef?.rewardSen ?? 0;

    roomManager.syncPlayerProfile(player, 'celebrate');
    roomManager.sendToPlayer(player.id, {
      type: 'profile_updated',
      profile: player,
      feedback: {
        title: `Hoàn thành nhiệm vụ: ${questDef?.title || questId} (+${rewardMerit} Công Đức)`,
        meritDelta: rewardMerit,
        expDelta: rewardExp,
        vfxType: 'golden_particles',
      },
    });

    res.json({
      ...(typeof result === 'object' ? result : {}),
      player,
      rewardMerit,
      rewardExp,
      rewardSen,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'QUEST_CLAIM_FAILED',
      message: err?.message || 'Không thể nhận thưởng nhiệm vụ lúc này.',
    });
  }
});

/**
 * 11. POST /api/economy/debug-karma & POST /api/economy/TriggerTestKarma
 * Helper endpoint `{ playerId, delta, reason }` so players or QA can test Karma Judgment
 * or Ascension directly while validating `playerId`.
 */
const handleDebugKarma = (req: Request, res: Response) => {
  const { playerId, delta, reason } = (req.body ?? {}) as {
    playerId?: string;
    delta?: number;
    reason?: string;
  };

  if (!playerId) {
    res.status(400).json({
      error: 'MISSING_PLAYER_ID',
      message: 'Cần cung cấp playerId hợp lệ.',
    });
    return;
  }

  let player = db.getPlayer(playerId);
  if (!player) {
    res.status(404).json({
      error: 'PLAYER_NOT_FOUND',
      message: `Không tìm thấy đạo hữu (${playerId}).`,
    });
    return;
  }

  const numericDelta = Number(delta);
  if (!Number.isFinite(numericDelta) || numericDelta === 0) {
    res.status(400).json({
      error: 'INVALID_DELTA',
      message: 'Giá trị delta phải là một số khác 0.',
    });
    return;
  }

  const txType: KarmaTransaction['type'] =
    numericDelta > 0 ? 'merit' : 'negative_karma';

  if (numericDelta > 0) {
    player.merit += Math.round(numericDelta);
    player.exp += Math.round(numericDelta * 0.8);
  } else {
    player.negativeKarma += Math.round(Math.abs(numericDelta));
  }

  player.karmaBalance = player.merit - player.negativeKarma;

  const tx: KarmaTransaction = {
    id: `tx_${uuidv4().slice(0, 8)}`,
    timestamp: Date.now(),
    type: txType,
    amount: Math.abs(Math.round(numericDelta)),
    reason: reason || (numericDelta > 0 ? 'Thiện duyên trợ lực' : 'Khảo nghiệm Nghiệp Kính Đài'),
    sourceId: 'karma_mirror_trial',
    netKarmaAfter: player.karmaBalance,
  };
  db.appendKarmaTransaction(player.id, tx);

  const assignedHellLevel = evaluateAssignedHellLevel(player.karmaBalance);
  let judgmentTriggered = false;

  if (assignedHellLevel > 0) {
    judgmentTriggered = true;
    const hellCfg = getHellLevelByNumber(assignedHellLevel);
    const hellName = hellCfg?.vietnameseName || `Địa Ngục Tầng ${assignedHellLevel}`;
    const prevRoomId = roomManager.getPlayerRoomId(player.id);

    roomManager.movePlayerToHellInstance(player.id, assignedHellLevel);
    player = db.getPlayer(player.id) ?? player;

    const judgmentMsg = {
      type: 'karma_judgment_triggered' as const,
      playerId: player.id,
      assignedHellLevel,
      hellName,
      karmaBalance: player.karmaBalance,
    };
    roomManager.sendToPlayer(player.id, judgmentMsg);
    roomManager.broadcastToRoom(prevRoomId, judgmentMsg, player.id);
  } else if (player.hellSentenceLevel > 0 && player.karmaBalance >= 0) {
    const freedFrom = player.hellSentenceLevel;
    roomManager.movePlayerToMainTemple(player.id);
    player = db.getPlayer(player.id) ?? player;
    roomManager.sendToPlayer(player.id, {
      type: 'hell_redemption_completed',
      playerId: player.id,
      freedFromLevel: freedFrom,
      newKarmaBalance: player.karmaBalance,
    });
  } else {
    player = db.savePlayer(player);
    roomManager.syncPlayerProfile(player);
  }

  roomManager.sendToPlayer(player.id, {
    type: 'profile_updated',
    profile: player,
    feedback: {
      title: tx.reason,
      meritDelta: numericDelta > 0 ? numericDelta : 0,
      karmaDelta: numericDelta,
      vfxType: numericDelta > 0 ? 'golden_particles' : 'bell_ripple',
    },
  });

  res.json({
    player,
    judgmentTriggered,
    assignedHellLevel: player.hellSentenceLevel,
    karmaBalance: player.karmaBalance,
    message: tx.reason,
  });
};

app.post('/api/economy/debug-karma', handleDebugKarma);
app.post('/api/economy/TriggerTestKarma', handleDebugKarma);

/**
 * 12. GET /api/rooms
 * Lists all active multiplayer room shards, player counts, and queue depths.
 */
app.get('/api/rooms', (_req: Request, res: Response) => {
  const rooms = roomManager.getRoomSummaries();
  res.json({
    rooms,
    totalOnline: roomManager.getTotalOnlineCount(),
  });
});

// Serve production frontend bundle if built (`dist/`)
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      next();
      return;
    }
    const indexHtml = path.join(distPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml);
    } else {
      next();
    }
  });
}

export const httpServer = http.createServer(app);

export const wss = new WebSocketServer({
  server: httpServer,
  path: '/ws',
});

wss.on('connection', (ws) => {
  roomManager.handleConnection(ws);
});

const PORT = Number(process.env.PORT) || 3001;

export function startServer(port: number = PORT): http.Server {
  if (!httpServer.listening) {
    httpServer.listen(port, () => {
      console.log(
        `[Luân Hồi Online] Multiplayer & Economy Server listening on http://localhost:${port} (WS: ws://localhost:${port}/ws)`
      );
    });
  }
  return httpServer;
}

if (process.env.VITEST !== 'true' && process.env.NODE_ENV !== 'test') {
  startServer(PORT);
}
