import React, { useState } from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react';
import { WISDOM_LIBRARY } from '@shared/loreData';
import { useGameStore } from '../store/gameStore';

export const WisdomModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const player = useGameStore((s) => s.player);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const submitWisdomChoice = useGameStore((s) => s.submitWisdomChoice);

  const [selectedId, setSelectedId] = useState<string>(WISDOM_LIBRARY[0].id);
  const [lastOutcome, setLastOutcome] = useState<{
    choiceId: string;
    meritDelta: number;
    negativeKarmaDelta: number;
    expDelta: number;
    consequenceText: string;
    teachingExplanation: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (activeModal !== 'wisdom' || !player) return null;

  const entry =
    WISDOM_LIBRARY.find((w) => w.id === selectedId) || WISDOM_LIBRARY[0];
  const isCompleted = player.completedWisdomIds.includes(entry.id);

  const handleSelectChoice = async (choiceId: string) => {
    if (submitting) return;
    const choice = entry.dilemmaScenario.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    setSubmitting(true);
    await submitWisdomChoice(entry.id, choiceId);
    setLastOutcome({
      choiceId,
      meritDelta: choice.meritDelta,
      negativeKarmaDelta: choice.negativeKarmaDelta,
      expDelta: choice.expDelta,
      consequenceText: choice.consequenceText,
      teachingExplanation: choice.teachingExplanation,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-amber-500/50 bg-stone-950 text-stone-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-gradient-to-r from-amber-950/60 via-stone-900 to-stone-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-2xl font-bold text-amber-200">
                Tàng Kinh Các — Thư Viện Trí Tuệ & Tình Huống Nhân Quả
              </h2>
              <p className="text-xs text-stone-400">
                 Đọc kinh điển Phật giáo xác thực và lựa chọn hành xử trước các tình huống đạo đức đời thường ({player.completedWisdomIds.length}/{WISDOM_LIBRARY.length} chủ đề đã học)
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className="rounded-xl border border-stone-700 p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto md:grid-cols-12">
          {/* Left Topic List (10 Topics) */}
          <div className="border-b border-stone-800 bg-stone-900/50 p-4 md:col-span-4 md:border-b-0 md:border-r">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-400 uppercase">
              10 Cuộn Kinh Trí Tuệ
            </div>
            <div className="space-y-1.5">
              {WISDOM_LIBRARY.map((item, idx) => {
                const done = player.completedWisdomIds.includes(item.id);
                const active = item.id === entry.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      setLastOutcome(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs transition ${
                      active
                        ? 'border-amber-400 bg-amber-950/60 text-amber-100 shadow'
                        : 'border-stone-800 bg-stone-900/70 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span className="line-clamp-1 font-semibold">
                      {idx + 1}. {item.title.split(':')[0]}
                    </span>
                    {done && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Scripture & Moral Dilemma */}
          <div className="flex flex-col justify-between space-y-5 p-6 md:col-span-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-0.5 text-[11px] font-semibold text-amber-300">
                  {entry.traditionNote}
                </span>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Đã Chiêm Nghiệm
                  </span>
                )}
              </div>

              <h3 className="font-serif-title text-2xl font-bold text-amber-100">
                {entry.title}
              </h3>

              {/* Story & Scriptural Citation */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm leading-relaxed text-stone-200">
                <p>{entry.summaryStory}</p>
                <div className="mt-3 border-t border-amber-500/20 pt-2 text-xs font-semibold text-amber-300">
                  📖 Nguồn dẫn kinh điển: {entry.sourceCitation}
                </div>
              </div>

              {/* Interactive Moral Dilemma Scenario */}
              <div className="rounded-2xl border border-stone-700 bg-stone-900/90 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-cyan-300 uppercase">
                    ⚖️ Tình Huống Nhân Quả Đời Thường · Nhân vật:{' '}
                    {entry.dilemmaScenario.npcName}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-stone-200">
                  {entry.dilemmaScenario.situation}
                </p>

                <div className="mt-4 space-y-2.5">
                  {entry.dilemmaScenario.choices.map((ch) => {
                    const isPicked = lastOutcome?.choiceId === ch.id;
                    return (
                      <button
                        key={ch.id}
                        disabled={submitting}
                        onClick={() => handleSelectChoice(ch.id)}
                        className={`flex w-full flex-col rounded-xl border p-3.5 text-left transition ${
                          isPicked
                            ? ch.alignment === 'harmful'
                              ? 'border-red-500 bg-red-950/60'
                              : 'border-emerald-400 bg-emerald-950/60'
                            : 'border-stone-700/80 bg-stone-950/80 hover:border-amber-400/70 hover:bg-stone-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-amber-100">
                            {ch.label}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              ch.alignment === 'compassionate'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : ch.alignment === 'harmful'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-stone-700 text-stone-300'
                            }`}
                          >
                            {ch.alignment === 'compassionate'
                              ? `+${ch.meritDelta} Công Đức`
                              : ch.alignment === 'harmful'
                                ? `+${ch.negativeKarmaDelta} Nghiệp Lực (Ác)`
                                : 'Trung Dung'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Consequence & Dharma Explanation Feedback */}
                {lastOutcome && (
                  <div
                    className={`mt-4 rounded-xl border p-4 text-xs leading-relaxed ${
                      lastOutcome.negativeKarmaDelta > 0
                        ? 'border-red-500/60 bg-red-950/40 text-red-100'
                        : 'border-emerald-500/60 bg-emerald-950/40 text-emerald-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {lastOutcome.negativeKarmaDelta > 0 ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <span>
                            Quả Báo Tức Thời (+{lastOutcome.negativeKarmaDelta}{' '}
                            Nghiệp Lực):
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-emerald-400" />
                          <span>
                            Phước Báo Thiện Lành (+{lastOutcome.meritDelta} Công
                            Đức, +{lastOutcome.expDelta} EXP):
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-1">{lastOutcome.consequenceText}</p>
                    <p className="mt-2 border-t border-white/15 pt-2 font-medium text-amber-200">
                      💡 <strong>Lời giảng đạo lý:</strong>{' '}
                      {lastOutcome.teachingExplanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Contemplative Reflection Question */}
              <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-3.5 text-xs text-stone-300 italic">
                🪷 <strong>Câu hỏi quán chiếu nội tâm:</strong>{' '}
                {entry.reflectionQuestion}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
