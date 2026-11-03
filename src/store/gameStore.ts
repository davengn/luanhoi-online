import { create } from 'zustand';
import {
  CharacterAppearance,
  ClientToServerMessage,
  CommunityEventState,
  KarmaTransaction,
  MeritActivityConfig,
  MeritActivityId,
  PlayerActionState,
  PlayerProfile,
  QuestProgress,
  RankDefinition,
  RealmId,
  RemotePlayerState,
  RoomSummary,
  RoomType,
  ServerToClientMessage,
  Vector3D,
} from '@shared/types';
import {
  ACHIEVEMENT_DEFINITIONS,
  COSMETIC_CATALOG,
  MERIT_ACTIVITIES,
  QUEST_DEFINITIONS,
  QUICK_CHAT_PRESETS,
  RANKS,
  TRIBULATIONS,
  calculateEffectiveActivityReward,
  calculateLevelFromExp,
  determineHighestEligibleRank,
  evaluateAssignedHellLevel,
} from '@shared/gameData';
import {
  HELL_LEVELS,
  WISDOM_LIBRARY,
  getHellLevelByNumber,
} from '@shared/loreData';
import soundEngine, { DharmaVerseCadence } from '../audio/soundEngine';

export type ModalId =
  | 'none'
  | 'wisdom'
  | 'hell_ledger'
  | 'tribulation'
  | 'quests'
  | 'social_shop'
  | 'npc_dialogue';

export type GraphicsQuality = 'Low' | 'Medium' | 'High';

export interface InteractableTarget {
  id: string;
  type:
    | 'altar'
    | 'npc'
    | 'gate'
    | 'hell_shrine'
    | 'tribulation_altar'
    | 'bell'
    | 'prayer_wheel'
    | 'incense'
    | 'lotus_pond'
    | 'wisdom_pavilion';
  label: string;
  sublabel: string;
  position: Vector3D;
  activityId?: MeritActivityId;
  targetRealm?: RealmId;
  targetHellLevel?: number;
  npcId?: string;
}

export interface CinematicEvent {
  type: 'ascension' | 'judgment' | 'redemption';
  title: string;
  subtitle: string;
  rankStage?: number;
  hellLevel?: number;
  karmaBalance?: number;
}

export interface ToastNotice {
  id: string;
  title: string;
  subtitle?: string;
  meritDelta?: number;
  karmaDelta?: number;
  expDelta?: number;
  senDelta?: number;
  type: 'merit' | 'karma' | 'ascension' | 'redemption' | 'info';
}

const STORAGE_PLAYER_ID_KEY = 'luanhoi_player_id_v1';
const STORAGE_PROFILE_BACKUP_KEY = 'luanhoi_profile_backup_v1';

function createInitialQuests(): Record<string, QuestProgress> {
  const map: Record<string, QuestProgress> = {};
  for (const q of QUEST_DEFINITIONS) {
    map[q.id] = {
      questId: q.id,
      currentCount: 0,
      targetCount: q.targetCount,
      completed: false,
      claimed: false,
      resetCycle: q.resetCycle,
    };
  }
  return map;
}

