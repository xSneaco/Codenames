'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from '@heroui/react';
import { useGameContext } from '@/contexts/GameContext';
import { useSocketContext } from '@/contexts/SocketContext';
import { getLobby } from '@/utils/api';
import { Lobby as LobbyType, Player, GameState, CurrentHint } from '@/types';
import Lobby from '@/components/Lobby';
import GameBoard from '@/components/GameBoard';
import UsernameModal from '@/components/UsernameModal';
import { colors } from '@/styles/colors';

export default function LobbyPage() {
  const params = useParams();
  const urlLobbyId = params.lobbyId as string;
  const router = useRouter();

  const {
    gameState,
    currentPlayer,
    setGameState,
    setPlayers,
    setCurrentPlayer,
    setLobbyId,
    setCurrentHint,
  } = useGameContext();
  const { socket, isConnected, connect } = useSocketContext();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [lobbyExists, setLobbyExists] = useState(false);

  // Check for saved username on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('codenames_username');
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      setShowUsernameModal(true);
    }
  }, []);

  // Check if lobby exists
  useEffect(() => {
    const checkLobby = async () => {
      if (!urlLobbyId) {
        router.push('/');
        return;
      }

      try {
        setIsLoading(true);
        const lobby = await getLobby(urlLobbyId);
        setLobbyExists(true);
        setLobbyId(urlLobbyId);

        if (lobby.players) {
          setPlayers(lobby.players);
        }
        if (lobby.gameState) {
          setGameState(lobby.gameState);
        }
      } catch (err) {
        console.error('Lobby not found:', err);
        setError('Lobby not found. It may have expired or been deleted.');
        setLobbyExists(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLobby();
  }, [urlLobbyId, router, setLobbyId, setPlayers, setGameState]);

  // Connect to socket when we have username and lobby exists
  useEffect(() => {
    if (username && lobbyExists && !isConnected) {
      connect();
    }
  }, [username, lobbyExists, isConnected, connect]);

  // Socket event listeners and join
  useEffect(() => {
    if (!socket) return;

    const handlePlayerJoined = (player: Player) => {
      setPlayers((prev: Player[]) => {
        const exists = prev.find((p) => p.id === player.id);
        if (exists) return prev;
        return [...prev, player];
      });
    };

    const handlePlayerLeft = (playerId: string) => {
      setPlayers((prev: Player[]) => prev.filter((p) => p.id !== playerId));
    };

    const handleLobbyState = (lobby: LobbyType) => {
      setPlayers(lobby.players);
      if (lobby.gameState) {
        setGameState(lobby.gameState);
      }
    };

    const handlePlayerUpdate = (updatedPlayer: Player) => {
      setPlayers((prev: Player[]) =>
        prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
      );
      if (currentPlayer?.id === updatedPlayer.id) {
        setCurrentPlayer(updatedPlayer);
      }
    };

    const handleGameStarted = (state: GameState) => {
      console.log('Game started:', state);
      setGameState(state);
      setCurrentHint(null);
    };

    const handleGameUpdate = (state: GameState) => {
      console.log('Game updated:', state);
      setGameState(state);
    };

    const handleJoined = (data: { player: Player; lobby: LobbyType }) => {
      console.log('Received joined event:', data);
      setCurrentPlayer(data.player);
      setPlayers(data.lobby.players);
      if (data.lobby.gameState) {
        setGameState(data.lobby.gameState);
      }
    };

    const handleTeamUpdated = (data: { playerId: string; team: string }) => {
      setPlayers((prev: Player[]) =>
        prev.map((p) => (p.id === data.playerId ? { ...p, team: data.team as Player['team'] } : p))
      );
      if (currentPlayer?.id === data.playerId) {
        setCurrentPlayer({ ...currentPlayer, team: data.team as Player['team'] });
      }
    };

    const handleRoleUpdated = (data: { playerId: string; role: string }) => {
      setPlayers((prev: Player[]) =>
        prev.map((p) => (p.id === data.playerId ? { ...p, role: data.role as Player['role'] } : p))
      );
      if (currentPlayer?.id === data.playerId) {
        setCurrentPlayer({ ...currentPlayer, role: data.role as Player['role'] });
      }
    };

    const handleTurnChanged = (data: { currentTurn: 'red' | 'blue' }) => {
      console.log('Turn changed to:', data.currentTurn);
      setCurrentHint(null);
      if (socket && urlLobbyId) {
        socket.emit('getGameState', { lobbyId: urlLobbyId }, (response: { success: boolean; gameState?: GameState }) => {
          if (response.success && response.gameState) {
            setGameState(response.gameState);
          }
        });
      }
    };

    const handleHintGiven = (data: CurrentHint) => {
      console.log('Hint received:', data);
      setCurrentHint(data);
    };

    const handleError = (message: string) => {
      console.error('Socket error:', message);
      setError(message);
    };

    // Register event listeners
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('lobbyState', handleLobbyState);
    socket.on('playerUpdate', handlePlayerUpdate);
    socket.on('gameStarted', handleGameStarted);
    socket.on('gameUpdate', handleGameUpdate);
    socket.on('joined', handleJoined);
    socket.on('teamUpdated', handleTeamUpdated);
    socket.on('roleUpdated', handleRoleUpdated);
    socket.on('turnChanged', handleTurnChanged);
    socket.on('hintGiven', handleHintGiven);
    socket.on('error', handleError);

    // Emit join if connected
    if (isConnected && username && urlLobbyId && !currentPlayer) {
      console.log('Emitting joinLobby:', { lobbyId: urlLobbyId, playerName: username });
      socket.emit('joinLobby', { lobbyId: urlLobbyId, playerName: username });
    }

    return () => {
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('lobbyState', handleLobbyState);
      socket.off('playerUpdate', handlePlayerUpdate);
      socket.off('gameStarted', handleGameStarted);
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('joined', handleJoined);
      socket.off('teamUpdated', handleTeamUpdated);
      socket.off('roleUpdated', handleRoleUpdated);
      socket.off('turnChanged', handleTurnChanged);
      socket.off('hintGiven', handleHintGiven);
      socket.off('error', handleError);
    };
  }, [socket, isConnected, username, urlLobbyId, currentPlayer, setPlayers, setCurrentPlayer, setGameState, setCurrentHint]);

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    setShowUsernameModal(false);
  };

  if (showUsernameModal) {
    return <UsernameModal isOpen={true} onSubmit={handleUsernameSubmit} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e14] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
        <div className="flex flex-col items-center gap-6 z-10">
          <Spinner size="lg" color="white" />
          <p className="text-white/50 text-sm uppercase tracking-widest animate-pulse">Establishing Connection...</p>
        </div>
      </div>
    );
  }

  if (error || !lobbyExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e14] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
        <div className="flex flex-col items-center gap-6 z-10 max-w-md text-center p-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
             <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-3xl font-black text-white">Connection Failed</h2>
          <p className="text-text-secondary text-lg">
            {error || 'This lobby frequency does not exist or has been terminated.'}
          </p>
          <button
            className="mt-4 px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded hover:bg-gray-200 transition-colors"
            onClick={() => router.push('/')}
          >
            Abort Mission
          </button>
        </div>
      </div>
    );
  }

  // Show game board if game is in progress
  if (gameState && gameState.status !== 'waiting') {
    return <GameBoard />;
  }

  // Show lobby for team selection
  return <Lobby />;
}
