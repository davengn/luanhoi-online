import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { InteractableTarget, useGameStore } from '../store/gameStore';
import { CharacterModel } from './CharacterModel';

export interface PlayerControllerProps {
  interactables: InteractableTarget[];
  worldBoundsRadius?: number;
}

export const PlayerController: React.FC<PlayerControllerProps> = ({
  interactables,
  worldBoundsRadius = 62,
}) => {
  const { camera, gl } = useThree();

  const player = useGameStore((s) => s.player);
  const localPosition = useGameStore((s) => s.localPosition);
  const localRotationY = useGameStore((s) => s.localRotationY);
  const localActionState = useGameStore((s) => s.localActionState);
  const localChatBubble = useGameStore((s) => s.localChatBubble);
  const targetMovePosition = useGameStore((s) => s.targetMovePosition);
  const joystickVector = useGameStore((s) => s.joystickVector);
  const activeModal = useGameStore((s) => s.activeModal);
  const activeCinematic = useGameStore((s) => s.activeCinematic);
  const activeVfx = useGameStore((s) => s.activeVfx);

  const updateLocalTransform = useGameStore((s) => s.updateLocalTransform);
  const setTargetMovePosition = useGameStore((s) => s.setTargetMovePosition);
  const setNearbyInteractable = useGameStore((s) => s.setNearbyInteractable);
  const performMeritActivity = useGameStore((s) => s.performMeritActivity);
  const tapPrayerBead = useGameStore((s) => s.tapPrayerBead);
  const startDharmaSession = useGameStore((s) => s.startDharmaSession);
  const sendQuickChat = useGameStore((s) => s.sendQuickChat);
  const triggerContextualInteract = useGameStore(
    (s) => s.triggerContextualInteract
  );

  const playerGroupRef = useRef<THREE.Group>(null);
  const vfxGroupRef = useRef<THREE.Group>(null);
  const posRef = useRef<THREE.Vector3>(
    new THREE.Vector3(localPosition.x, localPosition.y, localPosition.z)
  );
  const rotYRef = useRef<number>(localRotationY);

  // Camera spherical coordinates around player
  const camYawRef = useRef<number>(0);
  const camPitchRef = useRef<number>(0.42);
  const camDistRef = useRef<number>(9.5);
  const isDraggingCamRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const keysPressedRef = useRef<Set<string>>(new Set());

  // Sync position ref when teleporting realms/floors
  useEffect(() => {
    const dx = localPosition.x - posRef.current.x;
    const dz = localPosition.z - posRef.current.z;
    if (dx * dx + dz * dz > 9) {
      posRef.current.set(localPosition.x, localPosition.y, localPosition.z);
      if (playerGroupRef.current) {
        playerGroupRef.current.position.copy(posRef.current);
      }
    }
  }, [localPosition.x, localPosition.y, localPosition.z]);

  // Keyboard & Mouse camera controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const code = e.code;
      keysPressedRef.current.add(code);

      if (useGameStore.getState().activeModal !== 'none') return;

      if (code === 'Digit1') performMeritActivity('bow_buddha');
      else if (code === 'Digit2') performMeritActivity('meditate_session');
      else if (code === 'Digit3') tapPrayerBead();
      else if (code === 'Digit4') performMeritActivity('offer_incense');
      else if (code === 'Digit5') startDharmaSession();
      else if (code === 'Digit6') sendQuickChat('chat_adidaphat');
      else if (code === 'KeyE' || code === 'KeyF') {
        triggerContextualInteract();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.code);
    };

    const domElement = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button === 2 || e.button === 0) {
        isDraggingCamRef.current = true;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingCamRef.current) return;
      const dx = e.clientX - prevPointerRef.current.x;
      const dy = e.clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };

      camYawRef.current -= dx * 0.0065;
      camPitchRef.current = Math.max(
        0.15,
        Math.min(1.15, camPitchRef.current + dy * 0.0055)
      );
    };

    const handlePointerUp = () => {
      isDraggingCamRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      camDistRef.current = Math.max(
        4.5,
        Math.min(22, camDistRef.current + e.deltaY * 0.008)
      );
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('wheel', handleWheel, { passive: true });
    domElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [
    gl.domElement,
    performMeritActivity,
    sendQuickChat,
    startDharmaSession,
    tapPrayerBead,
    triggerContextualInteract,
  ]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const keys = keysPressedRef.current;

    // Rotate camera with Q / LeftBracket or RightBracket if desired
    let moveForward = 0;
    let moveRight = 0;

    if (activeModal === 'none' && !activeCinematic) {
      if (keys.has('KeyW') || keys.has('ArrowUp')) moveForward += 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) moveForward -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) moveRight += 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) moveRight -= 1;

      if (Math.abs(joystickVector.x) > 0.05 || Math.abs(joystickVector.y) > 0.05) {
        moveRight += joystickVector.x;
        moveForward -= joystickVector.y;
      }
    }

    const isSprinting = keys.has('ShiftLeft') || keys.has('ShiftRight');
    const baseSpeed = isSprinting ? 8.8 : 5.6;

    let isMoving = false;
    const moveDir = new THREE.Vector3();

    if (Math.abs(moveForward) > 0.01 || Math.abs(moveRight) > 0.01) {
      // Cancel click-to-move if player uses manual WASD/Joystick
      if (targetMovePosition) setTargetMovePosition(null);

      const forwardVec = new THREE.Vector3(
        -Math.sin(camYawRef.current),
        0,
        -Math.cos(camYawRef.current)
      ).normalize();
      const rightVec = new THREE.Vector3(
        Math.cos(camYawRef.current),
        0,
        -Math.sin(camYawRef.current)
      ).normalize();

      moveDir
        .addScaledVector(forwardVec, moveForward)
        .addScaledVector(rightVec, moveRight)
        .normalize();

      posRef.current.addScaledVector(moveDir, baseSpeed * dt);
      rotYRef.current = Math.atan2(moveDir.x, moveDir.z);
      isMoving = true;
    } else if (targetMovePosition && activeModal === 'none') {
      const toTarget = new THREE.Vector3(
        targetMovePosition.x - posRef.current.x,
        0,
        targetMovePosition.z - posRef.current.z
      );
      const dist = toTarget.length();
      if (dist > 0.35) {
        toTarget.normalize();
        posRef.current.addScaledVector(toTarget, baseSpeed * dt);
        rotYRef.current = Math.atan2(toTarget.x, toTarget.z);
        isMoving = true;
      } else {
        setTargetMovePosition(null);
      }
    }

    // Clamp to world radius
    const radialDistSq =
      posRef.current.x * posRef.current.x + posRef.current.z * posRef.current.z;
    if (radialDistSq > worldBoundsRadius * worldBoundsRadius) {
      const len = Math.sqrt(radialDistSq);
      posRef.current.x = (posRef.current.x / len) * worldBoundsRadius;
      posRef.current.z = (posRef.current.z / len) * worldBoundsRadius;
    }

    if (playerGroupRef.current) {
      playerGroupRef.current.position.copy(posRef.current);
      // Smooth angular interpolation
      const curRot = playerGroupRef.current.rotation.y;
      let diff = rotYRef.current - curRot;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      playerGroupRef.current.rotation.y = curRot + diff * Math.min(1, dt * 12);
    }

    // Update store transform & actionState
    if (isMoving) {
      const nextMoveState = isSprinting ? 'run' : 'walk';
      updateLocalTransform(
        {
          x: Number(posRef.current.x.toFixed(2)),
          y: Number(posRef.current.y.toFixed(2)),
          z: Number(posRef.current.z.toFixed(2)),
        },
        Number(rotYRef.current.toFixed(2)),
        nextMoveState
      );
    } else if (
      localActionState === 'walk' ||
      localActionState === 'run'
    ) {
      updateLocalTransform(
        {
          x: Number(posRef.current.x.toFixed(2)),
          y: Number(posRef.current.y.toFixed(2)),
          z: Number(posRef.current.z.toFixed(2)),
        },
        Number(rotYRef.current.toFixed(2)),
        'idle'
      );
    }

    // Proximity check for nearby interactable zones/NPCs/altars
    let closestTarget: InteractableTarget | null = null;
    let closestDistSq = 4.6 * 4.6; // 4.6m interaction radius

    for (const item of interactables) {
      const dx = item.position.x - posRef.current.x;
      const dz = item.position.z - posRef.current.z;
      const dSq = dx * dx + dz * dz;
      if (dSq < closestDistSq) {
        closestDistSq = dSq;
        closestTarget = item;
      }
    }

    const currentNearby = useGameStore.getState().nearbyInteractable;
    if (currentNearby?.id !== closestTarget?.id) {
      setNearbyInteractable(closestTarget);
    }

    // Third-person camera follow + cinematic camera override
    const t = clock.getElapsedTime();
    if (activeCinematic) {
      const orbitAngle = t * 0.65;
      const radius = 5.8;
      const targetCamPos = new THREE.Vector3(
        posRef.current.x + Math.sin(orbitAngle) * radius,
        posRef.current.y + 3.2,
        posRef.current.z + Math.cos(orbitAngle) * radius
      );
      camera.position.lerp(targetCamPos, dt * 4);
      camera.lookAt(
        posRef.current.x,
        posRef.current.y + 1.5,
        posRef.current.z
      );
    } else {
      const horizDist = camDistRef.current * Math.cos(camPitchRef.current);
      const vertDist = camDistRef.current * Math.sin(camPitchRef.current);

      const desiredCamPos = new THREE.Vector3(
        posRef.current.x + Math.sin(camYawRef.current) * horizDist,
        Math.max(1.2, posRef.current.y + 1.4 + vertDist),
        posRef.current.z + Math.cos(camYawRef.current) * horizDist
      );

      camera.position.lerp(desiredCamPos, Math.min(1, dt * 10));
      camera.lookAt(
        posRef.current.x,
        posRef.current.y + 1.35,
        posRef.current.z
      );
    }

    // Animate active VFX ring/particles
    if (vfxGroupRef.current && activeVfx) {
      const age = (Date.now() - activeVfx.timestamp) / 1000;
      vfxGroupRef.current.visible = age < 3.2;
      if (age < 3.2) {
        vfxGroupRef.current.position.set(
          posRef.current.x,
          posRef.current.y + 0.1,
          posRef.current.z
        );
        vfxGroupRef.current.rotation.y = t * 2.2;
        const s = 1 + age * 1.1;
        vfxGroupRef.current.scale.set(s, 1 + age * 0.5, s);
      }
    }
  });

  if (!player) return null;

  return (
    <>
      <group ref={playerGroupRef}>
        <CharacterModel
          username={player.username}
          appearance={player.appearance}
          rankStage={player.rankStage}
          actionState={localActionState}
          isLocalPlayer
          chatBubble={localChatBubble}
        />
      </group>

      {/* Click-to-move Ground Waypoint Ring */}
      {targetMovePosition && (
        <group
          position={[targetMovePosition.x, 0.05, targetMovePosition.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <mesh>
            <ringGeometry args={[0.35, 0.52, 24]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} />
          </mesh>
        </group>
      )}

      {/* Active Merit Activity 3D VFX Burst */}
      <group ref={vfxGroupRef} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[0.6, 0.95, 32]} />
          <meshBasicMaterial
            color={
              activeVfx?.type === 'lotus_bloom'
                ? '#f472b6'
                : activeVfx?.type === 'bell_ripple'
                  ? '#38bdf8'
                  : '#fbbf24'
            }
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Rising Golden Sparks / Lanterns */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 0.75,
                0.8 + (i % 3) * 0.45,
                Math.sin(angle) * 0.75,
              ]}
            >
              <octahedronGeometry args={[0.08, 0]} />
              <meshBasicMaterial color="#fde047" />
            </mesh>
          );
        })}
      </group>
    </>
  );
};
