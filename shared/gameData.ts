import {
  RankDefinition,
  MeritActivityId,
  MeritActivityConfig,
  TribulationDefinition,
  PlayerActionState,
} from './types';

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  resetCycle: 'daily' | 'weekly' | 'story' | 'redemption';
  rewardMerit: number;
  rewardExp: number;
  rewardSen: number;
  activityTrigger: MeritActivityId | 'any_merit' | 'wisdom_study' | 'tribulation_clear' | 'hell_redemption' | 'community_event';
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardSen: number;
  rewardTienNgoc: number;
  unlockTitle?: string;
  metric?: 'merit' | 'rankStage' | 'meditateCount' | 'prostrationCount' | 'wisdomCount' | 'tribulationCount' | 'hellRedemptionCount' | 'communityCount';
  targetValue?: number;
}

export interface CosmeticItem {
  id: string;
  name: string;
  vietnameseName: string;
  category: 'outfit' | 'aura' | 'accessory' | 'title' | 'nameplate';
  type: 'outfit' | 'aura' | 'accessory' | 'title' | 'nameplate';
  description: string;
  senCost: number;
  tienNgocCost: number;
  requiredRankStage: number;
  robeColor?: string;
  trimColor?: string;
  auraColor?: string;
  accessoryKey?: 'none' | 'mala_beads' | 'lotus_halo' | 'celestial_ribbon' | 'dharma_staff' | 'incense_censer';
  nameplateStyle?: 'wood' | 'jade' | 'gold' | 'celestial' | 'karmic_fire';
}

export interface QuickChatPreset {
  id: string;
  text: string;
  label: string;
  category: 'greeting' | 'practice' | 'blessing' | 'celestial' | 'redemption';
  suggestedEmote?: PlayerActionState;
}

export interface HellThresholdEntry {
  hellLevel: number;
  karmaThreshold: number;
  exitKarmaBalance: number;
  vietnameseName: string;
  englishName: string;
  sinTheme: string;
}

export interface KarmaJudgmentConfig {
  warningThreshold: number;
  triggerThreshold: number;
  redemptionFreedomThreshold: number;
  softCapMinimumMultiplier: number;
  levels: HellThresholdEntry[];
  thresholdsByLevel: Record<number, number>;
}

/**
 * 1. RANKS — Full 12-stage Spiritual & Celestial Progression
 * Stage 1 (Phàm Nhân) -> Stage 12 (Thiên Đạo Cảnh)
 */
export const RANKS: RankDefinition[] = [
  {
    stage: 1,
    name: 'Mortal Seeker',
    vietnameseTitle: 'Phàm Nhân',
    minExp: 0,
    minMerit: 0,
    minKarmaBalance: -99,
    requiredQuests: [],
    unlockDescription: 'Khởi đầu hành trình giữa cõi Nhân Gian, tìm hiểu nhân quả và gieo mầm thiện lành.',
    auraColor: '#d4c5a9',
    grantsCelestialAccess: false,
  },
  {
    stage: 2,
    name: 'Devout Believer',
    vietnameseTitle: 'Thiện Tín',
    minExp: 100,
    minMerit: 80,
    minKarmaBalance: 50,
    requiredQuests: ['quest_daily_incense'],
    unlockDescription: 'Tâm hướng thiện, thành kính dâng hương lễ Phật và giữ gìn lời nói ôn hòa.',
    auraColor: '#e8d882',
    grantsCelestialAccess: false,
  },
  {
    stage: 3,
    name: 'Dharma Practitioner',
    vietnameseTitle: 'Tu Hành Giả',
    minExp: 300,
    minMerit: 250,
    minKarmaBalance: 180,
    requiredQuests: ['quest_daily_meditation'],
    unlockDescription: 'Bắt đầu rèn luyện thân tâm qua thiền định, tụng kinh và quán chiếu hơi thở.',
    auraColor: '#f0c451',
    grantsCelestialAccess: false,
  },
  {
    stage: 4,
    name: 'Merit Cultivator',
    vietnameseTitle: 'Tích Đức Giả',
    minExp: 650,
    minMerit: 550,
    minKarmaBalance: 450,
    requiredQuests: ['quest_story_first_wisdom'],
    unlockDescription: 'Chăm chỉ làm việc thiện, giúp đỡ bá tánh và lan tỏa từ bi trong chốn thiền môn.',
    auraColor: '#f5a623',
    grantsCelestialAccess: false,
  },
  {
    stage: 5,
    name: 'Diligent Ascetic',
    vietnameseTitle: 'Hành Giả Tinh Tấn',
    minExp: 1200,
    minMerit: 1000,
    minKarmaBalance: 850,
    requiredQuests: ['quest_weekly_prostration'],
    unlockDescription: 'Tinh tấn ngày đêm không ngừng nghỉ, tâm bất động trước cám dỗ thế gian.',
    auraColor: '#69d2e7',
    grantsCelestialAccess: false,
  },
  {
    stage: 6,
    name: 'Threshold of Transcendence',
    vietnameseTitle: 'Cận Siêu Thoát',
    minExp: 2000,
    minMerit: 1800,
    minKarmaBalance: 1500,
    requiredQuests: ['quest_story_compassion_trial'],
    unlockDescription: 'Trí tuệ khai mở, chuẩn bị thân tâm vượt qua Lôi Kiếp để bước lên Thiên Đình.',
    auraColor: '#a7dbd8',
    grantsCelestialAccess: false,
  },
  {
    stage: 7,
    name: 'Ascended Spirit',
    vietnameseTitle: 'Phi Thăng Giả',
    minExp: 3200,
    minMerit: 3000,
    minKarmaBalance: 2600,
    requiredQuests: ['quest_story_celestial_gate'],
    requiredTribulationId: 'trib_lightning',
    unlockDescription: 'Vượt qua Lôi Kiếp Cửu Trùng, chính thức phi thăng Nam Thiên Môn, mở khóa Thiên Đình.',
    auraColor: '#7ef9ff',
    grantsCelestialAccess: true,
  },
  {
    stage: 8,
    name: 'Celestial Immortal',
    vietnameseTitle: 'Tiên Nhân',
    minExp: 5000,
    minMerit: 4500,
    minKarmaBalance: 4000,
    requiredQuests: ['quest_story_lotus_pond'],
    requiredTribulationId: 'trib_fire',
    unlockDescription: 'Tôi luyện qua Hồng Liên Hỏa Kiếp, thân thể thanh tịnh, tiêu dao nơi cung mây.',
    auraColor: '#ff9de2',
    grantsCelestialAccess: true,
  },
  {
    stage: 9,
    name: 'True Immortal',
    vietnameseTitle: 'Chân Tiên',
    minExp: 7500,
    minMerit: 6800,
    minKarmaBalance: 6000,
    requiredQuests: ['quest_story_heart_mirror'],
    requiredTribulationId: 'trib_heart_demon',
    unlockDescription: 'Chiến thắng Tâm Ma Kiếp, thấu triệt vô ngã, hào quang rực rỡ chiếu soi tam giới.',
    auraColor: '#c58af9',
    grantsCelestialAccess: true,
  },
  {
    stage: 10,
    name: 'Golden Immortal',
    vietnameseTitle: 'Kim Tiên',
    minExp: 11000,
    minMerit: 10000,
    minKarmaBalance: 9000,
    requiredQuests: ['quest_weekly_group_dharma'],
    requiredTribulationId: 'trib_wind',
    unlockDescription: 'Bất hoại trước Cửu Thiên Phong Kiếp, kim thân vĩnh hằng, trí bi viên mãn.',
    auraColor: '#ffd700',
    grantsCelestialAccess: true,
  },
  {
    stage: 11,
    name: 'Great Golden Immortal',
    vietnameseTitle: 'Đại La Kim Tiên',
    minExp: 16000,
    minMerit: 15000,
    minKarmaBalance: 13500,
    requiredQuests: ['quest_story_karmic_resolver'],
    requiredTribulationId: 'trib_karma',
    unlockDescription: 'Hóa giải Vạn Kiếp Nghiệp Lực, siêu vượt dòng sông thời gian, dẫn dắt chúng sinh.',
    auraColor: '#ffae00',
    grantsCelestialAccess: true,
  },
  {
    stage: 12,
    name: 'Heavenly Dao Sovereign',
    vietnameseTitle: 'Thiên Đạo Cảnh',
    minExp: 25000,
    minMerit: 24000,
    minKarmaBalance: 22000,
    requiredQuests: ['quest_story_supreme_awakening'],
    requiredTribulationId: 'trib_final_heavenly',
    unlockDescription: 'Hợp nhất cùng Thiên Đạo và Đại Từ Đại Bi, viên mãn giác ngộ giữa muôn cõi luân hồi.',
    auraColor: '#ffffff',
    grantsCelestialAccess: true,
  },
];

