import React, { useState } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useSocketContext } from '../contexts/SocketContext';
import WordCard from './WordCard';
import TeamPanel from './TeamPanel';
import GameOverModal from './GameOverModal';

const GameBoard: React.FC = () => {
  const { gameState, players, currentPlayer, isSpymaster, lobbyId, currentHint } = useGameContext();
  const { socket } = useSocketContext();
  const [showGameOver, setShowGameOver] = useState(true);
  const [hint, setHint] = useState('');
  const [hintNumber, setHintNumber] = useState<number>(1);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  const redTeam = players.filter((p) => p.team === 'red');
  const blueTeam = players.filter((p) => p.team === 'blue');

  const isMyTurn = gameState.currentTurn === currentPlayer?.team;
  const isOperative = currentPlayer?.role === 'operative';
  const canClick = isMyTurn && isOperative && gameState.status === 'playing';

  const handleCardClick = (position: number) => {
    if (!canClick) return;

    if (selectedPosition === position) {
      // Second click on the same card - submit it
      if (socket && lobbyId) {
        socket.emit('revealWord', { lobbyId, position });
        setSelectedPosition(null);
      }
    } else {
      // First click - select the card
      setSelectedPosition(position);
    }
  };

  const handleEndTurn = () => {
    if (socket && isMyTurn && lobbyId) {
      socket.emit('endTurn', { lobbyId });
      setSelectedPosition(null);
    }
  };

  const handleGiveHint = () => {
    if (socket && isSpymaster && isMyTurn && hint.trim() && lobbyId) {
      socket.emit('giveHint', { lobbyId, hint: hint.trim(), number: hintNumber });
      setHint('');
      setHintNumber(1);
    }
  };

  const handlePlayAgain = () => {
    if (socket && lobbyId) {
      socket.emit('newGame', { lobbyId });
      setShowGameOver(false);
    }
  };

  const handleBackToLobby = () => {
    if (socket && lobbyId) {
      socket.emit('backToLobby', { lobbyId });
      setShowGameOver(false);
    }
  };

  const getWinReason = (): 'all_words' | 'assassin' => {
    // Check if assassin was revealed
    const assassinCard = gameState.words.find((w) => w.type === 'assassin');
    if (assassinCard?.revealed) {
      return 'assassin';
    }
    return 'all_words';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
            Codenames
          </h1>

          {/* Turn Indicator */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm hidden sm:inline">Current Turn:</span>
            <div
              className={`px-4 py-2 rounded-full font-semibold ${
                gameState.currentTurn === 'red'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {gameState.currentTurn === 'red' ? 'Red' : 'Blue'} Team
              {isMyTurn && ' (Your Turn)'}
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600" />
              <span className="text-white font-bold">{gameState.redScore}</span>
              <span className="text-gray-500">/ {gameState.redTotal}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600" />
              <span className="text-white font-bold">{gameState.blueScore}</span>
              <span className="text-gray-500">/ {gameState.blueTotal}</span>
            </div>
          </div>
        </div>

        {/* Current Hint Display */}
        {currentHint && (
          <div className={`mt-3 py-2 px-4 rounded-lg ${
            currentHint.team === 'red' ? 'bg-red-900/50 border border-red-600' : 'bg-blue-900/50 border border-blue-600'
          }`}>
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
              <span className={`text-sm ${currentHint.team === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                {currentHint.spymasterName}:
              </span>
              <span className="text-white font-bold text-lg uppercase tracking-wider">
                "{currentHint.hint}"
              </span>
              <span className={`px-3 py-1 rounded-full font-bold ${
                currentHint.team === 'red' ? 'bg-red-600' : 'bg-blue-600'
              } text-white`}>
                {currentHint.number === 0 ? '∞' : currentHint.number}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Red Team Panel (Left on desktop) */}
          <div className="lg:w-48 order-2 lg:order-1">
            <TeamPanel
              team="red"
              players={redTeam}
              isCurrentTurn={gameState.currentTurn === 'red'}
              wordsRemaining={gameState.redTotal - gameState.redScore}
            />
          </div>

          {/* Game Board */}
          <div className="flex-1 order-1 lg:order-2">
            {/* 5x5 Grid */}
            <div className="grid grid-cols-5 gap-2 md:gap-3 mb-6">
              {gameState.words
                .sort((a, b) => a.position - b.position)
                .map((card) => (
                  <WordCard
                    key={card.position}
                    word={card.word}
                    color={card.type}
                    isRevealed={card.revealed}
                    isSpymaster={isSpymaster}
                    isSelected={selectedPosition === card.position}
                    onClick={() => handleCardClick(card.position)}
                    disabled={!canClick || card.revealed}
                  />
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* End Turn Button */}
              {isMyTurn && gameState.status === 'playing' && (
                <button
                  onClick={handleEndTurn}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  End Turn
                </button>
              )}

              {/* Role Indicator */}
              <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
                <span className="text-gray-400 text-sm">You are: </span>
                <span className="text-white font-medium capitalize">
                  {currentPlayer?.role || 'Spectator'}
                </span>
                {isSpymaster && (
                  <svg
                    className="w-4 h-4 text-yellow-400 inline ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Spymaster Hint Input */}
            {isSpymaster && isMyTurn && gameState.status === 'playing' && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-yellow-400 text-sm mb-3 text-center">
                  <svg
                    className="w-5 h-5 inline mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Give a hint to your team!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                    placeholder="Enter hint word..."
                    className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  <select
                    value={hintNumber}
                    onChange={(e) => setHintNumber(Number(e.target.value))}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
                      <option key={n} value={n}>
                        {n === 0 ? '∞' : n}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleGiveHint}
                    disabled={!hint.trim()}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Give Hint
                  </button>
                </div>
              </div>
            )}

            {/* Spymaster Info (when not their turn) */}
            {isSpymaster && (!isMyTurn || gameState.status !== 'playing') && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                <p className="text-yellow-400 text-sm">
                  <svg
                    className="w-5 h-5 inline mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  You are the Spymaster! You can see all card colors.
                </p>
              </div>
            )}
          </div>

          {/* Blue Team Panel (Right on desktop) */}
          <div className="lg:w-48 order-3">
            <TeamPanel
              team="blue"
              players={blueTeam}
              isCurrentTurn={gameState.currentTurn === 'blue'}
              wordsRemaining={gameState.blueTotal - gameState.blueScore}
            />
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameState.status === 'finished' && gameState.winner && (
        <GameOverModal
          isOpen={showGameOver}
          winner={gameState.winner}
          reason={getWinReason()}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={handleBackToLobby}
        />
      )}
    </div>
  );
};

export default GameBoard;
