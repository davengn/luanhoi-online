import React, { useState } from 'react';
import { Users, Palette, Check, Sparkles, X } from 'lucide-react';
import { COSMETIC_CATALOG } from '@shared/gameData';
import { CharacterAppearance, CharacterArchetype } from '@shared/types';
import { useGameStore } from '../store/gameStore';

const ARCHETYPE_OPTIONS: Array<{ id: CharacterArchetype; label: string }> = [
  { id: 'pilgrim', label: 'Cư Sĩ Hành Hương' },
  { id: 'novice_monk', label: 'Sa-Di Tu Hành' },
  { id: 'guardian', label: 'Hộ Pháp Già Lam' },
  { id: 'celestial_attendant', label: 'Tiên Đồng Thượng Giới' },
  { id: 'immortal', label: 'Chân Tiên Đắc Đạo' },
  { id: 'underworld_envoy', label: 'Sứ Giả Minh Giới' },
];

const HAIRSTYLE_OPTIONS: Array<{
  id: CharacterAppearance['hairstyle'];
  label: string;
}> = [
  { id: 'topknot', label: 'Búi Đạo Gia' },
  { id: 'shaved', label: 'Xuất Gia Tịnh Đảnh' },
  { id: 'flowing', label: 'Tóc Dài Phiêuật' },
  { id: 'crowned', label: 'Kim Quan Tiên Mão' },
  { id: 'braided', label: 'Tết Thanh Lịch' },
];

