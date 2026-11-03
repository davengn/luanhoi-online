# Asset Manifest & Licensing Ledger — Luân Hồi Online

Every 3D model (`.glb`), PBR surface texture (`.png`/`.jpg`), equirectangular HDRI sky (`.png`), particle sprite (`.png`/`.svg`), and Web Audio synthesizer preset used in **Luân Hồi Online** is verified to exist locally on disk under `public/assets/` and `src/audio/soundEngine.ts` with open-source (**CC0 1.0 Universal** or **MIT**) licensing.

---

## 1. 3D Models (`public/assets/models/*.glb`)

| Asset Name | Category | Source URL / Provenance | Creator | License | Attribution Required | Local File Path | File Size | Intended Environment | Optimization Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| **Grand Temple Pagoda** | 3D Model (`glTF 2.0 Binary`) | Procedural Binary GLB Pipeline (`LuanHoiOnline-ProceduralGLBBuilder/1.0`) | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/models/temple_pagoda.glb` | 32,708 B | Phàm Giới (Main Temple Hall) | Optimized (4 PBR submeshes, `<1.2k` tris) |
| **Sacred Golden Buddha Statue** | 3D Model (`glTF 2.0 Binary`) | Procedural Binary GLB Pipeline (`LuanHoiOnline-ProceduralGLBBuilder/1.0`) | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/models/buddha_statue.glb` | 112,520 B | Phàm Giới & Thiên Đình (Sanctuary Altar) | Optimized (Lotus throne + halo, `<3.2k` tris) |
| **Blooming Sacred Lotus** | 3D Model (`glTF 2.0 Binary`) | Procedural Binary GLB Pipeline (`LuanHoiOnline-ProceduralGLBBuilder/1.0`) | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/models/lotus_flower.glb` | 88,632 B | Phàm Giới (Lotus Pond), Thiên Đình, Âm Phủ (Lv.14) | Instancing-ready (`<2.4k` tris) |
| **Temple Stone Lantern (Đèn Đá)** | 3D Model (`glTF 2.0 Binary`) | Procedural Binary GLB Pipeline (`LuanHoiOnline-ProceduralGLBBuilder/1.0`) | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/models/stone_lantern.glb` | 15,412 B | Phàm Giới (Courtyard & Paths) | Optimized emissive core (`<500` tris) |
| **Bronze Tripod Incense Burner (Lư Hương)** | 3D Model (`glTF 2.0 Binary`) | Procedural Binary GLB Pipeline (`LuanHoiOnline-ProceduralGLBBuilder/1.0`) | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/models/incense_burner.glb` | 34,720 B | Phàm Giới (Incense Altar) | Optimized metallic-roughness (`<1.1k` tris) |
| **Heavenly Gate (Nam Thiên Môn)** | 3D Model (`glTF 2.0 Binary`) | Procedural Binary GLB Pipeline (`LuanHoiOnline-ProceduralGLBBuilder/1.0`) | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/models/celestial_gate.glb` | 21,848 B | Thiên Đình (Heavenly Court & Gate) | Optimized jade/gold PBR (`<700` tris) |
| **Karmic Obsidian Hell Pillar** | 3D Model (`glTF 2.0 Binary`) | Procedural Binary GLB Pipeline (`LuanHoiOnline-ProceduralGLBBuilder/1.0`) | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/models/hell_pillar.glb` | 14,552 B | Âm Phủ (Judgment Hall & 18 Hells) | Optimized emissive rune rings (`<450` tris) |
| **Monk / Pilgrim Avatar Mesh** | 3D Model (`glTF 2.0 Binary`) | Procedural Binary GLB Pipeline (`LuanHoiOnline-ProceduralGLBBuilder/1.0`) | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/models/monk_pilgrim.glb` | 32,148 B | All Realms (Player & NPC Avatar Base) | Multiplayer-ready (`<900` tris) |
| **Great Bronze Dharma Bell (Đại Hồng Chung)** | 3D Model (`glTF 2.0 Binary`) | Procedural Binary GLB Pipeline (`LuanHoiOnline-ProceduralGLBBuilder/1.0`) | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/models/dharma_bell.glb` | 23,296 B | Phàm Giới (Bell Tower) | Optimized bronze PBR (`<750` tris) |
| **Mani Prayer Wheel (Kinh Luân)** | 3D Model (`glTF 2.0 Binary`) | Procedural Binary GLB Pipeline (`LuanHoiOnline-ProceduralGLBBuilder/1.0`) | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/models/prayer_wheel.glb` | 18,740 B | Phàm Giới (Prayer Pavilion) | Optimized (`<600` tris) |
| **Wheel of Reincarnation (Lục Đạo Luân Hồi)** | 3D Model (`glTF 2.0 Binary`) | Procedural Binary GLB Pipeline (`LuanHoiOnline-ProceduralGLBBuilder/1.0`) | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/models/reincarnation_wheel.glb` | 23,844 B | Âm Phủ (Reincarnation Gate) | Optimized (`<750` tris) |
| **Khronos Classic Street Lantern** | 3D Model (`glTF 2.0 Binary`) | `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb` | Khronos Group | CC0 1.0 | No | `public/assets/models/khronos_lantern.glb` | 9,564,264 B | Phàm Giới (High-Detail Showcase Prop) | Embedded PBR textures (glTF Binary) |
| **Khronos Ornate Vessel** | 3D Model (`glTF 2.0 Binary`) | `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb` | Khronos Group | CC0 1.0 | No | `public/assets/models/khronos_vase.glb` | 8,966,700 B | Phàm Giới (Pure Water Offering Vessel) | Embedded PBR textures (glTF Binary) |

---

## 2. PBR Surface Textures (`public/assets/textures/`)

| Asset Name | Category | Source URL / Provenance | Creator | License | Attribution Required | Local File Path | File Size | Intended Environment | Optimization Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| **Temple Courtyard Stone Albedo** | PBR Albedo (`256x256 PNG`) | Procedural FBM Flagstone Generator | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/textures/temple_stone_albedo.png` | 44,435 B | Phàm Giới (Courtyard Ground) | Seamless tileable power-of-two PNG |
| **Temple Courtyard Stone Normal** | PBR Normal Map (`256x256 PNG`) | Procedural Sobel Height-to-Normal Generator | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/textures/temple_stone_normal.png` | 117,927 B | Phàm Giới & Âm Phủ Stone Surfaces | Tangent-space normal map |
| **Crimson Ironwood Lacquer** | PBR Albedo (`256x256 PNG`) | Procedural Wood Grain Generator | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/textures/temple_wood_lacquer.png` | 39,768 B | Phàm Giới (Pagoda Pillars & Beams) | Seamless tileable power-of-two PNG |
| **Celestial White-Emerald Jade** | PBR Albedo (`256x256 PNG`) | Procedural Marble Vein Generator | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/textures/celestial_jade_marble.png` | 48,020 B | Thiên Đình (Cloud Palaces & Arena) | Seamless tileable power-of-two PNG |
| **Underworld Obsidian & Magma Veins** | PBR Albedo/Emissive (`256x256 PNG`) | Procedural Basalt Fracture Generator | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/textures/underworld_obsidian_lava.png` | 51,850 B | Âm Phủ (Judgment Hall & 18 Hells) | Seamless tileable power-of-two PNG |
| **Sacred Brushed Gold Leaf** | PBR Metallic Albedo (`256x256 PNG`) | Procedural Metallic Foil Generator | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/textures/gold_leaf_metallic.png` | 39,576 B | Buddha Statues, Halos & Celestial Trim | Seamless tileable power-of-two PNG |
| **Reflective Water Normals** | Normal Map (`JPG`) | `https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg` | Three.js Contributors | MIT | Included in repo | `public/assets/textures/waternormals.jpg` | 248,813 B | Phàm Giới (Lotus Pond) & Âm Phủ (Vong Xuyên River) | Seamless animated water normal map |

---

## 3. Equirectangular Sky & Environment Maps (`public/assets/hdri/`)

| Asset Name | Category | Source URL / Provenance | Creator | License | Attribution Required | Local File Path | File Size | Intended Environment | Optimization Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| **Human Realm Golden Hour Sky** | Equirectangular Sky (`512x256 PNG`) | Procedural Atmospheric Gradient Generator | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/hdri/human_golden_hour_env.png` | 35,159 B | Phàm Giới | Compressed 2:1 Equirectangular PNG |
| **Celestial Realm Aether Aurora** | Equirectangular Sky (`512x256 PNG`) | Procedural Aurora & Zenith Generator | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/hdri/celestial_aether_env.png` | 145,871 B | Thiên Đình | Compressed 2:1 Equirectangular PNG |
| **Underworld Abyssal Horizon** | Equirectangular Sky (`512x256 PNG`) | Procedural Abyssal Sky Generator | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/hdri/underworld_abyss_env.png` | 62,330 B | Âm Phủ & 18 Levels of Hell | Compressed 2:1 Equirectangular PNG |

