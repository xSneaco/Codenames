import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../contexts/GameContext';
import { useSocketContext } from '../contexts/SocketContext';
import { getLobby } from '../utils/api';
import { Lobby as LobbyType, Player, GameState, CurrentHint } from '../types';
import Lobby from '../components/Lobby';
import GameBoard from '../components/GameBoard';
import UsernameModal from '../components/UsernameModal';

const LobbyPage: React.FC = () => {
  const { lobbyId: urlLobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();

  const {
    gameState,
    currentPlayer,
    setGameState,
    setPlayers,
    setCurrentPlayer,
    setLobbyId,
    setCurrentHint,
  } = useGameContext();
  const { socket, isConnected, connect, disconnect } = useSocketContext();

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
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const lobby = await getLobby(urlLobbyId);
        setLobbyExists(true);
        setLobbyId(urlLobbyId);

        // Initialize state from existing lobby data
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
  }, [urlLobbyId, navigate, setLobbyId, setPlayers, setGameState]);

  // Connect to socket when we have username and lobby exists
  useEffect(() => {
    if (username && lobbyExists && !isConnected) {
      connect();
    }

    return () => {
      // Cleanup handled by socket context
    };
  }, [username, lobbyExists, isConnected, connect]);

  // Socket event listeners and join - set up listeners BEFORE emitting join
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
      setCurrentHint(null); // Clear any previous hint
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
      // We need to use the gameState from useGameContext to update turn
      // Since this is in a closure, we need to refetch game state or update differently
      // For now, log and the effect dependencies should handle re-subscription
      console.log('Turn changed to:', data.currentTurn);
      // Clear the current hint when turn changes
      setCurrentHint(null);
      // Force a state update by requesting new game state from server
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
      console.log(`Hint from ${data.spymasterName}: "${data.hint}" (${data.number})`);
      setCurrentHint(data);
    };

    const handleError = (message: string) => {
      console.error('Socket error:', message);
      setError(message);
    };

    // Register event listeners first
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

    // Then emit join if connected
    if (isConnected && username && urlLobbyId && !currentPlayer) {
      console.log('Emitting joinLobby:', { lobbyId: urlLobbyId, playerName: username });
      socket.emit('joinLobby', {
        lobbyId: urlLobbyId,
        playerName: username,
      });
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

  const handleUsernameSubmit = useCallback((name: string) => {
    setUsername(name);
    setShowUsernameModal(false);
  }, []);

  const handleBackToHome = () => {
    disconnect();
    navigate('/');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4" />
          <p className="text-gray-400">Loading lobby...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Oops!</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleBackToHome}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Username Modal
  if (showUsernameModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <UsernameModal isOpen={true} onSubmit={handleUsernameSubmit} />
      </div>
    );
  }

  // Connecting state
  if (!isConnected || !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4" />
          <p className="text-gray-400">Connecting to lobby...</p>
        </div>
      </div>
    );
  }

  // Render Lobby or GameBoard based on game status
  if (gameState && gameState.status !== 'waiting') {
    return <GameBoard />;
  }

  return <Lobby />;
};

export default LobbyPage;
