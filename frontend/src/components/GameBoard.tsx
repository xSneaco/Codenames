'use client';

import { useState } from 'react';
import { Button, Input, Chip, Card, CardBody } from '@heroui/react';
import { Star, ArrowRight, Send } from 'lucide-react';
import { useGameContext } from '@/contexts/GameContext';
import { useSocketContext } from '@/contexts/SocketContext';
import WordCard from './WordCard';
import TeamPanel from './TeamPanel';
import GameOverModal from './GameOverModal';
import { colors } from '@/styles/colors';

const GameBoard: React.FC = () => {
  const { gameState, players, currentPlayer, isSpymaster, lobbyId, currentHint } = useGameContext();
  const { socket } = useSocketContext();
  const [showGameOver, setShowGameOver] = useState(true);
  const [hint, setHint] = useState('');
  const [hintNumber, setHintNumber] = useState<number>(1);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  if (!gameState) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0a0e14]"
      >
        <p className="text-white text-xl">Loading game...</p>
      </div>
    );
  }

  const redTeam = players.filter((p) => p.team === 'red');
  const blueTeam = players.filter((p) => p.team === 'blue');

  const isMyTurn = gameState.currentTurn === currentPlayer?.team;
  const isOperative = currentPlayer?.role === 'operative';
  const currentPhase = gameState.currentPhase || 'hint';
  const canClick = isMyTurn && isOperative && gameState.status === 'playing' && currentPhase === 'guessing';

  const handleCardClick = (position: number) => {
    if (!canClick) return;

    if (selectedPosition === position) {
      if (socket && lobbyId) {
        socket.emit('revealWord', { lobbyId, position });
        setSelectedPosition(null);
      }
    } else {
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
    const assassinCard = gameState.words.find((w) => w.type === 'assassin');
    if (assassinCard?.revealed) {
      return 'assassin';
    }
    return 'all_words';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e14] relative overflow-x-hidden">
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[url('/noise.png')]" />

      {/* Top Bar - Game Info */}
      <div className="sticky top-0 z-30 w-full bg-[#1a1f29] border-b border-white/5 shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Left: Score & Logo */}
          <div className="flex items-center gap-6">
            <h2 className="hidden md:block text-2xl font-black tracking-tighter text-white">
              CODENAMES
            </h2>

            <div className="flex items-center gap-4 bg-black/20 rounded-full p-1.5 pr-4 border border-white/5">
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${gameState.currentTurn === 'red' ? 'bg-red-600 text-white animate-pulse' : 'bg-white/5 text-text-secondary'}`}>
                  Red
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-red-500"></div>
                   <span className="text-xl font-black text-white leading-none">{gameState.redScore}</span>
                   <span className="text-xs text-white/30 leading-none">/{gameState.redTotal}</span>
                </div>
              </div>

              <div className="w-[1px] h-4 bg-white/10"></div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                   <span className="text-xs text-white/30 leading-none">/{gameState.blueTotal}</span>
                   <span className="text-xl font-black text-white leading-none">{gameState.blueScore}</span>
                   <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${gameState.currentTurn === 'blue' ? 'bg-blue-600 text-white animate-pulse' : 'bg-white/5 text-text-secondary'}`}>
                  Blue
                </div>
              </div>
            </div>
          </div>

          {/* Center: Hint Display (Floating) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md pointer-events-none flex justify-center">
            {currentHint && (
              <div
                className="pointer-events-auto flex items-center gap-3 px-6 py-2 rounded-full shadow-xl animate-bounce-in"
                style={{
                  background: currentHint.team === 'red' ? 'rgba(220, 38, 38, 0.95)' : 'rgba(37, 99, 235, 0.95)',
                  boxShadow: `0 10px 30px -5px ${currentHint.team === 'red' ? 'rgba(220, 38, 38, 0.5)' : 'rgba(37, 99, 235, 0.5)'}`
                }}
              >
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[10px] uppercase font-bold text-white/70">Hint</span>
                  <span className="text-white font-black text-lg uppercase tracking-wider">
                    {currentHint.hint}
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-white/20"></div>
                <div className="text-3xl font-black text-white">
                   {currentHint.number === 0 ? '∞' : currentHint.number}
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
             {/* Role Badge */}
             <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-xs text-text-secondary uppercase tracking-wider">Role</span>
                <span className={`text-sm font-bold capitalize ${isSpymaster ? 'text-yellow-400' : 'text-white'}`}>
                  {currentPlayer?.role || 'Spectator'}
                </span>
                {isSpymaster && <Star size={14} className="text-yellow-400 fill-yellow-400" />}
             </div>

             {isMyTurn && gameState.status === 'playing' && currentPhase === 'guessing' && (
                <Button
                  onPress={handleEndTurn}
                  color="default"
                  variant="solid"
                  className="font-bold bg-white text-black hover:bg-gray-200"
                  size="sm"
                  endContent={<ArrowRight size={16} />}
                >
                  End Turn
                </Button>
              )}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 max-w-[1800px] w-full mx-auto p-4 flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-center">

        {/* Red Team Sidebar (Desktop) */}
        <div className="hidden lg:block w-72 sticky top-24 shrink-0">
          <TeamPanel
            team="red"
            players={redTeam}
            isCurrentTurn={gameState.currentTurn === 'red'}
            wordsRemaining={gameState.redTotal - gameState.redScore}
          />
        </div>

        {/* Game Board Grid */}
        <div className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto">

          {/* Mobile Team Stats (Above Board) */}
          <div className="lg:hidden w-full grid grid-cols-2 gap-4 mb-4">
             <TeamPanel
                team="red"
                players={redTeam}
                isCurrentTurn={gameState.currentTurn === 'red'}
                wordsRemaining={gameState.redTotal - gameState.redScore}
              />
              <TeamPanel
                team="blue"
                players={blueTeam}
                isCurrentTurn={gameState.currentTurn === 'blue'}
                wordsRemaining={gameState.blueTotal - gameState.blueScore}
              />
          </div>

          <div className="w-full grid grid-cols-5 gap-2 sm:gap-4 md:gap-5 auto-rows-fr perspective-1000 mb-8">
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

          {/* Spymaster Control Zone */}
          {isSpymaster && isMyTurn && gameState.status === 'playing' && currentPhase === 'hint' && (
            <div className="w-full max-w-2xl bg-[#1e232e] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
               <div className="flex flex-col gap-4 relative z-10">
                  <div className="flex items-center justify-between">
                     <h3 className="text-white font-bold text-lg flex items-center gap-2">
                       <Star size={20} className="text-yellow-400" />
                       Spymaster Control
                     </h3>
                     <span className="text-xs text-text-secondary uppercase tracking-widest">Your Turn</span>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Type one word hint..."
                        value={hint}
                        onValueChange={setHint}
                        size="lg"
                        className="font-bold text-lg"
                        variant="bordered"
                        classNames={{
                          inputWrapper: 'bg-black/40 border-white/10 hover:border-white/20 h-14',
                          input: 'text-white placeholder:text-white/20',
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="#"
                        value={hintNumber.toString()}
                        onValueChange={(val) => setHintNumber(Math.min(9, Math.max(0, parseInt(val) || 0)))}
                        min={0}
                        max={9}
                        size="lg"
                        variant="bordered"
                        classNames={{
                          inputWrapper: 'bg-black/40 border-white/10 hover:border-white/20 h-14',
                          input: 'text-white text-center font-mono text-xl',
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    onPress={handleGiveHint}
                    isDisabled={!hint.trim()}
                    size="lg"
                    className="w-full font-bold text-lg uppercase tracking-wider"
                    style={{
                      backgroundColor: colors.accent.main,
                      boxShadow: 'none'
                    }}
                  >
                    Transmit Hint
                  </Button>
               </div>
            </div>
          )}
        </div>

        {/* Blue Team Sidebar (Desktop) */}
        <div className="hidden lg:block w-72 sticky top-24 shrink-0">
          <TeamPanel
            team="blue"
            players={blueTeam}
            isCurrentTurn={gameState.currentTurn === 'blue'}
            wordsRemaining={gameState.blueTotal - gameState.blueScore}
          />
        </div>
      </div>

      {/* Game Over Modal */}
      {gameState.status === 'finished' && gameState.winner && showGameOver && (
        <GameOverModal
          isOpen={true}
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