---

## 4. Particle Sprites & UI Billboards (`public/assets/particles/`)

| Asset Name | Category | Source URL / Provenance | Creator | License | Attribution Required | Local File Path | File Size | Intended Environment | Optimization Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| **Merit Golden Spark (PNG)** | Particle Sprite (`128x128 RGBA`) | Procedural SDF Radial Glow | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/particles/merit_spark.png` | 12,052 B | Merit Farming VFX & Ascension | Premultiplied alpha ready |
| **Lotus Petal Sprite (PNG)** | Particle Sprite (`128x128 RGBA`) | Procedural SDF Teardrop Petal | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/particles/lotus_petal.png` | 12,679 B | Lotus Offering & Sanctuary Breeze | Premultiplied alpha ready |
| **Incense Smoke Wisp (PNG)** | Particle Sprite (`128x128 RGBA`) | Procedural Soft FBM Cloud | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/particles/incense_wisp.png` | 7,794 B | Incense Burner & Hell Fog | Soft edge falloff |
| **Three.js Sparkle Sprite** | Particle Sprite (`PNG`) | `https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/spark1.png` | Three.js Contributors | MIT | Included in repo | `public/assets/particles/spark1.png` | 1,608 B | Celestial Tribulation Sparks | Ultra-lightweight (`1.6 KB`) |
| **Three.js Soft Circle** | Particle Sprite (`PNG`) | `https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/circle.png` | Three.js Contributors | MIT | Included in repo | `public/assets/particles/circle.png` | 4,158 B | Aura Ground Rings & Fireflies | Ultra-lightweight (`4.1 KB`) |
| **Dharma Eight-Spoke Wheel (SVG)** | Vector Emblem (`SVG`) | Hand-coded Sacred Geometry SVG | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/particles/dharma_wheel.svg` | 558 B | HUD & Halo Decals | Lossless vector (`<1 KB`) |
| **Lotus Petal Vector (SVG)** | Vector Sprite (`SVG`) | Hand-coded SVG Gradient | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/particles/lotus_petal.svg` | 438 B | HUD Merit Notifications | Lossless vector (`<1 KB`) |
| **Karmic Flame Vector (SVG)** | Vector Sprite (`SVG`) | Hand-coded SVG Radial Flame | Luân Hồi Online Art Team | CC0 1.0 | No | `public/assets/particles/karma_flame.svg` | 437 B | Underworld Hazard & Tribulation | Lossless vector (`<1 KB`) |

---

## 5. Real Buddhist Audio Recordings (`public/assets/audio/`) & Hybrid Engine (`src/audio/soundEngine.ts`)

`src/audio/soundEngine.ts` prioritizes real recorded Buddhist audio files in `public/assets/audio/` (downloaded from Wikimedia Commons under CC0 / Public Domain / CC BY-SA 4.0 licenses) and uses Web Audio API synthesis strictly as an auxiliary spatial/harmonic effect layer.

| Asset Name | Category | Source URL / Provenance | Creator | License | Attribution Required | Local File Path | File Size | Intended Environment & Trigger | Optimization Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| **Temple Singing Bowl Bell (`SingingBowl1.ogg`)** | Real Audio (`OGG Vorbis`) | `https://upload.wikimedia.org/wikipedia/commons/2/25/SingingBowl1.ogg` | Wikimedia Commons | Public Domain | No | `public/assets/audio/temple_bell.ogg` | 108,383 B | Phàm Giới (`playBellChime()` — Bowing to Buddha, 108 Prostrations) | Compressed OGG Vorbis |
| **Tibetan Singing Bowl Resonance (`Small_tibetan_singing_bowl.ogg`)** | Real Audio (`OGG Vorbis`) | `https://upload.wikimedia.org/wikipedia/commons/1/17/Small_tibetan_singing_bowl.ogg` | Wikimedia Commons (`Subh83`) | CC BY-SA 4.0 | Yes (Attributed in manifest) | `public/assets/audio/singing_bowl_long.ogg` | 911,352 B | Meditation Sessions & Dharma Contemplation Cadence | Compressed OGG Vorbis |
| **Japanese Rin Altar Chime (`Japanese_rin_played_as_struck_idiophone.ogg`)** | Real Audio (`OGG Vorbis`) | `https://upload.wikimedia.org/wikipedia/commons/e/e6/Japanese_rin_played_as_struck_idiophone.ogg` | Wikimedia Commons (`ustawka`) | CC BY-SA 4.0 | Yes (Attributed in manifest) | `public/assets/audio/rin_temple_chime.ogg` | 549,113 B | `playMeritChime()` & `playBellChime()` (Chuông Gia Trì) | Compressed OGG Vorbis |
| **Heart Sutra Recitation — Bát Nhã Tâm Kinh (`Bore_Xinjing.ogg`)** | Real Chanting (`OGG Vorbis`) | `https://upload.wikimedia.org/wikipedia/commons/b/b7/Bore_Xinjing_%E8%88%AC%E8%8B%A5%E5%BF%83%E7%BB%8F_%28Heart_Sutra%29_in_Mandarin_recited_by_a_Chinese_Buddhist_layperson_2.ogg` | Chinese Buddhist Layperson (Wikimedia) | CC0 1.0 | No | `public/assets/audio/heart_sutra_chant.ogg` | 1,123,997 B | `playDharmaVoiceSession()` (Nghe Giảng Pháp & Đọc Kinh) | Compressed OGG Vorbis |
| **Buddham Saranam Gacchami Chanting Chorus** | Real Chanting (`OGG Audio`) | `https://upload.wikimedia.org/wikipedia/commons/8/8d/Buddham_Saranam_Gacchami_-_Male_Voice%2C_with_Female_Chorus.oga` | Wikimedia Commons | CC0 1.0 | No | `public/assets/audio/buddham_saranam_chant.ogg` | 3,946,867 B | Thiên Đình Ambience & `playAscensionChoir()` | Compressed OGG Audio |
| **Buddhist Temple Prayer Ambience in Nepal** | Real Ambience (`OGG Vorbis`) | `https://upload.wikimedia.org/wikipedia/commons/d/d1/Buddhist_prayer_in_Nepal.ogg` | Wikimedia Commons | CC BY-SA 4.0 | Yes (Attributed in manifest) | `public/assets/audio/buddhist_temple_ambience.ogg` | 2,378,495 B | Phàm Giới Continuous Temple Ambience (`setRealmAmbience('human')`) | Loopable OGG Vorbis |
| **Temple Koshi Wind Chimes (`Windglockenspiel.Koshi.ogg`)** | Real Ambience (`OGG Vorbis`) | `https://upload.wikimedia.org/wikipedia/commons/a/a6/Windglockenspiel.Koshi.ogg` | Wikimedia Commons | CC0 1.0 | No | `public/assets/audio/temple_wind_chimes.ogg` | 1,420,891 B | Phàm Giới & Thiên Đình Breeze Wind Chimes | Loopable OGG Vorbis |
| **Chinese Bronze Temple Gong (`Gong55.ogg`)** | Real Percussion (`OGG Vorbis`) | `https://upload.wikimedia.org/wikipedia/commons/2/2c/Gong55.ogg` | Wikimedia Commons | CC0 1.0 | No | `public/assets/audio/temple_gong.ogg` | 148,607 B | Âm Phủ Judgment Hall & `playKarmaThunder()` | Compressed OGG Vorbis |
| **Tribulation & Underworld Thunder (`Thunder_01.ogg`)** | Real Weather SFX (`OGG Vorbis`) | `https://upload.wikimedia.org/wikipedia/commons/f/fa/Thunder_01.ogg` | Wikimedia Commons | CC BY-SA 4.0 | Yes (Attributed in manifest) | `public/assets/audio/thunder_tribulation.ogg` | 411,421 B | Độ Kiếp Lôi Đình & Âm Phủ (`playKarmaThunder()`) | Compressed OGG Vorbis |
| **Hardwood Percussion (`Claves.ogg`)** | Real Wood SFX (`OGG Vorbis`) | `https://upload.wikimedia.org/wikipedia/commons/c/c9/Claves.ogg` | Wikimedia Commons | Public Domain | No | `public/assets/audio/wooden_fish_claves.ogg` | 255,008 B | Auxiliary Wooden Percussion Accent | Compressed OGG Vorbis |
| **Single-Strike Rosewood Mõ Tụng Kinh (`wooden_fish_mo.wav`)** | Physical-Modeled WAV (`16-bit PCM`) | Acoustic Modal Waveguide Generator (`generate-wooden-fish-wav.mjs`) | Luân Hồi Online Audio Team | CC0 1.0 | No | `public/assets/audio/wooden_fish_mo.wav` | 24,740 B | `playWoodenFish()` (Rapid Prayer Bead Tapping) | Zero-latency 44.1kHz PCM WAV |
| **Hybrid Sound Engine (`soundEngine.ts`)** | Audio Controller (`TypeScript`) | Local Hybrid Sample + Web Audio API Engine | Luân Hồi Online Audio Team | MIT / CC0 | No | `src/audio/soundEngine.ts` | 14,120 B | Global Audio Manager | Zero external npm dependencies |
