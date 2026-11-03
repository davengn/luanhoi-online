import React, { Suspense, useMemo, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { WORLD_NPCS } from '@shared/loreData';
import { InteractableTarget, useGameStore } from '../store/gameStore';
import { CharacterModel } from './CharacterModel';
import { PlayerController } from './PlayerController';
import { RemotePlayers } from './RemotePlayers';

function CelestialGlb({
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

useGLTF.preload('/assets/models/celestial_gate.glb');

export const CELESTIAL_REALM_INTERACTABLES: InteractableTarget[] = [
  {
    id: 'int_celestial_npc_thanh_van',
    type: 'npc',
    label: 'Tiên Đồng Thanh Vân',
    sublabel: 'Nhấn [E] để Đàm Đạo Thiên Cơ & Tìm Hiểu Độ Kiếp',
    position: { x: 0, y: 0, z: -10 },
    npcId: 'npc_celestial_thanh_van',
  },
  {
    id: 'int_tribulation_arena',
    type: 'tribulation_altar',
    label: 'Đài Độ Kiếp Cửu Trùng (Tribulation Arena)',
    sublabel: 'Nhấn [E] để Khiêu Chiến Lôi Kiếp / Hỏa Kiếp / Tâm Ma Kiếp',
    position: { x: 18, y: 0, z: -6 },
  },
  {
    id: 'int_celestial_palace_altar',
    type: 'altar',
    label: 'Cửu Trùng Vân Cung (Cộng Tu Tiên Giới)',
    sublabel: 'Nhấn [E] để Cộng Tu Thiền Định Thượng Giới (+Công Đức)',
    position: { x: 0, y: 0, z: -16 },
    activityId: 'group_meditation',
  },
  {
    id: 'int_celestial_garden',
    type: 'lotus_pond',
    label: 'Hồ Ngọc Liên & Vườn Tiên Đào',
    sublabel: 'Nhấn [E] để Tụng Kinh Khai Trí (+Công Đức)',
    position: { x: -17, y: 0, z: -4 },
    activityId: 'read_scripture',
  },
  {
    id: 'int_celestial_return_human',
    type: 'gate',
    label: 'Nam Thiên Môn (Trở Về Phàm Giới)',
    sublabel: 'Nhấn [E] để Hạ Phàm Trở Về Chùa Linh Sơn',
    position: { x: 0, y: 0, z: 22 },
    targetRealm: 'human',
  },
];

export const CelestialRealm: React.FC = () => {
  const setTargetMovePosition = useGameStore((s) => s.setTargetMovePosition);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const nearbyInteractable = useGameStore((s) => s.nearbyInteractable);

  const dharmaRingRef = useRef<THREE.Mesh>(null);
  const lightningBoltRef = useRef<THREE.Mesh>(null);
  const cloudRingRef = useRef<THREE.Group>(null);

  const celestialNpcs = useMemo(
    () => WORLD_NPCS.filter((n) => n.realm === 'celestial'),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (dharmaRingRef.current) {
      dharmaRingRef.current.rotation.z = t * 0.45;
    }
    if (cloudRingRef.current) {
      cloudRingRef.current.rotation.y = t * 0.08;
    }
    if (lightningBoltRef.current) {
      const flash = Math.sin(t * 14) > 0.55;
      lightningBoltRef.current.visible = flash;
    }
  });

  const handleGroundClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return;
    setTargetMovePosition({
      x: e.point.x,
      y: 0,
      z: e.point.z,
    });
  };

  return (
    <group>
      {/* Floating White-Jade Central Island Platform */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
        onClick={handleGroundClick}
      >
        <circleGeometry args={[48, 64]} />
        <meshStandardMaterial
          color="#e2f1f8"
          roughness={0.28}
          metalness={0.35}
        />
      </mesh>

      {/* Golden Celestial Trim Rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[46.5, 48.2, 64]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.85}
          roughness={0.18}
        />
      </mesh>

      {/* Sacred Geometric Mandala in Center of Heavenly Court */}
      <mesh
        ref={dharmaRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
        onClick={handleGroundClick}
      >
        <ringGeometry args={[5.5, 7.8, 12]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* NAM THIÊN MÔN (SOUTHERN HEAVENLY GATE) */}
      <group position={[0, 0, 22]}>
        <Suspense fallback={null}>
          <CelestialGlb
            url="/assets/models/celestial_gate.glb"
            position={[0, 0, 0]}
            scale={2.4}
          />
        </Suspense>
        <Html position={[0, 7.2, 0]} center distanceFactor={18}>
          <div className="pointer-events-none rounded-full border border-amber-300/80 bg-sky-950/90 px-4 py-1 text-xs font-bold tracking-widest text-amber-200 shadow-xl whitespace-nowrap">
            ✦ NAM THIÊN MÔN (HẠ PHÀM) ✦
          </div>
        </Html>
      </group>

      {/* CLOUD PALACE (CỬU TRÙNG VÂN CUNG) */}
      <group position={[0, 0, -21]}>
        <mesh position={[0, 0.8, 0]} receiveShadow>
          <cylinderGeometry args={[12, 13.5, 1.6, 32]} />
          <meshStandardMaterial
            color="#f0f9ff"
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>
        <Suspense fallback={null}>
          <CelestialGlb
            url="/assets/models/temple_pagoda.glb"
            position={[0, 1.6, -1]}
            scale={2.3}
          />
          <CelestialGlb
            url="/assets/models/buddha_statue.glb"
            position={[0, 2.0, 3]}
            scale={2.0}
          />
        </Suspense>
      </group>

      {/* TRIBULATION ARENA (ĐÀI ĐỘ KIẾP CỬU TRÙNG) */}
      <group
        position={[18, 0, -6]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveModal('tribulation');
        }}
      >
        <mesh position={[0, 0.35, 0]} receiveShadow>
          <cylinderGeometry args={[8.5, 9.5, 0.7, 24]} />
          <meshStandardMaterial
            color="#1e1b4b"
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>

        {/* 8 Lightning-Rod Jade Obelisks around the Tribulation Colosseum */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <group
              key={i}
              position={[Math.cos(angle) * 7.8, 0.7, Math.sin(angle) * 7.8]}
            >
              <mesh position={[0, 2.5, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.42, 5, 8]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  emissive="#0284c7"
                  emissiveIntensity={0.5}
                />
              </mesh>
              <mesh position={[0, 5.4, 0]}>
                <octahedronGeometry args={[0.45, 0]} />
                <meshBasicMaterial color="#fde047" />
              </mesh>
            </group>
          );
        })}

        {/* Dynamic Tribulation Lightning Bolt */}
        <mesh ref={lightningBoltRef} position={[0, 6, 0]}>
          <cylinderGeometry args={[0.12, 0.35, 12, 6]} />
          <meshBasicMaterial color="#7dd3fc" />
        </mesh>

        <Html position={[0, 6.2, 0]} center distanceFactor={16}>
          <div className="pointer-events-none rounded-lg border border-cyan-300/80 bg-indigo-950/90 px-3 py-1 text-xs font-bold text-cyan-200 shadow-lg whitespace-nowrap">
            ⚡ Đài Độ Kiếp Cửu Trùng (Khiêu Chiến Thiên Kiếp)
          </div>
        </Html>
      </group>

      {/* CELESTIAL GARDEN & LOTUS LAKE (VƯỜN TIÊN ĐÀO) */}
      <group position={[-17, 0, -4]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <circleGeometry args={[8, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.75}
            roughness={0.1}
          />
        </mesh>
        <Suspense fallback={null}>
          {[
            [-3, 2],
            [2.5, -2.5],
            [0, 3.5],
            [-2.5, -3],
          ].map(([lx, lz], idx) => (
            <CelestialGlb
              key={idx}
              url="/assets/models/lotus_flower.glb"
              position={[lx, 0.14, lz]}
              scale={1.3}
            />
          ))}
        </Suspense>
      </group>

      {/* Billowing Sea of Clouds Ring around the Floating Island */}
      <group ref={cloudRingRef}>
        {Array.from({ length: 20 }).map((_, idx) => {
          const angle = (idx / 20) * Math.PI * 2;
          const dist = 52 + (idx % 3) * 5;
          return (
            <mesh
              key={idx}
              position={[
                Math.cos(angle) * dist,
                -2.5 + (idx % 4) * 1.2,
                Math.sin(angle) * dist,
              ]}
            >
              <sphereGeometry args={[6.5, 12, 12]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.72}
                roughness={1}
              />
            </mesh>
          );
        })}
      </group>

      {/* Interactive Zone Beacons */}
      {CELESTIAL_REALM_INTERACTABLES.map((item) => {
        const isHighlighted = nearbyInteractable?.id === item.id;
        return (
          <group
            key={item.id}
            position={[item.position.x, 0.06, item.position.z]}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry
                args={[
                  isHighlighted ? 1.3 : 0.95,
                  isHighlighted ? 1.65 : 1.15,
                  24,
                ]}
              />
              <meshBasicMaterial
                color={isHighlighted ? '#fde047' : '#38bdf8'}
                transparent
                opacity={isHighlighted ? 0.9 : 0.45}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* Celestial NPC: Tiên Đồng Thanh Vân */}
      {celestialNpcs.map((npc) => (
        <group
          key={npc.id}
          position={[npc.position.x, 0, npc.position.z]}
          rotation={[0, npc.rotationY, 0]}
        >
          <CharacterModel
            username={npc.name}
            rankStage={10}
            actionState="idle"
            isNpc
            npcRoleLabel={npc.title}
            appearance={{
              archetype: 'immortal',
              robeColor: npc.robeColor,
              trimColor: npc.accentColor,
              hairstyle: 'crowned',
              hairColor: '#f8fafc',
              auraId: 'aura_thunder_lotus',
              accessoryId: 'celestial_ribbon',
              titleId: npc.title,
              nameplateStyle: 'celestial',
            }}
            onClick={() => setActiveModal('npc_dialogue', npc.id)}
          />
        </group>
      ))}

      <RemotePlayers realm="celestial" />
      <PlayerController
        interactables={CELESTIAL_REALM_INTERACTABLES}
        worldBoundsRadius={45}
      />
    </group>
  );
};
