'use client';

import React from 'react';
import { Chip } from '@heroui/react';
import { useSocket } from '@/contexts/SocketContext';

export function ConnectionStatus() {
  const { isConnected } = useSocket();

  return (
    <Chip
      size="sm"
      variant="dot"
      color={isConnected ? 'success' : 'danger'}
      className="fixed bottom-4 right-4"
    >
      {isConnected ? 'Connected' : 'Disconnected'}
    </Chip>
  );
}
