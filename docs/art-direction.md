# Art Direction & Visual Bible — Luân Hồi Online

## 1. Aesthetic Vision & Philosophy
**Luân Hồi Online** blends serene **Vietnamese & East Asian Buddhist temple architecture** (*Chùa cổ Việt Nam, Đại Hùng Bảo Điện, Liên Hoa Trì*) with **Xianxia celestial cultivation** (*Thiên Đình*) and **solemn symbolic underworld mythology** (*Âm Phủ & 18 Tầng Địa Ngục*).

Rather than grim photorealism or graphic violence, the visual direction prioritizes **luminous atmospheric storytelling**:
- **Devotional Warmth in Phàm Giới**: Sunlight filtering through incense smoke, warm crimson-lacquered ironwood, mossy granite lanterns, and blooming pink-gold lotus ponds.
- **Transcendent Radiance in Thiên Đình**: Floating white jade pavilions, sea-of-clouds horizons, and sacred geometric halos.
- **Symbolic Gravity in Âm Phủ**: Monolithic basalt and obsidian halls illuminated by karmic mirrors, spectral bioluminescence, and elemental trials that emphasize moral reflection and redemption over gore.

---

## 2. Three Realms Visual Identity Matrix

| Attribute | Phàm Giới (Human Realm) | Thiên Đình (Celestial Realm) | Âm Phủ (Underworld & 18 Hells) |
| :--- | :--- | :--- | :--- |
| **Core Mood** | Serene, contemplative, communal, grounded | Ethereal, luminous, transcendent, majestic | Solemn, awesome, karmic, introspective |
| **Primary Materials** | Weathered granite, crimson lacquer wood, brushed bronze, terracotta | Translucent white/emerald jade, celestial gold leaf, pearl cloud-stone | Cracked basalt, obsidian, dark iron, glowing karmic runes |
| **Primary Palette** | `#D4AF37` (Sacred Gold), `#8B1E1E` (Lacquer Red), `#6E736B` (Temple Stone), `#F78FB3` (Lotus Pink) | `#E8F8F5` (Immortal Jade), `#FFD700` (Divine Gold), `#48DBFB` (Aether Cyan), `#FFFFFF` (Cloud White) | `#1A1423` (Abyssal Slate), `#3D1E6D` (Soul Violet), `#E84118` (Karmic Ember), `#00A8FF` (Ghost Fire) |
| **Directional Light** | Warm Golden Hour (`#FFE29A`, Intensity `1.8`, Azimuth `38°`, Elevation `28°`) | High Zenith Radiance (`#FFFDF5`, Intensity `2.2`, Azimuth `15°`, Elevation `62°`) | Rim/Under-lit Spectral Contrast (`#9C88FF` / `#FF4757`, Intensity `0.9`) |
| **Ambient / Hemisphere** | Sky `#87CEEB` / Ground `#4A3B2C` (`0.65`) | Sky `#C7ECEE` / Ground `#F6E58D` (`0.85`) | Sky `#1E1B2E` / Ground `#0F0C18` (`0.35`) |
| **Fog Model** | `FogExp2(#E8D5B5, 0.008)` — soft morning mountain mist | `FogExp2(#DFF9FB, 0.005)` — luminous cloud sea | `FogExp2(level.fogColor, 0.018)` — dense abyssal haze |
| **Signature VFX** | Rising incense wisps, drifting lotus petals, acoustic bell ripples, floating sky lanterns | Orbiting dharma rings, aurora ribbons, golden feather particles, tribulation lightning | Ghostly soul wisps, karmic scale beams, elemental embers/frost/mirrors |
| **HDRI Environment** | `/assets/hdri/human_golden_hour_env.png` | `/assets/hdri/celestial_aether_env.png` | `/assets/hdri/underworld_abyss_env.png` |

---

## 3. Architectural Landmarks by Realm

### 3.1 Phàm Giới (Human Realm — Grand Monastery Complex)
1. **Sân Chùa Chính (Grand Temple Courtyard)**: Paved with `/assets/textures/temple_stone_albedo.png` and normal-mapped flagstones, flanked by stone lanterns (`stone_lantern.glb`) and a central bronze tripod censer (`incense_burner.glb`).
2. **Chánh Điện Phật Đài (Main Buddha Hall)**: Elevated multi-tier pagoda (`temple_pagoda.glb`) housing the radiant seated Buddha (`buddha_statue.glb`) on a pink-and-gold lotus throne.
3. **Hồ Sen Tịnh Tâm (Sacred Lotus Pond)**: Reflective water plane (`waternormals.jpg`) populated with instanced `lotus_flower.glb` blossoms and wooden bridges.
4. **Lầu Chuông Đại Hồng Chung (Bell Tower)**: Timber pavilion housing `dharma_bell.glb` that emits expanding golden shockwave rings when struck.
5. **Đình Niệm珠 & Kinh Luân (Prayer-Bead & Mani Pavilion)**: Octagonal wooden shrine with rotating `prayer_wheel.glb` cylinders.
6. **Rừng Trúc & Thác Nước (Bamboo Grove & Meditation Waterfall)**: Instanced emerald bamboo stalks with mist sprites (`incense_wisp.png`).
7. **Thư Viện Trí Tuệ (Wisdom Library)** & **Cổng Phán Xét Nghiệp Báo (Karma Judgment Gate)**: Boundary archway linking Phàm Giới to Thiên Đình and Âm Phủ.