export const SocialAndShopModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const player = useGameStore((s) => s.player);
  const availableRooms = useGameStore((s) => s.availableRooms);
  const remotePlayers = useGameStore((s) => s.remotePlayers);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const customizeCharacter = useGameStore((s) => s.customizeCharacter);
  const switchRealmOrRoom = useGameStore((s) => s.switchRealmOrRoom);

  const [tab, setTab] = useState<'customize' | 'rooms'>('customize');

  if (activeModal !== 'social_shop' || !player) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-pink-500/50 bg-stone-950 text-stone-100 shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 bg-gradient-to-r from-pink-950/60 via-stone-900 to-amber-950/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-2xl font-bold text-pink-200">
                Tịnh Thất Pháp Phục & Đạo Tràng Đa Người Chơi
              </h2>
              <p className="text-xs text-stone-400">
                Hiện có: <strong className="text-pink-300">{player.senCurrency} 🌸 Sen</strong> ·{' '}
                <strong className="text-cyan-300">{player.tienNgoc} 💎 Tiên Ngọc</strong> (100% Thuần Thẩm Mỹ, Không Pay-to-Win)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('customize')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                tab === 'customize'
                  ? 'bg-pink-400 text-stone-950'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
              }`}
            >
              👘 Pháp Phục, Hào Quang & Pháp Khí
            </button>
            <button
              onClick={() => setTab('rooms')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                tab === 'rooms'
                  ? 'bg-cyan-400 text-stone-950'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
              }`}
            >
              🏯 Chuyển Phòng Đạo Tràng ({availableRooms.length})
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
        {tab === 'customize' ? (
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* Archetype & Hairstyle Selection */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                <div className="mb-2 text-xs font-bold text-amber-300 uppercase">
                  1. Chọn Hình Tướng Căn Cơ (Archetype):
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ARCHETYPE_OPTIONS.map((arch) => (
                    <button
                      key={arch.id}
                      onClick={() =>
                        customizeCharacter({ archetype: arch.id })
                      }
                      className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                        player.appearance.archetype === arch.id
                          ? 'border-amber-400 bg-amber-950/60 text-amber-200'
                          : 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      {arch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                <div className="mb-2 text-xs font-bold text-amber-300 uppercase">
                  2. Chọn Kiểu Tóc & Mão:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {HAIRSTYLE_OPTIONS.map((hs) => (
                    <button
                      key={hs.id}
                      onClick={() => customizeCharacter({ hairstyle: hs.id })}
                      className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                        player.appearance.hairstyle === hs.id
                          ? 'border-amber-400 bg-amber-950/60 text-amber-200'
                          : 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      {hs.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cosmetic Catalog (Outfits, Auras, Accessories, Titles) */}
            <div>
              <div className="mb-3 text-xs font-bold text-pink-300 uppercase">
                3. Pháp Bảo Thẩm Mỹ (Thỉnh bằng Hoa Sen & Tiên Ngọc tích lũy):
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {COSMETIC_CATALOG.map((item) => {
                  const isUnlocked =
                    item.senCost === 0 && item.tienNgocCost === 0
                      ? true
                      : player.unlockedOutfits.includes(item.id) ||
                        player.unlockedAuras.includes(item.id) ||
                        player.unlockedTitles.includes(item.vietnameseName);

                  const isEquipped =
                    (item.category === 'outfit' &&
                      player.appearance.robeColor === item.robeColor) ||
                    (item.category === 'aura' &&
                      player.appearance.auraId === item.id) ||
                    (item.category === 'accessory' &&
                      player.appearance.accessoryId === item.accessoryKey) ||
                    (item.category === 'title' &&
                      player.appearance.titleId === item.vietnameseName);

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col justify-between rounded-2xl border p-4 ${
                        isEquipped
                          ? 'border-amber-400 bg-amber-950/35'
                          : 'border-stone-800 bg-stone-900/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="rounded-full bg-stone-800 px-2.5 py-0.5 font-bold text-pink-300 uppercase">
                            {item.category} · Cấp {item.requiredRankStage}
                          </span>
                          {item.robeColor && (
                            <span
                              className="h-4 w-4 rounded-full border border-white/40"
                              style={{ backgroundColor: item.robeColor }}
                            />
                          )}
                        </div>
                        <h4 className="mt-2 text-sm font-bold text-amber-100">
                          {item.vietnameseName}
                        </h4>
                        <p className="mt-1 text-xs text-stone-400">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-stone-800 pt-3">
                        <span className="text-xs font-bold text-cyan-200">
                          {item.senCost > 0 ? `${item.senCost} 🌸` : 'Miễn phí'}{' '}
                          {item.tienNgocCost > 0
                            ? `· ${item.tienNgocCost} 💎`
                            : ''}
                        </span>
                        <button
                          onClick={() =>
                            customizeCharacter(
                              {
                                ...(item.robeColor
                                  ? { robeColor: item.robeColor }
                                  : {}),
                                ...(item.trimColor
                                  ? { trimColor: item.trimColor }
                                  : {}),
                                ...(item.category === 'aura'
                                  ? { auraId: item.id }
                                  : {}),
                                ...(item.accessoryKey
                                  ? { accessoryId: item.accessoryKey }
                                  : {}),
                                ...(item.category === 'title'
                                  ? {
                                      titleId: item.vietnameseName,
                                      nameplateStyle:
                                        item.nameplateStyle || 'gold',
                                    }
                                  : {}),
                              },
                              isUnlocked ? undefined : item.id,
                              item.category === 'aura'
                                ? 'aura'
                                : item.category === 'title'
                                  ? 'title'
                                  : 'outfit'
                            )
                          }
                          className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                            isEquipped
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isUnlocked
                                ? 'bg-amber-400 text-stone-950 hover:bg-amber-300'
                                : 'bg-pink-500 text-white hover:bg-pink-400'
                          }`}
                        >
                          {isEquipped ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Đang Mặc
                            </>
                          ) : isUnlocked ? (
                            'Trang Bị'
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" /> Thỉnh Pháp Vật
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: MULTIPLAYER ROOM SHARDS */
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {availableRooms.map((room) => (
                <div
                  key={room.roomId}
                  className="flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-900/80 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-400" />
                      <h4 className="text-sm font-bold text-amber-100">
                        {room.name}
                      </h4>
                    </div>
                    <p className="mt-1 text-xs text-stone-400">
                      Cõi: {room.realm.toUpperCase()} · Đạo hữu:{' '}
                      {room.playerCount}/{room.maxCapacity}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      switchRealmOrRoom(room.realm, {
                        roomType: room.roomType,
                        hellLevel: room.hellLevel,
                        preferredRoomId: room.roomId,
                      });
                      setActiveModal('none');
                    }}
                    className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-stone-950 hover:bg-cyan-300"
                  >
                    Vào Phòng
                  </button>
                </div>
              ))}
            </div>

            {remotePlayers.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-xs font-bold text-stone-400 uppercase">
                  Đạo hữu đang cùng tu tập trong phòng ({remotePlayers.length}):
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {remotePlayers.map((rp) => (
                    <div
                      key={rp.id}
                      className="rounded-xl border border-stone-800 bg-stone-900 p-3 text-xs"
                    >
                      <div className="font-bold text-amber-200">
                        {rp.username}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Cấp {rp.rankStage} · Công Đức: {rp.merit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
