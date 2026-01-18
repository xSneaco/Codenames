'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import {
  Player,
  GameState,
  Hint,
  JoinedPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  TeamUpdatedPayload,
  RoleUpdatedPayload,
  HintGivenPayload,
  JoinLobbyResponse,
} from '@/types';

interface GameContextType {
  // State
  player: Player | null;
  players: Player[];
  lobbyId: string | null;
  gameState: GameState | null;
  currentHint: Hint | null;
  isInLobby: boolean;
  isGameStarted: boolean;
  error: string | null;

  // Actions
  joinLobby: (lobbyId: string, playerName: string) => Promise<boolean>;
  leaveLobby: () => void;
  selectTeam: (team: 'red' | 'blue') => Promise<boolean>;
  selectRole: (role: 'spymaster' | 'operative') => Promise<boolean>;
  startGame: () => Promise<boolean>;
  revealWord: (position: number) => Promise<boolean>;
  giveHint: (hint: string, number: number) => Promise<boolean>;
  endTurn: () => Promise<boolean>;
  newGame: () => Promise<boolean>;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { socket, isConnected } = useSocket();

  const [player, setPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isInLobby = lobbyId !== null && player !== null;
  const isGameStarted = gameState !== null && gameState.status === 'playing';

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Join lobby
  const joinLobby = useCallback(async (lobbyIdInput: string, playerName: string): Promise<boolean> => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return false;
    }

    return new Promise((resolve) => {
      socket.emit(
        'joinLobby',
        { lobbyId: lobbyIdInput.toUpperCase(), playerName },
        (response: JoinLobbyResponse) => {
          if (response.success && response.player) {
            setPlayer(response.player);
            setLobbyId(lobbyIdInput.toUpperCase());
            resolve(true);
          } else {
            setError(response.error || 'Failed to join lobby');
            resolve(false);
          }
        }
      );
    });
  }, [socket, isConnected]);

  // Leave lobby
  const leaveLobby = useCallback(() => {
    if (!socket) return;

    socket.emit('leaveLobby', {}, () => {
      setPlayer(null);
      setPlayers([]);
      setLobbyId(null);
      setGameState(null);
      setCurrentHint(null);
    });
  }, [socket]);

  // Select team
  const selectTeam = useCallback(async (team: 'red' | 'blue'): Promise<boolean> => {
    if (!socket || !player) {
      setError('Not in a lobby');
      return false;
    }

    return new Promise((resolve) => {
      socket.emit(
        'selectTeam',
        { playerId: player.id, team },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            setPlayer((prev) => prev ? { ...prev, team } : null);
            resolve(true);
          } else {
            setError(response.error || 'Failed to select team');
            resolve(false);
          }
        }
      );
    });
  }, [socket, player]);

  // Select role
  const selectRole = useCallback(async (role: 'spymaster' | 'operative'): Promise<boolean> => {
    if (!socket || !player) {
      setError('Not in a lobby');
      return false;
    }

    return new Promise((resolve) => {
      socket.emit(
        'selectRole',
        { playerId: player.id, role },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            setPlayer((prev) => prev ? { ...prev, role } : null);
            resolve(true);
          } else {
            setError(response.error || 'Failed to select role');
            resolve(false);
          }
        }
      );
    });
  }, [socket, player]);

  // Start game
  const startGame = useCallback(async (): Promise<boolean> => {
    if (!socket || !lobbyId) {
      setError('Not in a lobby');
      return false;
    }

    return new Promise((resolve) => {
      socket.emit(
        'startGame',
        { lobbyId },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            resolve(true);
          } else {
            setError(response.error || 'Failed to start game');
            resolve(false);
          }
        }
      );
    });
  }, [socket, lobbyId]);

  // Reveal word
  const revealWord = useCallback(async (position: number): Promise<boolean> => {
    if (!socket || !lobbyId) {
      setError('Not in a game');
      return false;
    }

    return new Promise((resolve) => {
      socket.emit(
        'revealWord',
        { lobbyId, position },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            resolve(true);
          } else {
            setError(response.error || 'Failed to reveal word');
            resolve(false);
          }
        }
      );
    });
  }, [socket, lobbyId]);

  // Give hint
  const giveHint = useCallback(async (hint: string, number: number): Promise<boolean> => {
    if (!socket || !lobbyId) {
      setError('Not in a game');
      return false;
    }

    return new Promise((resolve) => {
      socket.emit(
        'giveHint',
        { lobbyId, hint, number },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            resolve(true);
          } else {
            setError(response.error || 'Failed to give hint');
            resolve(false);
          }
        }
      );
    });
  }, [socket, lobbyId]);

  // End turn
  const endTurn = useCallback(async (): Promise<boolean> => {
    if (!socket || !lobbyId) {
      setError('Not in a game');
      return false;
    }

    return new Promise((resolve) => {
      socket.emit(
        'endTurn',
        { lobbyId },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            resolve(true);
          } else {
            setError(response.error || 'Failed to end turn');
            resolve(false);
          }
        }
      );
    });
  }, [socket, lobbyId]);

  // New game
  const newGame = useCallback(async (): Promise<boolean> => {
    if (!socket || !lobbyId) {
      setError('Not in a game');
      return false;
    }

    return new Promise((resolve) => {
      socket.emit(
        'newGame',
        { lobbyId },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            setCurrentHint(null);
            resolve(true);
          } else {
            setError(response.error || 'Failed to start new game');
            resolve(false);
          }
        }
      );
    });
  }, [socket, lobbyId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle joined event (initial data when joining)
    const handleJoined = (data: JoinedPayload) => {
      setPlayers(data.lobby.players);
      if (data.lobby.gameState) {
        setGameState(data.lobby.gameState);
      }
    };

    // Handle player joined
    const handlePlayerJoined = (data: PlayerJoinedPayload) => {
      setPlayers((prev) => {
        const exists = prev.find((p) => p.id === data.id);
        if (exists) {
          return prev.map((p) => (p.id === data.id ? { ...p, ...data } : p));
        }
        return [...prev, { ...data, lobbyId: lobbyId || undefined }];
      });
    };

    // Handle player left
    const handlePlayerLeft = (data: PlayerLeftPayload) => {
      setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
    };

    // Handle team updated
    const handleTeamUpdated = (data: TeamUpdatedPayload) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === data.playerId ? { ...p, team: data.team } : p))
      );
      // Update current player if it's them
      if (player?.id === data.playerId) {
        setPlayer((prev) => prev ? { ...prev, team: data.team } : null);
      }
    };

    // Handle role updated
    const handleRoleUpdated = (data: RoleUpdatedPayload) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === data.playerId ? { ...p, role: data.role } : p))
      );
      // Update current player if it's them
      if (player?.id === data.playerId) {
        setPlayer((prev) => prev ? { ...prev, role: data.role } : null);
      }
    };

    // Handle game started
    const handleGameStarted = (data: GameState) => {
      setGameState(data);
      setCurrentHint(null);
    };

    // Handle game update
    const handleGameUpdate = (data: GameState) => {
      setGameState(data);
    };

    // Handle hint given
    const handleHintGiven = (data: HintGivenPayload) => {
      setCurrentHint(data);
    };

    // Handle turn changed
    const handleTurnChanged = () => {
      // Clear hint when turn changes
      setCurrentHint(null);
    };

    // Handle game over
    const handleGameOver = () => {
      setCurrentHint(null);
    };

    // Handle game reset
    const handleGameReset = () => {
      setCurrentHint(null);
    };

    // Register listeners
    socket.on('joined', handleJoined);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('teamUpdated', handleTeamUpdated);
    socket.on('roleUpdated', handleRoleUpdated);
    socket.on('gameStarted', handleGameStarted);
    socket.on('gameUpdate', handleGameUpdate);
    socket.on('hintGiven', handleHintGiven);
    socket.on('turnChanged', handleTurnChanged);
    socket.on('gameOver', handleGameOver);
    socket.on('gameReset', handleGameReset);

    return () => {
      socket.off('joined', handleJoined);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('teamUpdated', handleTeamUpdated);
      socket.off('roleUpdated', handleRoleUpdated);
      socket.off('gameStarted', handleGameStarted);
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('hintGiven', handleHintGiven);
      socket.off('turnChanged', handleTurnChanged);
      socket.off('gameOver', handleGameOver);
      socket.off('gameReset', handleGameReset);
    };
  }, [socket, lobbyId, player?.id]);

  return (
    <GameContext.Provider
      value={{
        player,
        players,
        lobbyId,
        gameState,
        currentHint,
        isInLobby,
        isGameStarted,
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
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