### 3.2 Thiên Đình (Celestial Realm)
1. **Nam Thiên Môn (Heavenly Gate)**: Monumental white-jade and gold archway (`celestial_gate.glb`) emerging from billowing volumetric clouds.
2. **Cung Điện Mây Ngọc (Jade Cloud Palace)** & **Vườn Tiên Đào (Celestial Garden)**: Suspended marble islands connected by rainbow bridges.
3. **Độ Kiếp Đài (Tribulation Arena)**: Circularjade colosseum ringed by eight lightning-rod obelisks where players brave Heavenly Lightning (*Lôi Kiếp*), Heart Demon Mirrors (*Tâm Ma Kiếp*), and Karmic Fire (*Nghiệp Hỏa Kiếp*).

### 3.3 Âm Phủ & The 18 Levels of Hell Visual Palette
Each of the 18 Hell levels dynamically reconfigures scene fog, lighting, `hell_pillar.glb` rune emissives, and particle hazards:

| Level | Vietnamese Name | Theme / Moral Failure | Primary | Secondary | Fog Color | Accent Glow | Architectural Motif |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **1** | Tầng 1: Ngục Vọng Ngôn | Dishonesty & Slander | `#2C223E` | `#4B3869` | `#1B1426` | `#A29BFE` | Echoing whisper pillars & fractured stone tongues |
| **2** | Tầng 2: Ngục Tham Lam | Greed & Hoarding | `#3D2C1E` | `#6E5034` | `#241911` | `#FDCB6E` | Endless dunes of illusory gold turning to ash |
| **3** | Tầng 3: Ngục Sân Hận | Wrath & Cruelty | `#4A1414` | `#7D2222` | `#2B0909` | `#FF5252` | Basalt chasms & erupting magma vents |
| **4** | Tầng 4: Ngục Khẩu Nghiệp | Harsh & Divisive Speech | `#1F2F3D` | `#34526E` | `#111B24` | `#74B9FF` | Hall of shattered acoustic mirrors (`mirror_chime`) |
| **5** | Tầng 5: Ngục Phản Bội | Betrayal & Broken Vows | `#2F2D38` | `#524E61` | `#19181F` | `#DFE6E9` | Crumbling suspension bridges over the abyss |
| **6** | Tầng 6: Ngục Vô Cảm | Cold Indifference | `#162A3A` | `#274C69` | `#0C1821` | `#81ECEC` | Glacial ice spires & freezing blizzard winds |
| **7** | Tầng 7: Ngục Bạo Lực | Violence & Harm | `#521818` | `#8C2929` | `#2E0B0B` | `#FF7675` | Iron braziers & roaring karmic flames |
| **8** | Tầng 8: Ngục Trộm Cắp | Theft & Exploitation | `#2B3326` | `#495740` | `#171C14` | `#55E6C1` | Shifting labyrinthine vaults & weighted chains |
| **9** | Tầng 9: Ngục Áp Bức | Oppression & Tyranny | `#2C2C34` | `#4A4A57` | `#18181C` | `#FFA502` | Monolithic iron pillars & gravity shackles |
| **10** | Tầng 10: Ngục Giả Dối | Fraud & Manipulation | `#361F42` | `#5E3673` | `#1E1126` | `#D980FA` | Shifting mirage arches & phantom lanterns |
| **11** | Tầng 11: Ngục Bất Hiếu | Ingratitude | `#1E2E26` | `#355244` | `#101915` | `#7BED9F` | Withered ancestral grove & weeping stone steles |
| **12** | Tầng 12: Ngục Ngạo Mạn | Arrogance & Hubris | `#382D1E` | `#634F35` | `#1F1810` | `#ECCC68` | Inverted babel towers & descending stairways |
| **13** | Tầng 13: Ngục Phá Hoại | Desecration of Sanctuary | `#2E2222` | `#523B3B` | `#1A1212` | `#FF6B81` | Ruined temple colonnades awaiting restoration |
| **14** | Tầng 14: Ngục Ô Uế | Corruption & Impurity | `#1F2E1E` | `#364F34` | `#111A10` | `#2ED573` | Miasma swamp purified only by blooming lotuses |
| **15** | Tầng 15: Ngục Bất Công | Injustice & Partiality | `#242938` | `#3E4863` | `#13161F` | `#70A1FF` | Colossal bronze Scales of Karma courtroom |
| **16** | Tầng 16: Ngục Vô Minh | Wilful Ignorance | `#1E1E26` | `#353542` | `#0F0F14` | `#FFEAA7` | Endless twilight fog cleared by Wisdom Lamps |
| **17** | Tầng 17: Ngục Chấp Niệm | Obsessive Attachment | `#331B2E` | `#592F50` | `#1C0E19` | `#FD79A8` | Tangled red-iron threads & obsidian alters |
| **18** | Tầng 18: Ngục A Tỳ (Avīci) | Relentless Malice & Awakening | `#14091A` | `#2D113B` | `#09030D` | `#FF3838` | Infinite void horizon with a single lotus of awakening |

