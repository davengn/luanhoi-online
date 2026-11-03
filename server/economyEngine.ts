import { v4 as uuidv4 } from 'uuid';
import {
  CharacterAppearance,
  KarmaTransaction,
  MeritActivityId,
  PlayerProfile,
  RankDefinition,
} from '../shared/types';
import {
  ACHIEVEMENT_DEFINITIONS,
  COSMETIC_CATALOG,
  MERIT_ACTIVITIES,
  QUEST_DEFINITIONS,
  RANKS,
  TRIBULATIONS,
  calculateEffectiveActivityReward,
  calculateLevelFromExp,
  evaluateAssignedHellLevel,
} from '../shared/gameData';
import {
  HELL_LEVELS,
  WISDOM_LIBRARY,
  getHellLevelByNumber,
  getHellLevelForKarma,
  getWisdomEntryById,
} from '../shared/loreData';
import { GameDatabase, db } from './database';

export class EconomyEngine {
  private readonly db: GameDatabase;

  constructor(database: GameDatabase = db) {
    this.db = database;
  }

  /**
   * Internal helper to advance matching quests on a player's profile
   */
  private advanceQuests(
    player: PlayerProfile,
    trigger:
      | MeritActivityId
      | 'any_merit'
      | 'wisdom_study'
      | 'tribulation_clear'
      | 'hell_redemption'
      | 'community_event',
    increment = 1
  ): void {
    for (const questDef of QUEST_DEFINITIONS) {
      const matchesSpecific = questDef.activityTrigger === trigger;
      const matchesGeneralMerit =
        questDef.activityTrigger === 'any_merit' &&
        trigger in MERIT_ACTIVITIES;

      if (!matchesSpecific && !matchesGeneralMerit) {
        continue;
      }

      if (!player.quests[questDef.id]) {
        player.quests[questDef.id] = {
          questId: questDef.id,
          currentCount: 0,
          targetCount: questDef.targetCount,
          completed: false,
          claimed: false,
          resetCycle: questDef.resetCycle,
        };
      }

      const q = player.quests[questDef.id];
      if (!q.completed) {
        q.currentCount = Math.min(q.targetCount, q.currentCount + increment);
        if (q.currentCount >= q.targetCount) {
          q.completed = true;
        }
      }
    }
  }

  /**
   * Evaluates and unlocks any eligible achievements for the player
   */
  private evaluateAchievements(player: PlayerProfile): string[] {
    const newlyUnlocked: string[] = [];

    for (const ach of ACHIEVEMENT_DEFINITIONS) {
      if (player.achievements.includes(ach.id)) {
        continue;
      }

      const target = ach.targetValue ?? 1;
      let currentMetricValue = 0;

      switch (ach.metric) {
        case 'merit':
          currentMetricValue = player.merit;
          break;
        case 'rankStage':
          currentMetricValue = player.rankStage;
          break;
        case 'meditateCount':
          currentMetricValue =
            (player.dailyActionCounts['meditate_session'] ?? 0) +
            (player.dailyActionCounts['group_meditation'] ?? 0);
          break;
        case 'prostrationCount':
          currentMetricValue = player.dailyActionCounts['prostration_108'] ?? 0;
          break;
        case 'wisdomCount':
          currentMetricValue = player.completedWisdomIds.length;
          break;
        case 'tribulationCount':
          currentMetricValue = player.completedTribulations.length;
          break;
        case 'hellRedemptionCount':
          currentMetricValue = player.completedHellLevels.length;
          break;
        case 'communityCount':
          currentMetricValue = player.dailyActionCounts['community_event'] ?? 0;
          break;
        default:
          currentMetricValue = 0;
      }

      if (currentMetricValue >= target) {
        player.achievements.push(ach.id);
        player.senCurrency += ach.rewardSen;
        player.tienNgoc += ach.rewardTienNgoc;
        if (ach.unlockTitle && !player.unlockedTitles.includes(ach.unlockTitle)) {
          player.unlockedTitles.push(ach.unlockTitle);
        }
        newlyUnlocked.push(ach.id);
      }
    }

    return newlyUnlocked;
  }

