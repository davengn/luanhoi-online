import type { WebSocket } from 'ws';
import {
  ClientToServerMessage,
  CommunityEventState,
  MeritActivityId,
  PlayerActionState,
  PlayerProfile,
  RealmId,
  RemotePlayerState,
  RoomSummary,
  RoomType,
  ServerToClientMessage,
  Vector3D,
} from '../shared/types';
import { MERIT_ACTIVITIES, QUICK_CHAT_PRESETS } from '../shared/gameData';
import { HELL_LEVELS, getHellLevelByNumber } from '../shared/loreData';
import { db } from './database';
import { economyEngine } from './economyEngine';

export const SPATIAL_INTEREST_RADIUS = 90;
export const WORLD_COORDINATE_LIMIT = 150;
export const CHAT_RATE_LIMIT_MS = 1500;
export const CHAT_MAX_LENGTH = 120;
export const CHAT_BUBBLE_DURATION_MS = 6000;
export const WORLD_TICK_MS = 100; // 10Hz synchronization tick

const VALID_ACTION_STATES: Set<PlayerActionState> = new Set([
  'idle',
  'walk',
  'run',
  'bow',
  'prostrate',
  'meditate',
  'pray_beads',
  'offer_incense',
  'offer_lotus',
  'celebrate',
  'cheer',
  'greet_chaptay',
  'ascend',
  'tribulation',
]);

const PROFANITY_PATTERNS: RegExp[] = [
  /\b(fuck|shit|bitch|asshole|bastard|cunt|dick)\b/gi,
  /\b(dm|dkm|dmm|vcl|vl|cc|clgt|deo|dit|du\s*ma|lon|buoi)\b/gi,
];

interface CommunityEventTemplate {
  type: CommunityEventState['type'];
  name: string;
  description: string;
  targetProgress: number;
  bonusMeritReward: number;
}

const COMMUNITY_EVENT_TEMPLATES: CommunityEventTemplate[] = [
  {
    type: 'prostration_108',
    name: 'Đại Lễ 108 Lạy Sám Hối Cộng Đồng',
    description:
      'Chư vị đạo hữu đồng tâm lễ Phật 108 lạy cầu nguyện quốc thái dân an, tiêu trừ nghiệp chướng sâu dày.',
    targetProgress: 108,
    bonusMeritReward: 80,
  },
  {
    type: 'collective_meditation',
    name: 'Pháp Hội Cộng Tu Thiền Định',
    description:
      'Đạo tràng đồng tọa thiền định tâm, hội tụ năng lượng chánh niệm thanh tịnh khắp Tam Giới.',
    targetProgress: 60,
    bonusMeritReward: 50,
  },
  {
    type: 'lotus_lantern_festival',
    name: 'Đêm Hội Hoa Đăng Cầu Nguyện',
    description:
      'Cùng thắp sáng đèn hoa đăng Liên Hoa trên hồ Tịnh Thủy, hồi hướng công đức cho muôn loài.',
    targetProgress: 80,
    bonusMeritReward: 60,
  },
  {
    type: 'temple_cleaning',
    name: 'Chấp Tác Quét Lá Tịnh Cảnh',
    description:
      'Chung tay quét dọn sân chùa Linh Sơn: "Quét sân quét cả bụi lòng, lá rơi mỗi chiếc tâm không nhẹ nhàng."',
    targetProgress: 50,
    bonusMeritReward: 40,
  },
];

interface AmbientBotDisciple {
  state: RemotePlayerState;
  roomId: string;
  waypoints: Vector3D[];
  currentWaypointIndex: number;
  pauseUntil: number;
  practiceActions: PlayerActionState[];
  phrases: string[];
  nextPhraseAt: number;
  walkSpeed: number;
}

interface RoomInstance {
  roomId: string;
  name: string;
  roomType: RoomType;
  realm: RealmId;
  hellLevel?: number;
  maxCapacity: number;
  shardIndex: number;
  autoShard: boolean;
  usesWaitingQueue: boolean;
  players: Map<string, RemotePlayerState>;
  bots: Map<string, AmbientBotDisciple>;
  waitingQueue: string[]; // ordered playerIds waiting for capacity
  communityEvent: CommunityEventState;
  communityEventIndex: number;
  eventParticipants: Set<string>;
}

interface ConnectedSession {
  playerId: string;
  ws: WebSocket;
  roomId: string | null;
  lastChatAt: number;
  lastMoveAt: number;
  connectedAt: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function distance3D(a: Vector3D, b: Vector3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function sanitizeChatMessage(raw: string): string {
  let cleaned = raw
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[\r\n\t]+/g, ' ')
    .trim();
  if (cleaned.length > CHAT_MAX_LENGTH) {
    cleaned = cleaned.slice(0, CHAT_MAX_LENGTH).trim();
  }
  for (const pattern of PROFANITY_PATTERNS) {
    cleaned = cleaned.replace(pattern, '***');
  }
  return cleaned;
}

export class RoomManager {
  private rooms: Map<string, RoomInstance> = new Map();
  private sessionsByPlayerId: Map<string, ConnectedSession> = new Map();
  private playerIdBySocket: Map<WebSocket, string> = new Map();
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private eventSequence = 1;

  constructor() {
    this.initializeDefaultRooms();
    this.spawnAmbientBotDisciples();
    this.startWorldTick();
  }

  private createCommunityEventState(templateIndex: number, roomId: string): CommunityEventState {
    const tpl = COMMUNITY_EVENT_TEMPLATES[templateIndex % COMMUNITY_EVENT_TEMPLATES.length];
    return {
      id: `evt_${roomId}_${this.eventSequence++}`,
      name: tpl.name,
      description: tpl.description,
      type: tpl.type,
      currentProgress: 0,
      targetProgress: tpl.targetProgress,
      activeParticipants: 0,
      bonusMeritReward: tpl.bonusMeritReward,
    };
  }

