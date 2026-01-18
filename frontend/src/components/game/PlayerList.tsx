'use client';

import React from 'react';
import { Card, CardBody, CardHeader, Chip, Divider, Avatar } from '@heroui/react';
import { Player } from '@/types';
import { cn } from '@/lib/utils';

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: number;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  const redTeam = players.filter((p) => p.team === 'red');
  const blueTeam = players.filter((p) => p.team === 'blue');
  const unassigned = players.filter((p) => !p.team);

  const renderPlayer = (player: Player) => (
    <div
      key={player.id}
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg',
        player.id === currentPlayerId && 'bg-white/10'
      )}
    >
      <Avatar
        name={player.name.charAt(0).toUpperCase()}
        size="sm"
        className={cn(
          player.team === 'red' && 'bg-red-600',
          player.team === 'blue' && 'bg-blue-600',
          !player.team && 'bg-gray-600'
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {player.name}
          {player.id === currentPlayerId && (
            <span className="text-gray-400 text-xs ml-1">(you)</span>
          )}
        </p>
      </div>
      <div className="flex gap-1">
        {player.isHost && (
          <Chip size="sm" variant="flat" color="warning">
            Host
          </Chip>
        )}
        {player.role && (
          <Chip
            size="sm"
            variant="flat"
            color={player.role === 'spymaster' ? 'secondary' : 'default'}
          >
            {player.role === 'spymaster' ? '🕵️' : '👤'}
          </Chip>
        )}
      </div>
    </div>
  );

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-bold">Players ({players.length})</h3>
      </CardHeader>
      <CardBody className="pt-0 space-y-4">
        {/* Red Team */}
        {redTeam.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-red-400">
                Red Team ({redTeam.length})
              </span>
            </div>
            <div className="space-y-1">
              {redTeam.map(renderPlayer)}
            </div>
          </div>
        )}

        {/* Blue Team */}
        {blueTeam.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium text-blue-400">
                Blue Team ({blueTeam.length})
              </span>
            </div>
            <div className="space-y-1">
              {blueTeam.map(renderPlayer)}
            </div>
          </div>
        )}

        {/* Unassigned */}
        {unassigned.length > 0 && (
          <>
            {(redTeam.length > 0 || blueTeam.length > 0) && (
              <Divider className="my-2" />
            )}
            <div>
              <span className="text-sm font-medium text-gray-400 mb-2 block">
                Unassigned ({unassigned.length})
              </span>
              <div className="space-y-1">
                {unassigned.map(renderPlayer)}
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