  /**
   * 1. Perform a validated Merit-farming activity with rank check, cooldown,
   * daily soft cap, diminishing returns, quest progress, and achievement unlocks.
   */
  public performMeritActivity(
    playerId: string,
    activityId: MeritActivityId
  ): {
    player: PlayerProfile;
    meritEarned: number;
    expEarned: number;
    senEarned: number;
    diminished: boolean;
    message: string;
    vfxType: string;
    unlockedAchievements: string[];
  } {
    const activity = MERIT_ACTIVITIES[activityId];
    if (!activity) {
      throw new Error(`Hoạt động công đức không tồn tại: ${String(activityId)}`);
    }

    const player =
      this.db.getPlayer(playerId) ?? this.db.getOrCreatePlayer({ playerId });

    if (player.rankStage < activity.requiredRankStage) {
      const requiredRank = RANKS.find((r) => r.stage === activity.requiredRankStage);
      throw new Error(
        `Cảnh giới chưa đủ! Hoạt động "${activity.name}" yêu cầu đạt cấp bậc ${activity.requiredRankStage} (${requiredRank?.vietnameseTitle ?? 'Cao hơn'}).`
      );
    }

    const now = Date.now();
    const lastUsedAt = player.actionCooldowns[activityId] ?? 0;
    const effectiveCooldownMs = Math.max(0, activity.cooldownMs - 200);
    if (lastUsedAt > 0 && now - lastUsedAt < effectiveCooldownMs) {
      const waitSeconds = ((effectiveCooldownMs - (now - lastUsedAt)) / 1000).toFixed(1);
      throw new Error(
        `Tâm cần tĩnh lặng giữa các lần hành trì. Vui lòng chờ ${waitSeconds} giây trước khi thực hiện lại "${activity.name}".`
      );
    }

    const dailyCountSoFar = player.dailyActionCounts[activityId] ?? 0;
    const reward = calculateEffectiveActivityReward(activity, dailyCountSoFar);

    player.actionCooldowns[activityId] = now;
    player.dailyActionCounts[activityId] = dailyCountSoFar + 1;

    player.merit += reward.merit;
    player.karmaBalance = player.merit - player.negativeKarma;
    player.exp += reward.exp;
    player.level = calculateLevelFromExp(player.exp);
    player.senCurrency += reward.sen;

    const tx: KarmaTransaction = {
      id: `tx_${uuidv4().slice(0, 12)}`,
      timestamp: now,
      type: 'merit',
      amount: reward.merit,
      reason: activity.name,
      sourceId: activity.id,
      netKarmaAfter: player.karmaBalance,
    };
    this.db.appendKarmaTransaction(player.id, tx);

    this.advanceQuests(player, activityId, 1);
    const unlockedAchievements = this.evaluateAchievements(player);
    this.db.savePlayer(player);

    const message = reward.isSoftCapped
      ? `Thực hành "${activity.name}" (+${reward.merit} Công Đức, +${reward.exp} EXP, +${reward.sen} Sen — Đã qua giới hạn tịnh tâm trong ngày, hiệu quả giảm nhẹ).`
      : `Thành tâm thực hành "${activity.name}"! Nhận +${reward.merit} Công Đức, +${reward.exp} EXP, +${reward.sen} Sen.`;

    return {
      player,
      meritEarned: reward.merit,
      expEarned: reward.exp,
      senEarned: reward.sen,
      diminished: reward.isSoftCapped,
      message,
      vfxType: activity.vfxType,
      unlockedAchievements,
    };
  }

