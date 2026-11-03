import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RealmId, RemotePlayerState } from '@shared/types';
import { useGameStore } from '../store/gameStore';
import { CharacterModel } from './CharacterModel';

interface InterpolatedRemotePlayerProps {
  player: RemotePlayerState;
}

const InterpolatedRemotePlayer: React.FC<InterpolatedRemotePlayerProps> = ({
  player,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef<THREE.Vector3>(
    new THREE.Vector3(player.position.x, player.position.y, player.position.z)
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.1);
    const target = new THREE.Vector3(
      player.position.x,
      player.position.y,
      player.position.z
    );
    currentPos.current.lerp(target, Math.min(1, dt * 10));
    groupRef.current.position.copy(currentPos.current);

    let rotDiff = player.rotationY - groupRef.current.rotation.y;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    groupRef.current.rotation.y += rotDiff * Math.min(1, dt * 10);
  });

  return (
    <group ref={groupRef}>
      <CharacterModel
        username={player.username}
        appearance={player.appearance}
        rankStage={player.rankStage}
        actionState={player.actionState}
        chatBubble={player.chatBubble}
      />
    </group>
  );
};

/**
 * Renders both live WebSocket remote players AND ambient Sangha disciples
 * so the monastery, celestial court, and underworld always feel alive and communal.
 */
export const RemotePlayers: React.FC<{ realm: RealmId }> = ({ realm }) => {
  const remotePlayers = useGameStore((s) => s.remotePlayers);

  const ambientDisciples: RemotePlayerState[] = useMemo(() => {
    if (realm === 'human') {
      return [
        {
          id: 'ambient_disciple_1',
          username: 'Tịnh Hải Cư Sĩ',
          rankStage: 3,
          level: 8,
          merit: 420,
          karmaBalance: 420,
          currentRealm: 'human',
          hellSentenceLevel: 0,
          position: { x: -4.2, y: 0, z: -5.5 },
          rotationY: 0,
          actionState: 'bow',
          appearance: {
            archetype: 'pilgrim',
            robeColor: '#6b7d8c',
            trimColor: '#d9c8a9',
            hairstyle: 'topknot',
            hairColor: '#1c1917',
            auraId: 'aura_warm_incense',
            accessoryId: 'mala_beads',
            titleId: 'Tu Hành Giả',
            nameplateStyle: 'wood',
          },
        },
        {
          id: 'ambient_disciple_2',
          username: 'Chơn Như Hành Giả',
          rankStage: 5,
          level: 16,
          merit: 1280,
          karmaBalance: 1250,
          currentRealm: 'human',
          hellSentenceLevel: 0,
          position: { x: 11.5, y: 0, z: 6.5 },
          rotationY: -0.8,
          actionState: 'meditate',
          appearance: {
            archetype: 'novice_monk',
            robeColor: '#d9822b',
            trimColor: '#f5d76e',
            hairstyle: 'shaved',
            hairColor: '#1c1917',
            auraId: 'aura_lotus_radiance',
            accessoryId: 'mala_beads',
            titleId: 'Tâm Sen Thanh Tịnh',
            nameplateStyle: 'jade',
          },
        },
        {
          id: 'ambient_disciple_3',
          username: 'Liên Hoa Đạo Hữu',
          rankStage: 4,
          level: 12,
          merit: 760,
          karmaBalance: 740,
          currentRealm: 'human',
          hellSentenceLevel: 0,
          position: { x: -12.5, y: 0, z: 8.2 },
          rotationY: 0.7,
          actionState: 'offer_lotus',
          appearance: {
            archetype: 'pilgrim',
            robeColor: '#f0f4f8',
            trimColor: '#9ad0ec',
            hairstyle: 'flowing',
            hairColor: '#1c1917',
            auraId: 'aura_lotus_radiance',
            accessoryId: 'lotus_halo',
            titleId: 'Tích Đức Giả',
            nameplateStyle: 'gold',
          },
        },
      ];
    }

    if (realm === 'celestial') {
      return [
        {
          id: 'ambient_immortal_1',
          username: 'Vân Tiêu Chân Tiên',
          rankStage: 9,
          level: 45,
          merit: 8200,
          karmaBalance: 8100,
          currentRealm: 'celestial',
          hellSentenceLevel: 0,
          position: { x: -6.5, y: 0, z: -4 },
          rotationY: 0.4,
          actionState: 'meditate',
          appearance: {
            archetype: 'immortal',
            robeColor: '#4a5596',
            trimColor: '#8be9fd',
            hairstyle: 'crowned',
            hairColor: '#f8fafc',
            auraId: 'aura_thunder_lotus',
            accessoryId: 'celestial_ribbon',
            titleId: 'Chân Tiên',
            nameplateStyle: 'celestial',
          },
        },
        {
          id: 'ambient_immortal_2',
          username: 'Huyền Hạc Kim Tiên',
          rankStage: 10,
          level: 62,
          merit: 12500,
          karmaBalance: 12300,
          currentRealm: 'celestial',
          hellSentenceLevel: 0,
          position: { x: 6.5, y: 0, z: -4 },
          rotationY: -0.4,
          actionState: 'pray_beads',
          appearance: {
            archetype: 'immortal',
            robeColor: '#b8860b',
            trimColor: '#fff6b3',
            hairstyle: 'crowned',
            hairColor: '#fef08a',
            auraId: 'aura_dharma_wheel',
            accessoryId: 'dharma_staff',
            titleId: 'Kim Tiên',
            nameplateStyle: 'gold',
          },
        },
      ];
    }

    return [
      {
        id: 'ambient_penitent_1',
        username: 'Hối Ngộ Hành Giả',
        rankStage: 2,
        level: 5,
        merit: 90,
        karmaBalance: -120,
        currentRealm: 'underworld',
        hellSentenceLevel: 1,
        position: { x: 4.5, y: 0, z: 5 },
        rotationY: -0.5,
        actionState: 'prostrate',
        appearance: {
          archetype: 'pilgrim',
          robeColor: '#3f3f46',
          trimColor: '#a1a1aa',
          hairstyle: 'topknot',
          hairColor: '#1c1917',
          auraId: 'aura_warm_incense',
          accessoryId: 'none',
          titleId: 'Người Sám Hối',
          nameplateStyle: 'karmic_fire',
        },
      },
    ];
  }, [realm]);

  const visibleRemote = remotePlayers.filter((p) => p.currentRealm === realm);

  return (
    <group>
      {visibleRemote.map((p) => (
        <InterpolatedRemotePlayer key={p.id} player={p} />
      ))}
      {ambientDisciples.map((p) => (
        <InterpolatedRemotePlayer key={p.id} player={p} />
      ))}
    </group>
  );
};