/**
 * 2. MERIT_ACTIVITIES — All 12 Core Spiritual & Social Activities
 * Cooldowns tuned between 2000ms and 8000ms for smooth interactive testing while preventing spam.
 */
export const MERIT_ACTIVITIES: Record<MeritActivityId, MeritActivityConfig> = {
  bow_buddha: {
    id: 'bow_buddha',
    name: 'Lễ Phật Thành Tâm (Bow to the Buddha)',
    description: 'Chắp tay cúi lạy trước kim thân Phật Đà, rũ bỏ ngã mạn và nuôi dưỡng lòng cung kính.',
    baseMerit: 8,
    baseExp: 10,
    senReward: 2,
    cooldownMs: 2500,
    dailySoftCap: 40,
    diminishingFactor: 0.5,
    requiredRankStage: 1,
    actionState: 'bow',
    vfxType: 'golden_particles',
    zoneHint: 'Chánh Điện Chùa Linh Sơn (Main Temple Altar)',
  },
  meditate_session: {
    id: 'meditate_session',
    name: 'Toạ Thiền Định Tâm (Mindful Meditation)',
    description: 'Ngồi kiết già trên bồ đoàn, theo dõi hơi thở chánh niệm để lắng dịu vọng tưởng.',
    baseMerit: 14,
    baseExp: 18,
    senReward: 4,
    cooldownMs: 4000,
    dailySoftCap: 30,
    diminishingFactor: 0.5,
    requiredRankStage: 1,
    actionState: 'meditate',
    vfxType: 'lotus_bloom',
    zoneHint: 'Thiền Đường Tịnh Tâm (Meditation Hall)',
  },
  prayer_beads: {
    id: 'prayer_beads',
    name: 'Lần Chuỗi Niệm Phật (Mala Bead Recitation)',
    description: 'Lần tràng hạt Bồ Đề 108 hạt, nhất tâm niệm danh hiệu Phật cầu bình an cho muôn loài.',
    baseMerit: 10,
    baseExp: 12,
    senReward: 3,
    cooldownMs: 3000,
    dailySoftCap: 35,
    diminishingFactor: 0.5,
    requiredRankStage: 1,
    actionState: 'pray_beads',
    vfxType: 'bell_ripple',
    zoneHint: 'Sân Chùa & Hành Lang Chuông Gió (Temple Courtyard)',
  },
  offer_incense: {
    id: 'offer_incense',
    name: 'Dâng Hương Trầm (Offer Sandalwood Incense)',
    description: 'Thắp nén tâm hương giới - định - tuệ, nguyện hương lành bay khắp mười phương.',
    baseMerit: 12,
    baseExp: 15,
    senReward: 3,
    cooldownMs: 3500,
    dailySoftCap: 25,
    diminishingFactor: 0.5,
    requiredRankStage: 1,
    actionState: 'offer_incense',
    vfxType: 'incense_smoke',
    zoneHint: 'Đỉnh Đồng Đại Hùng Bảo Điện (Main Bronze Censer)',
  },
  offer_lotus: {
    id: 'offer_lotus',
    name: 'Dâng Hoa Sen Thanh Khiết (Offer Sacred Lotus)',
    description: 'Cúng dường đóa sen trắng tinh khôi gần bùn mà chẳng hôi tanh mùi bùn.',
    baseMerit: 16,
    baseExp: 20,
    senReward: 5,
    cooldownMs: 4000,
    dailySoftCap: 20,
    diminishingFactor: 0.5,
    requiredRankStage: 1,
    actionState: 'offer_lotus',
    vfxType: 'lotus_bloom',
    zoneHint: 'Hồ Liên Hoa & Điện Quan Âm (Sacred Lotus Pond)',
  },
  read_scripture: {
    id: 'read_scripture',
    name: 'Tụng Kinh Khai Trí (Chant & Study Sutra)',
    description: 'Đọc tụng kinh điển cổ xưa, suy ngẫm lý nhân quả và Tứ Diệu Đế.',
    baseMerit: 18,
    baseExp: 25,
    senReward: 5,
    cooldownMs: 4500,
    dailySoftCap: 20,
    diminishingFactor: 0.5,
    requiredRankStage: 2,
    actionState: 'meditate',
    vfxType: 'golden_particles',
    zoneHint: 'Tàng Kinh Các (Scripture Pavilion)',
  },
  listen_dharma: {
    id: 'listen_dharma',
    name: 'Thính Pháp Giác Ngộ (Listen to Dharma Talk)',
    description: 'Lắng nghe bậc cao tăng giảng giải đạo lý từ bi, buông xả và vị tha.',
    baseMerit: 22,
    baseExp: 30,
    senReward: 6,
    cooldownMs: 5000,
    dailySoftCap: 15,
    diminishingFactor: 0.5,
    requiredRankStage: 2,
    actionState: 'meditate',
    vfxType: 'bell_ripple',
    zoneHint: 'Giảng Đường Pháp Âm (Dharma Lecture Terrace)',
  },
  help_npc: {
    id: 'help_npc',
    name: 'Cứu Giúp Bá Tánh (Aid Sentient Beings)',
    description: 'Lắng nghe nỗi khổ của lữ khách, chia sẻ lương thực, thuốc thang và lời khuyên thiện lành.',
    baseMerit: 25,
    baseExp: 32,
    senReward: 8,
    cooldownMs: 5000,
    dailySoftCap: 15,
    diminishingFactor: 0.5,
    requiredRankStage: 1,
    actionState: 'greet_chaptay',
    vfxType: 'golden_particles',
    zoneHint: 'Cổng Tam Quan & Đường Hành Hương (Pilgrim Path)',
  },
  group_meditation: {
    id: 'group_meditation',
    name: 'Cộng Tu Thiền Định (Synchronized Group Meditation)',
    description: 'Cùng các đạo hữu đồng tâm tọa thiền, cộng hưởng năng lượng thanh tịnh khắp đạo tràng.',
    baseMerit: 30,
    baseExp: 38,
    senReward: 10,
    cooldownMs: 6000,
    dailySoftCap: 15,
    diminishingFactor: 0.5,
    requiredRankStage: 2,
    actionState: 'meditate',
    vfxType: 'aura_surge',
    zoneHint: 'Đài Liên Hoa Cộng Tu (Communal Lotus Platform)',
  },
  offer_lantern: {
    id: 'offer_lantern',
    name: 'Thả Đèn Hoa Đăng (Release Floating Lotus Lantern)',
    description: 'Thắp sáng đèn hoa đăng cầu nguyện quốc thái dân an, soi đường cho những linh hồn lạc lối.',
    baseMerit: 20,
    baseExp: 24,
    senReward: 7,
    cooldownMs: 4500,
    dailySoftCap: 20,
    diminishingFactor: 0.5,
    requiredRankStage: 1,
    actionState: 'offer_lotus',
    vfxType: 'sky_lantern',
    zoneHint: 'Bến Hoa Đăng Hồ Tịnh Thủy (Lantern Pier)',
  },
  clean_temple: {
    id: 'clean_temple',
    name: 'Quét Lá Chùa Xưa (Sweep & Purify Temple Grounds)',
    description: 'Quét dọn lá rụng sân chùa: "Quét sân quét cả bụi lòng, lá rơi mỗi chiếc tâm không nhẹ nhàng".',
    baseMerit: 15,
    baseExp: 20,
    senReward: 5,
    cooldownMs: 3500,
    dailySoftCap: 25,
    diminishingFactor: 0.5,
    requiredRankStage: 1,
    actionState: 'bow',
    vfxType: 'golden_particles',
    zoneHint: 'Sân Bồ Đề Cổ Thụ (Ancient Bodhi Courtyard)',
  },
  prostration_108: {
    id: 'prostration_108',
    name: 'Đại Lễ 108 Lạy Sám Hối (108 Repentance Prostrations)',
    description: 'Thành tâm ngũ thể đầu địa 108 lạy, tiêu trừ nghiệp chướng sâu dày và tăng trưởng đại công đức.',
    baseMerit: 45,
    baseExp: 55,
    senReward: 15,
    cooldownMs: 8000,
    dailySoftCap: 10,
    diminishingFactor: 0.4,
    requiredRankStage: 3,
    actionState: 'prostrate',
    vfxType: 'aura_surge',
    zoneHint: 'Bậc Thang Ngũ Bách Danh & Đại Điện (Grand Prostration Steps)',
  },
};