  /**
   * 2. Resolve an interactive Wisdom Library moral dilemma choice.
   * Evaluates Karma Judgment threshold (karmaBalance <= -100) and sentences
   * the player to the corresponding level of the 18 Levels of Hell if triggered.
   */
  public resolveWisdomChoice(
    playerId: string,
    wisdomId: string,
    choiceId: string
  ): {
    player: PlayerProfile;
    outcome: {
      meritDelta: number;
      negativeKarmaDelta: number;
      expDelta: number;
      judgmentTriggered: boolean;
      assignedHellLevel: number;
      explanation: string;
      consequenceText: string;
    };
  } {
    const wisdomEntry =
      getWisdomEntryById(wisdomId) ??
      WISDOM_LIBRARY.find((w) => w.id === wisdomId);

    if (!wisdomEntry) {
      throw new Error(`Không tìm thấy bài học Trí Tuệ: ${wisdomId}`);
    }

    const choice =
      wisdomEntry.dilemmaScenario.choices.find((c) => c.id === choiceId) ??
      wisdomEntry.dilemmaScenario.choices.find((c) => c.alignment === choiceId);

    if (!choice) {
      throw new Error(
        `Lựa chọn "${choiceId}" không tồn tại trong tình huống "${wisdomEntry.title}".`
      );
    }

    const player =
      this.db.getPlayer(playerId) ?? this.db.getOrCreatePlayer({ playerId });

    player.merit += choice.meritDelta;
    player.negativeKarma += choice.negativeKarmaDelta;
    player.karmaBalance = player.merit - player.negativeKarma;
    player.exp += choice.expDelta;
    player.level = calculateLevelFromExp(player.exp);

    if (!player.completedWisdomIds.includes(wisdomEntry.id)) {
      player.completedWisdomIds.push(wisdomEntry.id);
    }

    const txType = choice.negativeKarmaDelta > 0 ? 'negative_karma' : 'merit';
    const txAmount =
      choice.negativeKarmaDelta > 0 ? choice.negativeKarmaDelta : choice.meritDelta;

    const tx: KarmaTransaction = {
      id: `tx_${uuidv4().slice(0, 12)}`,
      timestamp: Date.now(),
      type: txType,
      amount: txAmount,
      reason: `${wisdomEntry.title}: ${choice.label.slice(0, 64)}`,
      sourceId: `${wisdomEntry.id}:${choice.id}`,
      netKarmaAfter: player.karmaBalance,
    };
    this.db.appendKarmaTransaction(player.id, tx);

    let judgmentTriggered = false;
    let assignedHellLevel = 0;

    if (player.karmaBalance <= -100) {
      const evaluatedLevel = evaluateAssignedHellLevel(player.karmaBalance);
      const loreHellConfig = getHellLevelForKarma(player.karmaBalance);
      assignedHellLevel = Math.max(evaluatedLevel, loreHellConfig?.level ?? 1);
      if (assignedHellLevel > 0) {
        judgmentTriggered = true;
        player.hellSentenceLevel = assignedHellLevel;
        player.currentRealm = 'underworld';
        player.currentRoomId = `hell_instance_${assignedHellLevel}`;
        if (!player.unlockedRealms.includes('underworld')) {
          player.unlockedRealms.push('underworld');
        }
      }
    }

    this.advanceQuests(player, 'wisdom_study', 1);
    this.evaluateAchievements(player);
    this.db.savePlayer(player);

    return {
      player,
      outcome: {
        meritDelta: choice.meritDelta,
        negativeKarmaDelta: choice.negativeKarmaDelta,
        expDelta: choice.expDelta,
        judgmentTriggered,
        assignedHellLevel,
        explanation: choice.teachingExplanation,
        consequenceText: choice.consequenceText,
      },
    };
  }

