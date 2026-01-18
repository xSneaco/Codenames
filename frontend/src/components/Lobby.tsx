'use client';

import { useState } from 'react';
import { Button, Card, CardBody, Chip, Tooltip } from '@heroui/react';
import { Copy, Check, Star, Users, Play } from 'lucide-react';
import { useGameContext } from '@/contexts/GameContext';
import { useSocketContext } from '@/contexts/SocketContext';
import { Team, Role, Player } from '@/types';
import WordlistUpload from './WordlistUpload';
import { colors } from '@/styles/colors';

const Lobby: React.FC = () => {
  const {
    lobbyId,
    players,
    currentPlayer,
    isHost,
    updatePlayerTeam,
    updatePlayerRole,
  } = useGameContext();
  const { socket } = useSocketContext();
  const [copied, setCopied] = useState(false);

  const redTeam = players.filter((p) => p.team === 'red');
  const blueTeam = players.filter((p) => p.team === 'blue');
  const unassigned = players.filter((p) => !p.team);

  const redSpymaster = redTeam.find((p) => p.role === 'spymaster');
  const blueSpymaster = blueTeam.find((p) => p.role === 'spymaster');

  const canStartGame =
    isHost &&
    redSpymaster &&
    blueSpymaster &&
    redTeam.length >= 2 &&
    blueTeam.length >= 2;

  const handleTeamSelect = (team: Team) => {
    if (socket && currentPlayer) {
      socket.emit('selectTeam', { playerId: currentPlayer.id, team });
      updatePlayerTeam(currentPlayer.id, team);
    }
  };

  const handleRoleSelect = (role: Role) => {
    if (socket && currentPlayer) {
      socket.emit('selectRole', { playerId: currentPlayer.id, role });
      updatePlayerRole(currentPlayer.id, role);
    }
  };

  const handleStartGame = () => {
    if (socket && canStartGame && lobbyId) {
      socket.emit('startGame', { lobbyId });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(lobbyId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TeamSection: React.FC<{
    team: 'red' | 'blue';
    teamPlayers: Player[];
    hasSpymaster: boolean;
  }> = ({ team, teamPlayers, hasSpymaster }) => {
    const isSelected = currentPlayer?.team === team;
    const isSpymaster = currentPlayer?.team === team && currentPlayer?.role === 'spymaster';
    const isOperative = currentPlayer?.team === team && currentPlayer?.role === 'operative';

    const teamConfig = {
      red: {
        title: 'Red Agents',
        bg: 'bg-red-500/5',
        border: 'border-red-500/20',
        activeBorder: 'border-red-500',
        text: 'text-red-500',
        hover: 'hover:border-red-500/50 hover:bg-red-500/10',
        button: 'bg-red-600',
        glow: ''
      },
      blue: {
        title: 'Blue Agents',
        bg: 'bg-blue-500/5',
        border: 'border-blue-500/20',
        activeBorder: 'border-blue-500',
        text: 'text-blue-500',
        hover: 'hover:border-blue-500/50 hover:bg-blue-500/10',
        button: 'bg-blue-600',
        glow: ''
      },
    };

    const c = teamConfig[team];

    return (
      <Card
        className={`flex-1 transition-all duration-300 ${c.bg} ${isSelected ? `${c.activeBorder}` : c.border} border-2 overflow-visible`}
      >
        <CardBody className="p-0">
          {/* Header */}
          <div className={`p-6 border-b ${c.border} flex justify-between items-center bg-black/20`}>
            <div>
              <h2 className={`text-2xl font-black uppercase tracking-widest ${c.text}`}>
                {c.title}
              </h2>
              <p className="text-text-secondary text-sm font-medium opacity-70">
                {teamPlayers.length} Operatives Ready
              </p>
            </div>
            {!isSelected && (
              <Button
                size="sm"
                className={`${c.button} text-white font-bold uppercase tracking-wider`}
                onPress={() => handleTeamSelect(team)}
              >
                Join Team
              </Button>
            )}
            {isSelected && (
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-xs font-bold text-white uppercase">Joined</span>
               </div>
            )}
          </div>

          <div className="p-6 flex flex-col gap-6 h-full">
            {/* Role Selection (Only visible if on team) */}
            {isSelected && (
              <div className="flex gap-2 p-1 bg-black/40 rounded-xl mb-2">
                <button
                  onClick={() => handleRoleSelect('operative')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    isOperative
                      ? 'bg-white text-black shadow-lg scale-[1.02]'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users size={16} />
                  Operative
                </button>
                <button
                  onClick={() => handleRoleSelect('spymaster')}
                  disabled={hasSpymaster && !isSpymaster}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    isSpymaster
                      ? 'bg-white text-black shadow-lg scale-[1.02]'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  } ${hasSpymaster && !isSpymaster ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <Star size={16} />
                  Spymaster
                </button>
              </div>
            )}

            {/* Player List */}
            <div className="flex flex-col gap-3 flex-1">
              {teamPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    player.id === currentPlayer?.id
                      ? 'bg-white/10 border-white/30'
                      : 'bg-black/20 border-white/5'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${player.role === 'spymaster' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-text-secondary'}`}>
                    {player.role === 'spymaster' ? <Star size={16} /> : <Users size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${player.id === currentPlayer?.id ? 'text-white' : 'text-text-secondary'}`}>
                      {player.name} {player.id === currentPlayer?.id && '(You)'}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest opacity-50">
                      {player.role}
                    </p>
                  </div>
                </div>
              ))}

              {teamPlayers.length === 0 && (
                <div className="text-center py-10 opacity-30 border-2 border-dashed border-white/10 rounded-xl">
                  <p className="text-sm font-medium uppercase tracking-widest">No Agents</p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-5" style={{ backgroundImage: 'url(/noise.png)' }}></div>

      {/* Top Bar - Lobby Info */}
      <div className="z-10 w-full p-4 flex justify-between items-center bg-[#1a1f29] border-b border-white/5">
        <h1 className="text-xl font-black uppercase tracking-widest text-white/90">
          Lobby
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/10">
            <span className="text-xs text-text-secondary uppercase tracking-wider font-bold">Code</span>
            <span className="text-lg font-mono font-bold text-white tracking-widest">{lobbyId}</span>
            <Tooltip content={copied ? "Copied!" : "Copy Code"} closeDelay={100}>
                <button
                onClick={handleCopy}
                className="ml-2 p-1.5 rounded-full hover:bg-white/10 transition-colors text-text-secondary hover:text-white"
                >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Main Content - Team Standoff */}
      <div className="z-10 flex-1 flex flex-col md:flex-row gap-6 p-6 overflow-hidden">

        {/* Red Team Area */}
        <div className="flex-1 flex flex-col overflow-hidden h-full">
           <TeamSection
              team="red"
              teamPlayers={redTeam}
              hasSpymaster={!!redSpymaster}
            />
        </div>

        {/* Center Divider / Info */}
        <div className="flex flex-col justify-center items-center gap-6 min-w-[200px]">
           <div className="w-[1px] h-20 bg-white/20 hidden md:block"></div>
           <div className="text-center">
             <div className="text-6xl font-black text-white/10 select-none">VS</div>
           </div>

           {/* Unassigned Players */}
           <div className="w-full flex flex-col gap-2">
             {unassigned.length > 0 && (
               <div className="bg-[#1a1f29] p-4 rounded-xl border border-white/10">
                 <div className="flex items-center gap-2 mb-3 text-text-secondary">
                   <Users size={14} />
                   <span className="text-xs uppercase tracking-widest font-bold">Spectators</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {unassigned.map((player) => (
                      <Chip key={player.id} size="sm" variant="flat" className="bg-white/10 text-white/80">
                        {player.name}
                      </Chip>
                   ))}
                 </div>
               </div>
             )}

             {isHost && lobbyId && (
               <div className="mt-4">
                 <WordlistUpload lobbyId={lobbyId} />
               </div>
             )}
           </div>

           <div className="w-[1px] h-20 bg-white/20 hidden md:block"></div>
        </div>

        {/* Blue Team Area */}
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          <TeamSection
              team="blue"
              teamPlayers={blueTeam}
              hasSpymaster={!!blueSpymaster}
            />
        </div>
      </div>

      {/* Bottom Bar - Actions */}
      <div className="z-20 p-6 bg-[#1a1f29] border-t border-white/5 flex flex-col justify-center items-center gap-3">
        {isHost ? (
          <>
            <Button
              size="lg"
              className={`min-w-[300px] h-14 text-lg font-bold uppercase tracking-wider text-white shadow-xl transition-all ${canStartGame ? 'translate-y-0 text-white' : 'translate-y-1 opacity-50'}`}
              style={{
                backgroundColor: canStartGame
                  ? colors.accent.main
                  : '#1f2937',
                boxShadow: 'none'
              }}
              isDisabled={!canStartGame}
              onPress={handleStartGame}
              startContent={canStartGame ? <Play size={24} fill="currentColor" /> : null}
            >
              Start Game
            </Button>
            {!canStartGame && (
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wide opacity-70">
                Requires 2+ players per team & spymasters assigned
              </p>
            )}
          </>
        ) : (
          <p className="text-text-secondary animate-pulse text-sm uppercase tracking-widest">
            Waiting for host to start...
          </p>
        )}
      </div>
    </div>
  );
};

export default Lobby;
