'use client';

import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { WordCard as WordCardType } from '@/types';
import { cn } from '@/lib/utils';

interface WordCardProps {
  card: WordCardType;
  isSpymaster: boolean;
  canReveal: boolean;
  onReveal: (position: number) => void;
}

export function WordCard({ card, isSpymaster, canReveal, onReveal }: WordCardProps) {
  const { word, type, revealed, position } = card;

  // Determine the card color based on state
  const getCardClasses = () => {
    if (revealed) {
      switch (type) {
        case 'red':
          return 'word-card-red';
        case 'blue':
          return 'word-card-blue';
        case 'neutral':
          return 'word-card-neutral';
        case 'assassin':
          return 'word-card-assassin';
        default:
          return 'word-card-hidden';
      }
    }

    // For spymaster, show color hints
    if (isSpymaster) {
      switch (type) {
        case 'red':
          return 'bg-red-900/50 border-2 border-red-500';
        case 'blue':
          return 'bg-blue-900/50 border-2 border-blue-500';
        case 'neutral':
          return 'bg-amber-900/30 border-2 border-amber-500/50';
        case 'assassin':
          return 'bg-gray-900 border-2 border-gray-500';
        default:
          return 'word-card-hidden';
      }
    }

    return 'word-card-hidden hover:bg-slate-500';
  };

  const isClickable = canReveal && !revealed && !isSpymaster;

  return (
    <Card
      className={cn(
        'word-card cursor-default select-none',
        getCardClasses(),
        isClickable && 'cursor-pointer hover:scale-105 hover:shadow-lg',
        revealed && 'card-reveal'
      )}
      isPressable={isClickable}
      onPress={() => isClickable && onReveal(position)}
    >
      <CardBody className="flex items-center justify-center p-2 md:p-4">
        <span
          className={cn(
            'text-center font-bold uppercase tracking-wide',
            'text-xs sm:text-sm md:text-base lg:text-lg',
            revealed && type === 'assassin' && 'text-red-500',
            !revealed && isSpymaster && type === 'assassin' && 'text-red-400'
          )}
        >
          {word}
        </span>
      </CardBody>
    </Card>
  );
}
