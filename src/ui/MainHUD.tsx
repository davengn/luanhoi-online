import React, { useState } from 'react';
import {
  BookOpen,
  Compass,
  Flame,
  Flower2,
  Award,
  Users,
  Volume2,
  VolumeX,
  Sparkles,
  Scale,
  MessageCircle,
  ShieldAlert,
  ChevronRight,
  Radio,
} from 'lucide-react';
import {
  MERIT_ACTIVITIES,
  QUICK_CHAT_PRESETS,
  RANKS,
} from '@shared/gameData';
import {
  HELL_LEVELS,
  WORLD_NPCS,
  getHellLevelByNumber,
} from '@shared/loreData';
import { MeritActivityId } from '@shared/types';
import { GraphicsQuality, useGameStore } from '../store/gameStore';

export const MainHUD: React.FC = () => {
  const player = useGameStore((s) => s.player);
  const remotePlayers = useGameStore((s) => s.remotePlayers);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const communityEvent = useGameStore((s) => s.communityEvent);
  const onlineTotal = useGameStore((s) => s.onlineTotal);
  const isConnected = useGameStore((s) => s.isConnected);
  const localPosition = useGameStore((s) => s.localPosition);
  const nearbyInteractable = useGameStore((s) => s.nearbyInteractable);
  const underworldSubZone = useGameStore((s) => s.underworldSubZone);
  const activeHellFloor = useGameStore((s) => s.activeHellFloor);
  const hellChallengeProgress = useGameStore((s) => s.hellChallengeProgress);
  const activeModal = useGameStore((s) => s.activeModal);
  const activeNpcId = useGameStore((s) => s.activeNpcId);
  const graphicsQuality = useGameStore((s) => s.graphicsQuality);
  const isAudioMuted = useGameStore((s) => s.isAudioMuted);
  const beadCounter = useGameStore((s) => s.beadCounter);
  const dharmaSession = useGameStore((s) => s.dharmaSession);
  const toasts = useGameStore((s) => s.toasts);

  const performMeritActivity = useGameStore((s) => s.performMeritActivity);
  const tapPrayerBead = useGameStore((s) => s.tapPrayerBead);
  const startDharmaSession = useGameStore((s) => s.startDharmaSession);
  const sendQuickChat = useGameStore((s) => s.sendQuickChat);
  const triggerEmote = useGameStore((s) => s.triggerEmote);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setGraphicsQuality = useGameStore((s) => s.setGraphicsQuality);
  const toggleAudioMute = useGameStore((s) => s.toggleAudioMute);
  const switchRealmOrRoom = useGameStore((s) => s.switchRealmOrRoom);
  const triggerContextualInteract = useGameStore(
    (s) => s.triggerContextualInteract
  );
  const setJoystickVector = useGameStore((s) => s.setJoystickVector);

  const [showMoreActivities, setShowMoreActivities] = useState(false);
  const [showQuickChat, setShowQuickChat] = useState(false);
  const [selectedNpcTopicId, setSelectedNpcTopicId] = useState<string | null>(
    null
  );

  if (!player) return null;

  const currentRank =
    RANKS.find((r) => r.stage === player.rankStage) || RANKS[0];
  const nextRank = RANKS.find((r) => r.stage === player.rankStage + 1);
  const expProgress = nextRank
    ? Math.min(
        100,
        Math.max(
          0,
          ((player.exp - currentRank.minExp) /
            Math.max(1, nextRank.minExp - currentRank.minExp)) *
            100
        )
      )
    : 100;

  const currentHellCfg =
    getHellLevelByNumber(activeHellFloor) || HELL_LEVELS[0];
  const activeNpc = WORLD_NPCS.find((n) => n.id === activeNpcId);

  const realmLabel =
    player.currentRealm === 'human'
      ? 'Phàm Giới · Chùa Linh Sơn'
      : player.currentRealm === 'celestial'
        ? 'Thiên Đình · Cửu Trùng Vân Cung'
        : underworldSubZone === 'hell_floor'
          ? `Âm Phủ · Tầng ${activeHellFloor}: ${currentHellCfg.vietnameseName}`
          : 'Âm Phủ · Nghiệp Kính Đài';

  const extraActivities: MeritActivityId[] = [
    'offer_lotus',
    'offer_lantern',
    'clean_temple',
    'read_scripture',
    'help_npc',
    'group_meditation',
    'prostration_108',
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-3 sm:p-4">
      {/* TOP BAR: Left Player Status + Right Radar Minimap & World Switcher */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* TOP-LEFT: Player Profile, Currencies & Karma Balance */}
        <div className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-amber-500/35 bg-stone-950/85 p-3 shadow-2xl backdrop-blur-md sm:min-w-[330px]">
          <div className="flex items-center gap-3">
            {/* Avatar Badge */}
            <button
              onClick={() => setActiveModal('social_shop')}
              title="Tùy chỉnh Pháp Phục & Danh Hiệu"
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-900/70 to-stone-900 shadow-inner transition hover:scale-105"
            >
              <span className="text-xl">🧘</span>
              <span className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-stone-950">
                Lv.{player.level}
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-sm font-bold text-amber-100">
                  {player.username}
                </h2>
                <span
                  className="rounded-full border border-amber-400/50 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300"
                  style={{ borderColor: currentRank.auraColor }}
                >
                  Cấp {currentRank.stage} · {currentRank.vietnameseTitle}
                </span>
              </div>

              {/* EXP & Ascension Progress Bar */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200 transition-all duration-500"
                    style={{ width: `${expProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-stone-300">
                  {player.exp}
                  {nextRank ? `/${nextRank.minExp} EXP` : ' MAX'}
                </span>
              </div>
            </div>
          </div>

          {/* Core Spiritual Metrics: Merit, Negative Karma, Net Karma, Sen, Tiên Ngọc */}
          <div className="grid grid-cols-3 gap-1.5 border-t border-stone-800/80 pt-2 text-xs">
            <button
              onClick={() => setActiveModal('hell_ledger')}
              className="flex flex-col rounded-lg border border-amber-500/25 bg-amber-950/30 px-2 py-1 text-left transition hover:border-amber-400/60"
            >
              <span className="text-[10px] text-amber-300/80">
                🪷 Công Đức
              </span>
              <span className="font-bold text-amber-300">
                {player.merit.toLocaleString()}
              </span>
            </button>

            <button
              onClick={() => setActiveModal('hell_ledger')}
              className={`flex flex-col rounded-lg border px-2 py-1 text-left transition ${
                player.karmaBalance <= -50
                  ? 'border-red-500/60 bg-red-950/50 animate-pulse'
                  : 'border-purple-500/25 bg-purple-950/30 hover:border-purple-400/60'
              }`}
            >
              <span className="text-[10px] text-purple-300/80">
                ⚖️ Nhân Quả
              </span>
              <span
                className={`font-bold ${
                  player.karmaBalance < 0 ? 'text-red-400' : 'text-emerald-300'
                }`}
              >
                {player.karmaBalance >= 0
                  ? `+${player.karmaBalance}`
                  : player.karmaBalance}{' '}
                <span className="text-[10px] font-normal text-stone-400">
                  (Ác: {player.negativeKarma})
                </span>
              </span>
            </button>

            <button
              onClick={() => setActiveModal('social_shop')}
              className="flex flex-col rounded-lg border border-cyan-500/25 bg-cyan-950/30 px-2 py-1 text-left transition hover:border-cyan-400/60"
            >
              <span className="text-[10px] text-cyan-300/80">
                🌸 Sen · 💎 Ngọc
              </span>
              <span className="font-bold text-cyan-200">
                {player.senCurrency} · {player.tienNgoc}
              </span>
            </button>
          </div>

          {/* Current Realm & Sentence Warning Banner */}
          <div className="flex items-center justify-between rounded-lg bg-stone-900/90 px-2.5 py-1 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-amber-200">
              <Compass className="h-3.5 w-3.5 text-amber-400" />
              {realmLabel}
            </span>
            {player.hellSentenceLevel > 0 && (
              <button
                onClick={() => setActiveModal('hell_ledger')}
                className="rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow hover:bg-red-500"
              >
                Án Tầng {player.hellSentenceLevel} · Chuộc Lỗi
              </button>
            )}
          </div>
        </div>

        {/* TOP-RIGHT: Radar Minimap, Realm Travel & Graphics/Audio Controls */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/35 bg-stone-950/85 p-2.5 shadow-2xl backdrop-blur-md">
            {/* Radar 2D Minimap */}
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-amber-500/50 bg-stone-900/95 shadow-inner">
              <div className="absolute inset-2 rounded-full border border-amber-500/15" />
              <div className="absolute inset-6 rounded-full border border-amber-500/15" />
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-amber-500/15" />
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-amber-500/15" />

              {/* Remote Players Dots */}
              {remotePlayers.map((rp) => {
                const mx = 50 + (rp.position.x / 55) * 42;
                const my = 50 + (rp.position.z / 55) * 42;
                return (
                  <div
                    key={rp.id}
                    className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400"
                    style={{ left: `${mx}%`, top: `${my}%` }}
                    title={rp.username}
                  />
                );
              })}

              {/* Local Player Dot */}
              <div
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                style={{
                  left: `${Math.max(8, Math.min(92, 50 + (localPosition.x / 55) * 42))}%`,
                  top: `${Math.max(8, Math.min(92, 50 + (localPosition.z / 55) * 42))}%`,
                }}
              />
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-wider text-amber-300/80">
                {Math.round(localPosition.x)}, {Math.round(localPosition.z)}
              </span>
            </div>

            {/* Online Status, Quick Realm Switcher & Settings */}
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-300">
                  <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
                  {onlineTotal} Đạo Hữu
                </span>
                <span className="text-[10px] text-stone-400">
                  {isConnected ? currentRoom?.name || 'Đạo Tràng 1' : 'Tự Tu'}
                </span>
              </div>

              {/* Quick Realm Travel Buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => switchRealmOrRoom('human')}
                  className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                    player.currentRealm === 'human'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  Phàm Giới
                </button>
                <button
                  onClick={() => switchRealmOrRoom('celestial')}
                  className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                    player.currentRealm === 'celestial'
                      ? 'bg-cyan-400 text-stone-950 shadow'
                      : 'bg-stone-800/90 text-cyan-200 hover:bg-stone-700'
                  }`}
                >
                  Thiên Đình
                </button>
                <button
                  onClick={() =>
                    switchRealmOrRoom('underworld', {
                      underworldSubZone: 'judgment_hall',
                    })
                  }
                  className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                    player.currentRealm === 'underworld'
                      ? 'bg-purple-500 text-white shadow'
                      : 'bg-stone-800/90 text-purple-200 hover:bg-stone-700'
                  }`}
                >
                  Âm Phủ
                </button>
              </div>

              {/* Graphics Quality & Audio Controls */}
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <div className="flex items-center gap-0.5 rounded-lg bg-stone-900 p-0.5">
                  {(['Low', 'Medium', 'High'] as GraphicsQuality[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => setGraphicsQuality(q)}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${
                        graphicsQuality === q
                          ? 'bg-amber-500/80 text-stone-950 font-bold'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {q === 'Low' ? 'Thấp' : q === 'Medium' ? 'Vừa' : 'Cao'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={toggleAudioMute}
                  className="flex items-center gap-1 rounded-lg border border-stone-700 bg-stone-900 px-2 py-1 text-[11px] text-amber-200 hover:border-amber-400"
                  title="Bật/Tắt Âm Thanh Chùa & Tụng Kinh"
                >
                  {isAudioMuted ? (
                    <VolumeX className="h-3.5 w-3.5 text-red-400" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 18 Levels of Hell Quick 3D Floor Navigator when inside Underworld */}
          {player.currentRealm === 'underworld' && (
            <div className="flex max-w-[360px] flex-col gap-1.5 rounded-xl border border-purple-500/40 bg-stone-950/90 p-2.5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-200">
                  🔥 Khám Phá / Thọ Án 18 Tầng Địa Ngục (3D):
                </span>
                <button
                  onClick={() =>
                    switchRealmOrRoom('underworld', {
                      underworldSubZone:
                        underworldSubZone === 'judgment_hall'
                          ? 'hell_floor'
                          : 'judgment_hall',
                      hellLevel: activeHellFloor,
                    })
                  }
                  className="rounded bg-purple-700/80 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-purple-600"
                >
                  {underworldSubZone === 'judgment_hall'
                    ? `Vào Tầng ${activeHellFloor}`
                    : 'Về Nghiệp Kính Đài'}
                </button>
              </div>

              <div className="grid grid-cols-9 gap-1">
                {HELL_LEVELS.map((hl) => (
                  <button
                    key={hl.level}
                    onClick={() =>
                      switchRealmOrRoom('underworld', {
                        underworldSubZone: 'hell_floor',
                        hellLevel: hl.level,
                      })
                    }
                    title={`Tầng ${hl.level}: ${hl.vietnameseName}`}
                    className={`rounded py-1 text-[10px] font-bold transition ${
                      underworldSubZone === 'hell_floor' &&
                      activeHellFloor === hl.level
                        ? 'bg-red-500 text-white shadow'
                        : player.completedHellLevels.includes(hl.level)
                          ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-500/40'
                          : 'bg-stone-800 text-stone-300 hover:bg-purple-900/70'
                    }`}
                  >
                    {hl.level}
                  </button>
                ))}
              </div>

              {underworldSubZone === 'hell_floor' && (
                <div className="flex items-center justify-between border-t border-stone-800 pt-1.5 text-[11px] text-amber-200">
                  <span>
                    Nghi thức: {hellChallengeProgress[activeHellFloor] || 0}/
                    {currentHellCfg.redemptionQuest.requiredActions}
                  </span>
                  <button
                    onClick={() => setActiveModal('hell_ledger')}
                    className="font-bold text-amber-400 underline hover:text-amber-300"
                  >
                    Mở Câu Hỏi Tỉnh Thức & Chuộc Lỗi →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE AREA: Left Toasts + Right Modal Navigation & Community Event */}
      <div className="my-auto flex items-center justify-between py-2">
        {/* Floating Merit & Karma Notification Toasts */}
        <div className="flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`max-w-xs rounded-xl border px-3.5 py-2 shadow-lg backdrop-blur-md transition-all ${
                t.type === 'karma'
                  ? 'border-red-500/70 bg-red-950/90 text-red-100'
                  : t.type === 'ascension' || t.type === 'redemption'
                    ? 'border-yellow-400/80 bg-amber-950/90 text-yellow-100'
                    : 'border-amber-500/50 bg-stone-950/90 text-amber-100'
              }`}
            >
              <div className="text-xs font-bold">{t.title}</div>
              {t.subtitle && (
                <div className="mt-0.5 text-[11px] opacity-85">{t.subtitle}</div>
              )}
              {(t.meritDelta || t.karmaDelta || t.expDelta || t.senDelta) && (
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-bold">
                  {t.meritDelta && (
                    <span className="text-amber-300">
                      +{t.meritDelta} Công Đức
                    </span>
                  )}
                  {t.karmaDelta && (
                    <span className="text-red-300">
                      +{t.karmaDelta} Nghiệp Lực
                    </span>
                  )}
                  {t.expDelta && (
                    <span className="text-cyan-300">+{t.expDelta} EXP</span>
                  )}
                  {t.senDelta && (
                    <span className="text-pink-300">+{t.senDelta} Sen</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Side Feature Navigation Dock */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {/* Community Ritual Progress Tracker */}
          {communityEvent && (
            <div className="mb-1 w-60 rounded-xl border border-amber-500/40 bg-stone-950/85 p-2.5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-200">
                <span className="truncate">🏮 {communityEvent.name}</span>
                <span className="text-amber-400">
                  {communityEvent.currentProgress}/{communityEvent.targetProgress}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (communityEvent.currentProgress /
                        Math.max(1, communityEvent.targetProgress)) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
                <span>{communityEvent.activeParticipants} đạo hữu cộng tu</span>
                <span className="text-amber-300">
                  Thưởng +{communityEvent.bonusMeritReward} Công Đức
                </span>
              </div>
            </div>
          )}

          {/* Primary System Modal Buttons */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveModal('wisdom')}
              className="flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-stone-950/90 px-3.5 py-2 text-xs font-bold text-amber-100 shadow-lg transition hover:scale-105 hover:border-amber-400 hover:bg-amber-950/80"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Thư Viện Trí Tuệ & Nhân Quả</span>
            </button>

            <button
              onClick={() => setActiveModal('tribulation')}
              className="flex items-center gap-2.5 rounded-xl border border-cyan-500/40 bg-stone-950/90 px-3.5 py-2 text-xs font-bold text-cyan-100 shadow-lg transition hover:scale-105 hover:border-cyan-400 hover:bg-cyan-950/80"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Độ Kiếp & 12 Cảnh Giới</span>
            </button>

            <button
              onClick={() => setActiveModal('hell_ledger')}
              className="flex items-center gap-2.5 rounded-xl border border-purple-500/40 bg-stone-950/90 px-3.5 py-2 text-xs font-bold text-purple-100 shadow-lg transition hover:scale-105 hover:border-purple-400 hover:bg-purple-950/80"
            >
              <Scale className="h-4 w-4 text-purple-400" />
              <span>Sổ Nhân Quả & 18 Tầng Địa Ngục</span>
            </button>

            <button
              onClick={() => setActiveModal('quests')}
              className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-stone-950/90 px-3.5 py-2 text-xs font-bold text-emerald-100 shadow-lg transition hover:scale-105 hover:border-emerald-400 hover:bg-emerald-950/80"
            >
              <Award className="h-4 w-4 text-emerald-400" />
              <span>Nhiệm Vụ & Thành Tựu</span>
            </button>

            <button
              onClick={() => setActiveModal('social_shop')}
              className="flex items-center gap-2.5 rounded-xl border border-pink-500/40 bg-stone-950/90 px-3.5 py-2 text-xs font-bold text-pink-100 shadow-lg transition hover:scale-105 hover:border-pink-400 hover:bg-pink-950/80"
            >
              <Users className="h-4 w-4 text-pink-400" />
              <span>Đạo Tràng & Tùy Chỉnh Pháp Phục</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE DHARMA CHANTING SUBTITLE BANNER */}
      {dharmaSession?.active && dharmaSession.verse && (
        <div className="pointer-events-auto mx-auto mb-2 max-w-xl rounded-2xl border border-amber-400/70 bg-stone-950/95 px-5 py-3 text-center shadow-2xl">
          <div className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
            🔔 Đang Thính Pháp & Tụng Bát Nhã Tâm Kinh ({Math.round(dharmaSession.progress * 100)}%)
          </div>
          <div className="mt-1 font-serif-title text-base font-bold italic text-amber-100">
            “{dharmaSession.verse.paliOrSanskrit}”
          </div>
          <div className="mt-0.5 text-xs text-stone-300">
            {dharmaSession.verse.vietnamese}
          </div>
        </div>
      )}

      {/* CONTEXTUAL PROXIMITY INTERACTION PROMPT [E] */}
      {nearbyInteractable && (
        <div className="pointer-events-auto mx-auto mb-2 flex items-center gap-3 rounded-2xl border border-amber-400 bg-amber-950/95 px-4 py-2 text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.45)] animate-bounce">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-xs font-black text-stone-950">
            E
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-amber-200">
              {nearbyInteractable.label}
            </span>
            <span className="text-[11px] text-amber-100/80">
              {nearbyInteractable.sublabel}
            </span>
          </div>
          <button
            onClick={triggerContextualInteract}
            className="ml-2 rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-stone-950 hover:bg-amber-400"
          >
            Thực Hiện
          </button>
        </div>
      )}

      {/* BOTTOM ACTION BAR & MOBILE TOUCH D-PAD */}
      <div className="relative flex items-end justify-center">
        {/* Touch D-Pad for Mobile / Tablet */}
        <div className="pointer-events-auto absolute bottom-0 left-0 flex flex-col items-center gap-1 sm:hidden">
          <button
            onPointerDown={() => setJoystickVector({ x: 0, y: -1 })}
            onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}
            className="h-9 w-9 rounded-lg border border-amber-500/40 bg-stone-900/80 text-xs font-bold text-amber-200"
          >
            ▲
          </button>
          <div className="flex gap-1">
            <button
              onPointerDown={() => setJoystickVector({ x: -1, y: 0 })}
              onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}
              className="h-9 w-9 rounded-lg border border-amber-500/40 bg-stone-900/80 text-xs font-bold text-amber-200"
            >
              ◀
            </button>
            <button
              onPointerDown={() => setJoystickVector({ x: 0, y: 1 })}
              onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}
              className="h-9 w-9 rounded-lg border border-amber-500/40 bg-stone-900/80 text-xs font-bold text-amber-200"
            >
              ▼
            </button>
            <button
              onPointerDown={() => setJoystickVector({ x: 1, y: 0 })}
              onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}
              className="h-9 w-9 rounded-lg border border-amber-500/40 bg-stone-900/80 text-xs font-bold text-amber-200"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Extra Rituals Popover */}
        {showMoreActivities && (
          <div className="pointer-events-auto absolute bottom-16 mb-2 grid grid-cols-2 gap-1.5 rounded-2xl border border-amber-500/50 bg-stone-950/95 p-3 shadow-2xl sm:grid-cols-3">
            {extraActivities.map((actId) => {
              const cfg = MERIT_ACTIVITIES[actId];
              return (
                <button
                  key={actId}
                  onClick={() => {
                    performMeritActivity(actId);
                    setShowMoreActivities(false);
                  }}
                  className="flex flex-col rounded-xl border border-stone-800 bg-stone-900/90 px-3 py-2 text-left transition hover:border-amber-400 hover:bg-amber-950/40"
                >
                  <span className="text-xs font-bold text-amber-200">
                    {cfg.name.split(' (')[0]}
                  </span>
                  <span className="text-[10px] text-amber-400">
                    +{cfg.baseMerit} Công Đức · +{cfg.baseExp} EXP
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Chat & Emotes Popover */}
        {showQuickChat && (
          <div className="pointer-events-auto absolute bottom-16 mb-2 flex max-w-md flex-col gap-1.5 rounded-2xl border border-amber-500/50 bg-stone-950/95 p-3 shadow-2xl">
            <div className="text-xs font-bold text-amber-300">
              💬 Pháp Ngữ Chào Hỏi & Hồi Hướng Công Đức:
            </div>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {QUICK_CHAT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    sendQuickChat(preset.id);
                    setShowQuickChat(false);
                  }}
                  className="rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-1.5 text-left text-xs text-stone-200 transition hover:border-amber-400 hover:text-amber-200"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="mt-1 flex gap-1.5 border-t border-stone-800 pt-2">
              <button
                onClick={() => triggerEmote('greet_chaptay', 'Chắp tay kính lễ 🙏')}
                className="flex-1 rounded-lg bg-amber-900/50 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-800"
              >
                🙏 Chắp Tay
              </button>
              <button
                onClick={() => triggerEmote('prostrate', 'Ngũ thể đầu địa 🙇')}
                className="flex-1 rounded-lg bg-amber-900/50 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-800"
              >
                🙇 Đảnh Lễ
              </button>
              <button
                onClick={() => triggerEmote('celebrate', 'Hoan hỷ công đức ✨')}
                className="flex-1 rounded-lg bg-amber-900/50 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-800"
              >
                ✨ Hoan Hỷ
              </button>
            </div>
          </div>
        )}

        {/* Main Bottom Spiritual Action Hotbar */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-amber-500/40 bg-stone-950/90 px-3 py-2 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => performMeritActivity('bow_buddha')}
            className="group relative flex flex-col items-center rounded-xl border border-amber-500/30 bg-stone-900/90 px-3 py-1.5 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-950/50"
          >
            <span className="absolute left-1.5 top-1 text-[9px] font-bold text-amber-400/80">
              [1]
            </span>
            <span className="text-lg">🙏</span>
            <span className="text-[11px] font-bold text-amber-100">
              Lễ Phật
            </span>
          </button>

          <button
            onClick={() => performMeritActivity('meditate_session')}
            className="group relative flex flex-col items-center rounded-xl border border-amber-500/30 bg-stone-900/90 px-3 py-1.5 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-950/50"
          >
            <span className="absolute left-1.5 top-1 text-[9px] font-bold text-amber-400/80">
              [2]
            </span>
            <span className="text-lg">🧘</span>
            <span className="text-[11px] font-bold text-amber-100">
              Tọa Thiền
            </span>
          </button>

          <button
            onClick={tapPrayerBead}
            className="group relative flex flex-col items-center rounded-xl border border-amber-500/30 bg-stone-900/90 px-3 py-1.5 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-950/50"
          >
            <span className="absolute left-1.5 top-1 text-[9px] font-bold text-amber-400/80">
              [3]
            </span>
            <span className="text-lg">📿</span>
            <span className="text-[11px] font-bold text-amber-100">
              Gõ Mõ ({beadCounter})
            </span>
          </button>

          <button
            onClick={() => performMeritActivity('offer_incense')}
            className="group relative flex flex-col items-center rounded-xl border border-amber-500/30 bg-stone-900/90 px-3 py-1.5 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-950/50"
          >
            <span className="absolute left-1.5 top-1 text-[9px] font-bold text-amber-400/80">
              [4]
            </span>
            <span className="text-lg">🪔</span>
            <span className="text-[11px] font-bold text-amber-100">
              Dâng Hương
            </span>
          </button>

          <button
            onClick={startDharmaSession}
            className={`group relative flex flex-col items-center rounded-xl border px-3 py-1.5 transition hover:-translate-y-0.5 ${
              dharmaSession?.active
                ? 'border-yellow-400 bg-amber-900/80 text-yellow-200'
                : 'border-amber-500/30 bg-stone-900/90 text-amber-100 hover:border-amber-400 hover:bg-amber-950/50'
            }`}
          >
            <span className="absolute left-1.5 top-1 text-[9px] font-bold text-amber-400/80">
              [5]
            </span>
            <span className="text-lg">🔔</span>
            <span className="text-[11px] font-bold">
              {dharmaSession?.active ? 'Đang Tụng...' : 'Tụng Kinh'}
            </span>
          </button>

          <button
            onClick={() => {
              setShowMoreActivities((v) => !v);
              setShowQuickChat(false);
            }}
            className="group relative flex flex-col items-center rounded-xl border border-amber-500/30 bg-stone-900/90 px-3 py-1.5 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-950/50"
          >
            <Flower2 className="h-5 w-5 text-pink-400" />
            <span className="mt-0.5 text-[11px] font-bold text-amber-100">
              Nghi Thức Khác
            </span>
          </button>

          <button
            onClick={() => {
              setShowQuickChat((v) => !v);
              setShowMoreActivities(false);
            }}
            className="group relative flex flex-col items-center rounded-xl border border-amber-500/30 bg-stone-900/90 px-3 py-1.5 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-950/50"
          >
            <span className="absolute left-1.5 top-1 text-[9px] font-bold text-amber-400/80">
              [6]
            </span>
            <MessageCircle className="h-5 w-5 text-cyan-400" />
            <span className="mt-0.5 text-[11px] font-bold text-amber-100">
              Pháp Đàm
            </span>
          </button>
        </div>
      </div>

      {/* NPC DIALOGUE MODAL OVERLAY */}
      {activeModal === 'npc_dialogue' && activeNpc && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-amber-500/50 bg-stone-950 p-6 text-stone-100 shadow-2xl">
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div>
                <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-semibold text-amber-300">
                  {activeNpc.title}
                </span>
                <h3 className="mt-1 font-serif-title text-2xl font-bold text-amber-200">
                  {activeNpc.name}
                </h3>
                <p className="text-xs text-stone-400">{activeNpc.role}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedNpcTopicId(null);
                  setActiveModal('none');
                }}
                className="rounded-lg border border-stone-700 px-3 py-1 text-xs text-stone-300 hover:bg-stone-800"
              >
                Đóng [ESC]
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-950/20 p-4 text-sm leading-relaxed text-amber-100 italic">
              “{activeNpc.greeting}”
            </div>

            {/* Dialogue Topics */}
            <div className="mt-4 space-y-2">
              <div className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                Chủ đề thưa hỏi đạo lý:
              </div>
              {activeNpc.dialogueTopics.map((topic) => {
                const isSelected = selectedNpcTopicId === topic.id;
                return (
                  <div
                    key={topic.id}
                    className="rounded-xl border border-stone-800 bg-stone-900/90 p-3"
                  >
                    <button
                      onClick={() =>
                        setSelectedNpcTopicId(isSelected ? null : topic.id)
                      }
                      className="flex w-full items-center justify-between text-left text-sm font-bold text-amber-300 hover:text-amber-200"
                    >
                      <span>✦ {topic.title}</span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          isSelected ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {isSelected && (
                      <div className="mt-2 space-y-2 border-t border-stone-800 pt-2 text-xs leading-relaxed">
                        <p className="font-medium text-stone-300">
                          <strong className="text-amber-200">Hành giả:</strong>{' '}
                          {topic.prompt}
                        </p>
                        <p className="text-amber-100">
                          <strong className="text-amber-400">
                            {activeNpc.name}:
                          </strong>{' '}
                          {topic.response}
                        </p>
                        {topic.culturalNote && (
                          <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/30 p-2 text-[11px] text-cyan-200">
                            📌 <strong>Chú giải Văn hóa & Giáo lý:</strong>{' '}
                            {topic.culturalNote}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Contextual Action Buttons for the NPC */}
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-stone-800 pt-4">
              {activeNpc.id === 'npc_nun_tinh_tam' && (
                <button
                  onClick={() => setActiveModal('wisdom')}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400"
                >
                  📜 Mở 10 Cuộn Kinh Trí Tuệ & Nhân Quả
                </button>
              )}
              {activeNpc.id === 'npc_celestial_thanh_van' && (
                <button
                  onClick={() => setActiveModal('tribulation')}
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-stone-950 hover:bg-cyan-300"
                >
                  ⚡ Bước Vào Đài Độ Kiếp
                </button>
              )}
              {(activeNpc.id === 'npc_judge_thoi_giac' ||
                activeNpc.id === 'npc_underworld_envoy') && (
                <button
                  onClick={() => setActiveModal('hell_ledger')}
                  className="rounded-xl bg-purple-500 px-4 py-2 text-xs font-bold text-white hover:bg-purple-400"
                >
                  ⚖️ Mở Sổ Nhân Quả & Chuộc Lỗi
                </button>
              )}
              <button
                onClick={() => {
                  performMeritActivity('help_npc');
                  setActiveModal('none');
                }}
                className="rounded-xl border border-amber-400/60 bg-amber-950/60 px-4 py-2 text-xs font-bold text-amber-200 hover:bg-amber-900"
              >
                🙏 Chắp Tay Kính Lễ & Thọ Giáo (+Công Đức)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