/**
 * 3. TRIBULATIONS — All 6 Celestial Ascension Trials (Độ Kiếp)
 */
export const TRIBULATIONS: TribulationDefinition[] = [
  {
    id: 'trib_lightning',
    name: 'Nine-Heavens Lightning Tribulation',
    vietnameseName: 'Cửu Trùng Lôi Kiếp',
    type: 'lightning',
    requiredRankStage: 6,
    recommendedPartySize: 2,
    durationSeconds: 45,
    description: 'Chín đạo thiên lôi giáng xuống từ tầng mây tím để khảo nghiệm căn cơ và công đức trước khi bước qua Nam Thiên Môn.',
    hazardMechanic: 'Vòng tròn Thiên Lôi cảnh báo trên mặt đất mỗi 5 giây; giữ trạng thái Thiền Định hoặc di chuyển vào trận pháp Liên Hoa để giảm 70% sát thương linh lực.',
    rewardMerit: 250,
    rewardExp: 350,
    rewardTienNgoc: 25,
    unlockRankStage: 7,
    unlockAuraId: 'aura_thunder_lotus',
    unlockTitle: 'Lôi Kiếp Phi Thăng Giả',
  },
  {
    id: 'trib_fire',
    name: 'Crimson Lotus Fire Tribulation',
    vietnameseName: 'Hồng Liên Hỏa Kiếp',
    type: 'fire',
    requiredRankStage: 7,
    recommendedPartySize: 2,
    durationSeconds: 50,
    description: 'Ngọn lửa Nghiệp Hỏa Hồng Liên thiêu đốt mọi tạp niệm còn sót lại của bậc tân Tiên Nhân.',
    hazardMechanic: 'Sóng lửa lan tỏa từ tâm đài Độ Kiếp; đạo hữu xung quanh có thể truyền thanh khí hoặc niệm chú Cam Lộ để hạ nhiệt tâm hỏa.',
    rewardMerit: 400,
    rewardExp: 550,
    rewardTienNgoc: 40,
    unlockRankStage: 8,
    unlockAuraId: 'aura_crimson_lotus',
    unlockTitle: 'Hồng Liên Tiên Nhân',
  },
  {
    id: 'trib_heart_demon',
    name: 'Illusory Heart Demon Tribulation',
    vietnameseName: 'Vô Tướng Tâm Ma Kiếp',
    type: 'heart_demon',
    requiredRankStage: 8,
    recommendedPartySize: 3,
    durationSeconds: 60,
    description: 'Ảo ảnh của tham lam, sân hận và kiêu mạn hóa thành bóng tối bao vây tâm thức người tu hành.',
    hazardMechanic: 'Bóng ma ảo cảnh xuất hiện đặt câu hỏi đạo tâm; chọn đúng chánh niệm và giữ tâm bất động để phá tan ảo cảnh.',
    rewardMerit: 650,
    rewardExp: 850,
    rewardTienNgoc: 60,
    unlockRankStage: 9,
    unlockAuraId: 'aura_mirror_wisdom',
    unlockTitle: 'Bất Động Chân Tiên',
  },
  {
    id: 'trib_wind',
    name: 'Astral Gale Tribulation',
    vietnameseName: 'Cửu Thiên Phong Kiếp',
    type: 'wind',
    requiredRankStage: 9,
    recommendedPartySize: 3,
    durationSeconds: 65,
    description: 'Cuồng phong Tam Giới thổi tan lục phủ ngũ tạng phàm trần để đúc kết Bất Hoại Kim Thân.',
    hazardMechanic: 'Gió lốc đẩy lùi người chơi khỏi tâm đài; cần phối hợp kết ấn hộ pháp cùng đồng đạo để giữ vững vị trí trung tâm.',
    rewardMerit: 950,
    rewardExp: 1200,
    rewardTienNgoc: 90,
    unlockRankStage: 10,
    unlockAuraId: 'aura_golden_immortal',
    unlockTitle: 'Bất Hoại Kim Tiên',
  },
  {
    id: 'trib_karma',
    name: 'Myriad Lifetimes Karma Tribulation',
    vietnameseName: 'Vạn Kiếp Nghiệp Lực Kiếp',
    type: 'karma',
    requiredRankStage: 10,
    recommendedPartySize: 4,
    durationSeconds: 75,
    description: 'Dòng sông Nhân Quả hiện hình, tái hiện mọi ân oán nhiều đời để thử thách lòng đại từ đại bi.',
    hazardMechanic: 'Sợi dây nhân quả trói buộc; người chơi phải thực hiện nghi thức Xả Bỏ & Hồi Hướng Công Đức để chuyển hóa oán khí thành kim quang.',
    rewardMerit: 1400,
    rewardExp: 1800,
    rewardTienNgoc: 130,
    unlockRankStage: 11,
    unlockAuraId: 'aura_dharma_wheel',
    unlockTitle: 'Đại La Vô Thượng Tiên',
  },
  {
    id: 'trib_final_heavenly',
    name: 'Supreme Heavenly Dao Trial',
    vietnameseName: 'Hỗn Nguyên Thiên Đạo Đại Kiếp',
    type: 'final_heavenly',
    requiredRankStage: 11,
    recommendedPartySize: 5,
    durationSeconds: 90,
    description: 'Khảo nghiệm tối hậu của Thiên Đạo: Ngũ lôi, Hồng hỏa, Tâm ma, Cương phong và Nhân quả cùng hợp nhất.',
    hazardMechanic: 'Năm pha khảo nghiệm liên tiếp; cả đạo tràng có thể trợ niệm Hoa Đăng và Hộ Pháp để cùng đón hào quang Thiên Đạo Cảnh.',
    rewardMerit: 2200,
    rewardExp: 3000,
    rewardTienNgoc: 250,
    unlockRankStage: 12,
    unlockAuraId: 'aura_heavenly_dao',
    unlockTitle: 'Thiên Đạo Chí Tôn',
  },
];

