'use client';

import { ReactNode } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import { SocketProvider } from '@/contexts/SocketContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <GameProvider>{children}</GameProvider>
    </SocketProvider>
  );
}