  private createRoomInstance(params: {
    roomId: string;
    name: string;
    roomType: RoomType;
    realm: RealmId;
    hellLevel?: number;
    maxCapacity: number;
    shardIndex: number;
    autoShard: boolean;
    usesWaitingQueue: boolean;
    initialEventIndex?: number;
  }): RoomInstance {
    const eventIdx = params.initialEventIndex ?? 0;
    const room: RoomInstance = {
      roomId: params.roomId,
      name: params.name,
      roomType: params.roomType,
      realm: params.realm,
      hellLevel: params.hellLevel,
      maxCapacity: params.maxCapacity,
      shardIndex: params.shardIndex,
      autoShard: params.autoShard,
      usesWaitingQueue: params.usesWaitingQueue,
      players: new Map(),
      bots: new Map(),
      waitingQueue: [],
      communityEvent: this.createCommunityEventState(eventIdx, params.roomId),
      communityEventIndex: eventIdx,
      eventParticipants: new Set(),
    };
    this.rooms.set(room.roomId, room);
    return room;
  }

  private initializeDefaultRooms(): void {
    // 1. Main Temple (Public Human Realm hub, auto-shards at 60)
    this.createRoomInstance({
      roomId: 'main_temple_1',
      name: 'Chùa Linh Sơn — Đại Hùng Bảo Điện #1',
      roomType: 'main_temple',
      realm: 'human',
      maxCapacity: 60,
      shardIndex: 1,
      autoShard: true,
      usesWaitingQueue: false,
      initialEventIndex: 0,
    });

    // 2. Meditation Hall (Quiet practice hall, max 30, uses waiting queue when full)
    this.createRoomInstance({
      roomId: 'meditation_hall_1',
      name: 'Thiền Đường Tịnh Tâm #1',
      roomType: 'meditation_hall',
      realm: 'human',
      maxCapacity: 30,
      shardIndex: 1,
      autoShard: false,
      usesWaitingQueue: true,
      initialEventIndex: 1,
    });

    // 3. Heavenly Court (Celestial Realm hub, auto-shards at 50)
    this.createRoomInstance({
      roomId: 'heavenly_court_1',
      name: 'Cửu Trùng Vân Cung — Nam Thiên Môn #1',
      roomType: 'heavenly_court',
      realm: 'celestial',
      maxCapacity: 50,
      shardIndex: 1,
      autoShard: true,
      usesWaitingQueue: false,
      initialEventIndex: 2,
    });

    // 4. Tribulation Arena (Party instance for Celestial Trials, max 8)
    this.createRoomInstance({
      roomId: 'tribulation_arena_1',
      name: 'Đài Độ Kiếp Cửu Thiên #1',
      roomType: 'tribulation_arena',
      realm: 'celestial',
      maxCapacity: 8,
      shardIndex: 1,
      autoShard: true,
      usesWaitingQueue: false,
      initialEventIndex: 1,
    });

    // 5. Underworld Judgment Hall (Mirror of Karma, max 40)
    this.createRoomInstance({
      roomId: 'underworld_judgment_1',
      name: 'Nghiệp Kính Đài — Điện Phán Xét #1',
      roomType: 'underworld_judgment',
      realm: 'underworld',
      maxCapacity: 40,
      shardIndex: 1,
      autoShard: true,
      usesWaitingQueue: false,
      initialEventIndex: 0,
    });

    // 6. All 18 Levels of Hell isolated instances (hell_instance_1 .. hell_instance_18)
    for (let level = 1; level <= 18; level++) {
      const hellCfg = getHellLevelByNumber(level) ?? HELL_LEVELS[level - 1];
      const vnName = hellCfg ? hellCfg.vietnameseName : `Địa Ngục Tầng ${level}`;
      this.createRoomInstance({
        roomId: `hell_instance_${level}`,
        name: `Tầng ${level}: ${vnName}`,
        roomType: 'hell_instance',
        realm: 'underworld',
        hellLevel: level,
        maxCapacity: 25,
        shardIndex: 1,
        autoShard: true,
        usesWaitingQueue: false,
        initialEventIndex: 0,
      });
    }
  }