/**
 * 4. QUEST_DEFINITIONS — Daily, Weekly, Story, and Underworld Redemption Quests
 */
export const QUEST_DEFINITIONS: QuestDefinition[] = [
  // Daily Quests
  {
    id: 'quest_daily_incense',
    title: 'Nén Hương Tâm Thành (Morning Incense Offering)',
    description: 'Dâng 3 nén hương trầm tại Đại Hùng Bảo Điện để khởi đầu ngày mới trong chánh niệm.',
    targetCount: 3,
    resetCycle: 'daily',
    rewardMerit: 35,
    rewardExp: 45,
    rewardSen: 12,
    activityTrigger: 'offer_incense',
  },
  {
    id: 'quest_daily_meditation',
    title: 'Tĩnh Lặng Giữa Dòng Đời (Daily Mindful Sitting)',
    description: 'Hoàn thành 3 phiên Tọa Thiền Định Tâm tại Thiền Đường hoặc bên hồ sen.',
    targetCount: 3,
    resetCycle: 'daily',
    rewardMerit: 45,
    rewardExp: 60,
    rewardSen: 15,
    activityTrigger: 'meditate_session',
  },
  {
    id: 'quest_daily_bow',
    title: 'Chín Lạy Kính lễ Tam Bảo (Nine Reverent Bows)',
    description: 'Thành tâm lễ Phật 5 lần để rèn luyện lòng khiêm cung.',
    targetCount: 5,
    resetCycle: 'daily',
    rewardMerit: 30,
    rewardExp: 40,
    rewardSen: 10,
    activityTrigger: 'bow_buddha',
  },
  {
    id: 'quest_daily_clean',
    title: 'Quét Sân Tịnh Cảnh (Purify the Sanctuary)',
    description: 'Quét dọn lá rụng quanh sân chùa 3 lần để giữ chốn già lam thanh tịnh.',
    targetCount: 3,
    resetCycle: 'daily',
    rewardMerit: 40,
    rewardExp: 50,
    rewardSen: 14,
    activityTrigger: 'clean_temple',
  },
  {
    id: 'quest_daily_help_npc',
    title: 'Bàn Tay Từ Bi (Extend a Compassionate Hand)',
    description: 'Giúp đỡ 2 lữ khách hoặc bá tánh đang gặp khó khăn quanh cổng chùa.',
    targetCount: 2,
    resetCycle: 'daily',
    rewardMerit: 50,
    rewardExp: 65,
    rewardSen: 18,
    activityTrigger: 'help_npc',
  },
  // Weekly Quests
  {
    id: 'quest_weekly_prostration',
    title: 'Đại Nguyện 108 Lạy (Vow of 108 Prostrations)',
    description: 'Thực hiện 5 khóa Đại Lễ 108 Lạy Sám Hối trong tuần để tiêu trừ nghiệp chướng.',
    targetCount: 5,
    resetCycle: 'weekly',
    rewardMerit: 180,
    rewardExp: 240,
    rewardSen: 60,
    activityTrigger: 'prostration_108',
  },
  {
    id: 'quest_weekly_group_dharma',
    title: 'Đạo Tràng Cộng Tu (Sangha Collective Harmony)',
    description: 'Tham gia 5 phiên Cộng Tu Thiền Định cùng các đạo hữu khác.',
    targetCount: 5,
    resetCycle: 'weekly',
    rewardMerit: 160,
    rewardExp: 210,
    rewardSen: 55,
    activityTrigger: 'group_meditation',
  },
  {
    id: 'quest_weekly_lanterns',
    title: 'Đêm Hội Hoa Đăng (Sea of Wishing Lanterns)',
    description: 'Thả 8 đèn hoa đăng cầu nguyện bình an cho khắp cõi nhân gian.',
    targetCount: 8,
    resetCycle: 'weekly',
    rewardMerit: 150,
    rewardExp: 190,
    rewardSen: 50,
    activityTrigger: 'offer_lantern',
  },
  // Story Quests
  {
    id: 'quest_story_first_wisdom',
    title: 'Khởi Đầu Trí Tuệ (Awakening to Dharma Wisdom)',
    description: 'Hoàn thành bài học Trí Tuệ & Tình Huống Đạo Đức đầu tiên cùng bậc hiền triết.',
    targetCount: 1,
    resetCycle: 'story',
    rewardMerit: 100,
    rewardExp: 140,
    rewardSen: 35,
    activityTrigger: 'wisdom_study',
  },
  {
    id: 'quest_story_compassion_trial',
    title: 'Hạt Giống Đại Bi (Seeds of Great Compassion)',
    description: 'Dâng 3 đóa sen thanh khiết và lắng nghe Pháp âm tại giảng đường.',
    targetCount: 3,
    resetCycle: 'story',
    rewardMerit: 150,
    rewardExp: 200,
    rewardSen: 45,
    activityTrigger: 'offer_lotus',
  },
  {
    id: 'quest_story_celestial_gate',
    title: 'Bước Qua Nam Thiên Môn (Beyond the Southern Heaven Gate)',
    description: 'Vượt qua Cửu Trùng Lôi Kiếp để chính thức phi thăng lên cõi Thiên Đình.',
    targetCount: 1,
    resetCycle: 'story',
    rewardMerit: 300,
    rewardExp: 450,
    rewardSen: 100,
    activityTrigger: 'tribulation_clear',
  },
  {
    id: 'quest_story_lotus_pond',
    title: 'Hương Sen Cõi Thượng Giới (Fragrance of the Celestial Pond)',
    description: 'Tụng kinh khai trí 3 lần để củng cố đạo tâm nơi Thiên Đình.',
    targetCount: 3,
    resetCycle: 'story',
    rewardMerit: 220,
    rewardExp: 300,
    rewardSen: 75,
    activityTrigger: 'read_scripture',
  },
  {
    id: 'quest_story_heart_mirror',
    title: 'Gương Sáng Không Bụi (The Dustless Mirror of Mind)',
    description: 'Lắng nghe 4 buổi thuyết pháp để thấu triệt lý Vô Ngã trước Tâm Ma Kiếp.',
    targetCount: 4,
    resetCycle: 'story',
    rewardMerit: 320,
    rewardExp: 420,
    rewardSen: 90,
    activityTrigger: 'listen_dharma',
  },
  {
    id: 'quest_story_karmic_resolver',
    title: 'Hóa Giải Thiên Niên Nghiệp (Resolving Millennia of Karma)',
    description: 'Đóng góp vào 3 sự kiện Cộng Đồng của đạo tràng để hồi hướng cho muôn loài.',
    targetCount: 3,
    resetCycle: 'story',
    rewardMerit: 500,
    rewardExp: 650,
    rewardSen: 140,
    activityTrigger: 'community_event',
  },
  {
    id: 'quest_story_supreme_awakening',
    title: 'Viên Mãn Thiên Đạo (Supreme Awakening of the Way)',
    description: 'Vượt qua Hỗn Nguyên Thiên Đạo Đại Kiếp và đạt cảnh giới Thiên Đạo Cảnh.',
    targetCount: 1,
    resetCycle: 'story',
    rewardMerit: 1000,
    rewardExp: 1500,
    rewardSen: 300,
    activityTrigger: 'tribulation_clear',
  },
  // Redemption Quests
  {
    id: 'quest_redemption_repentance',
    title: 'Quay Đầu Là Bờ (The Shore of Repentance)',
    description: 'Thực hiện thử thách hối cải và chiêm nghiệm lỗi lầm tại tầng Địa Ngục đang thọ án để tịnh hóa Nghiệp Lực.',
    targetCount: 1,
    resetCycle: 'redemption',
    rewardMerit: 120,
    rewardExp: 80,
    rewardSen: 20,
    activityTrigger: 'hell_redemption',
  },
];

