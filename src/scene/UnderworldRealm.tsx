import React, { Suspense, useMemo, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  HELL_LEVELS,
  WORLD_NPCS,
  getHellLevelByNumber,
} from '@shared/loreData';
import { InteractableTarget, useGameStore } from '../store/gameStore';
import { CharacterModel } from './CharacterModel';
import { PlayerController } from './PlayerController';
import { RemotePlayers } from './RemotePlayers';

function UnderworldGlb({
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

useGLTF.preload('/assets/models/hell_pillar.glb');
useGLTF.preload('/assets/models/reincarnation_wheel.glb');

export const UnderworldRealm: React.FC = () => {
  const underworldSubZone = useGameStore((s) => s.underworldSubZone);
  const activeHellFloor = useGameStore((s) => s.activeHellFloor);
  const hellChallengeProgress = useGameStore((s) => s.hellChallengeProgress);
  const nearbyInteractable = useGameStore((s) => s.nearbyInteractable);
  const setTargetMovePosition = useGameStore((s) => s.setTargetMovePosition);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const switchRealmOrRoom = useGameStore((s) => s.switchRealmOrRoom);
  const advanceHellFloorChallenge = useGameStore(
    (s) => s.advanceHellFloorChallenge
  );

  const floorConfig = useMemo(
    () => getHellLevelByNumber(activeHellFloor) || HELL_LEVELS[0],
    [activeHellFloor]
  );

  const rotatingFeatureRef = useRef<THREE.Group>(null);
  const mirrorPulseRef = useRef<THREE.Mesh>(null);

  const underworldNpcs = useMemo(
    () => WORLD_NPCS.filter((n) => n.realm === 'underworld'),
    []
  );

  const completedSteps = hellChallengeProgress[activeHellFloor] || 0;
  const requiredSteps = floorConfig.redemptionQuest.requiredActions;

  // Dynamic interactables based on whether player is in Judgment Hall or one of the 18 Hell Floors
  const interactables: InteractableTarget[] = useMemo(() => {
    if (underworldSubZone === 'judgment_hall') {
      return [
        {
          id: 'int_npc_thoi_giac',
          type: 'npc',
          label: 'Phán Quan Thôi Giác (Nghiệp Kính Đài)',
          sublabel: 'Nhấn [E] để Tra Cứu Sổ Sinh Tử & Nghe Phán Xét Nhân Quả',
          position: { x: 0, y: 0, z: -10 },
          npcId: 'npc_judge_thoi_giac',
        },
        {
          id: 'int_npc_underworld_envoy',
          type: 'npc',
          label: 'Sứ Giả Địa Ngục (Cầu Nại Hà)',
          sublabel: 'Nhấn [E] để Tìm Hiểu Đường Chuộc Lỗi 18 Tầng Địa Ngục',
          position: { x: -8, y: 0, z: -4 },
          npcId: 'npc_underworld_envoy',
        },
        {
          id: 'int_enter_hell_floors',
          type: 'gate',
          label: `Cổng Vào 18 Tầng Địa Ngục (Tầng ${activeHellFloor}: ${floorConfig.vietnameseName})`,
          sublabel: 'Nhấn [E] để Bước Vào Tầng Địa Ngục Thực Hành Sám Hối',
          position: { x: 0, y: 0, z: -20 },
          targetRealm: 'underworld',
          targetHellLevel: activeHellFloor,
        },
        {
          id: 'int_reincarnation_return_human',
          type: 'gate',
          label: 'Đài Lục Đạo Luân Hồi (Trở Về Phàm Giới)',
          sublabel: 'Nhấn [E] để Trở Về Chùa Linh Sơn (Khi Không Còn Án Phạt)',
          position: { x: 0, y: 0, z: 22 },
          targetRealm: 'human',
        },
      ];
    }

    // Inside one of the 18 Levels of Hell
    const shrines: InteractableTarget[] = [
      {
        id: `int_warden_${activeHellFloor}`,
        type: 'hell_shrine',
        label: `${floorConfig.wardenNpc.name} (${floorConfig.wardenNpc.title})`,
        sublabel: 'Nhấn [E] để Thực Hành Nghi Thức Hối Cải & Mở Sổ Chuộc Lỗi',
        position: { x: 0, y: 0, z: -12 },
        targetHellLevel: activeHellFloor,
      },
      {
        id: `int_shrine_left_${activeHellFloor}`,
        type: 'hell_shrine',
        label: `Đài Sám Hối Tả Phương — ${floorConfig.redemptionQuest.title}`,
        sublabel: `Nhấn [E] để Tịnh Hóa Nghiệp Chướng (${completedSteps}/${requiredSteps})`,
        position: { x: -9, y: 0, z: -2 },
        targetHellLevel: activeHellFloor,
      },
      {
        id: `int_shrine_right_${activeHellFloor}`,
        type: 'hell_shrine',
        label: `Đài Sám Hối Hữu Phương — ${floorConfig.redemptionQuest.title}`,
        sublabel: `Nhấn [E] để Tịnh Hóa Nghiệp Chướng (${completedSteps}/${requiredSteps})`,
        position: { x: 9, y: 0, z: -2 },
        targetHellLevel: activeHellFloor,
      },
      {
        id: `int_shrine_center_${activeHellFloor}`,
        type: 'hell_shrine',
        label: `Tâm Đài Tỉnh Thức — ${floorConfig.vietnameseName}`,
        sublabel: `Nhấn [E] để Quán Chiếu & Hóa Giải Nghiệp Lực (${completedSteps}/${requiredSteps})`,
        position: { x: 0, y: 0, z: 4 },
        targetHellLevel: activeHellFloor,
      },
      {
        id: 'int_return_judgment_hall',
        type: 'gate',
        label: 'Cổng Trở Về Nghiệp Kính Đài / Phàm Giới',
        sublabel: 'Nhấn [E] để Quay Lại Điện Phán Xét Âm Phủ',
        position: { x: 0, y: 0, z: 20 },
        targetRealm: 'underworld',
      },
    ];

    return shrines;
  }, [
    underworldSubZone,
    activeHellFloor,
    floorConfig,
    completedSteps,
    requiredSteps,
  ]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (rotatingFeatureRef.current) {
      rotatingFeatureRef.current.rotation.y = t * 0.45;
    }
    if (mirrorPulseRef.current) {
      const s = 1 + Math.sin(t * 2.5) * 0.04;
      mirrorPulseRef.current.scale.set(s, s, 1);
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
      {/* Main Ground Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
        onClick={handleGroundClick}
      >
        <circleGeometry args={[56, 64]} />
        <meshStandardMaterial
          color={
            underworldSubZone === 'hell_floor'
              ? floorConfig.colorPalette.primary
              : '#1a1423'
          }
          roughness={0.82}
          metalness={0.2}
        />
      </mesh>

      {/* Outer Spectral Rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[44, 46, 64]} />
        <meshBasicMaterial
          color={
            underworldSubZone === 'hell_floor'
              ? floorConfig.colorPalette.accentGlow
              : '#a855f7'
          }
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* SUB-ZONE A: JUDGMENT HALL & RIVER VỌNG XUYÊN & CẦU NẠI HÀ */}
      {underworldSubZone === 'judgment_hall' && (
        <group>
          {/* River of Forgotten Souls (Sông Vọng Xuyên) */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.03, 6]}
            onClick={handleGroundClick}
          >
            <planeGeometry args={[80, 9]} />
            <meshStandardMaterial
              color="#3b0764"
              emissive="#581c87"
              emissiveIntensity={0.4}
              roughness={0.2}
              metalness={0.7}
            />
          </mesh>

          {/* Cầu Nại Hà Stone Arch Bridge */}
          <group position={[0, 0, 6]}>
            <mesh position={[0, 0.45, 0]} receiveShadow castShadow>
              <boxGeometry args={[6.5, 0.5, 11]} />
              <meshStandardMaterial color="#44403c" roughness={0.75} />
            </mesh>
            {[-3, 3].map((bx) => (
              <mesh key={bx} position={[bx, 1.1, 0]}>
                <boxGeometry args={[0.3, 0.9, 11]} />
                <meshStandardMaterial color="#78716c" />
              </mesh>
            ))}
          </group>

          {/* Nghiệp Kính Đài (Mirror of Karma Judgment Platform) */}
          <group position={[0, 0, -16]}>
            <mesh position={[0, 0.7, 0]} receiveShadow>
              <boxGeometry args={[20, 1.4, 10]} />
              <meshStandardMaterial color="#27272a" roughness={0.7} />
            </mesh>

            {/* Giant Glowing Karmic Mirror (Nghiệp Kính) */}
            <mesh ref={mirrorPulseRef} position={[0, 4.6, -2]}>
              <circleGeometry args={[3.4, 32]} />
              <meshBasicMaterial color="#c084fc" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 4.6, -2.05]}>
              <ringGeometry args={[3.4, 4.1, 32]} />
              <meshStandardMaterial
                color="#f59e0b"
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>

            <Html position={[0, 9.2, -2]} center distanceFactor={18}>
              <div className="pointer-events-none rounded-xl border border-purple-400/80 bg-purple-950/90 px-4 py-1.5 text-center text-xs font-bold text-purple-100 shadow-xl whitespace-nowrap">
                ⚖️ NGHIỆP KÍNH ĐÀI — THẬP BÁT TẦNG ĐỊA NGỤC
              </div>
            </Html>
          </group>

          {/* Obsidian Hell Pillars Flanking Judgment Hall */}
          <Suspense fallback={null}>
            {[
              [-9, -14],
              [9, -14],
              [-9, -4],
              [9, -4],
              [-9, 14],
              [9, 14],
            ].map(([px, pz], idx) => (
              <UnderworldGlb
                key={idx}
                url="/assets/models/hell_pillar.glb"
                position={[px, 0, pz]}
                scale={1.8}
              />
            ))}
          </Suspense>

          {/* Soul-Reincarnation Gate (Đài Lục Đạo Luân Hồi) */}
          <group position={[0, 0, 22]}>
            <Suspense fallback={null}>
              <UnderworldGlb
                url="/assets/models/reincarnation_wheel.glb"
                position={[0, 2.8, 0]}
                scale={2.1}
              />
            </Suspense>
            <Html position={[0, 6.2, 0]} center distanceFactor={16}>
              <div className="pointer-events-none rounded-lg border border-amber-400/80 bg-stone-950/90 px-3 py-1 text-xs font-bold text-amber-200 shadow-lg whitespace-nowrap">
                ☸️ Đài Lục Đạo Luân Hồi (Về Phàm Giới)
              </div>
            </Html>
          </group>

          {/* Underworld NPCs: Phán Quan Thôi Giác & Sứ Giả Địa Ngục */}
          {underworldNpcs.map((npc) => (
            <group
              key={npc.id}
              position={[npc.position.x, 0, npc.position.z]}
              rotation={[0, npc.rotationY, 0]}
            >
              <CharacterModel
                username={npc.name}
                rankStage={9}
                actionState="idle"
                isNpc
                npcRoleLabel={npc.title}
                appearance={{
                  archetype: 'underworld_envoy',
                  robeColor: npc.robeColor,
                  trimColor: npc.accentColor,
                  hairstyle: 'crowned',
                  hairColor: '#1c1917',
                  auraId: 'aura_dharma_wheel',
                  accessoryId: 'dharma_staff',
                  titleId: npc.title,
                  nameplateStyle: 'karmic_fire',
                }}
                onClick={() => setActiveModal('npc_dialogue', npc.id)}
              />
            </group>
          ))}
        </group>
      )}

      {/* SUB-ZONE B: DYNAMIC 3D ENVIRONMENT FOR ALL 18 LEVELS OF HELL */}
      {underworldSubZone === 'hell_floor' && (
        <group>
          {/* Central Karmic Trial Platform */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.03, 0]}
            onClick={handleGroundClick}
          >
            <ringGeometry args={[3.5, 12.5, 32]} />
            <meshStandardMaterial
              color={floorConfig.colorPalette.secondary}
              roughness={0.5}
              metalness={0.4}
            />
          </mesh>

          {/* Ring of 8 Obsidian Hell Pillars with Floor-Specific Emissive Glow */}
          <Suspense fallback={null}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <group
                  key={i}
                  position={[
                    Math.cos(angle) * 16,
                    0,
                    Math.sin(angle) * 16 - 2,
                  ]}
                >
                  <UnderworldGlb
                    url="/assets/models/hell_pillar.glb"
                    scale={1.85}
                  />
                  <pointLight
                    position={[0, 3.2, 0]}
                    color={floorConfig.colorPalette.accentGlow}
                    intensity={1.1}
                    distance={12}
                  />
                </group>
              );
            })}
          </Suspense>

          {/* Floor-Specific Architectural Set-Piece in 3D */}
          <group ref={rotatingFeatureRef} position={[0, 0, -4]}>
            {/* Floors 1, 5, 11, 13: Monoliths / Chasm Steles / Petrified Pillars */}
            {[1, 5, 11, 13].includes(activeHellFloor) && (
              <group>
                {[-6, -3, 3, 6].map((x, idx) => (
                  <mesh
                    key={idx}
                    position={[x, 2.6, (idx % 2) * 4 - 2]}
                    rotation={[0, idx * 0.4, activeHellFloor === 13 ? 0.25 : 0]}
                    castShadow
                  >
                    <boxGeometry args={[1.6, 5.2, 0.8]} />
                    <meshStandardMaterial
                      color={floorConfig.colorPalette.secondary}
                      emissive={floorConfig.colorPalette.accentGlow}
                      emissiveIntensity={0.25}
                    />
                  </mesh>
                ))}
              </group>
            )}

            {/* Floors 2, 8: Golden Mirage Dunes / Shifting Brass Gear Vaults */}
            {[2, 8].includes(activeHellFloor) && (
              <group position={[0, 2.5, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[4.2, 0.45, 12, 32]} />
                  <meshStandardMaterial
                    color="#eab308"
                    metalness={0.85}
                    roughness={0.2}
                  />
                </mesh>
                <mesh>
                  <octahedronGeometry args={[1.8, 0]} />
                  <meshStandardMaterial
                    color="#fbbf24"
                    emissive="#f59e0b"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              </group>
            )}

            {/* Floors 3, 7, 9: Volcanic Lava Rivers / Bronze Furnace / Iron Bastion */}
            {[3, 7, 9].includes(activeHellFloor) && (
              <group>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
                  <circleGeometry args={[5.5, 24]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
                <mesh position={[0, 3.2, 0]}>
                  <dodecahedronGeometry args={[2.1, 0]} />
                  <meshStandardMaterial
                    color="#7f1d1d"
                    emissive="#f97316"
                    emissiveIntensity={0.7}
                    wireframe={activeHellFloor === 9}
                  />
                </mesh>
              </group>
            )}

            {/* Floors 4, 6, 10, 16: Envious Mirrors / Glacial Ice Spires / Phantasm Lanterns */}
            {[4, 6, 10, 16].includes(activeHellFloor) && (
              <group>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const a = (i / 6) * Math.PI * 2;
                  return (
                    <mesh
                      key={i}
                      position={[Math.cos(a) * 5.2, 2.8, Math.sin(a) * 5.2]}
                      rotation={[0, -a, 0]}
                    >
                      <coneGeometry args={[1.1, 5.5, 6]} />
                      <meshStandardMaterial
                        color={floorConfig.colorPalette.accentGlow}
                        metalness={0.85}
                        roughness={0.1}
                        transparent
                        opacity={0.82}
                      />
                    </mesh>
                  );
                })}
              </group>
            )}

            {/* Floors 12, 15, 17: Inverted Arrogance Spire / Bronze Scales / Shadow Prison */}
            {[12, 15, 17].includes(activeHellFloor) && (
              <group position={[0, 4.5, 0]}>
                <mesh rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[3.2, 6.5, 8]} />
                  <meshStandardMaterial
                    color={floorConfig.colorPalette.secondary}
                    emissive={floorConfig.colorPalette.accentGlow}
                    emissiveIntensity={0.35}
                  />
                </mesh>
                <mesh>
                  <torusGeometry args={[4.5, 0.2, 12, 32]} />
                  <meshBasicMaterial
                    color={floorConfig.colorPalette.accentGlow}
                  />
                </mesh>
              </group>
            )}

            {/* Floors 14, 18: Lotus Purity Swamp & Avīci Golden Khakkhara / Minh Châu */}
            {[14, 18].includes(activeHellFloor) && (
              <group position={[0, 0, 0]}>
                <mesh position={[0, 4.5, 0]}>
                  <cylinderGeometry args={[0.18, 0.24, 9, 12]} />
                  <meshStandardMaterial
                    color="#fbbf24"
                    emissive="#f59e0b"
                    emissiveIntensity={0.8}
                    metalness={0.9}
                  />
                </mesh>
                <mesh position={[0, 9.4, 0]}>
                  <sphereGeometry args={[1.1, 24, 24]} />
                  <meshBasicMaterial color="#fef08a" />
                </mesh>
                <Suspense fallback={null}>
                  <UnderworldGlb
                    url="/assets/models/lotus_flower.glb"
                    position={[0, 0.2, 0]}
                    scale={2.2}
                  />
                </Suspense>
              </group>
            )}
          </group>

          {/* 3 Interactive Redemption Shrines on the Floor */}
          {[
            { pos: [-9, 0, -2], label: 'Đài Sám Hối Tả Phương' },
            { pos: [9, 0, -2], label: 'Đài Sám Hối Hữu Phương' },
            { pos: [0, 0, 4], label: 'Tâm Đài Tỉnh Thức' },
          ].map((shrine, idx) => (
            <group
              key={idx}
              position={shrine.pos as [number, number, number]}
              onClick={(e) => {
                e.stopPropagation();
                advanceHellFloorChallenge(activeHellFloor);
              }}
            >
              <mesh position={[0, 0.6, 0]} castShadow>
                <cylinderGeometry args={[0.9, 1.2, 1.2, 8]} />
                <meshStandardMaterial
                  color={floorConfig.colorPalette.secondary}
                />
              </mesh>
              <mesh position={[0, 1.65, 0]}>
                <octahedronGeometry args={[0.55, 0]} />
                <meshBasicMaterial
                  color={
                    completedSteps > idx
                      ? '#4ade80'
                      : floorConfig.colorPalette.accentGlow
                  }
                />
              </mesh>
              <Html position={[0, 2.8, 0]} center distanceFactor={15}>
                <div className="pointer-events-none rounded-md border border-amber-400/70 bg-stone-950/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-200 shadow whitespace-nowrap">
                  🕯️ {shrine.label} ({completedSteps}/{requiredSteps})
                </div>
              </Html>
            </group>
          ))}

          {/* Floor Warden NPC */}
          <group position={[0, 0, -12]}>
            <CharacterModel
              username={floorConfig.wardenNpc.name}
              rankStage={10}
              actionState="idle"
              isNpc
              npcRoleLabel={floorConfig.wardenNpc.title}
              appearance={{
                archetype: 'underworld_envoy',
                robeColor: floorConfig.colorPalette.primary,
                trimColor: floorConfig.colorPalette.accentGlow,
                hairstyle: 'crowned',
                hairColor: '#f8fafc',
                auraId: 'aura_dharma_wheel',
                accessoryId: 'dharma_staff',
                titleId: floorConfig.wardenNpc.title,
                nameplateStyle: 'karmic_fire',
              }}
              onClick={() => setActiveModal('hell_ledger')}
            />
          </group>

          {/* Portal Back to Judgment Hall */}
          <group
            position={[0, 0, 20]}
            onClick={(e) => {
              e.stopPropagation();
              switchRealmOrRoom('underworld', {
                underworldSubZone: 'judgment_hall',
              });
            }}
          >
            <mesh position={[0, 2.4, 0]}>
              <torusGeometry args={[2.1, 0.14, 12, 32]} />
              <meshBasicMaterial
                color={floorConfig.colorPalette.accentGlow}
              />
            </mesh>
            <Html position={[0, 5.1, 0]} center distanceFactor={16}>
              <div className="pointer-events-none rounded-lg border border-purple-300/70 bg-stone-950/90 px-3 py-1 text-xs font-bold text-purple-200 shadow whitespace-nowrap">
                ⚖️ Quay Về Nghiệp Kính Đài
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* Interactive Beacon Rings */}
      {interactables.map((item) => {
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
                color={
                  isHighlighted
                    ? '#fde047'
                    : floorConfig.colorPalette.accentGlow
                }
                transparent
                opacity={isHighlighted ? 0.9 : 0.45}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      <RemotePlayers realm="underworld" />
      <PlayerController
        interactables={interactables}
        worldBoundsRadius={42}
      />
    </group>
  );
};
