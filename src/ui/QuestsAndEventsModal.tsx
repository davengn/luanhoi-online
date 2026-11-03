import React, { useState } from 'react';
import { Award, CheckCircle2, Gift, Sparkles, X } from 'lucide-react';
import {
  ACHIEVEMENT_DEFINITIONS,
  QUEST_DEFINITIONS,
} from '@shared/gameData';
import { useGameStore } from '../store/gameStore';

export const QuestsAndEventsModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const player = useGameStore((s) => s.player);
  const communityEvent = useGameStore((s) => s.communityEvent);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const claimQuestReward = useGameStore((s) => s.claimQuestReward);
  const contributeToCommunityEvent = useGameStore(
    (s) => s.contributeToCommunityEvent
  );

  const [tab, setTab] = useState<'quests' | 'achievements'>('quests');

  if (activeModal !== 'quests' || !player) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-emerald-500/50 bg-stone-950 text-stone-100 shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 bg-gradient-to-r from-emerald-950/60 via-stone-900 to-stone-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-2xl font-bold text-emerald-200">
                Nhiệm Vụ Tu Tập, Thành Tựu & Đại Lễ Cộng Đồng
              </h2>
              <p className="text-xs text-stone-400">
                Hoàn thành thiện hạnh hàng ngày, tuần và cốt truyện để tích lũy Công Đức & Hoa Sen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('quests')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                tab === 'quests'
                  ? 'bg-emerald-400 text-stone-950'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
              }`}
            >
              📜 Nhiệm Vụ ({QUEST_DEFINITIONS.length})
            </button>
            <button
              onClick={() => setTab('achievements')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                tab === 'achievements'
                  ? 'bg-amber-400 text-stone-950'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
              }`}
            >
              🏆 Thành Tựu & Danh Hiệu
            </button>
            <button
              onClick={() => setActiveModal('none')}
              className="rounded-xl border border-stone-700 p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {/* Active Multiplayer Community Ritual Banner */}
          {communityEvent && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/25 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase">
                    🏮 Nghi Thức Cộng Đồng Đạo Tràng Đang Diễn Ra
                  </span>
                  <h3 className="font-serif-title text-xl font-bold text-amber-100">
                    {communityEvent.name}
                  </h3>
                  <p className="text-xs text-stone-300">
                    {communityEvent.description}
                  </p>
                </div>
                <button
                  onClick={() => contributeToCommunityEvent(5)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-stone-950 shadow hover:bg-amber-300"
                >
                  <Sparkles className="h-4 w-4" />
                  Trợ Niệm Cộng Đồng (+5 Tiến Độ)
                </button>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-stone-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300"
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
            </div>
          )}

          {tab === 'quests' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {QUEST_DEFINITIONS.map((qDef) => {
                const prog = player.quests[qDef.id] || {
                  questId: qDef.id,
                  currentCount: 0,
                  targetCount: qDef.targetCount,
                  completed: false,
                  claimed: false,
                  resetCycle: qDef.resetCycle,
                };

                return (
                  <div
                    key={qDef.id}
                    className={`flex flex-col justify-between rounded-2xl border p-4 ${
                      prog.claimed
                        ? 'border-stone-800 bg-stone-900/40 opacity-70'
                        : prog.completed
                          ? 'border-amber-400 bg-amber-950/30'
                          : 'border-stone-800 bg-stone-900/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="rounded-full bg-stone-800 px-2.5 py-0.5 font-bold text-emerald-300 uppercase">
                          {qDef.resetCycle === 'daily'
                            ? 'Hàng Ngày'
                            : qDef.resetCycle === 'weekly'
                              ? 'Hàng Tuần'
                              : qDef.resetCycle === 'redemption'
                                ? 'Chuộc Lỗi'
                                : 'Cốt Truyện'}
                        </span>
                        <span className="font-bold text-stone-300">
                          {prog.currentCount}/{qDef.targetCount}
                        </span>
                      </div>
                      <h4 className="mt-1.5 text-sm font-bold text-amber-100">
                        {qDef.title}
                      </h4>
                      <p className="mt-1 text-xs text-stone-400">
                        {qDef.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-stone-800 pt-2.5">
                      <span className="text-[11px] font-semibold text-amber-300">
                        +{qDef.rewardMerit} Công Đức · +{qDef.rewardExp} EXP · +
                        {qDef.rewardSen} Sen
                      </span>
                      {prog.claimed ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> Đã Nhận
                        </span>
                      ) : prog.completed ? (
                        <button
                          onClick={() => claimQuestReward(qDef.id)}
                          className="flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-1 text-xs font-bold text-stone-950 shadow hover:bg-amber-300"
                        >
                          <Gift className="h-3.5 w-3.5" /> Nhận Thưởng
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-500">
                          Đang thực hiện
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ACHIEVEMENT_DEFINITIONS.map((ach) => {
                const unlocked =
                  player.achievements.includes(ach.id) ||
                  (ach.metric === 'merit' &&
                    player.merit >= (ach.targetValue || 0)) ||
                  (ach.metric === 'rankStage' &&
                    player.rankStage >= (ach.targetValue || 0));

                return (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-3.5 rounded-2xl border p-4 ${
                      unlocked
                        ? 'border-amber-400/60 bg-amber-950/25'
                        : 'border-stone-800 bg-stone-900/60 opacity-75'
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-2xl">
                      {ach.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-amber-100">
                          {ach.title}
                        </h4>
                        {unlocked && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-xs text-stone-400">{ach.description}</p>
                      <div className="mt-1 text-[11px] text-cyan-300">
                        Thưởng: +{ach.rewardSen} Sen · +{ach.rewardTienNgoc} Tiên Ngọc
                        {ach.unlockTitle ? ` · Danh hiệu "${ach.unlockTitle}"` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
