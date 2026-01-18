'use client';

import { Card, CardBody, Chip } from '@heroui/react';
import { Star } from 'lucide-react';
import { Player, Team } from '@/types';

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
  if (!team) return null;

  const spymasters = players.filter((p) => p.role === 'spymaster');
  const operatives = players.filter((p) => p.role === 'operative');

  const baseBorder = team === 'red' ? 'border-red-500/20' : 'border-blue-500/20';
  const activeBorder = team === 'red' ? 'border-red-500' : 'border-blue-500';
  const bg = team === 'red' ? 'bg-red-900/10' : 'bg-blue-900/10';
  const text = team === 'red' ? 'text-red-500' : 'text-blue-500';

  return (
    <Card
      className={`transition-all duration-300 w-full ${bg} ${isCurrentTurn ? activeBorder : baseBorder} border-2`}
    >
      <CardBody className="p-4 overflow-visible">
        {/* Team Header */}
        <div className="flex items-center justify-between mb-4 relative">
          <span
            className={`text-xl font-black uppercase tracking-widest ${text}`}
          >
            {team}
          </span>
          {isCurrentTurn && (
             <div className="relative">
                <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${team === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div className={`relative w-3 h-3 rounded-full ${team === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
             </div>
          )}
        </div>

        {/* Words Remaining */}
        <div className="bg-black/30 rounded-xl p-6 mb-4 text-center border border-white/5 relative overflow-hidden group">
          <span className={`relative z-10 text-6xl font-black ${text} leading-none block transform transition-transform group-hover:scale-110 duration-300`}>
            {wordsRemaining}
          </span>
          <p className="relative z-10 text-[10px] text-text-secondary uppercase tracking-[0.2em] mt-2 opacity-60">
            Agents Remain
          </p>
        </div>

        {/* Players */}
        <div className="flex flex-col gap-4">
          {/* Spymasters */}
          {spymasters.length > 0 && (
            <div>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-1.5 opacity-50 pl-1">
                Spymaster
              </p>
              {spymasters.map((player) => (
                <div
                  key={player.id}
                  className="p-2.5 rounded-lg bg-black/20 flex items-center gap-2 mb-1 border border-white/5"
                >
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-white flex-1 truncate">
                    {player.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Operatives */}
          {operatives.length > 0 && (
            <div>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-1.5 opacity-50 pl-1">
                Operatives
              </p>
              <div className="flex flex-wrap gap-1.5">
                {operatives.map((player) => (
                  <div
                    key={player.id}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5"
                  >
                    <span className="text-xs font-medium text-white/70">
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default TeamPanel;
