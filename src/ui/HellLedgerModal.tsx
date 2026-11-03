import React, { useState } from 'react';
import {
  Scale,
  Flame,
  Eye,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  X,
} from 'lucide-react';
import { HELL_LEVELS, getHellLevelByNumber } from '@shared/loreData';
import { KARMA_JUDGMENT_CONFIG } from '@shared/gameData';
import { useGameStore } from '../store/gameStore';

export const HellLedgerModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const player = useGameStore((s) => s.player);
  const activeHellFloor = useGameStore((s) => s.activeHellFloor);
  const hellChallengeProgress = useGameStore((s) => s.hellChallengeProgress);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const switchRealmOrRoom = useGameStore((s) => s.switchRealmOrRoom);
  const submitHellRedemption = useGameStore((s) => s.submitHellRedemption);

  const [tab, setTab] = useState<'floors' | 'redemption' | 'ledger'>(
    player && player.hellSentenceLevel > 0 ? 'redemption' : 'floors'
  );
  const [selectedFloorNum, setSelectedFloorNum] = useState<number>(
    player?.hellSentenceLevel && player.hellSentenceLevel > 0
      ? player.hellSentenceLevel
      : activeHellFloor || 1
  );
  const [feedbackMsg, setFeedbackMsg] = useState<{
    text: string;
    isSuccess: boolean;
  } | null>(null);

  if (activeModal !== 'hell_ledger' || !player) return null;

  const floorCfg =
    getHellLevelByNumber(selectedFloorNum) || HELL_LEVELS[0];
  const progressSteps = hellChallengeProgress[selectedFloorNum] || 0;

  const handleReflectionChoice = async (idx: number) => {
    const res = await submitHellRedemption(selectedFloorNum, idx);
    if (!res.freed) {
      setFeedbackMsg({ text: res.message, isSuccess: false });
    } else {
      setFeedbackMsg({ text: res.message, isSuccess: true });
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-purple-500/50 bg-stone-950 text-stone-100 shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 bg-gradient-to-r from-purple-950/70 via-stone-900 to-red-950/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-2xl font-bold text-purple-200">
                Nghiệp Kính Đài — Sổ Nhân Quả & 18 Tầng Địa Ngục
              </h2>
              <p className="text-xs text-stone-400">
                Công Đức: <strong className="text-amber-300">{player.merit}</strong> · Nghiệp Ác:{' '}
                <strong className="text-red-400">{player.negativeKarma}</strong> · Cán Cân Nhân Quả:{' '}
                <strong
                  className={
                    player.karmaBalance < 0 ? 'text-red-400' : 'text-emerald-300'
                  }
                >
                  {player.karmaBalance}
                </strong>{' '}
                (Phán xét khi ≤ {KARMA_JUDGMENT_CONFIG.triggerThreshold})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('floors')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                tab === 'floors'
                  ? 'bg-purple-500 text-white'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
              }`}
            >
              🔥 18 Tầng Địa Ngục (3D)
            </button>
            <button
              onClick={() => setTab('redemption')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                tab === 'redemption'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
              }`}
            >
              🕯️ Sám Hối & Chuộc Lỗi
            </button>
            <button
              onClick={() => setTab('ledger')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                tab === 'ledger'
                  ? 'bg-cyan-500 text-stone-950'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
              }`}
            >
              📜 Sổ Ghi Chép Nghiệp Lực
            </button>
            <button
              onClick={() => setActiveModal('none')}
              className="rounded-xl border border-stone-700 p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: ALL 18 LEVELS OF HELL EXPLORER */}
        {tab === 'floors' && (
          <div className="grid flex-1 grid-cols-1 overflow-y-auto md:grid-cols-12">
            {/* 18 Floors Grid Selector */}
            <div className="border-b border-stone-800 bg-stone-900/50 p-4 md:col-span-5 md:border-b-0 md:border-r">
              <div className="mb-2 text-xs font-bold tracking-wider text-purple-300 uppercase">
                Danh Sách 18 Tầng Địa Ngục (Tâm Tạo Cảnh)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {HELL_LEVELS.map((hl) => {
                  const isCurrent = hl.level === selectedFloorNum;
                  const isSentenced = player.hellSentenceLevel === hl.level;
                  const isCleared = player.completedHellLevels.includes(hl.level);

                  return (
                    <button
                      key={hl.level}
                      onClick={() => {
                        setSelectedFloorNum(hl.level);
                        setFeedbackMsg(null);
                      }}
                      className={`flex flex-col rounded-xl border p-2 text-left transition ${
                        isCurrent
                          ? 'border-purple-400 bg-purple-950/70 shadow'
                          : isSentenced
                            ? 'border-red-500 bg-red-950/50'
                            : 'border-stone-800 bg-stone-900/80 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-purple-300">
                          Tầng {hl.level} ({hl.karmaThreshold})
                        </span>
                        {isCleared && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                      </div>
                      <span className="mt-0.5 truncate text-xs font-bold text-stone-100">
                        {hl.vietnameseName.replace('Địa Ngục ', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Hell Level Detailed Lore & 3D Teleport */}
            <div className="flex flex-col justify-between space-y-4 p-6 md:col-span-7">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="rounded-full border px-3 py-0.5 text-xs font-bold"
                    style={{
                      borderColor: floorCfg.colorPalette.accentGlow,
                      color: floorCfg.colorPalette.accentGlow,
                    }}
                  >
                    Tầng thứ {floorCfg.level} · Ngưỡng Nghiệp Lực:{' '}
                    {floorCfg.karmaThreshold}
                  </span>
                  <span className="text-xs text-stone-400">
                    {floorCfg.englishSubtitle}
                  </span>
                </div>

                <h3 className="font-serif-title text-3xl font-bold text-white">
                  {floorCfg.vietnameseName}
                </h3>

                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3.5 text-xs leading-relaxed text-red-200">
                  <strong>🔥 Nguyên nhân nghiệp chướng (Tội lỗi):</strong>{' '}
                  {floorCfg.themeSin}
                </div>

                <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-4 text-sm leading-relaxed text-stone-200">
                  <p>{floorCfg.environmentDescription}</p>
                  <p className="mt-2 text-xs text-stone-400">
                    🏛️ <strong>Kiến trúc 3D:</strong> {floorCfg.architectureStyle}
                  </p>
                  <p className="mt-1 text-xs text-amber-300">
                    ⚙️ <strong>Cơ chế khảo nghiệm:</strong>{' '}
                    {floorCfg.punishmentMechanic}
                  </p>
                </div>

                {/* Warden Dialogue */}
                <div className="rounded-xl border border-purple-500/30 bg-purple-950/25 p-4 text-xs leading-relaxed">
                  <div className="font-bold text-purple-300">
                    👤 {floorCfg.wardenNpc.name} ({floorCfg.wardenNpc.title}):
                  </div>
                  <p className="mt-1 text-stone-200 italic">
                    “{floorCfg.wardenNpc.dialogueIntro}”
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-stone-800 pt-4">
                <button
                  onClick={() => {
                    switchRealmOrRoom('underworld', {
                      underworldSubZone: 'hell_floor',
                      hellLevel: floorCfg.level,
                    });
                    setActiveModal('none');
                  }}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-purple-500"
                >
                  <Eye className="h-4 w-4" />
                  Bước Vào Tầng {floorCfg.level} Trong Không Gian 3D
                </button>

                <button
                  onClick={() => setTab('redemption')}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-lg transition hover:bg-amber-400"
                >
                  <Sparkles className="h-4 w-4" />
                  Thực Hành Sám Hối & Chuộc Lỗi Tầng {floorCfg.level}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REDEMPTION QUEST & AWAKENING REFLECTION */}
        {tab === 'redemption' && (
          <div className="flex flex-1 flex-col justify-between space-y-5 overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-500/40 bg-amber-950/25 p-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase">
                    Hành Trình Sám Hối & Hóa Giải Nghiệp Chướng — Tầng{' '}
                    {floorCfg.level}: {floorCfg.vietnameseName}
                  </span>
                  <h3 className="mt-1 font-serif-title text-2xl font-bold text-amber-100">
                    {floorCfg.redemptionQuest.title}
                  </h3>
                  <p className="text-xs text-stone-300">
                    Mục tiêu: {floorCfg.redemptionQuest.objective}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-bold text-amber-300">
                    Tiến độ Đài Sám Hối 3D: {progressSteps}/
                    {floorCfg.redemptionQuest.requiredActions}
                  </span>
                </div>
              </div>

              {/* Awakening Reflection Prompt from the Floor Warden */}
              <div className="rounded-2xl border border-stone-700 bg-stone-900/90 p-5">
                <div className="text-xs font-bold text-purple-300 uppercase">
                  🕯️ Câu Hỏi Quán Chiếu Tỉnh Thức Của {floorCfg.wardenNpc.name}:
                </div>
                <p className="mt-2 font-serif-title text-lg font-bold text-amber-100">
                  “{floorCfg.redemptionQuest.reflectionPrompt}”
                </p>

                <div className="mt-4 space-y-2.5">
                  {floorCfg.redemptionQuest.choices.map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleReflectionChoice(idx)}
                      className="flex w-full items-center justify-between rounded-xl border border-stone-700 bg-stone-950 p-4 text-left text-xs font-semibold text-stone-200 transition hover:border-amber-400 hover:bg-stone-900 hover:text-amber-100"
                    >
                      <span>
                        {idx + 1}. {ch.text}
                      </span>
                    </button>
                  ))}
                </div>

                {feedbackMsg && (
                  <div
                    className={`mt-4 rounded-xl border p-4 text-xs leading-relaxed ${
                      feedbackMsg.isSuccess
                        ? 'border-emerald-500 bg-emerald-950/50 text-emerald-100'
                        : 'border-red-500 bg-red-950/50 text-red-100'
                    }`}
                  >
                    {feedbackMsg.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CHRONOLOGICAL KARMA LEDGER */}
        {tab === 'ledger' && (
          <div className="flex-1 space-y-3 overflow-y-auto p-6">
            <div className="text-xs font-bold text-stone-400 uppercase">
              Lịch Sử Ghi Chép Nhân Quả (Công Đức, Nghiệp Lực & Hối Cải):
            </div>
            {player.karmaLedger.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  {tx.type === 'negative_karma' ? (
                    <AlertOctagon className="h-4 w-4 text-red-400" />
                  ) : (
                    <Flame className="h-4 w-4 text-amber-400" />
                  )}
                  <div>
                    <div className="font-bold text-stone-100">{tx.reason}</div>
                    <div className="text-[10px] text-stone-400">
                      {new Date(tx.timestamp).toLocaleTimeString('vi-VN')} · Cán cân sau giao dịch: {tx.netKarmaAfter}
                    </div>
                  </div>
                </div>
                <span
                  className={`font-bold ${
                    tx.type === 'negative_karma'
                      ? 'text-red-400'
                      : tx.type === 'redemption'
                        ? 'text-cyan-300'
                        : 'text-emerald-300'
                  }`}
                >
                  {tx.type === 'negative_karma'
                    ? `-${tx.amount} Nhân Quả`
                    : `+${tx.amount} ${tx.type === 'redemption' ? 'Hóa Giải' : 'Công Đức'}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
