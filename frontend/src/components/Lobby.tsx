import React, { useState } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useSocketContext } from '../contexts/SocketContext';
import { Team, Role, Player } from '../types';
import PlayerList from './PlayerList';
import WordlistUpload from './WordlistUpload';

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

  const copyLobbyCode = async () => {
    if (lobbyId) {
      try {
        await navigator.clipboard.writeText(lobbyId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

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
    if (socket && canStartGame) {
      socket.emit('startGame');
    }
  };

  const TeamSection: React.FC<{
    team: 'red' | 'blue';
    teamPlayers: Player[];
    hasSpymaster: boolean;
  }> = ({ team, teamPlayers, hasSpymaster }) => {
    const isSelected = currentPlayer?.team === team;
    const isSpymaster = currentPlayer?.team === team && currentPlayer?.role === 'spymaster';
    const isOperative = currentPlayer?.team === team && currentPlayer?.role === 'operative';

    const colors = {
      red: {
        bg: 'bg-red-900/30',
        border: 'border-red-500',
        text: 'text-red-400',
        button: 'bg-red-600 hover:bg-red-700',
      },
      blue: {
        bg: 'bg-blue-900/30',
        border: 'border-blue-500',
        text: 'text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
    };

    const c = colors[team];

    return (
      <div
        className={`rounded-xl border-2 ${c.border} ${c.bg} p-4 transition-all duration-200`}
      >
        <h3 className={`text-lg font-bold ${c.text} uppercase tracking-wider mb-4`}>
          {team} Team
        </h3>

        {/* Team Players */}
        <div className="mb-4 min-h-[100px]">
          {teamPlayers.length > 0 ? (
            <div className="space-y-2">
              {teamPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 p-2 bg-black/20 rounded-lg"
                >
                  {player.role === 'spymaster' && (
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                  <span className="text-white text-sm flex-1 truncate">
                    {player.name}
                    {player.id === currentPlayer?.id && (
                      <span className="text-gray-500 ml-1">(You)</span>
                    )}
                  </span>
                  {player.role && (
                    <span className="text-xs text-gray-400 capitalize">
                      {player.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              No players yet
            </div>
          )}
        </div>

        {/* Join Team Button */}
        {!isSelected && (
          <button
            onClick={() => handleTeamSelect(team)}
            className={`w-full py-2 px-4 ${c.button} text-white font-medium rounded-lg transition-all duration-200`}
          >
            Join {team === 'red' ? 'Red' : 'Blue'} Team
          </button>
        )}

        {/* Role Selection (if on this team) */}
        {isSelected && (
          <div className="space-y-2">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">
              Select Role
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRoleSelect('spymaster')}
                disabled={hasSpymaster && !isSpymaster}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isSpymaster
                    ? 'bg-yellow-600 text-white'
                    : hasSpymaster
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Spymaster
              </button>
              <button
                onClick={() => handleRoleSelect('operative')}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isOperative
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                Operative
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 mb-4">
            Codenames
          </h1>

          {/* Lobby Code */}
          <div className="inline-flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
            <span className="text-gray-400 text-sm">Lobby Code:</span>
            <span className="text-white font-mono text-lg font-bold tracking-wider">
              {lobbyId}
            </span>
            <button
              onClick={copyLobbyCode}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy lobby code"
            >
              {copied ? (
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Red Team */}
          <TeamSection
            team="red"
            teamPlayers={redTeam}
            hasSpymaster={!!redSpymaster}
          />

          {/* Blue Team */}
          <TeamSection
            team="blue"
            teamPlayers={blueTeam}
            hasSpymaster={!!blueSpymaster}
          />
        </div>

        {/* Unassigned Players */}
        {unassigned.length > 0 && (
          <div className="mb-8 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">
              Waiting for Team ({unassigned.length})
            </h3>
            <PlayerList players={unassigned} currentPlayerId={currentPlayer?.id} />
          </div>
        )}

        {/* Host Controls */}
        {isHost && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-6">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 14.5l1.5-7.5L7.5 10l2.5-5 2.5 5 3.07-3 1.5 7.5H2.93z" />
                <path d="M2 16.5h16v1H2v-1z" />
              </svg>
              Host Controls
            </h3>

            {/* Wordlist Upload */}
            {lobbyId && <WordlistUpload lobbyId={lobbyId} />}

            {/* Start Game Button */}
            <div>
              <button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className={`w-full py-4 px-6 font-semibold text-lg rounded-xl transition-all duration-200 ${
                  canStartGame
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-[1.02] shadow-lg shadow-green-500/25'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Start Game
              </button>
              {!canStartGame && (
                <p className="text-gray-500 text-sm text-center mt-2">
                  {!redSpymaster || !blueSpymaster
                    ? 'Each team needs a Spymaster to start'
                    : redTeam.length < 2 || blueTeam.length < 2
                    ? 'Each team needs at least 2 players'
                    : 'Configure teams to start'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Non-host waiting message */}
        {!isHost && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-xl">
              <svg
                className="w-6 h-6 text-purple-400 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-300">Waiting for host to start the game...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