  private spawnAmbientBotDisciples(): void {
    const now = Date.now();
    const botConfigs: Array<{
      roomId: string;
      id: string;
      username: string;
      rankStage: number;
      level: number;
      merit: number;
      karmaBalance: number;
      realm: RealmId;
      appearance: RemotePlayerState['appearance'];
      waypoints: Vector3D[];
      practiceActions: PlayerActionState[];
      phrases: string[];
    }> = [
      {
        roomId: 'main_temple_1',
        id: 'bot_thien_sinh_an_nhien',
        username: 'Thiền Sinh An Nhiên',
        rankStage: 3,
        level: 14,
        merit: 420,
        karmaBalance: 420,
        realm: 'human',
        appearance: {
          archetype: 'novice_monk',
          robeColor: '#d9822b',
          trimColor: '#f5d76e',
          hairstyle: 'shaved',
          hairColor: '#1c1917',
          auraId: 'aura_warm_incense',
          accessoryId: 'mala_beads',
          titleId: 'title_lotus_heart',
          nameplateStyle: 'jade',
        },
        waypoints: [
          { x: -4.5, y: 0, z: -5.5 },
          { x: 0, y: 0, z: -7.5 },
          { x: 4.5, y: 0, z: -5.5 },
          { x: 0, y: 0, z: -2.5 },
        ],
        practiceActions: ['bow', 'offer_incense', 'pray_beads', 'meditate'],
        phrases: [
          'Nam Mô A Di Đà Phật 🙏',
          'Nguyện đem công đức này hướng về khắp tất cả chúng sinh 🪷',
          'Chúc đạo hữu tinh tấn tu hành, thân tâm an lạc!',
        ],
      },
      {
        roomId: 'main_temple_1',
        id: 'bot_dao_huu_minh_tam',
        username: 'Đạo Hữu Minh Tâm',
        rankStage: 5,
        level: 26,
        merit: 1350,
        karmaBalance: 1300,
        realm: 'human',
        appearance: {
          archetype: 'pilgrim',
          robeColor: '#6b7d8c',
          trimColor: '#d9c8a9',
          hairstyle: 'topknot',
          hairColor: '#27272a',
          auraId: 'aura_lotus_radiance',
          accessoryId: 'incense_censer',
          titleId: 'title_compassionate_sage',
          nameplateStyle: 'gold',
        },
        waypoints: [
          { x: 6.5, y: 0, z: 3.0 },
          { x: 9.0, y: 0, z: -3.5 },
          { x: 3.5, y: 0, z: -6.0 },
          { x: -3.0, y: 0, z: 4.0 },
        ],
        practiceActions: ['meditate', 'prostrate', 'offer_lotus', 'bow'],
        phrases: [
          'Mời chư vị đạo hữu cùng hợp sức thực hiện Đại Lễ 108 Lạy!',
          'Thả đèn hoa đăng cầu nguyện bình an cho muôn loài 🏮',
          'Tâm bình thế giới bình, tâm tịnh cõi Phật hiện.',
        ],
      },
      {
        roomId: 'main_temple_1',
        id: 'bot_cu_si_tinh_lien',
        username: 'Cư Sĩ Tịnh Liên',
        rankStage: 4,
        level: 19,
        merit: 780,
        karmaBalance: 760,
        realm: 'human',
        appearance: {
          archetype: 'pilgrim',
          robeColor: '#f0f4f8',
          trimColor: '#9ad0ec',
          hairstyle: 'flowing',
          hairColor: '#1f2937',
          auraId: 'aura_lotus_radiance',
          accessoryId: 'lotus_halo',
          titleId: 'title_lotus_heart',
          nameplateStyle: 'jade',
        },
        waypoints: [
          { x: -8.0, y: 0, z: 2.0 },
          { x: -11.0, y: 0, z: -4.0 },
          { x: -5.0, y: 0, z: -8.0 },
        ],
        practiceActions: ['offer_lotus', 'meditate', 'greet_chaptay'],
        phrases: [
          'Hương sen thanh khiết tỏa ngát chốn thiền môn 🪷',
          'Cùng ngồi thiền tích công đức tại Thiền Đường nhé!',
        ],
      },
      {
        roomId: 'heavenly_court_1',
        id: 'bot_tien_nhan_van_hac',
        username: 'Tiên Nhân Vân Hạc',
        rankStage: 8,
        level: 48,
        merit: 5400,
        karmaBalance: 5200,
        realm: 'celestial',
        appearance: {
          archetype: 'immortal',
          robeColor: '#4a5596',
          trimColor: '#8be9fd',
          hairstyle: 'crowned',
          hairColor: '#e2e8f0',
          auraId: 'aura_thunder_lotus',
          accessoryId: 'celestial_ribbon',
          titleId: 'title_celestial_envoy',
          nameplateStyle: 'celestial',
        },
        waypoints: [
          { x: -5.0, y: 0, z: -4.0 },
          { x: 5.0, y: 0, z: -4.0 },
          { x: 0, y: 0, z: 4.5 },
        ],
        practiceActions: ['meditate', 'greet_chaptay', 'celebrate'],
        phrases: [
          'Cung hỷ đạo hữu độ kiếp phi thăng thành công! ✨',
          'Mây lành Cửu Trùng kết tụ từ công đức vô lượng.',
        ],
      },
    ];

    for (const cfg of botConfigs) {
      const room = this.rooms.get(cfg.roomId);
      if (!room) continue;
      const startPos = { ...cfg.waypoints[0] };
      const bot: AmbientBotDisciple = {
        state: {
          id: cfg.id,
          username: cfg.username,
          appearance: cfg.appearance,
          rankStage: cfg.rankStage,
          level: cfg.level,
          merit: cfg.merit,
          karmaBalance: cfg.karmaBalance,
          currentRealm: cfg.realm,
          hellSentenceLevel: 0,
          position: startPos,
          rotationY: 0,
          actionState: cfg.practiceActions[0] ?? 'meditate',
        },
        roomId: cfg.roomId,
        waypoints: cfg.waypoints,
        currentWaypointIndex: 1 % cfg.waypoints.length,
        pauseUntil: now + 4500,
        practiceActions: cfg.practiceActions,
        phrases: cfg.phrases,
        nextPhraseAt: now + 8000 + Math.floor(Math.random() * 6000),
        walkSpeed: 2.2,
      };
      room.bots.set(bot.state.id, bot);
    }
  }

  private updateAmbientBots(now: number, dtSeconds: number): void {
    for (const room of this.rooms.values()) {
      for (const bot of room.bots.values()) {
        // Expire chat bubble if needed
        if (bot.state.chatBubble && bot.state.chatBubble.expiresAt <= now) {
          bot.state.chatBubble = undefined;
        }

        // Occasionally emit a gentle spiritual greeting bubble
        if (now >= bot.nextPhraseAt && bot.phrases.length > 0) {
          const phrase = bot.phrases[Math.floor(Math.random() * bot.phrases.length)];
          bot.state.chatBubble = {
            text: phrase,
            expiresAt: now + CHAT_BUBBLE_DURATION_MS,
          };
          bot.nextPhraseAt = now + 18000 + Math.floor(Math.random() * 12000);
        }

        if (now < bot.pauseUntil) {
          continue;
        }

        const target = bot.waypoints[bot.currentWaypointIndex];
        if (!target) continue;

        const dx = target.x - bot.state.position.x;
        const dz = target.z - bot.state.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist <= 0.35) {
          bot.state.position.x = target.x;
          bot.state.position.z = target.z;
          bot.state.rotationY = Math.atan2(-bot.state.position.x, -8 - bot.state.position.z);
          const randomAction =
            bot.practiceActions[Math.floor(Math.random() * bot.practiceActions.length)] || 'meditate';
          bot.state.actionState = randomAction;
          bot.currentWaypointIndex = (bot.currentWaypointIndex + 1) % bot.waypoints.length;
          bot.pauseUntil = now + 5000 + Math.floor(Math.random() * 4500);
        } else {
          const step = Math.min(dist, bot.walkSpeed * dtSeconds);
          bot.state.position.x += (dx / dist) * step;
          bot.state.position.z += (dz / dist) * step;
          bot.state.rotationY = Math.atan2(dx, dz);
          bot.state.actionState = 'walk';
        }
      }
    }
  }