/**
 * 5. ACHIEVEMENT_DEFINITIONS — Non-Pay-To-Win Milestones & Titles
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'ach_first_bow',
    title: 'Sơ Tâm Lễ Phật',
    description: 'Thành tâm lễ Phật lần đầu tiên tại Chánh Điện.',
    icon: '🙏',
    rewardSen: 20,
    rewardTienNgoc: 2,
    unlockTitle: 'Người Khởi Tâm Thiện',
    metric: 'merit',
    targetValue: 10,
  },
  {
    id: 'ach_merit_1000',
    title: 'Công Đức Vô Lượng',
    description: 'Tích lũy đạt mốc 1.000 Công Đức qua các thiện hạnh.',
    icon: '🪷',
    rewardSen: 80,
    rewardTienNgoc: 15,
    unlockTitle: 'Đại Thiện Tri Thức',
    metric: 'merit',
    targetValue: 1000,
  },
  {
    id: 'ach_merit_10000',
    title: 'Vạn Thiện Đồng Quy',
    description: 'Tích lũy đạt mốc 10.000 Công Đức, hào quang phúc báo chiếu rạng.',
    icon: '☀️',
    rewardSen: 250,
    rewardTienNgoc: 60,
    unlockTitle: 'Phúc Huệ Song Toàn',
    metric: 'merit',
    targetValue: 10000,
  },
  {
    id: 'ach_meditate_master',
    title: 'Thiền Định Như Sơn',
    description: 'Hoàn thành 25 phiên tọa thiền định tâm không xao nhãng.',
    icon: '🧘',
    rewardSen: 60,
    rewardTienNgoc: 10,
    unlockTitle: 'Thiền Tâm Bất Động',
    metric: 'meditateCount',
    targetValue: 25,
  },
  {
    id: 'ach_prostration_devotee',
    title: 'Ngũ Thể Đầu Địa',
    description: 'Thực hiện 10 khóa Đại Lễ 108 Lạy Sám Hối.',
    icon: '📿',
    rewardSen: 100,
    rewardTienNgoc: 20,
    unlockTitle: 'Chí Thành Sám Hối',
    metric: 'prostrationCount',
    targetValue: 10,
  },
  {
    id: 'ach_wisdom_scholar',
    title: 'Thấu Lý Nhân Quả',
    description: 'Hoàn thành 10 bài học Trí Tuệ & Tình Huống Đạo Đức.',
    icon: '📜',
    rewardSen: 120,
    rewardTienNgoc: 25,
    unlockTitle: 'Bậc Trí Giả Nhân Gian',
    metric: 'wisdomCount',
    targetValue: 10,
  },
  {
    id: 'ach_celestial_ascension',
    title: 'Phi Thăng Thượng Giới',
    description: 'Đạt cấp bậc 7 (Phi Thăng Giả) và bước qua Nam Thiên Môn.',
    icon: '⚡',
    rewardSen: 150,
    rewardTienNgoc: 40,
    unlockTitle: 'Nam Thiên Phi Thăng Giả',
    metric: 'rankStage',
    targetValue: 7,
  },
  {
    id: 'ach_hell_redeemed',
    title: 'Phá Ám Hồi Quang',
    description: 'Thành tâm hối cải, vượt qua khảo nghiệm Địa Ngục và trở về Nhân Gian với tâm trong sạch.',
    icon: '🕯️',
    rewardSen: 90,
    rewardTienNgoc: 20,
    unlockTitle: 'Người Quay Đầu Tỉnh Ngộ',
    metric: 'hellRedemptionCount',
    targetValue: 1,
  },
  {
    id: 'ach_sangha_pillar',
    title: 'Trụ Cột Đạo Tràng',
    description: 'Đóng góp 15 lần vào các sự kiện Cộng Đồng của chùa.',
    icon: '🏮',
    rewardSen: 110,
    rewardTienNgoc: 25,
    unlockTitle: 'Hộ Pháp Đạo Tràng',
    metric: 'communityCount',
    targetValue: 15,
  },
  {
    id: 'ach_heavenly_dao',
    title: 'Thiên Đạo Viên Mãn',
    description: 'Đạt cảnh giới tối thượng Cấp 12 — Thiên Đạo Cảnh.',
    icon: '🌌',
    rewardSen: 500,
    rewardTienNgoc: 150,
    unlockTitle: 'Thiên Đạo Chí Tôn',
    metric: 'rankStage',
    targetValue: 12,
  },
];

/**
 * 6. COSMETIC_CATALOG — Purely Cosmetic Outfits, Auras, Accessories, and Titles
 * Purchased exclusively with earned Sen or Tiên Ngọc (Zero Pay-to-Win).
 */
