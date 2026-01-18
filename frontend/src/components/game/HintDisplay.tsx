'use client';

import React, { useState } from 'react';
import { Card, CardBody, Input, Button, Chip } from '@heroui/react';
import { Hint } from '@/types';
import { cn } from '@/lib/utils';

interface HintDisplayProps {
  currentHint: Hint | null;
  isSpymaster: boolean;
  isMyTurn: boolean;
  currentPhase: 'hint' | 'guessing';
  currentTurn: 'red' | 'blue' | null;
  onGiveHint: (hint: string, number: number) => void;
  onEndTurn: () => void;
}

export function HintDisplay({
  currentHint,
  isSpymaster,
  isMyTurn,
  currentPhase,
  currentTurn,
  onGiveHint,
  onEndTurn,
}: HintDisplayProps) {
  const [hintWord, setHintWord] = useState('');
  const [hintNumber, setHintNumber] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitHint = async () => {
    if (!hintWord.trim() || !hintNumber) return;
    
    setIsSubmitting(true);
    await onGiveHint(hintWord.trim(), parseInt(hintNumber, 10));
    setHintWord('');
    setHintNumber('1');
    setIsSubmitting(false);
  };

  const canGiveHint = isSpymaster && isMyTurn && currentPhase === 'hint';
  const canEndTurn = isMyTurn && currentPhase === 'guessing' && !isSpymaster;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardBody className="p-4">
        {/* Current Hint Display */}
        {currentHint && currentPhase === 'guessing' && (
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Chip
                color={currentHint.team === 'red' ? 'danger' : 'primary'}
                variant="flat"
                size="sm"
              >
                {currentHint.spymasterName}
              </Chip>
              <span className="text-gray-400">says:</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold uppercase tracking-wider">
                {currentHint.hint}
              </span>
              <Chip
                size="lg"
                variant="bordered"
                className="font-bold text-xl"
              >
                {currentHint.number}
              </Chip>
            </div>
          </div>
        )}

        {/* Spymaster Hint Input */}
        {canGiveHint && (
          <div className="space-y-4">
            <p className="text-center text-gray-400">
              Give a one-word hint and the number of cards it relates to
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Input
                placeholder="Enter your hint..."
                value={hintWord}
                onChange={(e) => setHintWord(e.target.value)}
                className="max-w-xs"
                size="lg"
                variant="bordered"
              />
              <Input
                type="number"
                min="0"
                max="9"
                value={hintNumber}
                onChange={(e) => setHintNumber(e.target.value)}
                className="w-24"
                size="lg"
                variant="bordered"
              />
              <Button
                color={currentTurn === 'red' ? 'danger' : 'primary'}
                size="lg"
                isDisabled={!hintWord.trim() || isSubmitting}
                isLoading={isSubmitting}
                onPress={handleSubmitHint}
              >
                Give Hint
              </Button>
            </div>
          </div>
        )}

        {/* Waiting for Hint */}
        {!currentHint && currentPhase === 'hint' && !canGiveHint && (
          <div className="text-center text-gray-400">
            <p className={cn(
              'text-lg',
              currentTurn === 'red' ? 'text-red-400' : 'text-blue-400'
            )}>
              Waiting for {currentTurn} spymaster to give a hint...
            </p>
          </div>
        )}

        {/* End Turn Button */}
        {canEndTurn && (
          <div className="flex justify-center mt-4">
            <Button
              color="warning"
              variant="flat"
              size="lg"
              onPress={onEndTurn}
            >
              End Turn
            </Button>
          </div>
        )}

        {/* Status Messages */}
        {isSpymaster && currentPhase === 'guessing' && isMyTurn && (
          <p className="text-center text-gray-400 mt-4">
            Your team is guessing...
          </p>
        )}
        
        {!isMyTurn && currentPhase === 'guessing' && (
          <p className="text-center text-gray-400 mt-4">
            Waiting for {currentTurn} team to make their guesses...
          </p>
        )}
      </CardBody>
    </Card>
  );
}