  private startWorldTick(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
    }
    this.tickTimer = setInterval(() => {
      this.broadcastWorldStateTick();
    }, WORLD_TICK_MS);
    if (typeof this.tickTimer.unref === 'function') {
      this.tickTimer.unref();
    }
  }

  public stopWorldTick(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  private broadcastWorldStateTick(): void {
    const now = Date.now();
    this.updateAmbientBots(now, WORLD_TICK_MS / 1000);

    const onlineTotal = this.getTotalOnlineCount();

    for (const [playerId, session] of this.sessionsByPlayerId.entries()) {
      if (!session.roomId || session.ws.readyState !== 1) continue;
      const room = this.rooms.get(session.roomId);
      if (!room) continue;

      const selfState = room.players.get(playerId);
      if (!selfState) continue;

      if (selfState.chatBubble && selfState.chatBubble.expiresAt <= now) {
        selfState.chatBubble = undefined;
      }

      const nearbyPlayers = this.getSpatiallyFilteredPlayers(
        room,
        selfState.position,
        playerId,
        SPATIAL_INTEREST_RADIUS
      );

      this.sendToSocket(session.ws, {
        type: 'world_state_delta',
        players: nearbyPlayers,
        onlineTotal,
        roomPlayerCount: room.players.size + room.bots.size,
      });
    }
  }

  /**
   * Spatial Interest Management: returns RemotePlayerState[] in the same room within `radius` (90 units),
   * sorted by proximity to `origin`.
   */
  public getSpatiallyFilteredPlayers(
    room: RoomInstance,
    origin: Vector3D,
    excludePlayerId?: string,
    radius: number = SPATIAL_INTEREST_RADIUS
  ): RemotePlayerState[] {
    const entries: Array<{ state: RemotePlayerState; dist: number }> = [];

    for (const [pid, state] of room.players.entries()) {
      if (excludePlayerId && pid === excludePlayerId) continue;
      const dist = distance3D(origin, state.position);
      if (dist <= radius) {
        entries.push({ state, dist });
      }
    }

    for (const [bid, bot] of room.bots.entries()) {
      if (excludePlayerId && bid === excludePlayerId) continue;
      const dist = distance3D(origin, bot.state.position);
      if (dist <= radius) {
        entries.push({ state: bot.state, dist });
      }
    }

    entries.sort((a, b) => a.dist - b.dist);
    return entries.map((e) => e.state);
  }

  public getTotalOnlineCount(): number {
    let total = 0;
    for (const room of this.rooms.values()) {
      total += room.players.size + room.bots.size;
    }
    return Math.max(total, this.sessionsByPlayerId.size);
  }

  public getConnectedPlayerCount(): number {
    return this.sessionsByPlayerId.size;
  }

  public toRoomSummary(room: RoomInstance): RoomSummary {
    return {
      roomId: room.roomId,
      name: room.name,
      roomType: room.roomType,
      realm: room.realm,
      hellLevel: room.hellLevel,
      playerCount: room.players.size + room.bots.size,
      maxCapacity: room.maxCapacity,
      queueLength: room.waitingQueue.length,
      shardIndex: room.shardIndex,
    };
  }

  public getRoomSummaries(): RoomSummary[] {
    return Array.from(this.rooms.values()).map((room) => this.toRoomSummary(room));
  }

  public getRoomSummary(roomId: string): RoomSummary | undefined {
    const room = this.rooms.get(roomId);
    return room ? this.toRoomSummary(room) : undefined;
  }

  public getRoomCommunityEvent(roomId: string): CommunityEventState | undefined {
    return this.rooms.get(roomId)?.communityEvent;
  }

  private buildRemoteStateFromProfile(
    profile: PlayerProfile,
    actionState: PlayerActionState = 'idle'
  ): RemotePlayerState {
    return {
      id: profile.id,
      username: profile.username,
      appearance: profile.appearance,
      rankStage: profile.rankStage,
      level: profile.level,
      merit: profile.merit,
      karmaBalance: profile.karmaBalance,
      currentRealm: profile.currentRealm,
      hellSentenceLevel: profile.hellSentenceLevel,
      position: {
        x: clamp(Number.isFinite(profile.position?.x) ? profile.position.x : 0, -WORLD_COORDINATE_LIMIT, WORLD_COORDINATE_LIMIT),
        y: clamp(Number.isFinite(profile.position?.y) ? profile.position.y : 0, -50, WORLD_COORDINATE_LIMIT),
        z: clamp(Number.isFinite(profile.position?.z) ? profile.position.z : 6, -WORLD_COORDINATE_LIMIT, WORLD_COORDINATE_LIMIT),
      },
      rotationY: Number.isFinite(profile.rotationY) ? profile.rotationY : 0,
      actionState,
    };
  }

  /**
   * Finds or auto-shards a target room matching the request criteria.
   */
  private resolveTargetRoom(params: {
    roomType: RoomType;
    realm: RealmId;
    hellLevel?: number;
    preferredRoomId?: string;
    playerId: string;
  }): RoomInstance {
    const { roomType, realm, hellLevel, preferredRoomId, playerId } = params;

    if (roomType === 'private_sanctuary') {
      const targetId = preferredRoomId || `private_sanctuary_${playerId}`;
      const existing = this.rooms.get(targetId);
      if (existing) return existing;
      return this.createRoomInstance({
        roomId: targetId,
        name: `Tịnh Thất Riêng (${playerId.slice(0, 8)})`,
        roomType: 'private_sanctuary',
        realm: 'human',
        maxCapacity: 12,
        shardIndex: 1,
        autoShard: false,
        usesWaitingQueue: false,
      });
    }

    if (preferredRoomId && this.rooms.has(preferredRoomId)) {
      const preferred = this.rooms.get(preferredRoomId)!;
      if (preferred.usesWaitingQueue || preferred.players.size < preferred.maxCapacity) {
        return preferred;
      }
    }

    if (roomType === 'hell_instance') {
      const targetLevel = clamp(Math.round(hellLevel ?? 1), 1, 18);
      const baseId = `hell_instance_${targetLevel}`;
      const baseRoom = this.rooms.get(baseId);
      if (baseRoom && baseRoom.players.size < baseRoom.maxCapacity) {
        return baseRoom;
      }
      // Look for another shard of this hell level
      const matchingShards = Array.from(this.rooms.values()).filter(
        (r) => r.roomType === 'hell_instance' && r.hellLevel === targetLevel
      );
      for (const shard of matchingShards) {
        if (shard.players.size < shard.maxCapacity) {
          return shard;
        }
      }
      const nextShardIndex = matchingShards.length + 1;
      const hellCfg = getHellLevelByNumber(targetLevel);
      const vnName = hellCfg ? hellCfg.vietnameseName : `Địa Ngục Tầng ${targetLevel}`;
      return this.createRoomInstance({
        roomId: `hell_instance_${targetLevel}_s${nextShardIndex}`,
        name: `Tầng ${targetLevel}: ${vnName} #${nextShardIndex}`,
        roomType: 'hell_instance',
        realm: 'underworld',
        hellLevel: targetLevel,
        maxCapacity: 25,
        shardIndex: nextShardIndex,
        autoShard: true,
        usesWaitingQueue: false,
      });
    }

    // Standard room types (main_temple, meditation_hall, heavenly_court, tribulation_arena, underworld_judgment)
    const shards = Array.from(this.rooms.values())
      .filter((r) => r.roomType === roomType)
      .sort((a, b) => a.shardIndex - b.shardIndex);

    for (const shard of shards) {
      if (shard.usesWaitingQueue || shard.players.size < shard.maxCapacity) {
        return shard;
      }
    }

    // All existing shards are full -> auto-shard a new room (e.g. main_temple_2, heavenly_court_2)
    const nextShardIndex = shards.length + 1;
    const templateRoom = shards[0];
    const baseTitle = templateRoom
      ? templateRoom.name.replace(/\s*#\d+$/, '')
      : roomType;

    return this.createRoomInstance({
      roomId: `${roomType}_${nextShardIndex}`,
      name: `${baseTitle} #${nextShardIndex}`,
      roomType,
      realm,
      maxCapacity: templateRoom ? templateRoom.maxCapacity : 50,
      shardIndex: nextShardIndex,
      autoShard: true,
      usesWaitingQueue: false,
    });
  }

  public handleConnection(ws: WebSocket): void {
    ws.on('message', async (rawData) => {
      try {
        const text = typeof rawData === 'string' ? rawData : rawData.toString('utf-8');
        const msg = JSON.parse(text) as ClientToServerMessage;
        await this.handleClientMessage(ws, msg);
      } catch (err) {
        this.sendToSocket(ws, {
          type: 'error_notice',
          code: 'INVALID_PACKET',
          message: 'Gói tin không hợp lệ hoặc không đúng định dạng.',
        });
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    ws.on('error', () => {
      this.handleDisconnect(ws);
    });
  }

  public async handleClientMessage(ws: WebSocket, msg: ClientToServerMessage): Promise<void> {
    if (!msg || typeof msg.type !== 'string') return;

    switch (msg.type) {
      case 'ping': {
        this.sendToSocket(ws, {
          type: 'pong',
          clientTime: typeof msg.clientTime === 'number' ? msg.clientTime : Date.now(),
          serverTime: Date.now(),
        });
        return;
      }

      case 'join_room': {
        await this.handleJoinRoom(ws, msg);
        return;
      }

      case 'move': {
        this.handleMove(ws, msg);
        return;
      }

      case 'perform_activity': {
        await this.handlePerformActivity(ws, msg);
        return;
      }

      case 'emote': {
        this.handleEmote(ws, msg);
        return;
      }

      case 'quick_chat': {
        this.handleQuickChat(ws, msg);
        return;
      }

      case 'contribute_event': {
        await this.handleContributeEvent(ws, msg);
        return;
      }
    }
  }

  private async handleJoinRoom(
    ws: WebSocket,
    msg: Extract<ClientToServerMessage, { type: 'join_room' }>
  ): Promise<void> {
    const requestedPlayerId = (msg.playerId || '').trim() || undefined;
    const profile = await Promise.resolve(
      db.getOrCreatePlayer({
        playerId: requestedPlayerId,
      })
    );

    const isInitialWelcome = !this.playerIdBySocket.has(ws);

    // Handle graceful reconnection if this playerId had an older socket open
    const existingSession = this.sessionsByPlayerId.get(profile.id);
    if (existingSession && existingSession.ws !== ws) {
      this.playerIdBySocket.delete(existingSession.ws);
      try {
        existingSession.ws.close();
      } catch {
        // ignore close errors on stale socket
      }
    }

    // Remove player from previous room or waiting queue before joining new room
    this.removePlayerFromRooms(profile.id);

    // Enforce Underworld sentence if player has active Hell Sentence (hellSentenceLevel > 0)
    let targetRoomType: RoomType = msg.roomType || 'main_temple';
    let targetRealm: RealmId = msg.realm || 'human';
    let targetHellLevel: number | undefined = msg.hellLevel;
    let preferredRoomId = msg.preferredRoomId;

    if (profile.hellSentenceLevel > 0 && targetRealm !== 'underworld') {
      targetRealm = 'underworld';
      targetRoomType = 'hell_instance';
      targetHellLevel = profile.hellSentenceLevel;
      preferredRoomId = `hell_instance_${profile.hellSentenceLevel}`;
    } else if (
      targetRealm === 'celestial' &&
      profile.rankStage < 7 &&
      !profile.unlockedRealms.includes('celestial')
    ) {
      this.sendToSocket(ws, {
        type: 'error_notice',
        code: 'REALM_LOCKED',
        message: 'Cần đạt cấp bậc Phi Thăng Giả (Cấp 7) và vượt qua Lôi Kiếp để bước vào Thiên Đình.',
      });
      targetRealm = 'human';
      targetRoomType = 'main_temple';
      preferredRoomId = 'main_temple_1';
    }

    const targetRoom = this.resolveTargetRoom({
      roomType: targetRoomType,
      realm: targetRealm,
      hellLevel: targetHellLevel,
      preferredRoomId,
      playerId: profile.id,
    });

    const session: ConnectedSession = {
      playerId: profile.id,
      ws,
      roomId: null,
      lastChatAt: existingSession?.lastChatAt ?? 0,
      lastMoveAt: Date.now(),
      connectedAt: Date.now(),
    };
    this.sessionsByPlayerId.set(profile.id, session);
    this.playerIdBySocket.set(ws, profile.id);

    // Check if room uses a waiting queue (e.g. meditation_hall_1) and is full
    if (
      targetRoom.usesWaitingQueue &&
      targetRoom.players.size >= targetRoom.maxCapacity &&
      !targetRoom.players.has(profile.id)
    ) {
      if (!targetRoom.waitingQueue.includes(profile.id)) {
        targetRoom.waitingQueue.push(profile.id);
      }
      const positionInQueue = targetRoom.waitingQueue.indexOf(profile.id) + 1;
      this.sendToSocket(ws, {
        type: 'room_queued',
        roomId: targetRoom.roomId,
        positionInQueue,
      });
      return;
    }

    this.placePlayerIntoRoom(profile, targetRoom, session, isInitialWelcome);
  }

  private placePlayerIntoRoom(
    profile: PlayerProfile,
    room: RoomInstance,
    session: ConnectedSession,
    sendWelcome: boolean
  ): void {
    session.roomId = room.roomId;
    profile.currentRealm = room.realm;
    profile.currentRoomId = room.roomId;
    profile.updatedAt = Date.now();
    db.savePlayer(profile);

    const remoteState = this.buildRemoteStateFromProfile(profile, 'idle');
    room.players.set(profile.id, remoteState);

    const nearbyPlayers = this.getSpatiallyFilteredPlayers(
      room,
      remoteState.position,
      profile.id,
      SPATIAL_INTEREST_RADIUS
    );

    const summary = this.toRoomSummary(room);

    if (sendWelcome) {
      this.sendToSocket(session.ws, {
        type: 'welcome',
        player: profile,
        room: summary,
        players: nearbyPlayers,
        communityEvent: room.communityEvent,
      });
    } else {
      this.sendToSocket(session.ws, {
        type: 'room_joined',
        room: summary,
        players: nearbyPlayers,
        communityEvent: room.communityEvent,
      });
    }

    // Broadcast player_joined to other players in the room
    this.broadcastToRoom(
      room.roomId,
      {
        type: 'player_joined',
        player: remoteState,
      },
      profile.id
    );
  }

  /**
   * Server-authoritative movement validation:
   * - Rejects NaN / Infinity
   * - Clamps x, y, z within [-150, 150]
   * - Validates actionState
   */
  public validateAndClampMovement(
    position: Vector3D,
    rotationY: number,
    actionState: PlayerActionState
  ): { position: Vector3D; rotationY: number; actionState: PlayerActionState } | null {
    if (
      !position ||
      !Number.isFinite(position.x) ||
      !Number.isFinite(position.y) ||
      !Number.isFinite(position.z) ||
      !Number.isFinite(rotationY)
    ) {
      return null;
    }

    const clampedPos: Vector3D = {
      x: clamp(position.x, -WORLD_COORDINATE_LIMIT, WORLD_COORDINATE_LIMIT),
      y: clamp(position.y, -WORLD_COORDINATE_LIMIT, WORLD_COORDINATE_LIMIT),
      z: clamp(position.z, -WORLD_COORDINATE_LIMIT, WORLD_COORDINATE_LIMIT),
    };

    const normalizedAction: PlayerActionState = VALID_ACTION_STATES.has(actionState)
      ? actionState
      : 'idle';

    return {
      position: clampedPos,
      rotationY,
      actionState: normalizedAction,
    };
  }

  private handleMove(
    ws: WebSocket,
    msg: Extract<ClientToServerMessage, { type: 'move' }>
  ): void {
    const playerId = this.playerIdBySocket.get(ws);
    if (!playerId) return;

    const session = this.sessionsByPlayerId.get(playerId);
    if (!session || !session.roomId) return;

    const validated = this.validateAndClampMovement(msg.position, msg.rotationY, msg.actionState);
    if (!validated) {
      this.sendToSocket(ws, {
        type: 'error_notice',
        code: 'INVALID_MOVEMENT',
        message: 'Tọa độ di chuyển không hợp lệ (NaN/Infinity bị từ chối).',
      });
      return;
    }

    const room = this.rooms.get(session.roomId);
    if (!room) return;

    const playerState = room.players.get(playerId);
    if (playerState) {
      playerState.position = validated.position;
      playerState.rotationY = validated.rotationY;
      playerState.actionState = validated.actionState;
    }

    session.lastMoveAt = Date.now();

    const profile = db.getPlayer(playerId);
    if (profile) {
      profile.position = validated.position;
      profile.rotationY = validated.rotationY;
      profile.updatedAt = Date.now();
    }
  }

  private async handlePerformActivity(
    ws: WebSocket,
    msg: Extract<ClientToServerMessage, { type: 'perform_activity' }>
  ): Promise<void> {
    const playerId = this.playerIdBySocket.get(ws);
    if (!playerId) return;

    try {
      const result: any = await Promise.resolve(
        economyEngine.performMeritActivity(playerId, msg.activityId)
      );

      if (result && result.success === false) {
        this.sendToSocket(ws, {
          type: 'error_notice',
          code: 'ACTIVITY_COOLDOWN',
          message: result.message || result.error || 'Hoạt động đang trong thời gian hồi.',
        });
        return;
      }

      const profile: PlayerProfile | undefined = result?.player ?? db.getPlayer(playerId);
      if (!profile) return;

      const activityCfg = MERIT_ACTIVITIES[msg.activityId];
      const meritEarned = result?.meritEarned ?? result?.meritDelta ?? activityCfg?.baseMerit ?? 0;
      const expEarned = result?.expEarned ?? result?.expDelta ?? activityCfg?.baseExp ?? 0;
      const vfxType = result?.vfxType ?? activityCfg?.vfxType ?? 'golden_particles';
      const actionState = activityCfg?.actionState ?? 'bow';

      this.syncPlayerProfile(profile, actionState);

      this.sendToPlayer(playerId, {
        type: 'profile_updated',
        profile,
        feedback: {
          title: result?.message || `${activityCfg?.name || msg.activityId} (+${meritEarned} Công Đức)`,
          meritDelta: meritEarned,
          expDelta: expEarned,
          vfxType,
        },
      });

      const session = this.sessionsByPlayerId.get(playerId);
      if (session?.roomId) {
        this.broadcastToRoom(session.roomId, {
          type: 'player_emote',
          playerId,
          emoteId: msg.activityId,
          actionState,
        });
      }

      await this.recordActivityContribution(playerId, msg.activityId);
    } catch (err: any) {
      this.sendToSocket(ws, {
        type: 'error_notice',
        code: 'ACTIVITY_ERROR',
        message: err?.message || 'Không thể thực hiện hoạt động lúc này.',
      });
    }
  }

  private handleEmote(
    ws: WebSocket,
    msg: Extract<ClientToServerMessage, { type: 'emote' }>
  ): void {
    const playerId = this.playerIdBySocket.get(ws);
    if (!playerId) return;

    const session = this.sessionsByPlayerId.get(playerId);
    if (!session || !session.roomId) return;

    const room = this.rooms.get(session.roomId);
    if (!room) return;

    const validState = VALID_ACTION_STATES.has(msg.actionState) ? msg.actionState : 'greet_chaptay';
    const playerState = room.players.get(playerId);
    if (playerState) {
      playerState.actionState = validState;
      playerState.activeEmote = msg.emoteId;
    }

    this.broadcastToRoom(room.roomId, {
      type: 'player_emote',
      playerId,
      emoteId: msg.emoteId || validState,
      actionState: validState,
    });
  }

  /**
   * Chat Moderation & Rate Limiting:
   * - Supports QUICK_CHAT_PRESETS and sanitized custom text (max 120 chars, profanity filter, 1.5s rate limit).
   */
  private handleQuickChat(
    ws: WebSocket,
    msg: Extract<ClientToServerMessage, { type: 'quick_chat' }>
  ): void {
    const playerId = this.playerIdBySocket.get(ws);
    if (!playerId) return;

    const session = this.sessionsByPlayerId.get(playerId);
    if (!session || !session.roomId) return;

    const now = Date.now();
    if (now - session.lastChatAt < CHAT_RATE_LIMIT_MS) {
      this.sendToSocket(ws, {
        type: 'error_notice',
        code: 'CHAT_RATE_LIMITED',
        message: 'Xin đạo hữu chậm lại một chút trước khi gửi lời nói tiếp theo (1.5 giây).',
      });
      return;
    }

    const room = this.rooms.get(session.roomId);
    if (!room) return;

    const preset = QUICK_CHAT_PRESETS.find((p) => p.id === msg.presetId);
    let finalText = '';

    if (msg.customText && msg.customText.trim().length > 0) {
      finalText = sanitizeChatMessage(msg.customText);
    } else if (preset) {
      finalText = preset.text;
    } else if (msg.presetId) {
      finalText = sanitizeChatMessage(msg.presetId);
    }

    if (!finalText) return;

    session.lastChatAt = now;

    const playerState = room.players.get(playerId);
    const username = playerState?.username || db.getPlayer(playerId)?.username || 'Hành Giả';

    if (playerState) {
      playerState.chatBubble = {
        text: finalText,
        expiresAt: now + CHAT_BUBBLE_DURATION_MS,
      };
      if (preset?.suggestedEmote) {
        playerState.actionState = preset.suggestedEmote;
      }
    }

    this.broadcastToRoom(room.roomId, {
      type: 'player_chat',
      playerId,
      username,
      text: finalText,
    });
  }

  private async handleContributeEvent(
    ws: WebSocket,
    msg: Extract<ClientToServerMessage, { type: 'contribute_event' }>
  ): Promise<void> {
    const playerId = this.playerIdBySocket.get(ws);
    if (!playerId) return;

    const session = this.sessionsByPlayerId.get(playerId);
    if (!session || !session.roomId) return;

    const amount = clamp(Math.round(Number(msg.amount) || 6), 1, 54);
    await this.incrementRoomCommunityEvent(session.roomId, playerId, amount);
  }

  /**
   * Called when a player performs a Merit Activity (via REST or WS) to progress the room's Community Ritual.
   */
  public async recordActivityContribution(
    playerId: string,
    activityId: MeritActivityId
  ): Promise<CommunityEventState | undefined> {
    const session = this.sessionsByPlayerId.get(playerId);
    const profile = db.getPlayer(playerId);
    const roomId = session?.roomId || profile?.currentRoomId || 'main_temple_1';

    let amount = 5;
    if (activityId === 'prostration_108') {
      amount = 18;
    } else if (activityId === 'group_meditation' || activityId === 'offer_lantern') {
      amount = 10;
    } else if (activityId === 'clean_temple' || activityId === 'meditate_session') {
      amount = 8;
    }

    return this.incrementRoomCommunityEvent(roomId, playerId, amount);
  }

  /**
   * Increments active Community Ritual progress in `roomId`.
   * When `currentProgress >= targetProgress`, awards `bonusMeritReward` via `economyEngine.grantCommunityEventReward`
   * to all players in the room, broadcasts `community_event_updated` with `milestoneReached: true`,
   * and rotates to the next community event!
   */
  public async incrementRoomCommunityEvent(
    roomId: string,
    contributorPlayerId: string,
    amount: number = 5
  ): Promise<CommunityEventState | undefined> {
    const room = this.rooms.get(roomId) ?? this.rooms.get('main_temple_1');
    if (!room) return undefined;

    room.eventParticipants.add(contributorPlayerId);
    room.communityEvent.activeParticipants = Math.max(
      room.eventParticipants.size,
      room.players.size
    );
    room.communityEvent.currentProgress = Math.min(
      room.communityEvent.targetProgress,
      room.communityEvent.currentProgress + Math.max(1, amount)
    );

    if (room.communityEvent.currentProgress >= room.communityEvent.targetProgress) {
      room.communityEvent.completedAt = Date.now();
      const completedSnapshot: CommunityEventState = { ...room.communityEvent };
      const bonusMerit = completedSnapshot.bonusMeritReward;
      const bonusExp = Math.round(bonusMerit * 1.25);

      // Reward all real players currently in the room (plus contributor)
      const recipientIds = new Set<string>([
        ...room.players.keys(),
        ...room.eventParticipants.values(),
      ]);

      for (const pid of recipientIds) {
        try {
          const rewardResult: any = await Promise.resolve(
            economyEngine.grantCommunityEventReward(
              pid,
              completedSnapshot.name,
              bonusMerit,
              bonusExp
            )
          );
          const updatedProfile: PlayerProfile | undefined =
            rewardResult?.player ?? rewardResult ?? db.getPlayer(pid);
          if (updatedProfile && updatedProfile.id) {
            this.syncPlayerProfile(updatedProfile);
            this.sendToPlayer(pid, {
              type: 'profile_updated',
              profile: updatedProfile,
              feedback: {
                title: `Viên mãn ${completedSnapshot.name}! (+${bonusMerit} Công Đức)`,
                meritDelta: bonusMerit,
                expDelta: bonusExp,
                vfxType: 'aura_surge',
              },
            });
          }
        } catch {
          // Ignore individual reward errors
        }
      }

      // Broadcast milestoneReached: true for the completed ritual
      this.broadcastToRoom(room.roomId, {
        type: 'community_event_updated',
        event: completedSnapshot,
        milestoneReached: true,
      });

      // Rotate to the next community event
      room.communityEventIndex =
        (room.communityEventIndex + 1) % COMMUNITY_EVENT_TEMPLATES.length;
      room.eventParticipants.clear();
      room.communityEvent = this.createCommunityEventState(
        room.communityEventIndex,
        room.roomId
      );

      return completedSnapshot;
    } else {
      const snapshot: CommunityEventState = { ...room.communityEvent };
      this.broadcastToRoom(room.roomId, {
        type: 'community_event_updated',
        event: snapshot,
        milestoneReached: false,
      });
      return snapshot;
    }
  }

  public syncPlayerProfile(
    profile: PlayerProfile,
    overrideActionState?: PlayerActionState
  ): void {
    const session = this.sessionsByPlayerId.get(profile.id);
    const roomId = session?.roomId || profile.currentRoomId;
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const existing = room.players.get(profile.id);
    if (existing) {
      existing.username = profile.username;
      existing.appearance = profile.appearance;
      existing.rankStage = profile.rankStage;
      existing.level = profile.level;
      existing.merit = profile.merit;
      existing.karmaBalance = profile.karmaBalance;
      existing.currentRealm = profile.currentRealm;
      existing.hellSentenceLevel = profile.hellSentenceLevel;
      if (overrideActionState) {
        existing.actionState = overrideActionState;
      }
    }
  }

  /**
   * Moves a player into a specific Hell Level instance when Karma Judgment triggers (`karmaBalance <= -100`).
   */
  public movePlayerToHellInstance(playerId: string, assignedHellLevel: number): RoomSummary {
    const safeLevel = clamp(Math.round(assignedHellLevel || 1), 1, 18);
    const hellRoomId = `hell_instance_${safeLevel}`;
    const hellRoom =
      this.rooms.get(hellRoomId) ??
      this.resolveTargetRoom({
        roomType: 'hell_instance',
        realm: 'underworld',
        hellLevel: safeLevel,
        preferredRoomId: hellRoomId,
        playerId,
      });

    const profile = db.getPlayer(playerId);
    if (profile) {
      profile.currentRealm = 'underworld';
      profile.currentRoomId = hellRoom.roomId;
      profile.hellSentenceLevel = safeLevel;
      profile.position = { x: 0, y: 0, z: 6 };
      profile.updatedAt = Date.now();
      db.savePlayer(profile);
    }

    const session = this.sessionsByPlayerId.get(playerId);
    if (session && profile) {
      this.removePlayerFromRooms(playerId);
      this.placePlayerIntoRoom(profile, hellRoom, session, false);
    }

    return this.toRoomSummary(hellRoom);
  }

  /**
   * Moves a redeemed player from Hell back to `main_temple_1` in the Human Realm.
   */
  public movePlayerToMainTemple(playerId: string): RoomSummary {
    const mainTemple = this.rooms.get('main_temple_1')!;
    const profile = db.getPlayer(playerId);
    if (profile) {
      profile.currentRealm = 'human';
      profile.currentRoomId = mainTemple.roomId;
      profile.hellSentenceLevel = 0;
      profile.position = { x: 0, y: 0, z: 6 };
      profile.updatedAt = Date.now();
      db.savePlayer(profile);
    }

    const session = this.sessionsByPlayerId.get(playerId);
    if (session && profile) {
      this.removePlayerFromRooms(playerId);
      this.placePlayerIntoRoom(profile, mainTemple, session, false);
    }

    return this.toRoomSummary(mainTemple);
  }

  private removePlayerFromRooms(playerId: string): void {
    for (const room of this.rooms.values()) {
      const qIndex = room.waitingQueue.indexOf(playerId);
      if (qIndex !== -1) {
        room.waitingQueue.splice(qIndex, 1);
      }

      if (room.players.has(playerId)) {
        room.players.delete(playerId);
        this.broadcastToRoom(
          room.roomId,
          {
            type: 'player_left',
            playerId,
          },
          playerId
        );
        this.advanceWaitingQueue(room);
      }
    }
  }

  private advanceWaitingQueue(room: RoomInstance): void {
    while (room.waitingQueue.length > 0 && room.players.size < room.maxCapacity) {
      const nextPlayerId = room.waitingQueue.shift()!;
      const nextSession = this.sessionsByPlayerId.get(nextPlayerId);
      const nextProfile = db.getPlayer(nextPlayerId);
      if (nextSession && nextSession.ws.readyState === 1 && nextProfile) {
        this.placePlayerIntoRoom(nextProfile, room, nextSession, false);
      }
    }

    // Notify remaining queued players of updated queue position
    room.waitingQueue.forEach((queuedId, idx) => {
      this.sendToPlayer(queuedId, {
        type: 'room_queued',
        roomId: room.roomId,
        positionInQueue: idx + 1,
      });
    });
  }

  private handleDisconnect(ws: WebSocket): void {
    const playerId = this.playerIdBySocket.get(ws);
    if (!playerId) return;

    this.playerIdBySocket.delete(ws);
    const session = this.sessionsByPlayerId.get(playerId);
    if (session && session.ws === ws) {
      this.sessionsByPlayerId.delete(playerId);
      this.removePlayerFromRooms(playerId);
    }
  }

  public sendToSocket(ws: WebSocket, message: ServerToClientMessage): void {
    if (ws.readyState === 1) {
      try {
        ws.send(JSON.stringify(message));
      } catch {
        // Ignore transient socket write errors
      }
    }
  }

  public sendToPlayer(playerId: string, message: ServerToClientMessage): void {
    const session = this.sessionsByPlayerId.get(playerId);
    if (session) {
      this.sendToSocket(session.ws, message);
    }
  }

  public broadcastToRoom(
    roomId: string,
    message: ServerToClientMessage,
    excludePlayerId?: string
  ): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const pid of room.players.keys()) {
      if (excludePlayerId && pid === excludePlayerId) continue;
      this.sendToPlayer(pid, message);
    }
  }

  public broadcastGlobal(message: ServerToClientMessage): void {
    for (const session of this.sessionsByPlayerId.values()) {
      this.sendToSocket(session.ws, message);
    }
  }

  public getPlayerRoomId(playerId: string): string {
    return (
      this.sessionsByPlayerId.get(playerId)?.roomId ||
      db.getPlayer(playerId)?.currentRoomId ||
      'main_temple_1'
    );
  }
}

export const roomManager = new RoomManager();
