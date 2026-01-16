import { useEffect, useCallback } from 'react';
import { useSocketContext } from '../contexts/SocketContext';
import { useGameContext } from '../contexts/GameContext';
import { Team, Role, GameState, Player } from '../types';

interface UseSocketReturn {
  joinLobby: (lobbyId: string, playerName: string) => void;
  leaveLobby: () => void;
  selectTeam: (team: Team) => void;
  selectRole: (role: Role) => void;
  revealWord: (position: number) => void;
  endTurn: () => void;
  startGame: () => void;
  newGame: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const { socket, isConnected } = useSocketContext();
  const {
    lobbyId,
    setGameState,
    setPlayers,
    setCurrentPlayer,
    setLobbyId,
    updatePlayerTeam,
    updatePlayerRole,
  } = useGameContext();

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    const handleGameState = (state: GameState) => {
      setGameState(state);
    };

    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    };

    const handlePlayerJoined = (player: Player) => {
      setPlayers((prev: Player[]) => [...prev, player]);
    };

    const handlePlayerLeft = (playerId: string) => {
      setPlayers((prev: Player[]) => prev.filter((p) => p.id !== playerId));
    };

    const handleTeamChanged = ({ playerId, team }: { playerId: string; team: Team }) => {
      updatePlayerTeam(playerId, team);
    };

    const handleRoleChanged = ({ playerId, role }: { playerId: string; role: Role }) => {
      updatePlayerRole(playerId, role);
    };

    const handleWordRevealed = (state: GameState) => {
      setGameState(state);
    };

    const handleTurnEnded = (state: GameState) => {
      setGameState(state);
    };

    const handleGameStarted = (state: GameState) => {
      setGameState(state);
    };

    const handleNewGame = (state: GameState) => {
      setGameState(state);
    };

    const handleError = (error: { message: string }) => {
      console.error('Socket error:', error.message);
    };

    socket.on('gameState', handleGameState);
    socket.on('playersUpdate', handlePlayersUpdate);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('teamChanged', handleTeamChanged);
    socket.on('roleChanged', handleRoleChanged);
    socket.on('wordRevealed', handleWordRevealed);
    socket.on('turnEnded', handleTurnEnded);
    socket.on('gameStarted', handleGameStarted);
    socket.on('newGame', handleNewGame);
    socket.on('error', handleError);

    return () => {
      socket.off('gameState', handleGameState);
      socket.off('playersUpdate', handlePlayersUpdate);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('teamChanged', handleTeamChanged);
      socket.off('roleChanged', handleRoleChanged);
      socket.off('wordRevealed', handleWordRevealed);
      socket.off('turnEnded', handleTurnEnded);
      socket.off('gameStarted', handleGameStarted);
      socket.off('newGame', handleNewGame);
      socket.off('error', handleError);
    };
  }, [socket, setGameState, setPlayers, updatePlayerTeam, updatePlayerRole]);

  const joinLobby = useCallback(
    (lobbyId: string, playerName: string) => {
      if (socket && isConnected) {
        socket.emit('joinLobby', { lobbyId, playerName }, (response: { player: Player; players: Player[]; gameState: GameState | null }) => {
          setCurrentPlayer(response.player);
          setPlayers(response.players);
          setLobbyId(lobbyId);
          if (response.gameState) {
            setGameState(response.gameState);
          }
        });
      }
    },
    [socket, isConnected, setCurrentPlayer, setPlayers, setLobbyId, setGameState]
  );

  const leaveLobby = useCallback(() => {
    if (socket && isConnected && lobbyId) {
      socket.emit('leaveLobby', { lobbyId });
      setLobbyId(null);
      setCurrentPlayer(null);
      setPlayers([]);
      setGameState(null);
    }
  }, [socket, isConnected, lobbyId, setLobbyId, setCurrentPlayer, setPlayers, setGameState]);

  const selectTeam = useCallback(
    (team: Team) => {
      if (socket && isConnected && lobbyId) {
        socket.emit('selectTeam', { lobbyId, team });
      }
    },
    [socket, isConnected, lobbyId]
  );

  const selectRole = useCallback(
    (role: Role) => {
      if (socket && isConnected && lobbyId) {
        socket.emit('selectRole', { lobbyId, role });
      }
    },
    [socket, isConnected, lobbyId]
  );

  const revealWord = useCallback(
    (position: number) => {
      if (socket && isConnected && lobbyId) {
        socket.emit('revealWord', { lobbyId, position });
      }
    },
    [socket, isConnected, lobbyId]
  );

  const endTurn = useCallback(() => {
    if (socket && isConnected && lobbyId) {
      socket.emit('endTurn', { lobbyId });
    }
  }, [socket, isConnected, lobbyId]);

  const startGame = useCallback(() => {
    if (socket && isConnected && lobbyId) {
      socket.emit('startGame', { lobbyId });
    }
  }, [socket, isConnected, lobbyId]);

  const newGame = useCallback(() => {
    if (socket && isConnected && lobbyId) {
      socket.emit('newGame', { lobbyId });
    }
  }, [socket, isConnected, lobbyId]);

  return {
    joinLobby,
    leaveLobby,
    selectTeam,
    selectRole,
    revealWord,
    endTurn,
    startGame,
    newGame,
  };
};