  /**
   * 3. Attempt rank ascension to the next cultivation stage (1..12).
   */
  public attemptAscension(playerId: string): {
    player: PlayerProfile;
    newRank: RankDefinition;
    unlockedCelestial: boolean;
    message: string;
  } {
    const player =
      this.db.getPlayer(playerId) ?? this.db.getOrCreatePlayer({ playerId });

    if (player.rankStage >= 12) {
      throw new Error(
        'Đạo hữu đã đạt cảnh giới tối thượng Cấp 12 — Thiên Đạo Cảnh!'
      );
    }

    const nextStage = player.rankStage + 1;
    const nextRank = RANKS.find((r) => r.stage === nextStage);
    if (!nextRank) {
      throw new Error(`Không tìm thấy thông tin cảnh giới cấp ${nextStage}.`);
    }

    if (player.exp < nextRank.minExp) {
      throw new Error(
        `Kinh nghiệm (EXP) chưa đủ để thăng cấp "${nextRank.vietnameseTitle}". Cần ${nextRank.minExp} EXP (hiện có ${player.exp} EXP).`
      );
    }

    if (player.merit < nextRank.minMerit) {
      throw new Error(
        `Công Đức chưa đủ để thăng cấp "${nextRank.vietnameseTitle}". Cần ${nextRank.minMerit} Công Đức (hiện có ${player.merit} Công Đức).`
      );
    }

    if (player.karmaBalance < nextRank.minKarmaBalance) {
      throw new Error(
        `Điểm Nhân Quả (Tịnh Nghiệp) chưa đạt yêu cầu cho cảnh giới "${nextRank.vietnameseTitle}". Cần tối thiểu ${nextRank.minKarmaBalance} (hiện tại ${player.karmaBalance}).`
      );
    }

    if (
      nextRank.requiredTribulationId &&
      !player.completedTribulations.includes(nextRank.requiredTribulationId)
    ) {
      const trib = TRIBULATIONS.find((t) => t.id === nextRank.requiredTribulationId);
      throw new Error(
        `Cần vượt qua khảo nghiệm Độ Kiếp "${trib?.vietnameseName ?? nextRank.requiredTribulationId}" trước khi thăng lên cảnh giới "${nextRank.vietnameseTitle}"!`
      );
    }

    player.rankStage = nextRank.stage;
    player.tienNgoc += nextRank.stage * 5;

    let unlockedCelestial = false;
    if (nextRank.grantsCelestialAccess) {
      if (!player.unlockedRealms.includes('celestial')) {
        player.unlockedRealms.push('celestial');
      }
      unlockedCelestial = true;
    }

    const rankTitleId = `title_stage_${nextRank.stage}`;
    if (!player.unlockedTitles.includes(rankTitleId)) {
      player.unlockedTitles.push(rankTitleId);
    }
    if (!player.unlockedTitles.includes(nextRank.vietnameseTitle)) {
      player.unlockedTitles.push(nextRank.vietnameseTitle);
    }

    this.evaluateAchievements(player);
    this.db.savePlayer(player);

    const message = unlockedCelestial
      ? `Chúc mừng đạo hữu đột phá cảnh giới Cấp ${nextRank.stage} — ${nextRank.vietnameseTitle}! Nam Thiên Môn đã mở khóa, cho phép du hành Thiên Đình!`
      : `Chúc mừng đạo hữu thăng tiến lên cảnh giới Cấp ${nextRank.stage} — ${nextRank.vietnameseTitle}!`;

    return {
      player,
      newRank: nextRank,
      unlockedCelestial,
      message,
    };
  }

