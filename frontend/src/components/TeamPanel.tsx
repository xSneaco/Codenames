import React from 'react';
import { Player, Team } from '../types';

interface TeamPanelProps {
  team: Team;
  players: Player[];
  isCurrentTurn: boolean;
  wordsRemaining: number;
}

const TeamPanel: React.FC<TeamPanelProps> = ({
  team,
  players,
  isCurrentTurn,
  wordsRemaining,
}) => {
  const teamColors = {
    red: {
      bg: 'bg-red-900/50',
      border: 'border-red-500',
      text: 'text-red-400',
      highlight: 'bg-red-500',
      activeBg: 'bg-red-900/70',
    },
    blue: {
      bg: 'bg-blue-900/50',
      border: 'border-blue-500',
      text: 'text-blue-400',
      highlight: 'bg-blue-500',
      activeBg: 'bg-blue-900/70',
    },
  };

  if (!team) return null;

  const colors = teamColors[team];
  const spymasters = players.filter((p) => p.role === 'spymaster');
  const operatives = players.filter((p) => p.role === 'operative');

  return (
    <div
      className={`rounded-xl border-2 ${colors.border} ${
        isCurrentTurn ? colors.activeBg : colors.bg
      } p-4 transition-all duration-300 ${
        isCurrentTurn ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-opacity-50' : ''
      }`}
      style={{ '--tw-ring-color': team === 'red' ? '#ef4444' : '#3b82f6' } as React.CSSProperties}
    >
      {/* Team Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${colors.text} uppercase tracking-wider`}>
          {team} Team
        </h3>
        {isCurrentTurn && (
          <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white animate-pulse">
            Your Turn
          </span>
        )}
      </div>

      {/* Words Remaining */}
      <div className="mb-4 p-3 bg-black/20 rounded-lg text-center">
        <div className={`text-3xl font-bold ${colors.text}`}>{wordsRemaining}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wide">
          Words Left
        </div>
      </div>

      {/* Players */}
      <div className="space-y-3">
        {/* Spymasters */}
        {spymasters.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Spymaster
            </div>
            {spymasters.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-2 p-2 bg-black/20 rounded-lg"
              >
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white text-sm font-medium truncate">
                  {player.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Operatives */}
        {operatives.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Operatives
            </div>
            {operatives.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-2 p-2 bg-black/20 rounded-lg mb-1"
              >
                <div className={`w-2 h-2 rounded-full ${colors.highlight}`} />
                <span className="text-white text-sm truncate">{player.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {players.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No players yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPanel;
