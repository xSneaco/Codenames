'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
  Tooltip,
} from '@heroui/react';
import { useSocket } from '@/contexts/SocketContext';
import { useGame } from '@/contexts/GameContext';
import { TeamSelection } from '@/components/lobby/TeamSelection';
import { GameBoard } from '@/components/game/GameBoard';
import { Scoreboard } from '@/components/game/Scoreboard';
import { HintDisplay } from '@/components/game/HintDisplay';
import { PlayerList } from '@/components/game/PlayerList';
import { GameOverModal } from '@/components/game/GameOverModal';

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const lobbyId = params.id as string;
  
  const { isConnected } = useSocket();
  const {
    player,
    players,
    gameState,
    currentHint,
    isInLobby,
    error,
    joinLobby,
    leaveLobby,
    selectTeam,
    selectRole,
    startGame,
    revealWord,
    giveHint,
    endTurn,
    newGame,
    clearError,
  } = useGame();

  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);

  // Join lobby on mount
  useEffect(() => {
    if (!isConnected || isInLobby) return;

    const playerName = sessionStorage.getItem('playerName');
    if (!playerName) {
      router.push('/');
      return;
    }

    const doJoin = async () => {
      setIsJoining(true);
      const success = await joinLobby(lobbyId, playerName);
      if (!success) {
        setJoinError(error || 'Failed to join lobby');
      }
      setIsJoining(false);
    };

    doJoin();
  }, [isConnected, isInLobby, lobbyId, joinLobby, router, error]);

  // Show game over modal when game ends
  useEffect(() => {
    if (gameState?.status === 'finished' && gameState?.winner) {
      setShowGameOver(true);
    }
  }, [gameState?.status, gameState?.winner]);

  // Handle leave lobby
  const handleLeave = () => {
    leaveLobby();
    router.push('/');
  };

  // Copy lobby code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(lobbyId);
  };

  // Loading state
  if (!isConnected || isJoining) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-gray-400">
            {!isConnected ? 'Connecting...' : 'Joining lobby...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (joinError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center space-y-4">
            <p className="text-red-500">{joinError}</p>
            <Button color="primary" onPress={() => router.push('/')}>
              Back to Home
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Not in lobby yet
  if (!isInLobby || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isSpymaster = player.role === 'spymaster';
  const isMyTurn = gameState?.currentTurn === player.team;
  const canReveal = isMyTurn && !isSpymaster && gameState?.currentPhase === 'guessing';
  const isGameActive = gameState?.status === 'playing';

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
              CODENAMES
            </h1>
            <Tooltip content="Click to copy lobby code">
              <Chip
                variant="bordered"
                className="cursor-pointer"
                onClick={handleCopyCode}
              >
                🔗 {lobbyId}
              </Chip>
            </Tooltip>
          </div>
          <div className="flex items-center gap-4">
            {player.team && (
              <Chip
                color={player.team === 'red' ? 'danger' : 'primary'}
                variant="solid"
              >
                {player.team.toUpperCase()} {isSpymaster ? '🕵️ Spymaster' : '👤 Operative'}
              </Chip>
            )}
            <Button color="default" variant="bordered" size="sm" onPress={handleLeave}>
              Leave
            </Button>
          </div>
        </div>
      </header>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-red-900/90 border border-red-500">
            <CardBody className="flex flex-row items-center gap-4 p-3">
              <p className="text-red-200">{error}</p>
              <Button size="sm" variant="light" onPress={clearError}>
                ✕
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {!isGameActive ? (
          /* Lobby - Team Selection */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">Select Your Team</h2>
                </CardHeader>
                <CardBody>
                  <TeamSelection
                    players={players}
                    currentPlayer={player}
                    onSelectTeam={selectTeam}
                    onSelectRole={selectRole}
                    onStartGame={startGame}
                    isHost={player.isHost}
                  />
                </CardBody>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <PlayerList players={players} currentPlayerId={player.id} />
            </div>
          </div>
        ) : (
          /* Active Game */
          <div className="space-y-6">
            {/* Scoreboard */}
            <Scoreboard
              redScore={gameState.redScore}
              blueScore={gameState.blueScore}
              redTotal={gameState.redTotal}
              blueTotal={gameState.blueTotal}
              currentTurn={gameState.currentTurn}
            />

            {/* Hint Display */}
            <HintDisplay
              currentHint={currentHint}
              isSpymaster={isSpymaster}
              isMyTurn={isMyTurn}
              currentPhase={gameState.currentPhase}
              currentTurn={gameState.currentTurn}
              onGiveHint={giveHint}
              onEndTurn={endTurn}
            />

            {/* Game Board */}
            <GameBoard
              gameState={gameState}
              isSpymaster={isSpymaster}
              canReveal={canReveal}
              onReveal={revealWord}
            />

            {/* Player List (Sidebar on larger screens) */}
            <div className="lg:hidden">
              <PlayerList players={players} currentPlayerId={player.id} />
            </div>
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={showGameOver}
        winner={gameState?.winner || null}
        isHost={player.isHost}
        onNewGame={async () => {
          await newGame();
          setShowGameOver(false);
        }}
        onClose={() => setShowGameOver(false)}
      />
    </div>
  );
}