function createDefaultProfile(
  playerId: string,
  username: string,
  appearance?: Partial<CharacterAppearance>
): PlayerProfile {
  const defaultAppearance: CharacterAppearance = {
    archetype: appearance?.archetype || 'pilgrim',
    robeColor: appearance?.robeColor || '#b45309',
    trimColor: appearance?.trimColor || '#f5d76e',
    hairstyle: appearance?.hairstyle || 'topknot',
    hairColor: appearance?.hairColor || '#1c1917',
    auraId: appearance?.auraId || 'aura_warm_incense',
    accessoryId: appearance?.accessoryId || 'mala_beads',
    titleId: appearance?.titleId || 'Phàm Nhân',
    nameplateStyle: appearance?.nameplateStyle || 'wood',
  };

  return {
    id: playerId,
    username: username || 'Thiện Hành Giả',
    appearance: defaultAppearance,
    merit: 30,
    negativeKarma: 0,
    karmaBalance: 30,
    exp: 25,
    level: 1,
    rankStage: 1,
    senCurrency: 50,
    tienNgoc: 10,
    currentRealm: 'human',
    currentRoomId: 'human_main_temple_1',
    hellSentenceLevel: 0,
    completedHellLevels: [],
    completedTribulations: [],
    unlockedRealms: ['human'],
    unlockedOutfits: ['outfit_pilgrim_robe'],
    unlockedAuras: ['aura_warm_incense'],
    unlockedTitles: ['Phàm Nhân'],
    completedWisdomIds: [],
    achievements: [],
    quests: createInitialQuests(),
    karmaLedger: [
      {
        id: 'tx_welcome',
        timestamp: Date.now(),
        type: 'merit',
        amount: 30,
        reason: 'Khởi tâm hướng thiện bước vào Chùa Linh Sơn Cổ Tự',
        sourceId: 'system_init',
        netKarmaAfter: 30,
      },
    ],
    actionCooldowns: {},
    dailyActionCounts: {},
    position: { x: 0, y: 0, z: 18 },
    rotationY: Math.PI,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

interface GameStoreState {
  // Auth & Profile
  isInitialized: boolean;
  isConnected: boolean;
  player: PlayerProfile | null;
  remotePlayers: RemotePlayerState[];
  availableRooms: RoomSummary[];
  currentRoom: RoomSummary | null;
  communityEvent: CommunityEventState | null;
  onlineTotal: number;

  // 3D World & Navigation State
  localPosition: Vector3D;
  localRotationY: number;
  localActionState: PlayerActionState;
  localChatBubble: { text: string; expiresAt: number } | null;
  targetMovePosition: Vector3D | null;
  joystickVector: { x: number; y: number };
  nearbyInteractable: InteractableTarget | null;
  activeVfx: {
    id: string;
    type: MeritActivityConfig['vfxType'];
    position: Vector3D;
    timestamp: number;
  } | null;

  // Underworld & 18 Hell Floors State
  underworldSubZone: 'judgment_hall' | 'hell_floor';
  activeHellFloor: number; // 1..18
  hellChallengeProgress: Record<number, number>;

  // UI & Audio & Graphics State
  activeModal: ModalId;
  activeNpcId: string | null;
  activeCinematic: CinematicEvent | null;
  graphicsQuality: GraphicsQuality;
  isAudioMuted: boolean;
  audioVolume: number;
  beadCounter: number;
  dharmaSession: {
    active: boolean;
    progress: number;
    verse?: DharmaVerseCadence;
  } | null;
  toasts: ToastNotice[];

  // Actions
  initSession: (
    username?: string,
    appearance?: Partial<CharacterAppearance>
  ) => Promise<void>;
  connectWebSocket: () => void;
  sendWsMessage: (msg: ClientToServerMessage) => void;
  updateLocalTransform: (
    pos: Vector3D,
    rotY: number,
    actionState?: PlayerActionState
  ) => void;
  setTargetMovePosition: (pos: Vector3D | null) => void;
  setJoystickVector: (vec: { x: number; y: number }) => void;
  setNearbyInteractable: (target: InteractableTarget | null) => void;
  setActiveModal: (modal: ModalId, npcId?: string | null) => void;
  setActiveCinematic: (cinematic: CinematicEvent | null) => void;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
  toggleAudioMute: () => void;
  setAudioVolume: (v: number) => void;
  addToast: (toast: Omit<ToastNotice, 'id'>) => void;
  removeToast: (id: string) => void;

  // Gameplay Actions (Server-authoritative with local fallback)
  performMeritActivity: (activityId: MeritActivityId) => Promise<void>;
  tapPrayerBead: () => void;
  startDharmaSession: () => void;
  stopDharmaSession: () => void;
  sendQuickChat: (presetId: string, customText?: string) => void;
  triggerEmote: (emoteState: PlayerActionState, label?: string) => void;
  submitWisdomChoice: (
    wisdomId: string,
    choiceId: string
  ) => Promise<{
    meritDelta: number;
    negativeKarmaDelta: number;
    expDelta: number;
    judgmentTriggered: boolean;
    assignedHellLevel: number;
    explanation: string;
  } | null>;
  attemptAscension: () => Promise<boolean>;
  completeTribulationTrial: (
    tribulationId: string,
    success: boolean,
    score: number
  ) => Promise<void>;
  advanceHellFloorChallenge: (hellLevel: number) => void;
  submitHellRedemption: (
    hellLevel: number,
    choiceIndex: number
  ) => Promise<{ freed: boolean; message: string; karmaRestored: number }>;
  claimQuestReward: (questId: string) => Promise<void>;
  contributeToCommunityEvent: (amount?: number) => void;
  customizeCharacter: (
    appearance?: Partial<CharacterAppearance>,
    unlockItemId?: string,
    unlockType?: 'outfit' | 'aura' | 'title' | 'accessory'
  ) => Promise<boolean>;
  switchRealmOrRoom: (
    realm: RealmId,
    options?: {
      roomType?: RoomType;
      hellLevel?: number;
      underworldSubZone?: 'judgment_hall' | 'hell_floor';
      preferredRoomId?: string;
    }
  ) => Promise<void>;
  refreshRooms: () => Promise<void>;
  triggerContextualInteract: () => void;
}

let wsInstance: WebSocket | null = null;
let moveThrottleTimer: number = 0;
let actionResetTimeout: ReturnType<typeof setTimeout> | null = null;

function saveProfileBackup(profile: PlayerProfile) {
  try {
    localStorage.setItem(STORAGE_PLAYER_ID_KEY, profile.id);
    localStorage.setItem(STORAGE_PROFILE_BACKUP_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota issues
  }
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  isInitialized: false,
  isConnected: false,
  player: null,
  remotePlayers: [],
  availableRooms: [
    {
      roomId: 'human_main_temple_1',
      name: 'Chùa Linh Sơn — Đạo Tràng 1',
      roomType: 'main_temple',
      realm: 'human',
      playerCount: 12,
      maxCapacity: 60,
      queueLength: 0,
      shardIndex: 1,
    },
    {
      roomId: 'human_meditation_hall_1',
      name: 'Thiền Đường Tịnh Tâm',
      roomType: 'meditation_hall',
      realm: 'human',
      playerCount: 8,
      maxCapacity: 30,
      queueLength: 0,
      shardIndex: 1,
    },
    {
      roomId: 'celestial_heavenly_court_1',
      name: 'Cửu Trùng Vân Cung — Đài Tiên 1',
      roomType: 'heavenly_court',
      realm: 'celestial',
      playerCount: 5,
      maxCapacity: 50,
      queueLength: 0,
      shardIndex: 1,
    },
    {
      roomId: 'underworld_judgment_1',
      name: 'Nghiệp Kính Đài — Âm司',
      roomType: 'underworld_judgment',
      realm: 'underworld',
      playerCount: 4,
      maxCapacity: 40,
      queueLength: 0,
      shardIndex: 1,
    },
  ],
  currentRoom: null,
  communityEvent: {
    id: 'evt_prostration_108',
    name: 'Đại Lễ Bái Sám 108 Lạy Cầu Quốc Thái Dân An',
    description:
      'Chư vị đạo hữu trong phòng cùng lễ Phật, tọa thiền và dâng hương tích lũy đủ 108 thiện hạnh để nhận Đại Phúc Báo.',
    type: 'prostration_108',
    currentProgress: 42,
    targetProgress: 108,
    activeParticipants: 9,
    bonusMeritReward: 80,
  },
  onlineTotal: 18,

  localPosition: { x: 0, y: 0, z: 18 },
  localRotationY: Math.PI,
  localActionState: 'idle',
  localChatBubble: null,
  targetMovePosition: null,
  joystickVector: { x: 0, y: 0 },
  nearbyInteractable: null,
  activeVfx: null,

  underworldSubZone: 'judgment_hall',
  activeHellFloor: 1,
  hellChallengeProgress: {},

  activeModal: 'none',
  activeNpcId: null,
  activeCinematic: null,
  graphicsQuality: 'High',
  isAudioMuted: false,
  audioVolume: 0.75,
  beadCounter: 0,
  dharmaSession: null,
  toasts: [],

  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-4), { ...toast, id }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4200);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  initSession: async (username, appearance) => {
    const savedPlayerId =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(STORAGE_PLAYER_ID_KEY) || undefined
        : undefined;

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: savedPlayerId,
          username,
          appearance,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const player: PlayerProfile = data.player;
        saveProfileBackup(player);
        const startRealm =
          player.hellSentenceLevel > 0 ? 'underworld' : player.currentRealm;
        const startSubZone =
          player.hellSentenceLevel > 0 ? 'hell_floor' : 'judgment_hall';
        const startHellFloor =
          player.hellSentenceLevel > 0 ? player.hellSentenceLevel : 1;

        set({
          player: { ...player, currentRealm: startRealm },
          availableRooms: data.availableRooms || get().availableRooms,
          localPosition: player.position || { x: 0, y: 0, z: 18 },
          localRotationY: player.rotationY ?? Math.PI,
          underworldSubZone: startSubZone,
          activeHellFloor: startHellFloor,
          isInitialized: true,
        });

        soundEngine.setRealmAmbience(startRealm, startHellFloor);
        get().connectWebSocket();
        return;
      }
    } catch {
      // Fallback to local profile if backend server is still starting
    }

    let fallbackProfile: PlayerProfile | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_PROFILE_BACKUP_KEY);
      if (raw) {
        fallbackProfile = JSON.parse(raw) as PlayerProfile;
        if (username) fallbackProfile.username = username;
        if (appearance) {
          fallbackProfile.appearance = {
            ...fallbackProfile.appearance,
            ...appearance,
          };
        }
      }
    } catch {
      fallbackProfile = null;
    }

    if (!fallbackProfile) {
      const generatedId =
        savedPlayerId || `player_${Math.random().toString(36).slice(2, 10)}`;
      fallbackProfile = createDefaultProfile(
        generatedId,
        username || 'Thiện Hành Giả',
        appearance
      );
    }

    saveProfileBackup(fallbackProfile);
    const startRealm =
      fallbackProfile.hellSentenceLevel > 0
        ? 'underworld'
        : fallbackProfile.currentRealm;
    const startHellFloor =
      fallbackProfile.hellSentenceLevel > 0
        ? fallbackProfile.hellSentenceLevel
        : 1;

    set({
      player: fallbackProfile,
      localPosition: fallbackProfile.position || { x: 0, y: 0, z: 18 },
      localRotationY: fallbackProfile.rotationY ?? Math.PI,
      underworldSubZone:
        fallbackProfile.hellSentenceLevel > 0 ? 'hell_floor' : 'judgment_hall',
      activeHellFloor: startHellFloor,
      isInitialized: true,
    });

    soundEngine.setRealmAmbience(startRealm, startHellFloor);
    get().connectWebSocket();
  },

  connectWebSocket: () => {
    if (typeof window === 'undefined') return;
    if (wsInstance && wsInstance.readyState <= WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsInstance = ws;

      ws.onopen = () => {
        set({ isConnected: true });
        const player = get().player;
        if (player) {
          const roomType: RoomType =
            player.currentRealm === 'celestial'
              ? 'heavenly_court'
              : player.currentRealm === 'underworld'
                ? player.hellSentenceLevel > 0
                  ? 'hell_instance'
                  : 'underworld_judgment'
                : 'main_temple';

          get().sendWsMessage({
            type: 'join_room',
            playerId: player.id,
            roomType,
            realm: player.currentRealm,
            hellLevel:
              player.hellSentenceLevel > 0
                ? player.hellSentenceLevel
                : get().activeHellFloor,
          });
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as ServerToClientMessage;
          const state = get();

          switch (msg.type) {
            case 'welcome':
              saveProfileBackup(msg.player);
              set({
                player: msg.player,
                currentRoom: msg.room,
                remotePlayers: msg.players.filter(
                  (p) => p.id !== msg.player.id
                ),
                communityEvent: msg.communityEvent,
              });
              break;

            case 'room_joined':
              set({
                currentRoom: msg.room,
                remotePlayers: msg.players.filter(
                  (p) => p.id !== state.player?.id
                ),
                communityEvent: msg.communityEvent,
              });
              break;

            case 'world_state_delta':
              set({
                remotePlayers: msg.players.filter(
                  (p) => p.id !== state.player?.id
                ),
                onlineTotal: msg.onlineTotal,
              });
              break;

            case 'player_joined':
              if (msg.player.id !== state.player?.id) {
                set((s) => ({
                  remotePlayers: [
                    ...s.remotePlayers.filter((p) => p.id !== msg.player.id),
                    msg.player,
                  ],
                }));
              }
              break;

            case 'player_left':
              set((s) => ({
                remotePlayers: s.remotePlayers.filter(
                  (p) => p.id !== msg.playerId
                ),
              }));
              break;

            case 'player_emote':
              set((s) => ({
                remotePlayers: s.remotePlayers.map((p) =>
                  p.id === msg.playerId
                    ? {
                        ...p,
                        actionState: msg.actionState,
                        activeEmote: msg.emoteId,
                      }
                    : p
                ),
              }));
              break;

            case 'player_chat':
              if (msg.playerId === state.player?.id) {
                set({
                  localChatBubble: {
                    text: msg.text,
                    expiresAt: Date.now() + 5500,
                  },
                });
              } else {
                set((s) => ({
                  remotePlayers: s.remotePlayers.map((p) =>
                    p.id === msg.playerId
                      ? {
                          ...p,
                          chatBubble: {
                            text: msg.text,
                            expiresAt: Date.now() + 5500,
                          },
                        }
                      : p
                  ),
                }));
              }
              break;

            case 'profile_updated':
              saveProfileBackup(msg.profile);
              set({ player: msg.profile });
              if (msg.feedback) {
                state.addToast({
                  title: msg.feedback.title,
                  meritDelta: msg.feedback.meritDelta,
                  karmaDelta: msg.feedback.karmaDelta,
                  expDelta: msg.feedback.expDelta,
                  type:
                    (msg.feedback.karmaDelta || 0) > 0 ? 'karma' : 'merit',
                });
              }
              break;

            case 'ascension_broadcast':
              state.addToast({
                title: `✨ ${msg.username} đã phi thăng cảnh giới ${msg.newRankName}!`,
                subtitle: `Tầng Tu Vi thứ ${msg.stage} rực sáng khắp đạo tràng`,
                type: 'ascension',
              });
              break;

            case 'karma_judgment_triggered':
              if (msg.playerId === state.player?.id) {
                soundEngine.playKarmaThunder();
                soundEngine.setRealmAmbience(
                  'underworld',
                  msg.assignedHellLevel
                );
                set((s) => ({
                  player: s.player
                    ? {
                        ...s.player,
                        currentRealm: 'underworld',
                        hellSentenceLevel: msg.assignedHellLevel,
                        karmaBalance: msg.karmaBalance,
                      }
                    : null,
                  underworldSubZone: 'hell_floor',
                  activeHellFloor: msg.assignedHellLevel,
                  localPosition: { x: 0, y: 0, z: 14 },
                  activeCinematic: {
                    type: 'judgment',
                    title: `PHÁN XÉT NGHIỆP LỰC: ${msg.hellName.toUpperCase()}`,
                    subtitle: `Nghiệp Lực tích tụ khiến chỉ số Nhân Quả giảm xuống ${msg.karmaBalance}. Hãy thành tâm vượt thử thách hối cải để trở về Phàm Giới!`,
                    hellLevel: msg.assignedHellLevel,
                    karmaBalance: msg.karmaBalance,
                  },
                }));
              }
              break;

            case 'hell_redemption_completed':
              if (msg.playerId === state.player?.id) {
                soundEngine.playAscensionChoir();
                soundEngine.setRealmAmbience('human');
                set((s) => ({
                  player: s.player
                    ? {
                        ...s.player,
                        currentRealm: 'human',
                        hellSentenceLevel: 0,
                        karmaBalance: msg.newKarmaBalance,
                      }
                    : null,
                  localPosition: { x: 0, y: 0, z: 16 },
                  activeCinematic: {
                    type: 'redemption',
                    title: 'QUAY ĐẦU LÀ BỜ — SIÊU THOÁT ĐỊA NGỤC',
                    subtitle: `Ánh sáng tỉnh thức đã hóa giải xiềng xích tầng ngục thứ ${msg.freedFromLevel}. Chào mừng thiện hữu trở lại Chùa Linh Sơn!`,
                    hellLevel: msg.freedFromLevel,
                    karmaBalance: msg.newKarmaBalance,
                  },
                }));
              }
              break;

            case 'community_event_updated':
              set({ communityEvent: msg.event });
              if (msg.milestoneReached) {
                soundEngine.playBellChime(216);
                state.addToast({
                  title: `🏮 Đại Lễ Viên Mãn: ${msg.event.name}!`,
                  subtitle: `Toàn đạo tràng nhận thưởng +${msg.event.bonusMeritReward} Công Đức cộng hưởng!`,
                  meritDelta: msg.event.bonusMeritReward,
                  type: 'ascension',
                });
              }
              break;

            case 'error_notice':
              state.addToast({
                title: msg.message,
                type: 'info',
              });
              break;
          }
        } catch {
          // Ignore malformed WS message
        }
      };

      ws.onclose = () => {
        set({ isConnected: false });
        wsInstance = null;
      };
    } catch {
      set({ isConnected: false });
    }
  },

  sendWsMessage: (msg) => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      try {
        wsInstance.send(JSON.stringify(msg));
      } catch {
        // Ignore send error
      }
    }
  },

  updateLocalTransform: (pos, rotY, actionState) => {
    const currentState = get();
    const nextAction = actionState ?? currentState.localActionState;
    set({
      localPosition: pos,
      localRotationY: rotY,
      localActionState: nextAction,
    });

    const now = performance.now();
    if (now - moveThrottleTimer >= 85) {
      moveThrottleTimer = now;
      currentState.sendWsMessage({
        type: 'move',
        position: pos,
        rotationY: rotY,
        actionState: nextAction,
      });
    }
  },

  setTargetMovePosition: (pos) => set({ targetMovePosition: pos }),
  setJoystickVector: (vec) => set({ joystickVector: vec }),
  setNearbyInteractable: (target) => set({ nearbyInteractable: target }),

  setActiveModal: (modal, npcId = null) => {
    soundEngine.playUiClick();
    set({ activeModal: modal, activeNpcId: npcId });
  },

  setActiveCinematic: (cinematic) => set({ activeCinematic: cinematic }),
  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),

  toggleAudioMute: () => {
    const muted = soundEngine.toggleMute();
    set({ isAudioMuted: muted });
  },

  setAudioVolume: (v) => {
    soundEngine.setVolume(v);
    set({ audioVolume: v, isAudioMuted: soundEngine.isMuted() });
  },

  performMeritActivity: async (activityId) => {
    const state = get();
    const player = state.player;
    if (!player) return;

    const config = MERIT_ACTIVITIES[activityId];
    if (!config) return;

    const now = Date.now();
    const cooldownUntil = player.actionCooldowns?.[activityId] || 0;
    if (now < cooldownUntil) {
      const waitSec = ((cooldownUntil - now) / 1000).toFixed(1);
      state.addToast({
        title: `Đang tịnh tâm hồi khí (${waitSec}s)`,
        subtitle: config.name,
        type: 'info',
      });
      return;
    }

    if (player.rankStage < config.requiredRankStage) {
      state.addToast({
        title: `Yêu cầu cảnh giới Cấp ${config.requiredRankStage}`,
        subtitle: `Hãy tiếp tục tích lũy Công Đức để mở khóa ${config.name}`,
        type: 'info',
      });
      return;
    }

    // Play authentic Buddhist sound & set 3D animation + VFX immediately
    soundEngine.playActivitySound(activityId);
    set({
      localActionState: config.actionState,
      activeVfx: {
        id: `vfx_${now}`,
        type: config.vfxType,
        position: { ...state.localPosition },
        timestamp: now,
      },
    });

    if (actionResetTimeout) clearTimeout(actionResetTimeout);
    actionResetTimeout = setTimeout(() => {
      if (get().localActionState === config.actionState) {
        set({ localActionState: 'idle' });
      }
    }, Math.min(config.cooldownMs, 3800));

    state.sendWsMessage({
      type: 'perform_activity',
      activityId,
      targetPosition: state.localPosition,
    });

    try {
      const res = await fetch('/api/economy/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id,
          activityId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        saveProfileBackup(data.player);
        set({ player: data.player });
        state.addToast({
          title: config.name.split(' (')[0],
          subtitle: data.diminished
            ? 'Đã vượt giới hạn chánh niệm trong ngày (Giảm 50% hiệu quả)'
            : config.zoneHint,
          meritDelta: data.meritEarned,
          expDelta: data.expEarned,
          senDelta: data.senEarned,
          type: 'merit',
        });
        state.contributeToCommunityEvent(1);
        return;
      }
    } catch {
      // Offline / local deterministic fallback
    }

    const dailyCount = player.dailyActionCounts[activityId] || 0;
    const reward = calculateEffectiveActivityReward(config, dailyCount);
    const nextMerit = player.merit + reward.merit;
    const nextExp = player.exp + reward.exp;
    const nextSen = player.senCurrency + reward.sen;
    const nextKarmaBalance = nextMerit - player.negativeKarma;
    const nextLevel = calculateLevelFromExp(nextExp);

    const updatedQuests = { ...player.quests };
    for (const qDef of QUEST_DEFINITIONS) {
      if (
        qDef.activityTrigger === activityId ||
        qDef.activityTrigger === 'any_merit'
      ) {
        const cur = updatedQuests[qDef.id] || {
          questId: qDef.id,
          currentCount: 0,
          targetCount: qDef.targetCount,
          completed: false,
          claimed: false,
          resetCycle: qDef.resetCycle,
        };
        if (!cur.completed) {
          const nextCount = Math.min(cur.targetCount, cur.currentCount + 1);
          updatedQuests[qDef.id] = {
            ...cur,
            currentCount: nextCount,
            completed: nextCount >= cur.targetCount,
          };
        }
      }
    }

    const tx: KarmaTransaction = {
      id: `tx_${now}`,
      timestamp: now,
      type: 'merit',
      amount: reward.merit,
      reason: config.name,
      sourceId: activityId,
      netKarmaAfter: nextKarmaBalance,
    };

    const updatedProfile: PlayerProfile = {
      ...player,
      merit: nextMerit,
      exp: nextExp,
      level: nextLevel,
      senCurrency: nextSen,
      karmaBalance: nextKarmaBalance,
      quests: updatedQuests,
      karmaLedger: [tx, ...player.karmaLedger.slice(0, 49)],
      actionCooldowns: {
        ...player.actionCooldowns,
        [activityId]: now + config.cooldownMs,
      },
      dailyActionCounts: {
        ...player.dailyActionCounts,
        [activityId]: dailyCount + 1,
      },
      updatedAt: now,
    };

    saveProfileBackup(updatedProfile);
    set({ player: updatedProfile });
    state.addToast({
      title: config.name.split(' (')[0],
      subtitle: reward.isSoftCapped
        ? 'Đã vượt mức khuyến nghị trong ngày'
        : config.zoneHint,
      meritDelta: reward.merit,
      expDelta: reward.exp,
      senDelta: reward.sen,
      type: 'merit',
    });
    state.contributeToCommunityEvent(1);
  },

  tapPrayerBead: () => {
    const state = get();
    soundEngine.playWoodenFish(1.0);
    const nextBead = state.beadCounter + 1;
    set({
      beadCounter: nextBead,
      localActionState: 'pray_beads',
    });

    if (nextBead % 9 === 0) {
      // Every 9 wooden-fish strikes triggers prayer_beads merit activity
      state.performMeritActivity('prayer_beads');
    } else {
      state.addToast({
        title: `Gõ Mõ Tụng Kinh (${nextBead}/108 hạt)`,
        subtitle: 'Tâm niệm A Di Đà Phật — Gõ đủ mỗi 9 nhịp nhận Công Đức',
        type: 'info',
      });
    }
  },

  startDharmaSession: () => {
    const state = get();
    if (state.dharmaSession?.active) {
      state.stopDharmaSession();
      return;
    }

    set({
      localActionState: 'meditate',
      dharmaSession: { active: true, progress: 0 },
    });

    soundEngine.playDharmaVoiceSession(
      (progress, verse) => {
        set({
          dharmaSession: { active: true, progress, verse },
        });
      },
      () => {
        set({ dharmaSession: null, localActionState: 'idle' });
        get().performMeritActivity('listen_dharma');
      },
      2200
    );
  },

  stopDharmaSession: () => {
    soundEngine.stopDharmaVoiceSession();
    set({ dharmaSession: null, localActionState: 'idle' });
  },

  sendQuickChat: (presetId, customText) => {
    const state = get();
    const preset = QUICK_CHAT_PRESETS.find((p) => p.id === presetId);
    const text = customText || preset?.text || 'Nam Mô A Di Đà Phật 🙏';
    const emote = preset?.suggestedEmote || 'greet_chaptay';

    soundEngine.playUiClick();
    set({
      localChatBubble: {
        text,
        expiresAt: Date.now() + 5500,
      },
      localActionState: emote,
    });

    state.sendWsMessage({
      type: 'quick_chat',
      presetId,
      customText: text,
    });

    setTimeout(() => {
      if (get().localActionState === emote) {
        set({ localActionState: 'idle' });
      }
    }, 3000);
  },

  triggerEmote: (emoteState, label) => {
    const state = get();
    soundEngine.playUiClick();
    set({ localActionState: emoteState });
    state.sendWsMessage({
      type: 'emote',
      emoteId: emoteState,
      actionState: emoteState,
    });

    if (label) {
      set({
        localChatBubble: {
          text: label,
          expiresAt: Date.now() + 4000,
        },
      });
    }
  },

  submitWisdomChoice: async (wisdomId, choiceId) => {
    const state = get();
    const player = state.player;
    if (!player) return null;

    const entry = WISDOM_LIBRARY.find((w) => w.id === wisdomId);
    const choice = entry?.dilemmaScenario.choices.find(
      (c) => c.id === choiceId
    );
    if (!entry || !choice) return null;

    try {
      const res = await fetch('/api/economy/wisdom-choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id,
          wisdomId,
          choiceId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedPlayer: PlayerProfile = data.player;
        saveProfileBackup(updatedPlayer);
        set({ player: updatedPlayer });

        if (choice.meritDelta > 0) {
          soundEngine.playMeritChime();
          state.addToast({
            title: `Trí Tuệ Khai Mở: +${choice.meritDelta} Công Đức`,
            subtitle: entry.title,
            meritDelta: choice.meritDelta,
            expDelta: choice.expDelta,
            type: 'merit',
          });
        } else if (choice.negativeKarmaDelta > 0) {
          soundEngine.playKarmaThunder();
          state.addToast({
            title: `Nghiệp Lực Phát Sinh: +${choice.negativeKarmaDelta} Nghiệp Ác`,
            subtitle: choice.consequenceText,
            karmaDelta: choice.negativeKarmaDelta,
            type: 'karma',
          });
        }

        if (data.outcome?.judgmentTriggered) {
          const assignedLevel = data.outcome.assignedHellLevel || 1;
          const hellCfg = getHellLevelByNumber(assignedLevel);
          soundEngine.setRealmAmbience('underworld', assignedLevel);
          set({
            activeModal: 'none',
            underworldSubZone: 'hell_floor',
            activeHellFloor: assignedLevel,
            localPosition: { x: 0, y: 0, z: 14 },
            activeCinematic: {
              type: 'judgment',
              title: `PHÁN XÉT NGHIỆP LỰC — ${hellCfg?.vietnameseName.toUpperCase() || `TẦNG THỨ ${assignedLevel}`}`,
              subtitle: `Do lựa chọn tổn hại chúng sinh, chỉ số Nhân Quả giảm xuống ${updatedPlayer.karmaBalance}. Phán Quan Thôi Giác đã triệu hồi tâm thức bạn về Âm Phủ để chiêm nghiệm và chuộc lỗi!`,
              hellLevel: assignedLevel,
              karmaBalance: updatedPlayer.karmaBalance,
            },
          });
        }

        return data.outcome;
      }
    } catch {
      // Fallback local calculation
    }

    const now = Date.now();
    const nextMerit = player.merit + choice.meritDelta;
    const nextNegKarma = player.negativeKarma + choice.negativeKarmaDelta;
    const nextExp = player.exp + choice.expDelta;
    const nextKarmaBalance = nextMerit - nextNegKarma;
    const assignedHell = evaluateAssignedHellLevel(nextKarmaBalance);
    const judgmentTriggered = assignedHell > 0;

    const tx: KarmaTransaction = {
      id: `tx_wisdom_${now}`,
      timestamp: now,
      type: choice.negativeKarmaDelta > 0 ? 'negative_karma' : 'merit',
      amount:
        choice.negativeKarmaDelta > 0
          ? choice.negativeKarmaDelta
          : choice.meritDelta,
      reason: `${entry.title}: ${choice.label.slice(0, 60)}...`,
      sourceId: wisdomId,
      netKarmaAfter: nextKarmaBalance,
    };

    const completedWisdomIds = player.completedWisdomIds.includes(wisdomId)
      ? player.completedWisdomIds
      : [...player.completedWisdomIds, wisdomId];

    const updatedQuests = { ...player.quests };
    for (const qDef of QUEST_DEFINITIONS) {
      if (qDef.activityTrigger === 'wisdom_study') {
        const cur = updatedQuests[qDef.id];
        if (cur && !cur.completed) {
          const nextCount = Math.min(cur.targetCount, cur.currentCount + 1);
          updatedQuests[qDef.id] = {
            ...cur,
            currentCount: nextCount,
            completed: nextCount >= cur.targetCount,
          };
        }
      }
    }

    const updatedPlayer: PlayerProfile = {
      ...player,
      merit: nextMerit,
      negativeKarma: nextNegKarma,
      karmaBalance: nextKarmaBalance,
      exp: nextExp,
      level: calculateLevelFromExp(nextExp),
      currentRealm: judgmentTriggered ? 'underworld' : player.currentRealm,
      hellSentenceLevel: judgmentTriggered
        ? assignedHell
        : player.hellSentenceLevel,
      completedWisdomIds,
      quests: updatedQuests,
      karmaLedger: [tx, ...player.karmaLedger.slice(0, 49)],
      updatedAt: now,
    };

    saveProfileBackup(updatedPlayer);
    set({ player: updatedPlayer });

    if (choice.meritDelta > 0) {
      soundEngine.playMeritChime();
      state.addToast({
        title: `Trí Tuệ Từ Bi: +${choice.meritDelta} Công Đức`,
        subtitle: entry.title,
        meritDelta: choice.meritDelta,
        expDelta: choice.expDelta,
        type: 'merit',
      });
    } else if (choice.negativeKarmaDelta > 0) {
      soundEngine.playKarmaThunder();
      state.addToast({
        title: `Nghiệp Ác Ghi Sổ: +${choice.negativeKarmaDelta} Nghiệp Lực`,
        subtitle: choice.consequenceText,
        karmaDelta: choice.negativeKarmaDelta,
        type: 'karma',
      });
    }

    if (judgmentTriggered) {
      const hellCfg = getHellLevelByNumber(assignedHell);
      soundEngine.setRealmAmbience('underworld', assignedHell);
      set({
        activeModal: 'none',
        underworldSubZone: 'hell_floor',
        activeHellFloor: assignedHell,
        localPosition: { x: 0, y: 0, z: 14 },
        activeCinematic: {
          type: 'judgment',
          title: `PHÁN XÉT NGHIỆP LỰC — ${hellCfg?.vietnameseName.toUpperCase() || `TẦNG ${assignedHell}`}`,
          subtitle: `Chỉ số Nhân Quả đã rơi xuống mức ${nextKarmaBalance}. Tâm tạo cảnh — bạn bị đưa tới ${hellCfg?.vietnameseName} để thực hành Sám Hối & Chuộc Lỗi!`,
          hellLevel: assignedHell,
          karmaBalance: nextKarmaBalance,
        },
      });
    }

    return {
      meritDelta: choice.meritDelta,
      negativeKarmaDelta: choice.negativeKarmaDelta,
      expDelta: choice.expDelta,
      judgmentTriggered,
      assignedHellLevel: assignedHell,
      explanation: choice.teachingExplanation,
    };
  },

  attemptAscension: async () => {
    const state = get();
    const player = state.player;
    if (!player) return false;

    const nextStage = player.rankStage + 1;
    const nextRank = RANKS.find((r) => r.stage === nextStage);
    if (!nextRank) return false;

    try {
      const res = await fetch('/api/economy/ascend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedPlayer: PlayerProfile = data.player;
        saveProfileBackup(updatedPlayer);
        soundEngine.playAscensionChoir();

        set({
          player: updatedPlayer,
          localActionState: 'ascend',
          activeModal: 'none',
          activeCinematic: {
            type: 'ascension',
            title: `ĐỘ KIẾP PHI THĂNG: ${nextRank.vietnameseTitle.toUpperCase()}`,
            subtitle: nextRank.unlockDescription,
            rankStage: nextRank.stage,
          },
        });

        if (data.unlockedCelestial) {
          soundEngine.setRealmAmbience('celestial');
        }
        return true;
      }
    } catch {
      // Fallback check
    }

    const meetsExp = player.exp >= nextRank.minExp;
    const meetsMerit = player.merit >= nextRank.minMerit;
    const meetsKarma = player.karmaBalance >= nextRank.minKarmaBalance;
    const meetsTrib =
      !nextRank.requiredTribulationId ||
      player.completedTribulations.includes(nextRank.requiredTribulationId);

    if (!meetsExp || !meetsMerit || !meetsKarma || !meetsTrib) {
      state.addToast({
        title: `Chưa đủ điều kiện thăng cấp ${nextRank.vietnameseTitle}`,
        subtitle: `Yêu cầu: ${nextRank.minMerit} Công Đức, ${nextRank.minExp} EXP${nextRank.requiredTribulationId ? ' và vượt qua Thiên Kiếp tương ứng' : ''}.`,
        type: 'info',
      });
      return false;
    }

    const unlockedRealms: RealmId[] =
      nextRank.grantsCelestialAccess &&
      !player.unlockedRealms.includes('celestial')
        ? [...player.unlockedRealms, 'celestial']
        : player.unlockedRealms;

    const updatedPlayer: PlayerProfile = {
      ...player,
      rankStage: nextRank.stage,
      unlockedRealms,
      unlockedTitles: player.unlockedTitles.includes(nextRank.vietnameseTitle)
        ? player.unlockedTitles
        : [...player.unlockedTitles, nextRank.vietnameseTitle],
      appearance: {
        ...player.appearance,
        titleId: nextRank.vietnameseTitle,
      },
      currentRealm: nextRank.grantsCelestialAccess
        ? 'celestial'
        : player.currentRealm,
      updatedAt: Date.now(),
    };

    saveProfileBackup(updatedPlayer);
    soundEngine.playAscensionChoir();
    if (nextRank.grantsCelestialAccess) {
      soundEngine.setRealmAmbience('celestial');
    }

    set({
      player: updatedPlayer,
      localActionState: 'ascend',
      activeModal: 'none',
      activeCinematic: {
        type: 'ascension',
        title: `ĐỘ KIẾP PHI THĂNG: ${nextRank.vietnameseTitle.toUpperCase()}`,
        subtitle: nextRank.unlockDescription,
        rankStage: nextRank.stage,
      },
    });

    return true;
  },

  completeTribulationTrial: async (tribulationId, success, score) => {
    const state = get();
    const player = state.player;
    if (!player) return;

    const trib = TRIBULATIONS.find((t) => t.id === tribulationId);
    if (!trib) return;

    try {
      const res = await fetch('/api/economy/tribulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id,
          tribulationId,
          success,
          score,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        saveProfileBackup(data.player);
        set({ player: data.player });
        if (success) {
          soundEngine.playAscensionChoir();
          state.addToast({
            title: `⚡ Vượt Qua ${trib.vietnameseName}!`,
            subtitle: `Nhận +${data.rewardMerit} Công Đức, +${data.rewardExp} EXP, +${data.rewardTienNgoc} Tiên Ngọc`,
            meritDelta: data.rewardMerit,
            expDelta: data.rewardExp,
            type: 'ascension',
          });
        }
        return;
      }
    } catch {
      // Fallback local
    }

    if (!success) {
      soundEngine.playKarmaThunder();
      state.addToast({
        title: `Độ Kiếp Thất Bại: ${trib.vietnameseName}`,
        subtitle: 'Hãy củng cố đạo tâm và thử lại khi đã sẵn sàng!',
        type: 'karma',
      });
      return;
    }

    soundEngine.playAscensionChoir();
    const completedTribulations = player.completedTribulations.includes(
      tribulationId
    )
      ? player.completedTribulations
      : [...player.completedTribulations, tribulationId];

    const nextMerit = player.merit + trib.rewardMerit;
    const nextExp = player.exp + trib.rewardExp;
    const nextTienNgoc = player.tienNgoc + trib.rewardTienNgoc;
    const nextKarmaBalance = nextMerit - player.negativeKarma;
    const eligibleRank = determineHighestEligibleRank(
      nextExp,
      nextMerit,
      nextKarmaBalance,
      completedTribulations
    );

    const nextRankStage = Math.max(
      player.rankStage,
      trib.unlockRankStage,
      eligibleRank.stage
    );
    const unlockedRealms: RealmId[] =
      nextRankStage >= 7 && !player.unlockedRealms.includes('celestial')
        ? [...player.unlockedRealms, 'celestial']
        : player.unlockedRealms;

    const updatedPlayer: PlayerProfile = {
      ...player,
      merit: nextMerit,
      exp: nextExp,
      level: calculateLevelFromExp(nextExp),
      tienNgoc: nextTienNgoc,
      karmaBalance: nextKarmaBalance,
      rankStage: nextRankStage,
      completedTribulations,
      unlockedRealms,
      unlockedAuras: player.unlockedAuras.includes(trib.unlockAuraId)
        ? player.unlockedAuras
        : [...player.unlockedAuras, trib.unlockAuraId],
      unlockedTitles: player.unlockedTitles.includes(trib.unlockTitle)
        ? player.unlockedTitles
        : [...player.unlockedTitles, trib.unlockTitle],
      updatedAt: Date.now(),
    };

    saveProfileBackup(updatedPlayer);
    set({ player: updatedPlayer });
    state.addToast({
      title: `⚡ Độ Kiếp Thành Công: ${trib.vietnameseName}!`,
      subtitle: `Mở khóa danh hiệu "${trib.unlockTitle}" & +${trib.rewardTienNgoc} Tiên Ngọc`,
      meritDelta: trib.rewardMerit,
      expDelta: trib.rewardExp,
      type: 'ascension',
    });
  },

  advanceHellFloorChallenge: (hellLevel) => {
    const state = get();
    const cfg = getHellLevelByNumber(hellLevel) || HELL_LEVELS[0];
    const currentSteps = state.hellChallengeProgress[hellLevel] || 0;
    const nextSteps = Math.min(
      cfg.redemptionQuest.requiredActions,
      currentSteps + 1
    );

    soundEngine.playBellChime(216);
    set((s) => ({
      hellChallengeProgress: {
        ...s.hellChallengeProgress,
        [hellLevel]: nextSteps,
      },
      localActionState: 'pray_beads',
    }));

    if (nextSteps >= cfg.redemptionQuest.requiredActions) {
      state.addToast({
        title: `🕯️ Đã hoàn thành ${nextSteps}/${cfg.redemptionQuest.requiredActions} nghi thức: ${cfg.redemptionQuest.title}`,
        subtitle:
          'Mở Sổ Nhân Quả & Chuộc Lỗi để trả lời Câu Hỏi Tỉnh Thức của Giám Ngục!',
        type: 'redemption',
      });
      set({ activeModal: 'hell_ledger' });
    } else {
      state.addToast({
        title: `Nghi Thức Sám Hối (${nextSteps}/${cfg.redemptionQuest.requiredActions})`,
        subtitle: cfg.redemptionQuest.objective,
        type: 'info',
      });
    }
  },

  submitHellRedemption: async (hellLevel, choiceIndex) => {
    const state = get();
    const player = state.player;
    const cfg = getHellLevelByNumber(hellLevel) || HELL_LEVELS[0];
    const choice = cfg.redemptionQuest.choices[choiceIndex];

    if (!player || !choice) {
      return {
        freed: false,
        message: 'Lựa chọn không hợp lệ.',
        karmaRestored: 0,
      };
    }

    try {
      const res = await fetch('/api/economy/hell-redemption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id,
          hellLevel,
          choiceIndex,
          actionProgress: cfg.redemptionQuest.requiredActions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        saveProfileBackup(data.player);
        set({ player: data.player });

        if (data.freed) {
          soundEngine.playAscensionChoir();
          soundEngine.setRealmAmbience('human');
          set({
            activeModal: 'none',
            localPosition: { x: 0, y: 0, z: 16 },
            activeCinematic: {
              type: 'redemption',
              title: `SIÊU THOÁT ${cfg.vietnameseName.toUpperCase()}`,
              subtitle: choice.feedback,
              hellLevel,
              karmaBalance: data.player.karmaBalance,
            },
          });
        } else if (choice.isAwakened) {
          soundEngine.playMeritChime();
        } else {
          soundEngine.playKarmaThunder();
        }

        return {
          freed: data.freed,
          message: data.message || choice.feedback,
          karmaRestored: data.karmaRestored || choice.karmaRestored,
        };
      }
    } catch {
      // Fallback local redemption
    }

    if (!choice.isAwakened) {
      soundEngine.playKarmaThunder();
      return {
        freed: false,
        message: choice.feedback,
        karmaRestored: 0,
      };
    }

    const now = Date.now();
    const restored = Math.max(choice.karmaRestored, player.negativeKarma);
    const nextNegKarma = Math.max(0, player.negativeKarma - restored);
    const nextMerit = Math.max(player.merit, 20);
    const nextKarmaBalance = nextMerit - nextNegKarma;

    const tx: KarmaTransaction = {
      id: `tx_redeem_${now}`,
      timestamp: now,
      type: 'redemption',
      amount: restored,
      reason: `Tỉnh ngộ tại ${cfg.vietnameseName}: ${cfg.redemptionQuest.title}`,
      sourceId: `hell_level_${hellLevel}`,
      netKarmaAfter: nextKarmaBalance,
    };

    const completedHellLevels = player.completedHellLevels.includes(hellLevel)
      ? player.completedHellLevels
      : [...player.completedHellLevels, hellLevel];

    const updatedPlayer: PlayerProfile = {
      ...player,
      merit: nextMerit,
      negativeKarma: nextNegKarma,
      karmaBalance: nextKarmaBalance,
      currentRealm: 'human',
      hellSentenceLevel: 0,
      completedHellLevels,
      karmaLedger: [tx, ...player.karmaLedger.slice(0, 49)],
      updatedAt: now,
    };

    saveProfileBackup(updatedPlayer);
    soundEngine.playAscensionChoir();
    soundEngine.setRealmAmbience('human');

    set({
      player: updatedPlayer,
      activeModal: 'none',
      localPosition: { x: 0, y: 0, z: 16 },
      activeCinematic: {
        type: 'redemption',
        title: `SIÊU THOÁT ${cfg.vietnameseName.toUpperCase()}`,
        subtitle: choice.feedback,
        hellLevel,
        karmaBalance: nextKarmaBalance,
      },
    });

    return {
      freed: true,
      message: choice.feedback,
      karmaRestored: restored,
    };
  },

  claimQuestReward: async (questId) => {
    const state = get();
    const player = state.player;
    if (!player) return;

    const qDef = QUEST_DEFINITIONS.find((q) => q.id === questId);
    const qProg = player.quests[questId];
    if (!qDef || !qProg || !qProg.completed || qProg.claimed) return;

    try {
      const res = await fetch('/api/economy/quest-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, questId }),
      });

      if (res.ok) {
        const data = await res.json();
        saveProfileBackup(data.player);
        soundEngine.playMeritChime();
        set({ player: data.player });
        state.addToast({
          title: `Hoàn Thành Nhiệm Vụ: ${qDef.title.split(' (')[0]}`,
          meritDelta: data.rewardMerit,
          expDelta: data.rewardExp,
          senDelta: data.rewardSen,
          type: 'merit',
        });
        return;
      }
    } catch {
      // Fallback local
    }

    soundEngine.playMeritChime();
    const nextMerit = player.merit + qDef.rewardMerit;
    const nextExp = player.exp + qDef.rewardExp;
    const nextSen = player.senCurrency + qDef.rewardSen;
    const nextKarmaBalance = nextMerit - player.negativeKarma;

    const updatedPlayer: PlayerProfile = {
      ...player,
      merit: nextMerit,
      exp: nextExp,
      level: calculateLevelFromExp(nextExp),
      senCurrency: nextSen,
      karmaBalance: nextKarmaBalance,
      quests: {
        ...player.quests,
        [questId]: {
          ...qProg,
          claimed: true,
        },
      },
      updatedAt: Date.now(),
    };

    saveProfileBackup(updatedPlayer);
    set({ player: updatedPlayer });
    state.addToast({
      title: `Nhận Thưởng: ${qDef.title.split(' (')[0]}`,
      meritDelta: qDef.rewardMerit,
      expDelta: qDef.rewardExp,
      senDelta: qDef.rewardSen,
      type: 'merit',
    });
  },

  contributeToCommunityEvent: (amount = 1) => {
    const state = get();
    const evt = state.communityEvent;
    if (!evt) return;

    state.sendWsMessage({
      type: 'contribute_event',
      eventId: evt.id,
      amount,
    });

    const nextProgress = Math.min(
      evt.targetProgress,
      evt.currentProgress + amount
    );
    set({
      communityEvent: {
        ...evt,
        currentProgress: nextProgress,
      },
    });
  },

  customizeCharacter: async (appearance, unlockItemId, unlockType) => {
    const state = get();
    const player = state.player;
    if (!player) return false;

    try {
      const res = await fetch(`/api/player/${player.id}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appearance,
          unlockItemId,
          unlockType: unlockType === 'accessory' ? 'outfit' : unlockType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        saveProfileBackup(data.player);
        soundEngine.playMeritChime();
        set({ player: data.player });
        state.addToast({
          title: data.message || 'Đã cập nhật Pháp Phục & Danh Hiệu',
          type: 'merit',
        });
        return true;
      }
    } catch {
      // Local fallback
    }

    let nextSen = player.senCurrency;
    let nextTienNgoc = player.tienNgoc;
    const unlockedOutfits = [...player.unlockedOutfits];
    const unlockedAuras = [...player.unlockedAuras];
    const unlockedTitles = [...player.unlockedTitles];
    let nextAppearance = { ...player.appearance, ...appearance };

    if (unlockItemId) {
      const item = COSMETIC_CATALOG.find((c) => c.id === unlockItemId);
      if (item) {
        if (
          player.senCurrency < item.senCost ||
          player.tienNgoc < item.tienNgocCost
        ) {
          state.addToast({
            title: 'Chưa đủ Sen hoặc Tiên Ngọc để thỉnh pháp vật này',
            type: 'info',
          });
          return false;
        }
        nextSen -= item.senCost;
        nextTienNgoc -= item.tienNgocCost;

        if (item.category === 'outfit') {
          if (!unlockedOutfits.includes(item.id)) unlockedOutfits.push(item.id);
          if (item.robeColor) nextAppearance.robeColor = item.robeColor;
          if (item.trimColor) nextAppearance.trimColor = item.trimColor;
        } else if (item.category === 'aura') {
          if (!unlockedAuras.includes(item.id)) unlockedAuras.push(item.id);
          nextAppearance.auraId = item.id;
        } else if (item.category === 'accessory' && item.accessoryKey) {
          if (!unlockedOutfits.includes(item.id)) unlockedOutfits.push(item.id);
          nextAppearance.accessoryId = item.accessoryKey;
        } else if (item.category === 'title') {
          if (!unlockedTitles.includes(item.vietnameseName)) {
            unlockedTitles.push(item.vietnameseName);
          }
          nextAppearance.titleId = item.vietnameseName;
          if (item.nameplateStyle) {
            nextAppearance.nameplateStyle = item.nameplateStyle;
          }
        }
      }
    }

    const updatedPlayer: PlayerProfile = {
      ...player,
      senCurrency: nextSen,
      tienNgoc: nextTienNgoc,
      unlockedOutfits,
      unlockedAuras,
      unlockedTitles,
      appearance: nextAppearance,
      updatedAt: Date.now(),
    };

    saveProfileBackup(updatedPlayer);
    soundEngine.playMeritChime();
    set({ player: updatedPlayer });
    state.addToast({
      title: 'Đã cập nhật Pháp Tướng & Hào Quang',
      type: 'merit',
    });
    return true;
  },

  switchRealmOrRoom: async (realm, options) => {
    const state = get();
    const player = state.player;
    if (!player) return;

    // Prevent leaving underworld if actively sentenced unless exploring floors within underworld
    if (player.hellSentenceLevel > 0 && realm !== 'underworld') {
      state.addToast({
        title: `Đang thọ án tại Tầng ${player.hellSentenceLevel} Địa Ngục`,
        subtitle:
          'Hãy hoàn thành Thử Thách Hối Cải & Câu Hỏi Tỉnh Thức để trở về Phàm Giới!',
        type: 'karma',
      });
      set({
        activeModal: 'hell_ledger',
        underworldSubZone: 'hell_floor',
        activeHellFloor: player.hellSentenceLevel,
      });
      return;
    }

    // Check Celestial access requirement (Rank Stage >= 7 or unlockedRealms includes celestial)
    if (
      realm === 'celestial' &&
      player.rankStage < 7 &&
      !player.unlockedRealms.includes('celestial')
    ) {
      state.addToast({
        title: 'Nam Thiên Môn chưa mở!',
        subtitle:
          'Cần đạt Cấp 6 (Cận Siêu Thoát) và vượt qua Cửu Trùng Lôi Kiếp để bước lên Thiên Đình.',
        type: 'info',
      });
      set({ activeModal: 'tribulation' });
      return;
    }

    const nextHellFloor = options?.hellLevel || state.activeHellFloor || 1;
    const nextSubZone =
      options?.underworldSubZone ||
      (options?.hellLevel ? 'hell_floor' : 'judgment_hall');

    const defaultSpawn: Vector3D =
      realm === 'human'
        ? { x: 0, y: 0, z: 18 }
        : realm === 'celestial'
          ? { x: 0, y: 0, z: 16 }
          : { x: 0, y: 0, z: 14 };

    const updatedPlayer: PlayerProfile = {
      ...player,
      currentRealm: realm,
      position: defaultSpawn,
      updatedAt: Date.now(),
    };

    saveProfileBackup(updatedPlayer);
    soundEngine.setRealmAmbience(realm, nextHellFloor);

    set({
      player: updatedPlayer,
      localPosition: defaultSpawn,
      localRotationY: Math.PI,
      targetMovePosition: null,
      underworldSubZone: nextSubZone,
      activeHellFloor: nextHellFloor,
      nearbyInteractable: null,
    });

    const roomType: RoomType =
      options?.roomType ||
      (realm === 'celestial'
        ? 'heavenly_court'
        : realm === 'underworld'
          ? nextSubZone === 'hell_floor'
            ? 'hell_instance'
            : 'underworld_judgment'
          : 'main_temple');

    state.sendWsMessage({
      type: 'join_room',
      playerId: player.id,
      roomType,
      realm,
      hellLevel: realm === 'underworld' ? nextHellFloor : undefined,
      preferredRoomId: options?.preferredRoomId,
    });
  },

  refreshRooms: async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.rooms)) {
          set({ availableRooms: data.rooms });
        }
      }
    } catch {
      // Keep existing rooms list
    }
  },

  triggerContextualInteract: () => {
    const state = get();
    const target = state.nearbyInteractable;
    if (!target) return;

    soundEngine.playUiClick();

    if (target.type === 'npc' && target.npcId) {
      state.setActiveModal('npc_dialogue', target.npcId);
      return;
    }

    if (target.type === 'wisdom_pavilion') {
      state.setActiveModal('wisdom');
      return;
    }

    if (target.type === 'tribulation_altar') {
      state.setActiveModal('tribulation');
      return;
    }

    if (target.type === 'hell_shrine') {
      state.advanceHellFloorChallenge(
        target.targetHellLevel || state.activeHellFloor
      );
      return;
    }

    if (target.type === 'gate' && target.targetRealm) {
      state.switchRealmOrRoom(target.targetRealm, {
        hellLevel: target.targetHellLevel,
        underworldSubZone: target.targetHellLevel
          ? 'hell_floor'
          : 'judgment_hall',
      });
      return;
    }

    if (target.activityId) {
      state.performMeritActivity(target.activityId);
    }
  },
}));
