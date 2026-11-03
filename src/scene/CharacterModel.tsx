import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  CharacterAppearance,
  PlayerActionState,
} from '@shared/types';
import { COSMETIC_CATALOG, RANKS } from '@shared/gameData';

export interface CharacterModelProps {
  username: string;
  appearance: CharacterAppearance;
  rankStage: number;
  actionState: PlayerActionState;
  isLocalPlayer?: boolean;
  isNpc?: boolean;
  npcRoleLabel?: string;
  chatBubble?: {
    text: string;
    expiresAt: number;
  } | null;
  onClick?: () => void;
}

const NAMEPLATE_STYLE_CLASSES: Record<
  CharacterAppearance['nameplateStyle'],
  string
> = {
  wood: 'bg-stone-900/90 border-amber-700/70 text-amber-100',
  jade: 'bg-emerald-950/90 border-emerald-400/70 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.35)]',
  gold: 'bg-amber-950/90 border-amber-400/90 text-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.45)]',
  celestial:
    'bg-indigo-950/90 border-cyan-300/80 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.5)]',
  karmic_fire:
    'bg-red-950/90 border-orange-500/80 text-orange-100 shadow-[0_0_15px_rgba(239,68,68,0.5)]',
};

export const CharacterModel: React.FC<CharacterModelProps> = ({
  username,
  appearance,
  rankStage,
  actionState,
  isLocalPlayer = false,
  isNpc = false,
  npcRoleLabel,
  chatBubble,
  onClick,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const auraRingRef = useRef<THREE.Mesh>(null);
  const dharmaWheelRef = useRef<THREE.Group>(null);
  const ribbonRef = useRef<THREE.Mesh>(null);

  const rankDef = useMemo(
    () => RANKS.find((r) => r.stage === rankStage) || RANKS[0],
    [rankStage]
  );

  const auraColor = useMemo(() => {
    const cosmeticAura = COSMETIC_CATALOG.find(
      (c) => c.id === appearance.auraId
    );
    return cosmeticAura?.auraColor || rankDef.auraColor || '#e6c27a';
  }, [appearance.auraId, rankDef.auraColor]);

  const showBubble =
    chatBubble && chatBubble.text && chatBubble.expiresAt > Date.now();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!bodyRef.current || !headRef.current) return;

    const body = bodyRef.current;
    const head = headRef.current;
    const lArm = leftArmRef.current;
    const rArm = rightArmRef.current;
    const lLeg = leftLegRef.current;
    const rLeg = rightLegRef.current;

    // Reset baseline transforms before applying state procedural motion
    body.position.set(0, 0.95, 0);
    body.rotation.set(0, 0, 0);
    head.rotation.set(0, 0, 0);

    if (lArm && rArm && lLeg && rLeg) {
      lArm.rotation.set(0, 0, 0.12);
      rArm.rotation.set(0, 0, -0.12);
      lLeg.rotation.set(0, 0, 0);
      rLeg.rotation.set(0, 0, 0);
      lLeg.position.set(-0.16, 0.45, 0);
      rLeg.position.set(0.16, 0.45, 0);
    }

    switch (actionState) {
      case 'walk':
      case 'run': {
        const speed = actionState === 'run' ? 11 : 7.5;
        const amp = actionState === 'run' ? 0.65 : 0.42;
        body.position.y = 0.95 + Math.abs(Math.sin(t * speed)) * 0.08;
        body.rotation.x = actionState === 'run' ? 0.14 : 0.06;
        if (lArm && rArm && lLeg && rLeg) {
          lArm.rotation.x = Math.sin(t * speed) * amp;
          rArm.rotation.x = -Math.sin(t * speed) * amp;
          lLeg.rotation.x = -Math.sin(t * speed) * amp;
          rLeg.rotation.x = Math.sin(t * speed) * amp;
        }
        break;
      }

      case 'bow':
      case 'greet_chaptay': {
        const bowAngle =
          actionState === 'bow'
            ? (Math.sin(t * 3.2) * 0.5 + 0.5) * 0.65
            : 0.22;
        body.rotation.x = bowAngle;
        head.rotation.x = bowAngle * 0.4;
        if (lArm && rArm) {
          // Hands joined in Anjali Mudra (Chắp tay búp sen)
          lArm.rotation.set(-0.95, 0.45, -0.25);
          rArm.rotation.set(-0.95, -0.45, 0.25);
        }
        break;
      }

      case 'prostrate': {
        const cycle = (Math.sin(t * 2.4) + 1) * 0.5;
        body.position.y = 0.95 - cycle * 0.52;
        body.rotation.x = cycle * 1.15;
        if (lArm && rArm && lLeg && rLeg) {
          lArm.rotation.set(-1.3 * cycle, 0.3, -0.15);
          rArm.rotation.set(-1.3 * cycle, -0.3, 0.15);
          lLeg.rotation.x = -0.6 * cycle;
          rLeg.rotation.x = -0.6 * cycle;
        }
        break;
      }

      case 'meditate': {
        // Seated lotus posture floating gently
        body.position.y = 0.58 + Math.sin(t * 2.0) * 0.04;
        if (lArm && rArm && lLeg && rLeg) {
          lArm.rotation.set(-0.55, 0.35, -0.2);
          rArm.rotation.set(-0.55, -0.35, 0.2);
          lLeg.position.set(-0.22, 0.22, 0.12);
          rLeg.position.set(0.22, 0.22, 0.12);
          lLeg.rotation.set(-1.35, 0, 0.85);
          rLeg.rotation.set(-1.35, 0, -0.85);
        }
        break;
      }

      case 'pray_beads': {
        body.position.y = 0.95 + Math.sin(t * 3) * 0.02;
        head.rotation.x = 0.15;
        if (lArm && rArm) {
          lArm.rotation.set(-0.85, 0.35, -0.2);
          rArm.rotation.set(
            -0.85 + Math.sin(t * 10) * 0.15,
            -0.35,
            0.2
          );
        }
        break;
      }

      case 'offer_incense':
      case 'offer_lotus': {
        const lift = Math.sin(t * 3.0) * 0.15;
        body.rotation.x = 0.12;
        if (lArm && rArm) {
          lArm.rotation.set(-1.25 - lift, 0.3, -0.1);
          rArm.rotation.set(-1.25 - lift, -0.3, 0.1);
        }
        break;
      }

      case 'celebrate':
      case 'cheer': {
        body.position.y = 0.98 + Math.abs(Math.sin(t * 6)) * 0.16;
        if (lArm && rArm) {
          lArm.rotation.set(0, 0, 2.5 + Math.sin(t * 8) * 0.25);
          rArm.rotation.set(0, 0, -2.5 - Math.sin(t * 8) * 0.25);
        }
        break;
      }

      case 'ascend':
      case 'tribulation': {
        body.position.y = 1.45 + Math.sin(t * 3.5) * 0.18;
        if (lArm && rArm) {
          lArm.rotation.set(-0.4, 0, 0.65);
          rArm.rotation.set(-0.4, 0, -0.65);
        }
        break;
      }

      default: {
        // Gentle breathing idle (Immortal archetype levitates slightly)
        const levitateOffset =
          appearance.archetype === 'immortal' || rankStage >= 8 ? 0.18 : 0;
        body.position.y =
          0.95 + levitateOffset + Math.sin(t * 2.2) * 0.03;
        if (lArm && rArm) {
          lArm.rotation.z = 0.12 + Math.sin(t * 1.8) * 0.03;
          rArm.rotation.z = -0.12 - Math.sin(t * 1.8) * 0.03;
        }
        break;
      }
    }

    if (auraRingRef.current) {
      auraRingRef.current.rotation.z = t * 0.8;
      const pulse = 1 + Math.sin(t * 2.8) * 0.06;
      auraRingRef.current.scale.set(pulse, pulse, 1);
    }

    if (dharmaWheelRef.current) {
      dharmaWheelRef.current.rotation.z = -t * 0.9;
    }

    if (ribbonRef.current) {
      ribbonRef.current.rotation.z = Math.sin(t * 2.2) * 0.12;
      ribbonRef.current.position.y = 1.35 + Math.sin(t * 3) * 0.05;
    }
  });

  return (
    <group ref={rootRef} onClick={onClick}>
      {/* Ground Cultivation Aura Ring */}
      <mesh
        ref={auraRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
      >
        <ringGeometry args={[0.58, 0.82, 32]} />
        <meshBasicMaterial
          color={auraColor}
          transparent
          opacity={Math.min(0.85, 0.25 + rankStage * 0.05)}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Secondary Lotus Aura Base when Meditating or High Rank */}
      {(actionState === 'meditate' || rankStage >= 4) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[0.95, 16]} />
          <meshBasicMaterial
            color={auraColor}
            transparent
            opacity={actionState === 'meditate' ? 0.32 : 0.16}
          />
        </mesh>
      )}

      {/* Dharma Wheel Back Halo for High Ranks or aura_dharma_wheel */}
      {(rankStage >= 7 ||
        appearance.auraId === 'aura_dharma_wheel' ||
        appearance.auraId === 'aura_heavenly_dao' ||
        isNpc) && (
        <group ref={dharmaWheelRef} position={[0, 1.45, -0.28]}>
          <mesh>
            <torusGeometry args={[0.58, 0.025, 12, 32]} />
            <meshBasicMaterial color={auraColor} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.18, 0.56, 8]} />
            <meshBasicMaterial
              color={auraColor}
              wireframe
              transparent
              opacity={0.55}
            />
          </mesh>
        </group>
      )}

      {/* Main Articulated Character Body */}
      <group ref={bodyRef} position={[0, 0.95, 0]}>
        {/* Lower Robe / Tunic Skirt */}
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.38, 0.65, 16]} />
          <meshStandardMaterial
            color={appearance.robeColor}
            roughness={0.55}
            metalness={0.1}
          />
        </mesh>

        {/* Upper Torso Robe */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.24, 0.52, 16]} />
          <meshStandardMaterial
            color={appearance.robeColor}
            roughness={0.5}
            metalness={0.12}
          />
        </mesh>

        {/* Ornate Kasaya Sash / Trim Collar */}
        <mesh position={[0, 0.22, 0.02]} rotation={[0, 0, 0.35]} castShadow>
          <torusGeometry args={[0.23, 0.045, 10, 20]} />
          <meshStandardMaterial
            color={appearance.trimColor}
            roughness={0.35}
            metalness={0.45}
          />
        </mesh>

        {/* Waist Sash Belt */}
        <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.035, 8, 24]} />
          <meshStandardMaterial
            color={appearance.trimColor}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Archetype-specific Shoulder Mantle for Guardian / Immortal / Envoy */}
        {(appearance.archetype === 'guardian' ||
          appearance.archetype === 'immortal' ||
          appearance.archetype === 'underworld_envoy') && (
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[0.68, 0.12, 0.34]} />
            <meshStandardMaterial
              color={appearance.trimColor}
              roughness={0.25}
              metalness={0.65}
            />
          </mesh>
        )}

        {/* Head & Hair Group */}
        <group ref={headRef} position={[0, 0.62, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.21, 20, 20]} />
            <meshStandardMaterial
              color="#f3d2b3"
              roughness={0.6}
              metalness={0.05}
            />
          </mesh>

          {/* Calm Eyes */}
          <mesh position={[-0.07, 0.02, 0.185]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial color="#1c1917" />
          </mesh>
          <mesh position={[0.07, 0.02, 0.185]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial color="#1c1917" />
          </mesh>

          {/* Mindful Smile / Brow Mark (Urna) */}
          <mesh position={[0, 0.09, 0.195]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>

          {/* Hairstyles */}
          {appearance.hairstyle !== 'shaved' && (
            <group>
              {/* Hair Cap */}
              <mesh position={[0, 0.06, -0.02]}>
                <sphereGeometry
                  args={[0.218, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.58]}
                />
                <meshStandardMaterial
                  color={appearance.hairColor || '#1c1917'}
                  roughness={0.7}
                />
              </mesh>

              {/* Topknot */}
              {(appearance.hairstyle === 'topknot' ||
                appearance.hairstyle === 'crowned') && (
                <mesh position={[0, 0.26, -0.02]}>
                  <sphereGeometry args={[0.085, 12, 12]} />
                  <meshStandardMaterial
                    color={appearance.hairColor || '#1c1917'}
                  />
                </mesh>
              )}

              {/* Crowned Golden Hairpin / Diadem */}
              {appearance.hairstyle === 'crowned' && (
                <mesh position={[0, 0.27, 0]}>
                  <cylinderGeometry args={[0.1, 0.09, 0.09, 12]} />
                  <meshStandardMaterial
                    color="#fbbf24"
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
              )}

              {/* Flowing / Braided Back Hair */}
              {(appearance.hairstyle === 'flowing' ||
                appearance.hairstyle === 'braided') && (
                <mesh position={[0, -0.15, -0.16]}>
                  <capsuleGeometry args={[0.08, 0.35, 8, 12]} />
                  <meshStandardMaterial
                    color={appearance.hairColor || '#1c1917'}
                  />
                </mesh>
              )}
            </group>
          )}

          {/* Shaved Monk6-Dot Ordination Marks */}
          {appearance.hairstyle === 'shaved' && (
            <group position={[0, 0.19, 0.07]}>
              <mesh position={[-0.03, 0, 0]}>
                <sphereGeometry args={[0.009, 6, 6]} />
                <meshBasicMaterial color="#d97706" />
              </mesh>
              <mesh position={[0.03, 0, 0]}>
                <sphereGeometry args={[0.009, 6, 6]} />
                <meshBasicMaterial color="#d97706" />
              </mesh>
            </group>
          )}

          {/* Accessory: Floating Lotus Halo Crown */}
          {appearance.accessoryId === 'lotus_halo' && (
            <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.24, 0.022, 10, 24]} />
              <meshBasicMaterial color="#fde047" />
            </mesh>
          )}
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.31, 0.34, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.28, 8, 12]} />
            <meshStandardMaterial color={appearance.robeColor} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#f3d2b3" />
          </mesh>

          {/* Held Offering Item when Offering Incense or Lotus */}
          {actionState === 'offer_incense' && (
            <group position={[0.15, -0.38, 0.15]} rotation={[0.4, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.01, 0.01, 0.35, 6]} />
                <meshBasicMaterial color="#b45309" />
              </mesh>
              <mesh position={[0, 0.18, 0]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshBasicMaterial color="#f97316" />
              </mesh>
            </group>
          )}

          {actionState === 'offer_lotus' && (
            <mesh position={[0.15, -0.38, 0.14]}>
              <octahedronGeometry args={[0.09, 1]} />
              <meshStandardMaterial
                color="#f472b6"
                emissive="#f472b6"
                emissiveIntensity={0.4}
              />
            </mesh>
          )}
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.31, 0.34, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.28, 8, 12]} />
            <meshStandardMaterial color={appearance.robeColor} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#f3d2b3" />
          </mesh>

          {/* Accessory: Nine-Ring Dharma Staff (Tích Trượng) */}
          {appearance.accessoryId === 'dharma_staff' && (
            <group position={[0.08, -0.15, 0.12]}>
              <mesh>
                <cylinderGeometry args={[0.02, 0.02, 1.55, 8]} />
                <meshStandardMaterial
                  color="#92400e"
                  metalness={0.3}
                  roughness={0.5}
                />
              </mesh>
              <mesh position={[0, 0.82, 0]}>
                <torusGeometry args={[0.12, 0.02, 8, 16]} />
                <meshStandardMaterial
                  color="#fbbf24"
                  metalness={0.85}
                  roughness={0.15}
                />
              </mesh>
            </group>
          )}

          {/* Accessory: Golden Filigree Censer */}
          {appearance.accessoryId === 'incense_censer' && (
            <mesh position={[0.08, -0.45, 0.1]}>
              <dodecahedronGeometry args={[0.09, 0]} />
              <meshStandardMaterial
                color="#f59e0b"
                metalness={0.8}
                roughness={0.2}
                emissive="#d97706"
                emissiveIntensity={0.35}
              />
            </mesh>
          )}
        </group>

        {/* Accessory: 108 Mala Beads around Neck */}
        {appearance.accessoryId === 'mala_beads' && (
          <mesh position={[0, 0.41, 0.04]} rotation={[Math.PI / 2.3, 0, 0]}>
            <torusGeometry args={[0.19, 0.024, 8, 20]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} />
          </mesh>
        )}

        {/* Accessory: Celestial Silk Ribbon */}
        {(appearance.accessoryId === 'celestial_ribbon' ||
          appearance.archetype === 'celestial_attendant' ||
          appearance.archetype === 'immortal') && (
          <mesh
            ref={ribbonRef}
            position={[0, 0.35, -0.15]}
            rotation={[0.2, 0, 0]}
          >
            <torusGeometry args={[0.48, 0.028, 10, 32, Math.PI * 1.35]} />
            <meshBasicMaterial
              color={appearance.trimColor || '#67e8f9'}
              transparent
              opacity={0.82}
            />
          </mesh>
        )}
      </group>

      {/* Left & Right Legs */}
      <group ref={leftLegRef} position={[-0.16, 0.45, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.3, 8, 10]} />
          <meshStandardMaterial color="#292524" roughness={0.8} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.16, 0.45, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.3, 8, 10]} />
          <meshStandardMaterial color="#292524" roughness={0.8} />
        </mesh>
      </group>

      {/* Floating Billboard Nameplate, Title & Chat Bubble */}
      <Html
        position={[0, 2.25, 0]}
        center
        distanceFactor={14}
        zIndexRange={[20, 0]}
      >
        <div className="pointer-events-none flex flex-col items-center gap-1 select-none whitespace-nowrap">
          {showBubble && (
            <div className="mb-1 max-w-[230px] whitespace-normal rounded-xl border border-amber-400/70 bg-stone-950/95 px-3 py-1.5 text-center text-xs font-medium text-amber-100 shadow-lg">
              {chatBubble.text}
            </div>
          )}

          {/* Title / Role Pill */}
          <div
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
              NAMEPLATE_STYLE_CLASSES[appearance.nameplateStyle || 'wood']
            }`}
          >
            {isNpc
              ? npcRoleLabel || appearance.titleId
              : appearance.titleId || rankDef.vietnameseTitle}
          </div>

          {/* Username */}
          <div
            className={`rounded-md px-2 py-0.5 text-xs font-bold tracking-wide drop-shadow ${
              isLocalPlayer
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/50'
                : isNpc
                  ? 'bg-amber-950/85 text-yellow-300 border border-yellow-500/60'
                  : 'bg-black/65 text-stone-100'
            }`}
          >
            {isNpc ? `✦ ${username} ✦` : username}
          </div>
        </div>
      </Html>
    </group>
  );
};
