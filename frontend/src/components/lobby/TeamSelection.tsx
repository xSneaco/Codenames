'use client';

import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Divider } from '@heroui/react';
import { Player } from '@/types';
import { cn } from '@/lib/utils';

interface TeamSelectionProps {
  players: Player[];
  currentPlayer: Player;
  onSelectTeam: (team: 'red' | 'blue') => void;
  onSelectRole: (role: 'spymaster' | 'operative') => void;
  onStartGame: () => void;
  isHost: boolean;
}

export function TeamSelection({
  players,
  currentPlayer,
  onSelectTeam,
  onSelectRole,
  onStartGame,
  isHost,
}: TeamSelectionProps) {
  const redTeam = players.filter((p) => p.team === 'red');
  const blueTeam = players.filter((p) => p.team === 'blue');
  
  const redSpymaster = redTeam.find((p) => p.role === 'spymaster');
  const blueSpymaster = blueTeam.find((p) => p.role === 'spymaster');
  
  const canStart =
    redTeam.length >= 1 &&
    blueTeam.length >= 1 &&
    redSpymaster &&
    blueSpymaster &&
    players.length >= 4;

  const renderTeamCard = (team: 'red' | 'blue') => {
    const teamPlayers = team === 'red' ? redTeam : blueTeam;
    const spymaster = team === 'red' ? redSpymaster : blueSpymaster;
    const isCurrentTeam = currentPlayer.team === team;
    const teamColor = team === 'red' ? 'danger' : 'primary';

    return (
      <Card
        className={cn(
          'flex-1 min-w-[280px] transition-all',
          isCurrentTeam && (team === 'red' ? 'ring-2 ring-red-500' : 'ring-2 ring-blue-500')
        )}
      >
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-4 h-4 rounded-full',
                team === 'red' ? 'bg-red-500' : 'bg-blue-500'
              )}
            />
            <h3 className="text-lg font-bold capitalize">{team} Team</h3>
          </div>
          <Chip size="sm" variant="flat">
            {teamPlayers.length} player{teamPlayers.length !== 1 ? 's' : ''}
          </Chip>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Team Members */}
          <div className="space-y-2">
            {teamPlayers.map((player) => (
              <div
                key={player.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg',
                  player.id === currentPlayer.id && 'bg-white/10'
                )}
              >
                <span className="text-sm">
                  {player.name}
                  {player.id === currentPlayer.id && (
                    <span className="text-gray-400 text-xs ml-1">(you)</span>
                  )}
                </span>
                <div className="flex gap-1">
                  {player.isHost && (
                    <Chip size="sm" variant="flat" color="warning">
                      Host
                    </Chip>
                  )}
                  {player.role === 'spymaster' && (
                    <Chip size="sm" variant="flat" color="secondary">
                      🕵️ Spymaster
                    </Chip>
                  )}
                  {player.role === 'operative' && (
                    <Chip size="sm" variant="flat">
                      👤 Operative
                    </Chip>
                  )}
                </div>
              </div>
            ))}
            {teamPlayers.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                No players yet
              </p>
            )}
          </div>

          <Divider />

          {/* Join Team Button */}
          {!isCurrentTeam && (
            <Button
              color={teamColor}
              variant="solid"
              className="w-full"
              onPress={() => onSelectTeam(team)}
            >
              Join {team.charAt(0).toUpperCase() + team.slice(1)} Team
            </Button>
          )}

          {/* Role Selection */}
          {isCurrentTeam && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 text-center">Choose your role:</p>
              <div className="flex gap-2">
                <Button
                  color="secondary"
                  variant={currentPlayer.role === 'spymaster' ? 'solid' : 'bordered'}
                  className="flex-1"
                  isDisabled={!!spymaster && spymaster.id !== currentPlayer.id}
                  onPress={() => onSelectRole('spymaster')}
                >
                  🕵️ Spymaster
                </Button>
                <Button
                  variant={currentPlayer.role === 'operative' ? 'solid' : 'bordered'}
                  className="flex-1"
                  onPress={() => onSelectRole('operative')}
                >
                  👤 Operative
                </Button>
              </div>
              {spymaster && spymaster.id !== currentPlayer.id && (
                <p className="text-xs text-gray-500 text-center">
                  {spymaster.name} is the spymaster
                </p>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        {renderTeamCard('red')}
        {renderTeamCard('blue')}
      </div>

      {/* Start Game Button */}
      {isHost && (
        <div className="flex flex-col items-center gap-2">
          <Button
            color="success"
            size="lg"
            className="px-12"
            isDisabled={!canStart}
            onPress={onStartGame}
          >
            Start Game
          </Button>
          {!canStart && (
            <p className="text-sm text-gray-400 text-center">
              Need at least 4 players with both teams having a spymaster
            </p>
          )}
        </div>
      )}

      {!isHost && (
        <p className="text-center text-gray-400">
          Waiting for the host to start the game...
        </p>
      )}
    </div>
  );
}