export const COSMETIC_CATALOG: CosmeticItem[] = [
  // Outfits
  {
    id: 'outfit_pilgrim_robe',
    name: 'Humble Pilgrim Garb',
    vietnameseName: 'Áo Lam Hành Hương',
    category: 'outfit',
    type: 'outfit',
    description: 'Áo lam giản dị của người cư sĩ thành tâm về chùa lễ Phật.',
    senCost: 0,
    tienNgocCost: 0,
    requiredRankStage: 1,
    robeColor: '#6b7d8c',
    trimColor: '#d9c8a9',
  },
  {
    id: 'outfit_saffron_monk',
    name: 'Saffron Dharma Robe',
    vietnameseName: 'Huỳnh Y Giải Thoát',
    category: 'outfit',
    type: 'outfit',
    description: 'Y cà-sa màu vàng nghệ truyền thống, biểu trưng cho sự buông xả và phạm hạnh.',
    senCost: 45,
    tienNgocCost: 0,
    requiredRankStage: 2,
    robeColor: '#d9822b',
    trimColor: '#f5d76e',
  },
  {
    id: 'outfit_white_lotus',
    name: 'White Lotus Vestment',
    vietnameseName: 'Bạch Liên Tinh Khiết Y',
    category: 'outfit',
    type: 'outfit',
    description: 'Y phục trắng ngần thêu hoa sen bạc, thanh thoát như sương sớm.',
    senCost: 90,
    tienNgocCost: 0,
    requiredRankStage: 3,
    robeColor: '#f0f4f8',
    trimColor: '#9ad0ec',
  },
  {
    id: 'outfit_jade_guardian',
    name: 'Jade Guardian Armor-Robe',
    vietnameseName: 'Ngọc Thanh Hộ Pháp Bào',
    category: 'outfit',
    type: 'outfit',
    description: 'Bào phục xanh ngọc bích trang nghiêm của bậc hộ pháp chốn thiền môn.',
    senCost: 160,
    tienNgocCost: 15,
    requiredRankStage: 5,
    robeColor: '#1f6f61',
    trimColor: '#e8c547',
  },
  {
    id: 'outfit_celestial_cloud',
    name: 'Nine-Clouds Immortal Raiment',
    vietnameseName: 'Cửu Vân Tiên Y',
    category: 'outfit',
    type: 'outfit',
    description: 'Tiên y dệt từ mây lành Thiên Đình, phát sáng dịu nhẹ khi lướt đi giữa hư không.',
    senCost: 280,
    tienNgocCost: 45,
    requiredRankStage: 7,
    robeColor: '#4a5596',
    trimColor: '#8be9fd',
  },
  {
    id: 'outfit_golden_sovereign',
    name: 'Golden Sovereign Dharma Robe',
    vietnameseName: 'Kim Quang Thiên Đạo Bào',
    category: 'outfit',
    type: 'outfit',
    description: 'Pháp bào tối thượng dệt bằng ánh kim quang của bậc Đại La Kim Tiên.',
    senCost: 500,
    tienNgocCost: 120,
    requiredRankStage: 10,
    robeColor: '#b8860b',
    trimColor: '#fff6b3',
  },
  // Auras
  {
    id: 'aura_warm_incense',
    name: 'Warm Sandalwood Halo',
    vietnameseName: 'Hào Quang Hương Trầm',
    category: 'aura',
    type: 'aura',
    description: 'Vòng sáng ấm áp dịu nhẹ như khói trầm hương lan tỏa quanh thân.',
    senCost: 40,
    tienNgocCost: 0,
    requiredRankStage: 1,
    auraColor: '#e6c27a',
  },
  {
    id: 'aura_lotus_radiance',
    name: 'Sacred Pink Lotus Aura',
    vietnameseName: 'Liên Hoa Bảo Quang',
    category: 'aura',
    type: 'aura',
    description: 'Đài sen hồng phát sáng dưới chân mỗi khi thiền định hoặc lễ bái.',
    senCost: 110,
    tienNgocCost: 10,
    requiredRankStage: 3,
    auraColor: '#ff9ebb',
  },
  {
    id: 'aura_thunder_lotus',
    name: 'Cyan Thunder-Lotus Halo',
    vietnameseName: 'Thanh Lôi Tiên Quang',
    category: 'aura',
    type: 'aura',
    description: 'Hào quang tia chớp xanh biếc minh chứng đã vượt qua Cửu Trùng Lôi Kiếp.',
    senCost: 220,
    tienNgocCost: 35,
    requiredRankStage: 7,
    auraColor: '#5ce1e6',
  },
  {
    id: 'aura_dharma_wheel',
    name: 'Golden Dharma Wheel Halo',
    vietnameseName: 'Kim Luân Pháp Quang',
    category: 'aura',
    type: 'aura',
    description: 'Bánh xe Pháp Luân vàng rực xoay chuyển sau lưng bậc giác ngộ.',
    senCost: 420,
    tienNgocCost: 90,
    requiredRankStage: 10,
    auraColor: '#ffd700',
  },
  {
    id: 'aura_heavenly_dao',
    name: 'Supreme Cosmic Nirvana Aura',
    vietnameseName: 'Hỗn Nguyên Đại Đạo Quang',
    category: 'aura',
    type: 'aura',
    description: 'Ánh sáng ngũ sắc viên mãn bao trùm cả đất trời.',
    senCost: 700,
    tienNgocCost: 180,
    requiredRankStage: 12,
    auraColor: '#ffffff',
  },
  // Accessories
  {
    id: 'acc_mala_beads',
    name: '108 Bodhi Mala Beads',
    vietnameseName: 'Tràng Hạt Bồ Đề 108 Hạt',
    category: 'accessory',
    type: 'accessory',
    description: 'Chuỗi hạt Bồ Đề cổ thụ giúp tâm trí luôn tỉnh thức.',
    senCost: 35,
    tienNgocCost: 0,
    requiredRankStage: 1,
    accessoryKey: 'mala_beads',
  },
  {
    id: 'acc_incense_censer',
    name: 'Golden Filigree Censer',
    vietnameseName: 'Lư Hương Đồng Chạm Rồng',
    category: 'accessory',
    type: 'accessory',
    description: 'Lư hương nhỏ tỏa hương trầm thanh khiết theo từng bước chân.',
    senCost: 75,
    tienNgocCost: 5,
    requiredRankStage: 2,
    accessoryKey: 'incense_censer',
  },
  {
    id: 'acc_lotus_halo',
    name: 'Floating Lotus Crown',
    vietnameseName: 'Mão Liên Hoa Phát Quang',
    category: 'accessory',
    type: 'accessory',
    description: 'Vòng nguyệt quế kết từ cánh sen ánh sáng lơ lửng trên đỉnh đầu.',
    senCost: 140,
    tienNgocCost: 20,
    requiredRankStage: 4,
    accessoryKey: 'lotus_halo',
  },
  {
    id: 'acc_celestial_ribbon',
    name: 'Astral Silk Ribbon',
    vietnameseName: 'Huyền Thiên Phi Bạc',
    category: 'accessory',
    type: 'accessory',
    description: 'Dải lụa tiên giới uốn lượn quanh vai người đã phi thăng.',
    senCost: 240,
    tienNgocCost: 40,
    requiredRankStage: 7,
    accessoryKey: 'celestial_ribbon',
  },
  {
    id: 'acc_dharma_staff',
    name: 'Nine-Ring Khakkhara Staff',
    vietnameseName: 'Tích Trượng Cửu Hoàn',
    category: 'accessory',
    type: 'accessory',
    description: 'Tích trượng chín vòng ngân vang phá tan bóng tối vô minh.',
    senCost: 320,
    tienNgocCost: 65,
    requiredRankStage: 8,
    accessoryKey: 'dharma_staff',
  },
  // Titles & Nameplates
  {
    id: 'title_lotus_heart',
    name: 'Tâm Sen Thanh Tịnh',
    vietnameseName: 'Tâm Sen Thanh Tịnh',
    category: 'title',
    type: 'title',
    description: 'Danh hiệu dành cho người giữ tâm trong sáng giữa bụi trần.',
    senCost: 50,
    tienNgocCost: 0,
    requiredRankStage: 2,
    nameplateStyle: 'jade',
  },
  {
    id: 'title_compassionate_sage',
    name: 'Từ Bi Hành Giả',
    vietnameseName: 'Từ Bi Hành Giả',
    category: 'title',
    type: 'title',
    description: 'Danh hiệu tôn vinh người luôn sẵn lòng cứu giúp bá tánh.',
    senCost: 120,
    tienNgocCost: 15,
    requiredRankStage: 4,
    nameplateStyle: 'gold',
  },
  {
    id: 'title_celestial_envoy',
    name: 'Thiên Đình Sứ Giả',
    vietnameseName: 'Thiên Đình Sứ Giả',
    category: 'title',
    type: 'title',
    description: 'Danh hiệu cao quý của bậc tiên nhân bước qua Nam Thiên Môn.',
    senCost: 260,
    tienNgocCost: 50,
    requiredRankStage: 7,
    nameplateStyle: 'celestial',
  },
];

