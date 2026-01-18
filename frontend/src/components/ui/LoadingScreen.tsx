'use client';

import React from 'react';
import { Spinner } from '@heroui/react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner size="lg" color="primary" />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}