  /**
   * 4. Complete or record a Celestial Tribulation trial (Độ Kiếp).
   */
  public completeTribulation(
    playerId: string,
    tribulationId: string,
    success: boolean,
    score?: number
  ): {
    player: PlayerProfile;
    rewardMerit: number;
    rewardExp: number;
    rewardTienNgoc: number;
    unlockedRankStage?: number;
    message: string;
  } {
    const tribulation =
      TRIBULATIONS.find((t) => t.id === tribulationId) ??
      TRIBULATIONS.find((t) => t.type === tribulationId);

    if (!tribulation) {
      throw new Error(`Không tìm thấy khảo nghiệm Độ Kiếp: ${tribulationId}`);
    }

    const player =
      this.db.getPlayer(playerId) ?? this.db.getOrCreatePlayer({ playerId });

    if (!success) {
      const consolationExp = 25;
      player.exp += consolationExp;
      player.level = calculateLevelFromExp(player.exp);
      this.db.savePlayer(player);

      return {
        player,
        rewardMerit: 0,
        rewardExp: consolationExp,
        rewardTienNgoc: 0,
        message: `Chưa vượt qua được "${tribulation.vietnameseName}", nhưng căn cơ vẫn bảo toàn (+${consolationExp} EXP khích lệ). Hãy tĩnh tâm thiền định, tích thêm Công Đức hoặc mời đạo hữu hộ pháp cùng thử lại!`,
      };
    }

    if (!player.completedTribulations.includes(tribulation.id)) {
      player.completedTribulations.push(tribulation.id);
    }

    const scoreBonusMultiplier =
      typeof score === 'number' && score > 100 ? Math.min(1.25, 1 + (score - 100) / 1000) : 1;
    const rewardMerit = Math.round(tribulation.rewardMerit * scoreBonusMultiplier);
    const rewardExp = Math.round(tribulation.rewardExp * scoreBonusMultiplier);
    const rewardTienNgoc = tribulation.rewardTienNgoc;

    player.merit += rewardMerit;
    player.karmaBalance = player.merit - player.negativeKarma;
    player.exp += rewardExp;
    player.level = calculateLevelFromExp(player.exp);
    player.tienNgoc += rewardTienNgoc;

    if (
      tribulation.unlockAuraId &&
      !player.unlockedAuras.includes(tribulation.unlockAuraId)
    ) {
      player.unlockedAuras.push(tribulation.unlockAuraId);
    }
    if (
      tribulation.unlockTitle &&
      !player.unlockedTitles.includes(tribulation.unlockTitle)
    ) {
      player.unlockedTitles.push(tribulation.unlockTitle);
    }

    const tx: KarmaTransaction = {
      id: `tx_${uuidv4().slice(0, 12)}`,
      timestamp: Date.now(),
      type: 'merit',
      amount: rewardMerit,
      reason: `Độ kiếp thành công: ${tribulation.vietnameseName}`,
      sourceId: tribulation.id,
      netKarmaAfter: player.karmaBalance,
    };
    this.db.appendKarmaTransaction(player.id, tx);

    let unlockedRankStage: number | undefined;
    const targetRank = RANKS.find((r) => r.stage === tribulation.unlockRankStage);
    if (
      targetRank &&
      player.rankStage < targetRank.stage &&
      player.exp >= targetRank.minExp &&
      player.merit >= targetRank.minMerit &&
      player.karmaBalance >= targetRank.minKarmaBalance
    ) {
      player.rankStage = targetRank.stage;
      unlockedRankStage = targetRank.stage;
      if (
        targetRank.grantsCelestialAccess &&
        !player.unlockedRealms.includes('celestial')
      ) {
        player.unlockedRealms.push('celestial');
      }
    }

    this.advanceQuests(player, 'tribulation_clear', 1);
    this.evaluateAchievements(player);
    this.db.savePlayer(player);

    const message = unlockedRankStage
      ? `Vượt qua "${tribulation.vietnameseName}" viên mãn! Nhận +${rewardMerit} Công Đức, +${rewardExp} EXP, +${rewardTienNgoc} Tiên Ngọc và chính thức phi thăng Cấp ${unlockedRankStage} (${targetRank?.vietnameseTitle})!`
      : `Vượt qua "${tribulation.vietnameseName}" thành công! Nhận +${rewardMerit} Công Đức, +${rewardExp} EXP, +${rewardTienNgoc} Tiên Ngọc và mở khóa hào quang "${tribulation.unlockTitle}".`;

    return {
      player,
      rewardMerit,
      rewardExp,
      rewardTienNgoc,
      unlockedRankStage,
      message,
    };
  }