/**
 * 7. QUICK_CHAT_PRESETS — Respectful Vietnamese Social Phrases
 */
export const QUICK_CHAT_PRESETS: QuickChatPreset[] = [
  {
    id: 'chat_adidaphat',
    text: 'Nam Mô A Di Đà Phật 🙏',
    label: 'Nam Mô A Di Đà Phật 🙏',
    category: 'greeting',
    suggestedEmote: 'greet_chaptay',
  },
  {
    id: 'chat_tinhtan',
    text: 'Chúc đạo hữu tinh tấn tu hành, thân tâm an lạc!',
    label: 'Chúc đạo hữu tinh tấn tu hành!',
    category: 'blessing',
    suggestedEmote: 'bow',
  },
  {
    id: 'chat_cungthien',
    text: 'Cùng ngồi thiền tích công đức tại Thiền Đường nhé!',
    label: 'Cùng ngồi thiền tích công đức nhé!',
    category: 'practice',
    suggestedEmote: 'meditate',
  },
  {
    id: 'chat_dokiep',
    text: 'Cung hỷ đạo hữu độ kiếp phi thăng thành công! ✨',
    label: 'Cung hỷ đạo hữu độ kiếp thành công!',
    category: 'celestial',
    suggestedEmote: 'celebrate',
  },
  {
    id: 'chat_108lay',
    text: 'Mời chư vị đạo hữu cùng hợp sức thực hiện Đại Lễ 108 Lạy!',
    label: 'Cùng thực hiện Đại Lễ 108 Lạy!',
    category: 'practice',
    suggestedEmote: 'prostrate',
  },
  {
    id: 'chat_hoadang',
    text: 'Thả đèn hoa đăng cầu nguyện bình an cho muôn loài 🏮',
    label: 'Thả đèn hoa đăng cầu bình an 🏮',
    category: 'blessing',
    suggestedEmote: 'offer_lotus',
  },
  {
    id: 'chat_quaydaulabo',
    text: 'Quay đầu là bờ, chúc đạo hữu sớm tịnh hóa nghiệp lực trở về nhân gian!',
    label: 'Quay đầu là bờ, cố lên đạo hữu!',
    category: 'redemption',
    suggestedEmote: 'cheer',
  },
  {
    id: 'chat_hoihuong',
    text: 'Nguyện đem công đức này hướng về khắp tất cả đệ tử và chúng sinh 🙏',
    label: 'Hồi hướng công đức cho chúng sinh 🙏',
    category: 'blessing',
    suggestedEmote: 'greet_chaptay',
  },
];

/**
 * 8. KARMA_JUDGMENT_CONFIG — Configurable Negative Karma Thresholds Mapping to 18 Levels of Hell
 * Triggered when `karmaBalance = merit - negativeKarma <= -100`.
 * Deeper negative karma sentences the player to deeper levels down to Level 18 (`<= -3500`).
 */
