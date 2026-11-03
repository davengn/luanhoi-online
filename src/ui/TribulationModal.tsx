import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Zap,
  Shield,
  CheckCircle2,
  Lock,
  X,
} from 'lucide-react';
import { RANKS, TRIBULATIONS } from '@shared/gameData';
import { TribulationDefinition } from '@shared/types';
import { useGameStore } from '../store/gameStore';
import soundEngine from '../audio/soundEngine';

export const TribulationModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const player = useGameStore((s) => s.player);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const attemptAscension = useGameStore((s) => s.attemptAscension);
  const completeTribulationTrial = useGameStore(
    (s) => s.completeTribulationTrial
  );

  const [tab, setTab] = useState<'ranks' | 'tribulations'>('ranks');
  const [activeTrial, setActiveTrial] = useState<TribulationDefinition | null>(
    null
  );
  const [trialTimer, setTrialTimer] = useState<number>(12);
  const [spiritShield, setSpiritShield] = useState<number>(100);
  const [playerSlot, setPlayerSlot] = useState<number>(4); // 0..8 lotus grid
  const [hazardSlots, setHazardSlots] = useState<number[]>([1, 7]);

  useEffect(() => {
    if (!activeTrial) return;

    const interval = setInterval(() => {
      setTrialTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          completeTribulationTrial(activeTrial.id, true, spiritShield);
          setActiveTrial(null);
          return 0;
        }
        return prev - 1;
      });

      // Spawn new lightning/fire hazard cells on the 3x3 lotus array
      const h1 = Math.floor(Math.random() * 9);
      const h2 = (h1 + 2 + Math.floor(Math.random() * 5)) % 9;
      const h3 = (h1 + 5) % 9;
      const nextHazards = [h1, h2, h3];
      setHazardSlots(nextHazards);

      soundEngine.playKarmaThunder();

      setSpiritShield((hp) => {
        // Check if current player slot is struck
        if (nextHazards.includes(playerSlot)) {
          const nextHp = Math.max(0, hp - 22);
          if (nextHp <= 0) {
            clearInterval(interval);
            completeTribulationTrial(activeTrial.id, false, 0);
            setActiveTrial(null);
          }
          return nextHp;
        }
        return Math.min(100, hp + 5);
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTrial, completeTribulationTrial, playerSlot, spiritShield]);

  if (activeModal !== 'tribulation' || !player) return null;

  const nextRank = RANKS.find((r) => r.stage === player.rankStage + 1);
  const canAscendNow =
    nextRank &&
    player.exp >= nextRank.minExp &&
    player.merit >= nextRank.minMerit &&
    player.karmaBalance >= nextRank.minKarmaBalance &&
    (!nextRank.requiredTribulationId ||
      player.completedTribulations.includes(nextRank.requiredTribulationId));

  const startMiniGame = (trib: TribulationDefinition) => {
    soundEngine.playKarmaThunder();
    setSpiritShield(100);
    setTrialTimer(12);
    setPlayerSlot(4);
    setHazardSlots([0, 8]);
    setActiveTrial(trib);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-500/50 bg-stone-950 text-stone-100 shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 bg-gradient-to-r from-cyan-950/70 via-stone-900 to-indigo-950/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-2xl font-bold text-cyan-200">
                Thiên Đạo Cảnh Giới & Đài Độ Kiếp Cửu Trùng
              </h2>
              <p className="text-xs text-stone-400">
                12 Tầng Tu Tập Tâm Linh · Khiêu chiến Lôi Kiếp, Hỏa Kiếp & Tâm Ma Kiếp để bước qua Nam Thiên Môn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('ranks')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                tab === 'ranks'
                  ? 'bg-cyan-400 text-stone-950'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
              }`}
            >
              🪷 12 Cảnh Giới Tu Tập
            </button>
            <button
              onClick={() => setTab('tribulations')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                tab === 'tribulations'
                  ? 'bg-amber-400 text-stone-950'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
              }`}
            >
              ⚡ 6 Đại Thiên Kiếp (Độ Kiếp)
            </button>
            <button
              onClick={() => {
                setActiveTrial(null);
                setActiveModal('none');
              }}
              className="rounded-xl border border-stone-700 p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ACTIVE INTERACTIVE TRIBULATION TRIAL MINI-GAME */}
        {activeTrial ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-5 p-6 text-center">
            <div className="rounded-full border border-cyan-400/60 bg-cyan-950/60 px-4 py-1 text-xs font-bold text-cyan-200">
              ⚡ ĐANG ĐỘ KIẾP: {activeTrial.vietnameseName.toUpperCase()} ({trialTimer}s còn lại)
            </div>

            <h3 className="font-serif-title text-2xl font-bold text-white">
              Di chuyển giữa 9 Đài Sen để tránh Thiên Lôi & Nghiệp Hỏa!
            </h3>
            <p className="max-w-lg text-xs text-stone-300">
              Nhấn vào các ô Đài Sen an toàn (màu xanh) để giữ vững Đạo Tâm. Bạn cũng có thể nhấn nút Kết Ấn Hộ Pháp để hồi phục Linh Lực!
            </p>

            {/* Spirit Shield Bar */}
            <div className="w-full max-w-md">
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span className="text-cyan-300">🛡️ Hộ Tâm Linh Lực</span>
                <span className="text-amber-300">{spiritShield}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-stone-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${spiritShield}%` }}
                />
              </div>
            </div>

            {/* 3x3 Lotus Formation Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((slot) => {
                const isPlayerHere = playerSlot === slot;
                const isHazardHere = hazardSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      soundEngine.playUiClick();
                      setPlayerSlot(slot);
                    }}
                    className={`flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-2 transition ${
                      isHazardHere
                        ? 'border-red-500 bg-red-950/80 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                        : isPlayerHere
                          ? 'border-cyan-300 bg-cyan-900/70 text-white shadow-[0_0_20px_rgba(34,211,238,0.6)]'
                          : 'border-stone-700 bg-stone-900/80 text-stone-400 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-2xl">
                      {isHazardHere ? '⚡' : isPlayerHere ? '🧘' : '🪷'}
                    </span>
                    <span className="mt-1 text-[10px] font-bold">
                      {isHazardHere
                        ? 'Thiên Lôi!'
                        : isPlayerHere
                          ? 'Hành Giả'
                          : `Đài Sen ${slot + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  soundEngine.playBellChime(216);
                  setSpiritShield((s) => Math.min(100, s + 18));
                }}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-lg hover:bg-amber-400"
              >
                <Shield className="h-4 w-4" />
                Niệm Chú Kết Ấn Hộ Pháp (+18% Linh Lực)
              </button>
            </div>
          </div>
        ) : tab === 'ranks' ? (
          /* TAB 1: 12 CULTIVATION RANKS */
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {/* Next Rank Ascension Callout */}
            {nextRank && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-950/50 via-stone-900 to-cyan-950/40 p-4">
                <div>
                  <span className="text-xs font-bold text-amber-300 uppercase">
                    Cảnh Giới Tiếp Theo: Cấp {nextRank.stage} —{' '}
                    {nextRank.vietnameseTitle}
                  </span>
                  <p className="mt-1 text-xs text-stone-300">
                    Yêu cầu: <strong>{nextRank.minMerit}</strong> Công Đức (Hiện có: {player.merit}) ·{' '}
                    <strong>{nextRank.minExp}</strong> EXP (Hiện có: {player.exp})
                    {nextRank.requiredTribulationId
                      ? ` · Cần vượt Thiên Kiếp tương ứng`
                      : ''}
                  </p>
                </div>

                <button
                  onClick={attemptAscension}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold shadow-lg transition ${
                    canAscendNow
                      ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 animate-pulse'
                      : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  ✨ Độ Kiếp Thăng Cấp ({nextRank.vietnameseTitle})
                </button>
              </div>
            )}

            {/* Grid of All 12 Ranks */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {RANKS.map((r) => {
                const unlocked = player.rankStage >= r.stage;
                const isCurrent = player.rankStage === r.stage;
                return (
                  <div
                    key={r.stage}
                    className={`flex flex-col justify-between rounded-2xl border p-4 ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-950/35 shadow-lg'
                        : unlocked
                          ? 'border-emerald-500/40 bg-stone-900/90'
                          : 'border-stone-800 bg-stone-900/50 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-stone-950"
                          style={{ backgroundColor: r.auraColor }}
                        >
                          Cấp {r.stage}
                        </span>
                        {unlocked ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Lock className="h-4 w-4 text-stone-500" />
                        )}
                      </div>
                      <h4 className="mt-2 font-serif-title text-xl font-bold text-amber-100">
                        {r.vietnameseTitle}
                      </h4>
                      <div className="text-[11px] text-stone-400">{r.name}</div>
                      <p className="mt-2 text-xs leading-relaxed text-stone-300">
                        {r.unlockDescription}
                      </p>
                    </div>

                    <div className="mt-3 border-t border-stone-800 pt-2 text-[11px] text-amber-300/90">
                      Cần {r.minMerit} Công Đức · {r.minExp} EXP
                      {r.grantsCelestialAccess && ' · Mở Khóa Thiên Đình'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* TAB 2: 6 CELESTIAL TRIBULATIONS */
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2">
            {TRIBULATIONS.map((trib) => {
              const cleared = player.completedTribulations.includes(trib.id);
              return (
                <div
                  key={trib.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 ${
                    cleared
                      ? 'border-emerald-500/50 bg-emerald-950/20'
                      : 'border-cyan-500/40 bg-stone-900/90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-cyan-500/20 px-3 py-0.5 text-[11px] font-bold text-cyan-300">
                        Yêu cầu Cấp {trib.requiredRankStage} · Mở Cấp{' '}
                        {trib.unlockRankStage}
                      </span>
                      {cleared && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> Đã Vượt Qua
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 font-serif-title text-2xl font-bold text-white">
                      {trib.vietnameseName}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-stone-300">
                      {trib.description}
                    </p>
                    <div className="mt-2 rounded-xl border border-stone-800 bg-stone-950/70 p-2.5 text-[11px] text-cyan-200">
                      ⚡ <strong>Cơ chế Thiên Kiếp:</strong>{' '}
                      {trib.hazardMechanic}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-stone-800 pt-3">
                    <div className="text-[11px] text-amber-300">
                      Thưởng: +{trib.rewardMerit} Công Đức · +
                      {trib.rewardTienNgoc} Tiên Ngọc
                    </div>
                    <button
                      onClick={() => startMiniGame(trib)}
                      className="flex items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-stone-950 shadow hover:bg-cyan-300"
                    >
                      <Zap className="h-4 w-4" />
                      {cleared ? 'Luyện Lại' : 'Khiêu Chiến Độ Kiếp'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
