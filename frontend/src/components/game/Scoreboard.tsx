'use client';

import React from 'react';
import { Card, CardBody, Chip, Progress } from '@heroui/react';
import { cn } from '@/lib/utils';

interface ScoreboardProps {
  redScore: number;
  blueScore: number;
  redTotal: number;
  blueTotal: number;
  currentTurn: 'red' | 'blue' | null;
  startingTeam?: 'red' | 'blue';
}

export function Scoreboard({
  redScore,
  blueScore,
  redTotal,
  blueTotal,
  currentTurn,
}: ScoreboardProps) {
  const redRemaining = redTotal - redScore;
  const blueRemaining = blueTotal - blueScore;

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
      {/* Red Team Score */}
      <Card
        className={cn(
          'flex-1 w-full transition-all duration-300',
          currentTurn === 'red'
            ? 'ring-2 ring-red-500 pulse-glow'
            : 'opacity-75'
        )}
        style={{ '--tw-ring-color': '#ef4444' } as React.CSSProperties}
      >
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Chip
              color="danger"
              variant="solid"
              size="sm"
              className="font-bold"
            >
              RED
            </Chip>
            <span className="text-2xl font-bold text-red-500">
              {redRemaining}
            </span>
          </div>
          <Progress
            color="danger"
            value={(redScore / redTotal) * 100}
            size="sm"
            className="mt-2"
          />
          <p className="text-xs text-gray-400 mt-1 text-center">
            {redScore} / {redTotal} found
          </p>
        </CardBody>
      </Card>

      {/* Blue Team Score */}
      <Card
        className={cn(
          'flex-1 w-full transition-all duration-300',
          currentTurn === 'blue'
            ? 'ring-2 ring-blue-500 pulse-glow'
            : 'opacity-75'
        )}
        style={{ '--tw-ring-color': '#3b82f6' } as React.CSSProperties}
      >
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Chip
              color="primary"
              variant="solid"
              size="sm"
              className="font-bold"
            >
              BLUE
            </Chip>
            <span className="text-2xl font-bold text-blue-500">
              {blueRemaining}
            </span>
          </div>
          <Progress
            color="primary"
            value={(blueScore / blueTotal) * 100}
            size="sm"
            className="mt-2"
          />
          <p className="text-xs text-gray-400 mt-1 text-center">
            {blueScore} / {blueTotal} found
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