export const KARMA_JUDGMENT_CONFIG: KarmaJudgmentConfig = {
  warningThreshold: -50,
  triggerThreshold: -100,
  redemptionFreedomThreshold: 0,
  softCapMinimumMultiplier: 0.2,
  levels: [
    {
      hellLevel: 1,
      karmaThreshold: -100,
      exitKarmaBalance: 0,
      vietnameseName: 'Tầng 1: Bạt Thiệt Địa Ngục',
      englishName: 'Chamber of Deceitful Words',
      sinTheme: 'Vọng ngữ, nói dối, đâm bị thóc chọc bị gạo gây chia rẽ.',
    },
    {
      hellLevel: 2,
      karmaThreshold: -220,
      exitKarmaBalance: -80,
      vietnameseName: 'Tầng 2: Tiễn Đao Địa Ngục',
      englishName: 'Dunes of Insatiable Greed',
      sinTheme: 'Tham lam ích kỷ, chiếm đoạt của cải và phá hoại hạnh phúc người khác.',
    },
    {
      hellLevel: 3,
      karmaThreshold: -360,
      exitKarmaBalance: -180,
      vietnameseName: 'Tầng 3: Thiết Thụ Địa Ngục',
      englishName: 'Forge of Wrathful Discord',
      sinTheme: 'Sân hận cuồng nộ, ly gián tình thân và gieo rắc thù hằn.',
    },
    {
      hellLevel: 4,
      karmaThreshold: -520,
      exitKarmaBalance: -300,
      vietnameseName: 'Tầng 4: Nghiệt Kính Địa Ngục',
      englishName: 'Hall of the Karmic Mirror',
      sinTheme: 'Giả nhân giả nghĩa, che giấu tội lỗi, trốn tránh trách nhiệm.',
    },
    {
      hellLevel: 5,
      karmaThreshold: -700,
      exitKarmaBalance: -450,
      vietnameseName: 'Tầng 5: Chưng Lung Địa Ngục',
      englishName: 'Chasm of Broken Oaths',
      sinTheme: 'Bội ước phản tín, nói lời hoa mỹ nhưng phản bội lòng tin.',
    },
    {
      hellLevel: 6,
      karmaThreshold: -900,
      exitKarmaBalance: -620,
      vietnameseName: 'Tầng 6: Đồng Trụ Địa Ngục',
      englishName: 'Glacier of Cruel Apathy',
      sinTheme: 'Vô cảm tàn nhẫn trước nỗi đau khổ cùng cực của đồng loại.',
    },
    {
      hellLevel: 7,
      karmaThreshold: -1100,
      exitKarmaBalance: -800,
      vietnameseName: 'Tầng 7: Đao Sơn Địa Ngục',
      englishName: 'Ridge of Malicious Slander',
      sinTheme: 'Vu khống, ác khẩu làm tổn thương danh dự và sinh mạng người vô tội.',
    },
    {
      hellLevel: 8,
      karmaThreshold: -1300,
      exitKarmaBalance: -1000,
      vietnameseName: 'Tầng 8: Băng Sơn Địa Ngục',
      englishName: 'Vault of Stolen Offerings',
      sinTheme: 'Biển thủ của công, trộm cắp tài vật cứu tế và của tam bảo.',
    },
    {
      hellLevel: 9,
      karmaThreshold: -1500,
      exitKarmaBalance: -1200,
      vietnameseName: 'Tầng 9: Dầu Oa Địa Ngục',
      englishName: 'Arena of Bullying & Violence',
      sinTheme: 'Ỷ mạnh hiếp yếu, bạo hành và chà đạp kẻ thế cô.',
    },
    {
      hellLevel: 10,
      karmaThreshold: -1720,
      exitKarmaBalance: -1400,
      vietnameseName: 'Tầng 10: Ngưu Khanh Địa Ngục',
      englishName: 'Maze of Fraud & Manipulation',
      sinTheme: 'Lừa đảo tinh vi, thao túng tâm lý và lợi dụng lòng tin của người hiền.',
    },
    {
      hellLevel: 11,
      karmaThreshold: -1950,
      exitKarmaBalance: -1620,
      vietnameseName: 'Tầng 11: Thạch Áp Địa Ngục',
      englishName: 'Grove of Filial Ingratitude',
      sinTheme: 'Bất hiếu, vô ơn với bậc sinh thành và những người từng cưu mang mình.',
    },
    {
      hellLevel: 12,
      karmaThreshold: -2200,
      exitKarmaBalance: -1850,
      vietnameseName: 'Tầng 12: Xuân Cối Địa Ngục',
      englishName: 'Spire of Arrogant Hubris',
      sinTheme: 'Ngạo mạn cực độ, khinh miệt đạo lý và tự coi mình trên muôn loài.',
    },
    {
      hellLevel: 13,
      karmaThreshold: -2450,
      exitKarmaBalance: -2100,
      vietnameseName: 'Tầng 13: Huyết Trì Địa Ngục',
      englishName: 'Ruins of Communal Sabotage',
      sinTheme: 'Phá hoại cộng đồng, hủy hoại môi trường sống và nguồn sống chung.',
    },
    {
      hellLevel: 14,
      karmaThreshold: -2700,
      exitKarmaBalance: -2350,
      vietnameseName: 'Tầng 14: Vong Tử Thành Địa Ngục',
      englishName: 'Mire of Corrupted Trust',
      sinTheme: 'Tuyệt vọng buông xuôi, đầu độc niềm tin và kéo người khác vào đường ác.',
    },
    {
      hellLevel: 15,
      karmaThreshold: -2950,
      exitKarmaBalance: -2600,
      vietnameseName: 'Tầng 15: Đao Cứ Địa Ngục',
      englishName: 'Court of Unjust Exploitation',
      sinTheme: 'Bất công bóc lột, bóp méo công lý vì tư lợi.',
    },
    {
      hellLevel: 16,
      karmaThreshold: -3150,
      exitKarmaBalance: -2850,
      vietnameseName: 'Tầng 16: Hỏa Xa Địa Ngục',
      englishName: 'Fog of Wilful Ignorance',
      sinTheme: 'Cố chấp vô minh, biết rõ điều ác nhưng vẫn cố tình gieo nhân dữ.',
    },
    {
      hellLevel: 17,
      karmaThreshold: -3320,
      exitKarmaBalance: -3050,
      vietnameseName: 'Tầng 17: Bànạch Địa Ngục',
      englishName: 'Abyss of Obsessive Attachment',
      sinTheme: 'Chấp niệm thù hận sâu nặng không chịu buông bỏ qua nhiều kiếp.',
    },
    {
      hellLevel: 18,
      karmaThreshold: -3500,
      exitKarmaBalance: -3250,
      vietnameseName: 'Tầng 18: A Tỳ Đại Địa Ngục (Avīci)',
      englishName: 'Sanctum of Ultimate Reckoning',
      sinTheme: 'Tội ngũ nghịch cực trọng, hủy báng chánh pháp và làm tổn hại đại chúng.',
    },
  ],
  thresholdsByLevel: {
    1: -100,
    2: -220,
    3: -360,
    4: -520,
    5: -700,
    6: -900,
    7: -1100,
    8: -1300,
    9: -1500,
    10: -1720,
    11: -1950,
    12: -2200,
    13: -2450,
    14: -2700,
    15: -2950,
    16: -3150,
    17: -3320,
    18: -3500,
  },
};

/**
 * Pure utility functions for deterministic progression & karma evaluation
 */
export function evaluateAssignedHellLevel(karmaBalance: number): number {
  if (karmaBalance > KARMA_JUDGMENT_CONFIG.triggerThreshold) {
    return 0;
  }
  let assignedLevel = 1;
  for (const entry of KARMA_JUDGMENT_CONFIG.levels) {
    if (karmaBalance <= entry.karmaThreshold) {
      assignedLevel = entry.hellLevel;
    }
  }
  return assignedLevel;
}

export function calculateEffectiveActivityReward(
  activity: MeritActivityConfig,
  dailyCountSoFar: number
): { merit: number; exp: number; sen: number; isSoftCapped: boolean } {
  if (dailyCountSoFar < activity.dailySoftCap) {
    return {
      merit: activity.baseMerit,
      exp: activity.baseExp,
      sen: activity.senReward,
      isSoftCapped: false,
    };
  }
  const overCapSteps = Math.floor((dailyCountSoFar - activity.dailySoftCap) / Math.max(1, Math.floor(activity.dailySoftCap / 2))) + 1;
  const multiplier = Math.max(
    KARMA_JUDGMENT_CONFIG.softCapMinimumMultiplier,
    Math.pow(activity.diminishingFactor, overCapSteps)
  );
  return {
    merit: Math.max(1, Math.round(activity.baseMerit * multiplier)),
    exp: Math.max(1, Math.round(activity.baseExp * multiplier)),
    sen: Math.max(1, Math.round(activity.senReward * multiplier)),
    isSoftCapped: true,
  };
}

export function calculateLevelFromExp(exp: number): number {
  // Smooth curve from Level 1 to Level 100 across 0..30,000+ EXP
  const level = Math.floor(1 + Math.sqrt(Math.max(0, exp) / 3));
  return Math.min(100, Math.max(1, level));
}

export function determineHighestEligibleRank(
  exp: number,
  merit: number,
  karmaBalance: number,
  completedTribulations: string[]
): RankDefinition {
  let highest = RANKS[0];
  for (const rank of RANKS) {
    const meetsExp = exp >= rank.minExp;
    const meetsMerit = merit >= rank.minMerit;
    const meetsKarma = karmaBalance >= rank.minKarmaBalance;
    const meetsTribulation =
      !rank.requiredTribulationId || completedTribulations.includes(rank.requiredTribulationId);
    if (meetsExp && meetsMerit && meetsKarma && meetsTribulation) {
      highest = rank;
    } else {
      break;
    }
  }
  return highest;
}
