import React from 'react';
import { Team } from '../types';

interface GameOverModalProps {
  isOpen: boolean;
  winner: Team;
  reason: 'all_words' | 'assassin';
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  reason,
  onPlayAgain,
  onBackToLobby,
}) => {
  if (!isOpen || !winner) return null;

  const teamColors = {
    red: {
      gradient: 'from-red-600 to-red-800',
      text: 'text-red-400',
      bg: 'bg-red-500',
      glow: 'shadow-red-500/50',
    },
    blue: {
      gradient: 'from-blue-600 to-blue-800',
      text: 'text-blue-400',
      bg: 'bg-blue-500',
      glow: 'shadow-blue-500/50',
    },
  };

  const colors = teamColors[winner];

  const getReasonText = () => {
    if (reason === 'assassin') {
      const loser = winner === 'red' ? 'Blue' : 'Red';
      return `${loser} Team hit the assassin!`;
    }
    return `${winner === 'red' ? 'Red' : 'Blue'} Team found all their words!`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Confetti-like decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 ${
              i % 2 === 0 ? 'bg-red-500' : 'bg-blue-500'
            } rounded-full animate-bounce opacity-60`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-700">
        {/* Colored header */}
        <div className={`bg-gradient-to-r ${colors.gradient} p-6 text-center`}>
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
          <p className="text-white/80 text-lg">
            {winner === 'red' ? 'Red' : 'Blue'} Team Wins!
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Win reason */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-full">
              {reason === 'assassin' ? (
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="text-gray-300 text-sm">{getReasonText()}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onPlayAgain}
              className={`w-full py-3 px-6 bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${colors.glow}`}
            >
              Play Again
            </button>
            <button
              onClick={onBackToLobby}
              className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-all duration-200"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
