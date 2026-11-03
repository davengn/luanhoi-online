import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { HELL_LEVELS, getHellLevelByNumber } from '@shared/loreData';
import { useGameStore } from '../store/gameStore';
import { HumanRealm } from './HumanRealm';
import { CelestialRealm } from './CelestialRealm';
import { UnderworldRealm } from './UnderworldRealm';

export const GameCanvas: React.FC = () => {
  const player = useGameStore((s) => s.player);
  const graphicsQuality = useGameStore((s) => s.graphicsQuality);
  const underworldSubZone = useGameStore((s) => s.underworldSubZone);
  const activeHellFloor = useGameStore((s) => s.activeHellFloor);

  const realm = player?.currentRealm || 'human';

  const dpr: [number, number] =
    graphicsQuality === 'Low'
      ? [1, 1]
      : graphicsQuality === 'Medium'
        ? [1, 1.25]
        : [1, 1.75];

  const enableShadows = graphicsQuality !== 'Low';

  const envTheme = useMemo(() => {
    if (realm === 'celestial') {
      return {
        bgColor: '#0c192c',
        fogColor: '#162c46',
        fogDensity: 0.009,
        dirColor: '#fffdf5',
        dirIntensity: 2.1,
        hemiSky: '#c7ecee',
        hemiGround: '#f6e58d',
        hemiIntensity: 0.85,
      };
    }

    if (realm === 'underworld') {
      if (underworldSubZone === 'hell_floor') {
        const floorCfg = getHellLevelByNumber(activeHellFloor) || HELL_LEVELS[0];
        return {
          bgColor: floorCfg.colorPalette.fogColor,
          fogColor: floorCfg.colorPalette.fogColor,
          fogDensity: 0.017,
          dirColor: floorCfg.colorPalette.ambientLight,
          dirIntensity: 1.15,
          hemiSky: floorCfg.colorPalette.ambientLight,
          hemiGround: floorCfg.colorPalette.primary,
          hemiIntensity: 0.55,
        };
      }

      return {
        bgColor: '#120d1d',
        fogColor: '#1a1228',
        fogDensity: 0.015,
        dirColor: '#c084fc',
        dirIntensity: 1.1,
        hemiSky: '#3b0764',
        hemiGround: '#090514',
        hemiIntensity: 0.5,
      };
    }

    // Default: Phàm Giới (Human Realm Golden Hour)
    return {
      bgColor: '#1e1916',
      fogColor: '#2d241c',
      fogDensity: 0.011,
      dirColor: '#ffe29a',
      dirIntensity: 1.85,
      hemiSky: '#87ceeb',
      hemiGround: '#4a3b2c',
      hemiIntensity: 0.72,
    };
  }, [realm, underworldSubZone, activeHellFloor]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Canvas
        shadows={enableShadows}
        dpr={dpr}
        camera={{ position: [0, 6.5, 26], fov: 50, near: 0.2, far: 180 }}
      >
        <color attach="background" args={[envTheme.bgColor]} />
        <fogExp2
          attach="fog"
          args={[envTheme.fogColor, envTheme.fogDensity]}
        />

        {/* Ambient & Hemisphere Lighting */}
        <hemisphereLight
          args={[
            envTheme.hemiSky,
            envTheme.hemiGround,
            envTheme.hemiIntensity,
          ]}
        />

        {/* Primary Directional Light */}
        <directionalLight
          position={[25, 38, 22]}
          color={envTheme.dirColor}
          intensity={envTheme.dirIntensity}
          castShadow={enableShadows}
          shadow-mapSize-width={graphicsQuality === 'High' ? 2048 : 1024}
          shadow-mapSize-height={graphicsQuality === 'High' ? 2048 : 1024}
          shadow-camera-near={1}
          shadow-camera-far={110}
          shadow-camera-left={-38}
          shadow-camera-right={38}
          shadow-camera-top={38}
          shadow-camera-bottom={-38}
        />

        {/* Starry Celestial / Evening Sky Dome */}
        {graphicsQuality !== 'Low' && (
          <Stars
            radius={85}
            depth={40}
            count={graphicsQuality === 'High' ? 2200 : 1000}
            factor={realm === 'celestial' ? 4.5 : 2.8}
            saturation={0.5}
            fade
            speed={0.6}
          />
        )}

        {/* Active 3D Realm Scene */}
        {realm === 'human' && <HumanRealm />}
        {realm === 'celestial' && <CelestialRealm />}
        {realm === 'underworld' && <UnderworldRealm />}
      </Canvas>
    </div>
  );
};
