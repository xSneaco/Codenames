'use client';

import React from 'react';
import { WordCard } from './WordCard';
import { GameState } from '@/types';

interface GameBoardProps {
  gameState: GameState;
  isSpymaster: boolean;
  canReveal: boolean;
  onReveal: (position: number) => void;
}

export function GameBoard({ gameState, isSpymaster, canReveal, onReveal }: GameBoardProps) {
  return (
    <div className="game-board w-full max-w-5xl mx-auto">
      {gameState.words.map((card) => (
        <WordCard
          key={card.position}
          card={card}
          isSpymaster={isSpymaster}
          canReveal={canReveal}
          onReveal={onReveal}
        />
      ))}
    </div>
  );
}