---

## 4. Character Silhouettes & 12 Spiritual Aura Tiers

### 4.1 Avatar Archetypes (`monk_pilgrim.glb` + Modular Attachments)
- **Pilgrim (`pilgrim`)**: Simple hemp/indigo tunic, wooden nameplate, warm approachable silhouette.
- **Novice Monk (`novice_monk`)**: Saffron/ochre monastic robe with crimson Kasaya sash and mala beads.
- **Temple Guardian (`guardian`)**: Broad-shouldered bronze-trimmed armor mantle with Dharma staff.
- **Celestial Attendant (`celestial_attendant`)**: Flowing cyan-and-white silk sleeves with floating lotus halo.
- **Immortal (`immortal`)**: Crowned topknot, radiant golden-jade robes, and levitating idle posture.
- **Underworld Envoy (`underworld_envoy`)**: Deep violet-and-obsidian vestments with soul-lantern accessory.

### 4.2 Cultivation Rank Aura Progression (Stages 1–12)
1. **Phàm Nhân (Stage 1)**: Subtle warm breath mist (`#D1CCC0`, opacity `0.15`)
2. **Tĩnh Tâm (Stage 2)**: Calm sky-blue ripple (`#74B9FF`, opacity `0.25`)
3. **Thiện Niệm (Stage 3)**: Gentle emerald lotus glow (`#55EFC4`, opacity `0.32`)
4. **Tu Hành (Stage 4)**: Saffron monastic halo (`#FDCB6E`, opacity `0.40`)
5. **Chân Tâm (Stage 5)**: Rose-lotus floor mandala (`#FD79A8`, opacity `0.48`)
6. **Hiền Giả (Stage 6)**: Pure amber Dharma ring (`#F39C12`, opacity `0.55`)
7. **Đạo Tâm (Stage 7)**: Jade-cyan spiritual pillar (`#00CEC9`, opacity `0.62`)
8. **La Hán Hộ Pháp (Stage 8)**: Radiant bronze-gold halo + orbiting beads (`#E1B12C`, opacity `0.70`)
9. **Bồ Tát Tâm (Stage 9)**: Seven-treasure lotus canopy (`#FFEAA7`, opacity `0.78`)
10. **Tiên Nhân (Stage 10)**: Celestial silver-gold cloud ribbon (`#DFF9FB`, opacity `0.85`)
11. **Thượng Tiên (Stage 11)**: Twin orbiting Dharma wheels (`#FFD700`, opacity `0.92`)
12. **Thiên Đạo Cảnh (Stage 12)**: Sovereign cosmic golden-rainbow aura (`#FFF200`, opacity `1.0`)

---

## 5. Performance, LOD & Graphics Presets
To guarantee **60 FPS on desktop** and **30+ FPS on mobile browsers**:
- **Polygon Budget**:
  - Hero Landmarks (`buddha_statue.glb`, `temple_pagoda.glb`, `celestial_gate.glb`): `< 3,500` triangles each.
  - Props (`stone_lantern.glb`, `incense_burner.glb`, `lotus_flower.glb`, `hell_pillar.glb`): `< 1,200` triangles each.
  - Player & Remote Avatars (`monk_pilgrim.glb`): `< 900` triangles per avatar (up to 40 visible avatars per room = `< 36k` avatar triangles total).
- **Graphics Quality Presets**:
  - `Low`: DPR `1.0`, shadows disabled, particle count `25%`, basic hemisphere lighting.
  - `Medium`: DPR `1.25`, `1024x1024` directional shadow map, particle count `60%`, exponential fog.
  - `High`: DPR `1.5–2.0`, `2048x2048` soft shadows, `100%` instanced lotus/spark particles, HDRI environment reflections.