  /**
   * 5. Perform Underworld Redemption inside one of the 18 Levels of Hell.
   */
  public performHellRedemption(
    playerId: string,
    hellLevel: number,
    choiceIndex?: number,
    actionProgress?: number
  ): {
    player: PlayerProfile;
    karmaRestored: number;
    freed: boolean;
    message: string;
  } {
    const player =
      this.db.getPlayer(playerId) ?? this.db.getOrCreatePlayer({ playerId });

    const effectiveLevel =
      hellLevel >= 1 && hellLevel <= 18
        ? hellLevel
        : player.hellSentenceLevel >= 1 && player.hellSentenceLevel <= 18
          ? player.hellSentenceLevel
          : 1;

    const hellConfig =
      getHellLevelByNumber(effectiveLevel) ??
      HELL_LEVELS.find((h) => h.level === effectiveLevel);

    if (!hellConfig) {
      throw new Error(`Tầng Địa Ngục không hợp lệ: ${hellLevel}`);
    }

    // Ensure negativeKarma reflects any direct karmaBalance manipulation in tests
    if (player.karmaBalance < 0 && player.merit - player.negativeKarma !== player.karmaBalance) {
      player.negativeKarma = Math.max(player.negativeKarma, player.merit - player.karmaBalance);
    }

    const choices = hellConfig.redemptionQuest.choices;
    const selectedChoice =
      typeof choiceIndex === 'number' && choiceIndex >= 0 && choiceIndex < choices.length
        ? choices[choiceIndex]
        : undefined;

    // If the player explicitly picked an unawakened choice without completing the challenge
    if (selectedChoice && !selectedChoice.isAwakened) {
      return {
        player,
        karmaRestored: 0,
        freed: false,
        message: selectedChoice.feedback,
      };
    }

    const requiredActions = hellConfig.redemptionQuest.requiredActions || 3;
    const isFullCompletion =
      (selectedChoice && selectedChoice.isAwakened) ||
      actionProgress === undefined ||
      actionProgress >= requiredActions;

    const currentDeficit = Math.max(
      0,
      hellConfig.exitKarmaBalance - player.karmaBalance,
      player.negativeKarma
    );

    let karmaRestored = 0;
    if (isFullCompletion) {
      const baseChoiceRestore = selectedChoice?.karmaRestored ?? Math.abs(hellConfig.karmaThreshold);
      karmaRestored = Math.max(150, baseChoiceRestore, currentDeficit);
      player.negativeKarma = 0;
      if (player.merit < hellConfig.exitKarmaBalance) {
        player.merit = hellConfig.exitKarmaBalance;
      }
      player.karmaBalance = player.merit - player.negativeKarma;
    } else {
      const stepRestore = Math.max(
        50,
        Math.ceil(Math.max(150, Math.abs(hellConfig.karmaThreshold)) / requiredActions)
      );
      karmaRestored = stepRestore;
      player.negativeKarma = Math.max(0, player.negativeKarma - stepRestore);
      player.karmaBalance = player.merit - player.negativeKarma;
    }

    const tx: KarmaTransaction = {
      id: `tx_${uuidv4().slice(0, 12)}`,
      timestamp: Date.now(),
      type: 'redemption',
      amount: karmaRestored,
      reason: `Sám hối & Chuộc lỗi tại ${hellConfig.vietnameseName}`,
      sourceId: `hell_level_${hellConfig.level}`,
      netKarmaAfter: player.karmaBalance,
    };
    this.db.appendKarmaTransaction(player.id, tx);

    let freed = false;
    if (player.karmaBalance >= hellConfig.exitKarmaBalance) {
      freed = true;
      player.hellSentenceLevel = 0;
      player.currentRealm = 'human';
      player.currentRoomId = 'main_temple_1';
      player.position = { x: 0, y: 0, z: 18 };
      if (!player.completedHellLevels.includes(hellConfig.level)) {
        player.completedHellLevels.push(hellConfig.level);
      }
      this.advanceQuests(player, 'hell_redemption', 1);
      this.evaluateAchievements(player);
    }

    this.db.savePlayer(player);

    const message = freed
      ? selectedChoice?.feedback ??
        `${hellConfig.wardenNpc.dialogueRedemption} Nghiệp lực đã tịnh hóa (+${karmaRestored}), bạn được phóng thích trở về Phàm Giới!`
      : `Đã tịnh hóa +${karmaRestored} Nghiệp Lực tại ${hellConfig.vietnameseName}. Hãy tiếp tục thực hành sám hối để đạt mức thoát ngục (${hellConfig.exitKarmaBalance}).`;

    return {
      player,
      karmaRestored,
      freed,
      message,
    };
  }

