import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Flower2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const Cinematics: React.FC = () => {
  const activeCinematic = useGameStore((s) => s.activeCinematic);
  const setActiveCinematic = useGameStore((s) => s.setActiveCinematic);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  return (
    <AnimatePresence>
      {activeCinematic && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-black/90 p-8 text-center backdrop-blur-sm"
        >
          {/* Top Cinematic Letterbox Bar */}
          <div className="mt-4 flex items-center gap-2 rounded-full border border-amber-400/50 bg-stone-950/90 px-5 py-1.5 text-xs font-bold tracking-widest text-amber-300 uppercase shadow-lg">
            {activeCinematic.type === 'ascension' && (
              <>
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span>Thiên Đạo Cảm Ứng · Độ Kiếp Phi Thăng</span>
              </>
            )}
            {activeCinematic.type === 'judgment' && (
              <>
                <Flame className="h-4 w-4 text-red-500" />
                <span>Nghiệp Kính Đài Phán Xét · Nhân Quả Báo Ứng</span>
              </>
            )}
            {activeCinematic.type === 'redemption' && (
              <>
                <Flower2 className="h-4 w-4 text-emerald-400" />
                <span>Tâm Bồ Đề Thức Tỉnh · Phá Ám Hồi Quang</span>
              </>
            )}
          </div>

          {/* Center Dramatic Banner */}
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`max-w-2xl rounded-3xl border-2 p-8 shadow-2xl backdrop-blur-md ${
              activeCinematic.type === 'judgment'
                ? 'border-red-500/80 bg-red-950/85 shadow-[0_0_60px_rgba(239,68,68,0.45)]'
                : activeCinematic.type === 'redemption'
                  ? 'border-emerald-400/80 bg-emerald-950/85 shadow-[0_0_60px_rgba(16,185,129,0.45)]'
                  : 'border-amber-400/90 bg-amber-950/85 shadow-[0_0_60px_rgba(251,191,36,0.5)]'
            }`}
          >
            <h1 className="font-serif-title text-3xl font-extrabold tracking-wide text-white sm:text-4xl">
              {activeCinematic.title}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-stone-200 sm:text-base">
              {activeCinematic.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {activeCinematic.type === 'judgment' && (
                <button
                  onClick={() => {
                    setActiveCinematic(null);
                    setActiveModal('hell_ledger');
                  }}
                  className="rounded-xl bg-red-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-red-400"
                >
                  🕯️ Xem Thử Thách Hối Cải & Chuộc Lỗi
                </button>
              )}

              <button
                onClick={() => setActiveCinematic(null)}
                className="rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-bold text-stone-950 shadow-lg transition hover:bg-amber-300"
              >
                Tiếp Tục Hành Trình
              </button>
            </div>
          </motion.div>

          <div className="mb-2 text-xs text-stone-400">
            Camera 3D đang xoay chiếu cảnh giới thực tại của hành giả
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
