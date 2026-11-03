import React, { Suspense, useMemo, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { WORLD_NPCS } from '@shared/loreData';
import { InteractableTarget, useGameStore } from '../store/gameStore';
import { CharacterModel } from './CharacterModel';
import { PlayerController } from './PlayerController';
import { RemotePlayers } from './RemotePlayers';

function GlbModelInstance({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return (
    <primitive
      object={cloned}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

// Preload core Human Realm GLB assets
useGLTF.preload('/assets/models/temple_pagoda.glb');
useGLTF.preload('/assets/models/buddha_statue.glb');
useGLTF.preload('/assets/models/lotus_flower.glb');
useGLTF.preload('/assets/models/stone_lantern.glb');
useGLTF.preload('/assets/models/incense_burner.glb');
useGLTF.preload('/assets/models/dharma_bell.glb');
useGLTF.preload('/assets/models/prayer_wheel.glb');
useGLTF.preload('/assets/models/reincarnation_wheel.glb');

export const HUMAN_REALM_INTERACTABLES: InteractableTarget[] = [
  {
    id: 'int_buddha_altar',
    type: 'altar',
    label: 'Đại Hùng Bảo Điện (Lễ Phật)',
    sublabel: 'Nhấn [E] để Lễ Phật Thành Tâm (+Công Đức)',
    position: { x: 0, y: 0, z: -15.5 },
    activityId: 'bow_buddha',
  },
  {
    id: 'int_incense_censer',
    type: 'incense',
    label: 'Đỉnh Đồng Dâng Hương',
    sublabel: 'Nhấn [E] để Dâng Hương Trầm (+Công Đức)',
    position: { x: 0, y: 0, z: -6.5 },
    activityId: 'offer_incense',
  },
  {
    id: 'int_npc_tue_minh',
    type: 'npc',
    label: 'Thiền Sư Tuệ Minh',
    sublabel: 'Nhấn [E] để Thưa Hỏi Đạo Lý & Thiền Định',
    position: { x: 0, y: 0, z: -12 },
    npcId: 'npc_zen_master_tue_minh',
  },
  {
    id: 'int_npc_tinh_tam',
    type: 'npc',
    label: 'Tịnh Tâm Sư Cô (Thư Viện Trí Tuệ)',
    sublabel: 'Nhấn [E] để Đàm Đạo & Mở 10 Cuộn Kinh Trí Tuệ',
    position: { x: -14, y: 0, z: -6 },
    npcId: 'npc_nun_tinh_tam',
  },
  {
    id: 'int_npc_kim_cang',
    type: 'npc',
    label: 'Hộ Pháp Kim Cang',
    sublabel: 'Nhấn [E] để Tham Vấn Hộ Pháp & Đại Lễ Cộng Đồng',
    position: { x: 14, y: 0, z: -6 },
    npcId: 'npc_guardian_kim_cang',
  },
  {
    id: 'int_lotus_pond',
    type: 'lotus_pond',
    label: 'Hồ Liên Hoa Tịnh Thủy',
    sublabel: 'Nhấn [E] để Dâng Hoa Sen Thanh Khiết (+Công Đức)',
    position: { x: -16, y: 0, z: 8 },
    activityId: 'offer_lotus',
  },
  {
    id: 'int_meditation_garden',
    type: 'altar',
    label: 'Thiền Viên Tịnh Tâm',
    sublabel: 'Nhấn [E] để Tọa Thiền Định Tâm (+Công Đức)',
    position: { x: 16, y: 0, z: 7 },
    activityId: 'meditate_session',
  },
  {
    id: 'int_bell_tower',
    type: 'bell',
    label: 'Lầu Chuông Đại Hồng Chung',
    sublabel: 'Nhấn [E] để Thỉnh Chuông & Nghe Pháp Âm (+Công Đức)',
    position: { x: 18, y: 0, z: -12 },
    activityId: 'listen_dharma',
  },
  {
    id: 'int_prayer_wheel',
    type: 'prayer_wheel',
    label: 'Đình Kinh Luân & Tràng Hạt',
    sublabel: 'Nhấn [E] để Xoay Kinh Luân Niệm Phật (+Công Đức)',
    position: { x: -18, y: 0, z: -12 },
    activityId: 'prayer_beads',
  },
  {
    id: 'int_wisdom_pavilion',
    type: 'wisdom_pavilion',
    label: 'Tàng Kinh Các (Thư Viện Trí Tuệ)',
    sublabel: 'Nhấn [E] để Học Kinh Điển & Giải Quyết Tình Huống Đạo Đức',
    position: { x: -22, y: 0, z: -3 },
  },
  {
    id: 'int_gate_celestial',
    type: 'gate',
    label: 'Đài Phi Thăng Nam Thiên Môn',
    sublabel: 'Nhấn [E] để Bước Lên Thiên Đình (Yêu cầu Cấp 7 Phi Thăng Giả)',
    position: { x: 22, y: 0, z: 18 },
    targetRealm: 'celestial',
  },
  {
    id: 'int_gate_underworld',
    type: 'gate',
    label: 'Cổng Nghiệp Kính Âm Phủ & 18 Tầng Địa Ngục',
    sublabel: 'Nhấn [E] đểBước Qua Cổng Âm Phủ & Quan Sát 18 Tầng Địa Ngục',
    position: { x: -22, y: 0, z: 18 },
    targetRealm: 'underworld',
  },
];

export const HumanRealm: React.FC = () => {
  const setTargetMovePosition = useGameStore((s) => s.setTargetMovePosition);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const performMeritActivity = useGameStore((s) => s.performMeritActivity);
  const nearbyInteractable = useGameStore((s) => s.nearbyInteractable);

  const incenseSmokeRef = useRef<THREE.Group>(null);
  const prayerWheelGroupRef = useRef<THREE.Group>(null);
  const waterfallRef = useRef<THREE.Mesh>(null);
  const buddhaHaloRef = useRef<THREE.Mesh>(null);

  const humanNpcs = useMemo(
    () => WORLD_NPCS.filter((n) => n.realm === 'human'),
    []
  );

  // Bamboo forest coordinates
  const bambooStalks = useMemo(() => {
    const arr: Array<{ x: number; z: number; h: number; scale: number }> = [];
    for (let i = 0; i < 42; i++) {
      const angle = (i / 42) * Math.PI * 1.4 - Math.PI * 0.7;
      const radius = 34 + (i % 5) * 2.8;
      arr.push({
        x: Math.sin(angle) * radius,
        z: -Math.cos(angle) * radius - 4,
        h: 6 + (i % 4) * 1.6,
        scale: 0.85 + (i % 3) * 0.15,
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (incenseSmokeRef.current) {
      incenseSmokeRef.current.children.forEach((child, idx) => {
        const phase = (t * 0.55 + idx * 0.25) % 1;
        child.position.y = 1.6 + phase * 3.8;
        child.position.x = Math.sin(t * 1.5 + idx) * 0.25 * phase;
        const s = 0.25 + phase * 0.75;
        child.scale.set(s, s, s);
      });
    }

    if (prayerWheelGroupRef.current) {
      prayerWheelGroupRef.current.rotation.y = t * 0.9;
    }

    if (waterfallRef.current) {
      const mat = waterfallRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.25 + Math.sin(t * 4) * 0.08;
      }
    }

    if (buddhaHaloRef.current) {
      buddhaHaloRef.current.rotation.z = t * 0.35;
    }
  });

  const handleGroundClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return; // Ignore camera drag release
    setTargetMovePosition({
      x: e.point.x,
      y: 0,
      z: e.point.z,
    });
  };

  return (
    <group>
      {/* Main Ground Plane with Click-to-Move */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
        onClick={handleGroundClick}
      >
        <circleGeometry args={[75, 64]} />
        <meshStandardMaterial color="#3c352a" roughness={0.88} metalness={0.05} />
      </mesh>

      {/* Stone Paved Central Courtyard Axis */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 2]}
        receiveShadow
        onClick={handleGroundClick}
      >
        <planeGeometry args={[18, 46]} />
        <meshStandardMaterial color="#6e685f" roughness={0.75} metalness={0.1} />
      </mesh>

      {/* Ornate Golden Lotus Courtyard Mandala */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 4]}
        onClick={handleGroundClick}
      >
        <ringGeometry args={[3.2, 4.8, 32]} />
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>

      {/* ZONE 1 & 2: GRAND BUDDHA HALL (ĐẠI HÙNG BẢO ĐIỆN) */}
      <group position={[0, 0, -21]}>
        {/* Elevated Stone Platform */}
        <mesh position={[0, 0.7, 0]} receiveShadow castShadow>
          <boxGeometry args={[24, 1.4, 14]} />
          <meshStandardMaterial color="#57534e" roughness={0.7} />
        </mesh>

        {/* Grand Steps */}
        <mesh position={[0, 0.35, 7.8]} receiveShadow>
          <boxGeometry args={[8, 0.7, 2.2]} />
          <meshStandardMaterial color="#78716c" roughness={0.65} />
        </mesh>

        {/* Crimson Lacquer Pillars */}
        {[-9, -5, 5, 9].map((px) => (
          <mesh key={px} position={[px, 4.2, 5.5]} castShadow>
            <cylinderGeometry args={[0.42, 0.48, 7, 16]} />
            <meshStandardMaterial
              color="#7f1d1d"
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
        ))}

        {/* Real GLB Pagoda & Sacred Golden Buddha Statue */}
        <Suspense fallback={null}>
          <GlbModelInstance
            url="/assets/models/temple_pagoda.glb"
            position={[0, 1.4, -1.5]}
            scale={2.4}
          />
          <GlbModelInstance
            url="/assets/models/buddha_statue.glb"
            position={[0, 1.8, 2.5]}
            scale={2.1}
          />
        </Suspense>

        {/* Radiant Buddha Halo Backdrop */}
        <mesh ref={buddhaHaloRef} position={[0, 4.8, 1.2]}>
          <ringGeometry args={[2.1, 2.85, 32]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Bowing Cushions (Bồ Đoàn Lễ Phật) in front of the Hall */}
        {[-2.2, 0, 2.2].map((bx) => (
          <mesh
            key={bx}
            position={[bx, 0.12, 5.5]}
            onClick={(e) => {
              e.stopPropagation();
              performMeritActivity('bow_buddha');
            }}
          >
            <cylinderGeometry args={[0.65, 0.72, 0.22, 20]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* ZONE 5: BRONZE INCENSE BURNER AREA (ĐỈNH ĐỒNG DÂNG HƯƠNG) */}
      <group
        position={[0, 0, -6.5]}
        onClick={(e) => {
          e.stopPropagation();
          performMeritActivity('offer_incense');
        }}
      >
        <Suspense fallback={null}>
          <GlbModelInstance
            url="/assets/models/incense_burner.glb"
            position={[0, 0, 0]}
            scale={1.8}
          />
        </Suspense>
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <cylinderGeometry args={[1.6, 1.8, 0.3, 16]} />
          <meshStandardMaterial color="#44403c" />
        </mesh>

        {/* Rising Incense Smoke Wisps */}
        <group ref={incenseSmokeRef}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[0, 1.8 + i * 0.5, 0]}>
              <sphereGeometry args={[0.22, 10, 10]} />
              <meshBasicMaterial
                color="#e7e5e4"
                transparent
                opacity={0.28}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* COURTYARD STONE LANTERNS (ĐÈN ĐÁ CỔ TỰ) */}
      <Suspense fallback={null}>
        {[
          [-6.5, -10],
          [6.5, -10],
          [-6.5, 0],
          [6.5, 0],
          [-6.5, 10],
          [6.5, 10],
        ].map(([lx, lz], idx) => (
          <group key={idx} position={[lx, 0, lz]}>
            <GlbModelInstance
              url="/assets/models/stone_lantern.glb"
              scale={1.45}
            />
            <pointLight
              position={[0, 2.1, 0]}
              color="#fbbf24"
              intensity={0.9}
              distance={9}
            />
          </group>
        ))}
      </Suspense>

      {/* ZONE 4: SACRED LOTUS POND (HỒ LIÊN HOA TỊNH THỦY) */}
      <group
        position={[-18, 0, 8]}
        onClick={(e) => {
          e.stopPropagation();
          performMeritActivity('offer_lotus');
        }}
      >
        {/* Reflective Water Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <circleGeometry args={[8.5, 36]} />
          <meshStandardMaterial
            color="#0e7490"
            roughness={0.12}
            metalness={0.65}
          />
        </mesh>

        {/* Stone Pond Rim */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[8.2, 9.1, 36]} />
          <meshStandardMaterial color="#57534e" roughness={0.8} />
        </mesh>

        {/* Red Lacquer Arch Bridge across Lotus Pond */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[16, 0.25, 2.2]} />
          <meshStandardMaterial color="#991b1b" roughness={0.5} />
        </mesh>

        {/* Blooming 3D Lotus Flowers */}
        <Suspense fallback={null}>
          {[
            [-3.5, 3.2],
            [2.8, 3.8],
            [-4.2, -3.5],
            [3.6, -2.8],
            [0, 5.2],
            [-2.2, -5.0],
          ].map(([lx, lz], idx) => (
            <GlbModelInstance
              key={idx}
              url="/assets/models/lotus_flower.glb"
              position={[lx, 0.12, lz]}
              scale={1.15}
            />
          ))}
        </Suspense>
      </group>

      {/* ZONE 3: MEDITATION GARDEN (THIỀN VIÊN TỊNH TÂM) */}
      <group
        position={[18, 0, 7]}
        onClick={(e) => {
          e.stopPropagation();
          performMeritActivity('meditate_session');
        }}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[7.5, 32]} />
          <meshStandardMaterial color="#4d7c0f" roughness={0.85} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[4.5, 5.2, 24]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
        </mesh>

        {/* Meditation Lotus Cushions */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 3.2, 0.15, Math.sin(angle) * 3.2]}
              castShadow
            >
              <cylinderGeometry args={[0.7, 0.8, 0.2, 16]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.5} />
            </mesh>
          );
        })}
      </group>

      {/* ZONE 6: BELL TOWER (LẦU CHUÔNG ĐẠI HỒNG CHUNG) */}
      <group
        position={[18, 0, -12]}
        onClick={(e) => {
          e.stopPropagation();
          performMeritActivity('listen_dharma');
        }}
      >
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[6.5, 0.8, 6.5]} />
          <meshStandardMaterial color="#57534e" />
        </mesh>
        <mesh position={[0, 4.8, 0]} castShadow>
          <coneGeometry args={[5.2, 2.6, 4]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.45} />
        </mesh>
        <Suspense fallback={null}>
          <GlbModelInstance
            url="/assets/models/dharma_bell.glb"
            position={[0, 1.5, 0]}
            scale={1.8}
          />
        </Suspense>
      </group>

      {/* ZONE 7: PRAYER-BEAD & MANI WHEEL PAVILION (ĐÌNH KINH LUÂN) */}
      <group
        position={[-18, 0, -12]}
        onClick={(e) => {
          e.stopPropagation();
          performMeritActivity('prayer_beads');
        }}
      >
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <cylinderGeometry args={[4.2, 4.5, 0.8, 8]} />
          <meshStandardMaterial color="#57534e" />
        </mesh>
        <mesh position={[0, 4.6, 0]} castShadow>
          <coneGeometry args={[4.6, 2.4, 8]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
        <group ref={prayerWheelGroupRef} position={[0, 1.5, 0]}>
          <Suspense fallback={null}>
            <GlbModelInstance
              url="/assets/models/prayer_wheel.glb"
              scale={1.8}
            />
          </Suspense>
        </group>
      </group>

      {/* ZONE 11: WISDOM LIBRARY PAVILION (TÀNG KINH CÁC) */}
      <group
        position={[-23, 0, -3]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveModal('wisdom');
        }}
      >
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[6.2, 3.8, 5.2]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>
        <mesh position={[0, 4.9, 0]} castShadow>
          <coneGeometry args={[5.2, 2.2, 4]} />
          <meshStandardMaterial color="#b45309" metalness={0.3} />
        </mesh>
      </group>

      {/* ZONE 8: TAM QUAN ENTRANCE GATE (CỔNG TAM QUAN) */}
      <group position={[0, 0, 26]}>
        {[-6.5, -2.5, 2.5, 6.5].map((gx, i) => (
          <mesh key={i} position={[gx, 3.2, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.52, 6.4, 12]} />
            <meshStandardMaterial color="#7f1d1d" />
          </mesh>
        ))}
        <mesh position={[0, 6.6, 0]} castShadow>
          <boxGeometry args={[16.5, 1.4, 2.4]} />
          <meshStandardMaterial color="#b45309" metalness={0.35} />
        </mesh>
      </group>

      {/* ZONE 9: WATERFALL & EMERALD BAMBOO FOREST */}
      <group position={[26, 0, -24]}>
        <mesh position={[0, 5, 0]} castShadow>
          <coneGeometry args={[7, 11, 7]} />
          <meshStandardMaterial color="#44403c" roughness={0.9} />
        </mesh>
        <mesh ref={waterfallRef} position={[-1.2, 4.2, 3.5]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[2.6, 8.5]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.3}
            transparent
            opacity={0.82}
          />
        </mesh>
      </group>

      {/* Bamboo Stalks Around Sanctuary Perimeter */}
      <group>
        {bambooStalks.map((b, i) => (
          <mesh
            key={i}
            position={[b.x, b.h / 2, b.z]}
            scale={[b.scale, 1, b.scale]}
          >
            <cylinderGeometry args={[0.14, 0.18, b.h, 8]} />
            <meshStandardMaterial color="#15803d" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* ZONE 12A: CELESTIAL ASCENSION PORTAL (ĐÀI PHI THĂNG NAM THIÊN MÔN) */}
      <group position={[22, 0, 18]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[2.4, 3.2, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 2.8, 0]}>
          <torusGeometry args={[2.3, 0.15, 12, 32]} />
          <meshStandardMaterial
            color="#bae6fd"
            emissive="#38bdf8"
            emissiveIntensity={0.8}
          />
        </mesh>
        <Html position={[0, 5.6, 0]} center distanceFactor={16}>
          <div className="pointer-events-none rounded-lg border border-cyan-400/70 bg-sky-950/90 px-3 py-1 text-center text-xs font-bold text-cyan-200 shadow-lg whitespace-nowrap">
            ⚡ Đài Phi Thăng Thiên Đình
          </div>
        </Html>
      </group>

      {/* ZONE 12B: KARMA JUDGMENT & UNDERWORLD GATE (CỔNG NGHIỆP KÍNH ÂM PHỦ) */}
      <group position={[-22, 0, 18]}>
        <Suspense fallback={null}>
          <GlbModelInstance
            url="/assets/models/reincarnation_wheel.glb"
            position={[0, 2.6, 0]}
            scale={1.7}
          />
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[2.4, 3.2, 32]} />
          <meshBasicMaterial color="#c084fc" side={THREE.DoubleSide} />
        </mesh>
        <Html position={[0, 5.6, 0]} center distanceFactor={16}>
          <div className="pointer-events-none rounded-lg border border-purple-400/70 bg-purple-950/90 px-3 py-1 text-center text-xs font-bold text-purple-200 shadow-lg whitespace-nowrap">
            ☸️ Cổng Âm Phủ & 18 Tầng Địa Ngục
          </div>
        </Html>
      </group>

      {/* Interactive Zone Beacon Rings */}
      {HUMAN_REALM_INTERACTABLES.map((item) => {
        const isHighlighted = nearbyInteractable?.id === item.id;
        return (
          <group
            key={item.id}
            position={[item.position.x, 0.06, item.position.z]}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry
                args={[
                  isHighlighted ? 1.25 : 0.9,
                  isHighlighted ? 1.55 : 1.1,
                  24,
                ]}
              />
              <meshBasicMaterial
                color={isHighlighted ? '#fde047' : '#f59e0b'}
                transparent
                opacity={isHighlighted ? 0.9 : 0.38}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* WORLD NPCs IN PHÀM GIỚI */}
      {humanNpcs.map((npc) => (
        <group
          key={npc.id}
          position={[npc.position.x, npc.position.y, npc.position.z]}
          rotation={[0, npc.rotationY, 0]}
        >
          <CharacterModel
            username={npc.name}
            rankStage={8}
            actionState="greet_chaptay"
            isNpc
            npcRoleLabel={npc.title}
            appearance={{
              archetype:
                npc.culturalOrigin === 'buddhist_dharmapala'
                  ? 'guardian'
                  : 'novice_monk',
              robeColor: npc.robeColor,
              trimColor: npc.accentColor,
              hairstyle:
                npc.culturalOrigin === 'buddhist_dharmapala'
                  ? 'crowned'
                  : 'shaved',
              hairColor: '#1c1917',
              auraId: 'aura_dharma_wheel',
              accessoryId:
                npc.culturalOrigin === 'buddhist_dharmapala'
                  ? 'dharma_staff'
                  : 'mala_beads',
              titleId: npc.title,
              nameplateStyle: 'gold',
            }}
            onClick={() => setActiveModal('npc_dialogue', npc.id)}
          />
        </group>
      ))}

      {/* Multiplayer Remote Players & Local Player Controller */}
      <RemotePlayers realm="human" />
      <PlayerController
        interactables={HUMAN_REALM_INTERACTABLES}
        worldBoundsRadius={58}
      />
    </group>
  );
};