  /**
   * 6. Claim rewards for a completed quest.
   */
  public claimQuestReward(
    playerId: string,
    questId: string
  ): {
    player: PlayerProfile;
    rewardMerit: number;
    rewardExp: number;
    rewardSen: number;
    message: string;
  } {
    const questDef = QUEST_DEFINITIONS.find((q) => q.id === questId);
    if (!questDef) {
      throw new Error(`Không tìm thấy nhiệm vụ: ${questId}`);
    }

    const player =
      this.db.getPlayer(playerId) ?? this.db.getOrCreatePlayer({ playerId });

    const progress = player.quests[questId];
    if (!progress || (!progress.completed && progress.currentCount < questDef.targetCount)) {
      throw new Error(
        `Nhiệm vụ "${questDef.title}" chưa hoàn thành (${progress?.currentCount ?? 0}/${questDef.targetCount}).`
      );
    }

    if (progress.claimed) {
      throw new Error(`Phần thưởng nhiệm vụ "${questDef.title}" đã được nhận trước đó.`);
    }

    progress.completed = true;
    progress.claimed = true;

    const rewardMerit = questDef.rewardMerit;
    const rewardExp = questDef.rewardExp;
    const rewardSen = questDef.rewardSen;

    player.merit += rewardMerit;
    player.karmaBalance = player.merit - player.negativeKarma;
    player.exp += rewardExp;
    player.level = calculateLevelFromExp(player.exp);
    player.senCurrency += rewardSen;

    const tx: KarmaTransaction = {
      id: `tx_${uuidv4().slice(0, 12)}`,
      timestamp: Date.now(),
      type: 'merit',
      amount: rewardMerit,
      reason: `Hoàn thành nhiệm vụ: ${questDef.title}`,
      sourceId: questDef.id,
      netKarmaAfter: player.karmaBalance,
    };
    this.db.appendKarmaTransaction(player.id, tx);

    this.evaluateAchievements(player);
    this.db.savePlayer(player);

    return {
      player,
      rewardMerit,
      rewardExp,
      rewardSen,
      message: `Nhận thưởng nhiệm vụ "${questDef.title}": +${rewardMerit} Công Đức, +${rewardExp} EXP, +${rewardSen} Sen!`,
    };
  }

