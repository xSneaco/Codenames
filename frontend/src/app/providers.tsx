'use client';

import { HeroUIProvider } from '@heroui/react';
import { SocketProvider } from '@/contexts/SocketContext';
import { GameProvider } from '@/contexts/GameContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <SocketProvider>
        <GameProvider>{children}</GameProvider>
      </SocketProvider>
    </HeroUIProvider>
  );
}
