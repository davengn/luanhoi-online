import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { GameCanvas } from './scene/GameCanvas';
import { MainHUD } from './ui/MainHUD';
import { Cinematics } from './ui/Cinematics';
import { WisdomModal } from './ui/WisdomModal';
import { HellLedgerModal } from './ui/HellLedgerModal';
import { TribulationModal } from './ui/TribulationModal';
import { QuestsAndEventsModal } from './ui/QuestsAndEventsModal';
import { SocialAndShopModal } from './ui/SocialAndShopModal';

export const App: React.FC = () => {
  const isInitialized = useGameStore((s) => s.isInitialized);
  const initSession = useGameStore((s) => s.initSession);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal('none');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setActiveModal]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0c0a12] select-none">
      {/* 3D WebGL / React Three Fiber World */}
      <GameCanvas />

      {/* Main Spiritual RPG HUD */}
      {isInitialized && (
        <>
          <MainHUD />
          <WisdomModal />
          <HellLedgerModal />
          <TribulationModal />
          <QuestsAndEventsModal />
          <SocialAndShopModal />
          <Cinematics />
        </>
      )}
    </main>
  );
};

export default App;
