import React from 'react';
import { Player } from '../types';

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentPlayerId }) => {
  const getTeamColor = (team: Player['team']) => {
    switch (team) {
      case 'red':
        return 'text-red-400';
      case 'blue':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTeamBg = (team: Player['team']) => {
    switch (team) {
      case 'red':
        return 'bg-red-500/10 border-red-500/30';
      case 'blue':
        return 'bg-blue-500/10 border-blue-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-2">
      {players.map((player) => (
        <div
          key={player.id}
          className={`flex items-center gap-3 p-3 rounded-lg border ${getTeamBg(
            player.team
          )} ${player.id === currentPlayerId ? 'ring-2 ring-purple-500' : ''}`}
        >
          {/* Host Crown */}
          {player.isHost && (
            <svg
              className="w-5 h-5 text-yellow-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2.93 14.5l1.5-7.5L7.5 10l2.5-5 2.5 5 3.07-3 1.5 7.5H2.93z" />
              <path d="M2 16.5h16v1H2v-1z" />
            </svg>
          )}

          {/* Player Name */}
          <span
            className={`font-medium flex-1 truncate ${getTeamColor(player.team)} ${
              player.id === currentPlayerId ? 'font-bold' : ''
            }`}
          >
            {player.name}
            {player.id === currentPlayerId && (
              <span className="ml-2 text-xs text-gray-500">(You)</span>
            )}
          </span>

          {/* Role Badge */}
          {player.role && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                player.role === 'spymaster'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {player.role === 'spymaster' && (
                <svg
                  className="w-3 h-3 inline mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
              {player.role}
            </span>
          )}

          {/* Team indicator if no team */}
          {!player.team && (
            <span className="text-xs text-gray-500">No team</span>
          )}
        </div>
      ))}

      {players.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No players in lobby
        </div>
      )}
    </div>
  );
};

export default PlayerList;
