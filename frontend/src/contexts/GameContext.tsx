import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { GameState, Player, Team, Role, CurrentHint } from '../types';

interface GameContextType {
  gameState: GameState | null;
  players: Player[];
  currentPlayer: Player | null;
  lobbyId: string | null;
  isHost: boolean;
  isSpymaster: boolean;
  currentHint: CurrentHint | null;
  setGameState: (state: GameState | null) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setCurrentPlayer: (player: Player | null) => void;
  setLobbyId: (id: string | null) => void;
  setCurrentHint: (hint: CurrentHint | null) => void;
  updatePlayerTeam: (playerId: string, team: Team) => void;
  updatePlayerRole: (playerId: string, role: Role) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [currentHint, setCurrentHint] = useState<CurrentHint | null>(null);

  const isHost = currentPlayer?.isHost ?? false;
  const isSpymaster = currentPlayer?.role === 'spymaster';

  const updatePlayerTeam = useCallback((playerId: string, team: Team) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, team } : player
      )
    );
    if (currentPlayer?.id === playerId) {
      setCurrentPlayer((prev) => (prev ? { ...prev, team } : null));
    }
  }, [currentPlayer]);

  const updatePlayerRole = useCallback((playerId: string, role: Role) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, role } : player
      )
    );
    if (currentPlayer?.id === playerId) {
      setCurrentPlayer((prev) => (prev ? { ...prev, role } : null));
    }
  }, [currentPlayer]);

  const resetGame = useCallback(() => {
    setGameState(null);
    setPlayers([]);
    setCurrentPlayer(null);
    setLobbyId(null);
    setCurrentHint(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        players,
        currentPlayer,
        lobbyId,
        isHost,
        isSpymaster,
        currentHint,
        setGameState,
        setPlayers,
        setCurrentPlayer,
        setLobbyId,
        setCurrentHint,
        updatePlayerTeam,
        updatePlayerRole,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