  /**
   * 7. Customize character appearance or unlock non-pay-to-win cosmetics with earned Sen / Tiên Ngọc.
   */
  public customizeCharacter(
    playerId: string,
    payload: {
      appearance?: Partial<CharacterAppearance>;
      unlockItemId?: string;
      unlockType?: 'outfit' | 'aura' | 'title' | 'accessory';
    }
  ): {
    player: PlayerProfile;
    message: string;
  } {
    const player =
      this.db.getPlayer(playerId) ?? this.db.getOrCreatePlayer({ playerId });

    let unlockMessage = '';

    if (payload.unlockItemId) {
      const cosmetic = COSMETIC_CATALOG.find((item) => item.id === payload.unlockItemId);

      if (cosmetic) {
        const isAlreadyUnlocked =
          player.unlockedOutfits.includes(cosmetic.id) ||
          player.unlockedAuras.includes(cosmetic.id) ||
          player.unlockedTitles.includes(cosmetic.id);

        if (!isAlreadyUnlocked) {
          if (player.rankStage < cosmetic.requiredRankStage) {
            throw new Error(
              `Vật phẩm "${cosmetic.vietnameseName}" yêu cầu đạt Cảnh Giới Cấp ${cosmetic.requiredRankStage}.`
            );
          }
          if (player.senCurrency < cosmetic.senCost) {
            throw new Error(
              `Không đủ Hoa Sen để mở khóa "${cosmetic.vietnameseName}" (Cần ${cosmetic.senCost} Sen, hiện có ${player.senCurrency} Sen).`
            );
          }
          if (player.tienNgoc < cosmetic.tienNgocCost) {
            throw new Error(
              `Không đủ Tiên Ngọc để mở khóa "${cosmetic.vietnameseName}" (Cần ${cosmetic.tienNgocCost} Tiên Ngọc, hiện có ${player.tienNgoc} Tiên Ngọc).`
            );
          }

          player.senCurrency -= cosmetic.senCost;
          player.tienNgoc -= cosmetic.tienNgocCost;

          if (cosmetic.category === 'outfit') {
            player.unlockedOutfits.push(cosmetic.id);
          } else if (cosmetic.category === 'aura') {
            player.unlockedAuras.push(cosmetic.id);
          } else if (cosmetic.category === 'title' || cosmetic.category === 'nameplate') {
            player.unlockedTitles.push(cosmetic.id);
          } else if (cosmetic.category === 'accessory') {
            player.unlockedOutfits.push(cosmetic.id);
          }
        }

        // Apply unlocked cosmetic properties to appearance
        if (cosmetic.robeColor) player.appearance.robeColor = cosmetic.robeColor;
        if (cosmetic.trimColor) player.appearance.trimColor = cosmetic.trimColor;
        if (cosmetic.category === 'aura') player.appearance.auraId = cosmetic.id;
        if (cosmetic.accessoryKey) player.appearance.accessoryId = cosmetic.accessoryKey;
        if (cosmetic.category === 'title') player.appearance.titleId = cosmetic.id;
        if (cosmetic.nameplateStyle) player.appearance.nameplateStyle = cosmetic.nameplateStyle;

        unlockMessage = `Đã mở khóa và trang bị "${cosmetic.vietnameseName}"!`;
      } else {
        // Direct archetype / aura / title unlock identifier
        const targetType = payload.unlockType ?? 'outfit';
        if (targetType === 'outfit' && !player.unlockedOutfits.includes(payload.unlockItemId)) {
          player.unlockedOutfits.push(payload.unlockItemId);
        } else if (targetType === 'aura' && !player.unlockedAuras.includes(payload.unlockItemId)) {
          player.unlockedAuras.push(payload.unlockItemId);
        } else if (targetType === 'title' && !player.unlockedTitles.includes(payload.unlockItemId)) {
          player.unlockedTitles.push(payload.unlockItemId);
        }
        unlockMessage = `Đã mở khóa "${payload.unlockItemId}"!`;
      }
    }

    if (payload.appearance && Object.keys(payload.appearance).length > 0) {
      player.appearance = {
        ...player.appearance,
        ...payload.appearance,
      };
    }

    this.db.savePlayer(player);

    return {
      player,
      message: unlockMessage || 'Đã cập nhật pháp phục và diện mạo nhân vật thành công!',
    };
  }

  /**
   * 8. Grant community event reward to a participating player.
   */
  public grantCommunityEventReward(
    playerId: string,
    eventName: string,
    bonusMerit: number,
    bonusExp?: number
  ): PlayerProfile | undefined {
    const player = this.db.getPlayer(playerId);
    if (!player) {
      return undefined;
    }

    const meritDelta = Math.max(0, Math.round(bonusMerit));
    const expDelta = Math.max(0, Math.round(bonusExp ?? meritDelta * 1.2));
    const senBonus = Math.max(5, Math.round(meritDelta / 4));

    player.merit += meritDelta;
    player.karmaBalance = player.merit - player.negativeKarma;
    player.exp += expDelta;
    player.level = calculateLevelFromExp(player.exp);
    player.senCurrency += senBonus;
    player.dailyActionCounts['community_event'] =
      (player.dailyActionCounts['community_event'] ?? 0) + 1;

    const tx: KarmaTransaction = {
      id: `tx_${uuidv4().slice(0, 12)}`,
      timestamp: Date.now(),
      type: 'merit',
      amount: meritDelta,
      reason: `Sự kiện Cộng Đồng: ${eventName}`,
      sourceId: 'community_event',
      netKarmaAfter: player.karmaBalance,
    };
    this.db.appendKarmaTransaction(player.id, tx);

    this.advanceQuests(player, 'community_event', 1);
    this.evaluateAchievements(player);
    return this.db.savePlayer(player);
  }
}

export const economyEngine = new EconomyEngine(db);
