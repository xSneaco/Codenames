import React from 'react';
import { CardType } from '../types';

interface WordCardProps {
  word: string;
  color: CardType;
  isRevealed: boolean;
  isSpymaster: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const colorStyles: Record<CardType, { bg: string; border: string; text: string }> = {
  red: {
    bg: 'bg-red-600',
    border: 'border-red-500',
    text: 'text-white',
  },
  blue: {
    bg: 'bg-blue-600',
    border: 'border-blue-500',
    text: 'text-white',
  },
  neutral: {
    bg: 'bg-amber-200',
    border: 'border-amber-400',
    text: 'text-gray-800',
  },
  assassin: {
    bg: 'bg-gray-900',
    border: 'border-gray-600',
    text: 'text-white',
  },
};

const WordCard: React.FC<WordCardProps> = ({
  word,
  color,
  isRevealed,
  isSpymaster,
  isSelected = false,
  onClick,
  disabled = false,
}) => {
  const styles = colorStyles[color];
  const isClickable = !disabled && !isRevealed && onClick;

  const getCardClasses = () => {
    const baseClasses =
      'relative w-full aspect-[4/3] rounded-xl font-semibold text-sm md:text-base transition-all duration-300 flex items-center justify-center p-2 overflow-hidden';

    if (isRevealed) {
      return `${baseClasses} ${styles.bg} ${styles.text} shadow-lg`;
    }

    if (isSpymaster) {
      // Spymaster view - subtle colored indicator
      return `${baseClasses} bg-gray-800 border-2 ${styles.border} text-white`;
    }

    // Selected card (first click)
    if (isSelected) {
      return `${baseClasses} bg-purple-600 border-4 border-purple-400 text-white cursor-pointer transform scale-105 shadow-xl ring-4 ring-purple-500/50 animate-pulse`;
    }

    // Regular player view - neutral card
    if (isClickable) {
      return `${baseClasses} bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 hover:border-gray-500 text-white cursor-pointer transform hover:scale-105 hover:shadow-xl`;
    }

    return `${baseClasses} bg-gray-700 border-2 border-gray-600 text-white opacity-60 cursor-not-allowed`;
  };

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={disabled || isRevealed}
      className={getCardClasses()}
    >
      {/* Spymaster corner indicator */}
      {isSpymaster && !isRevealed && (
        <div
          className={`absolute top-1 right-1 w-3 h-3 rounded-full ${styles.bg} opacity-75`}
        />
      )}

      {/* Word text */}
      <span className="text-center break-words leading-tight uppercase tracking-wide">
        {word}
      </span>

      {/* Revealed overlay effect */}
      {isRevealed && (
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      )}

      {/* Assassin skull indicator */}
      {isRevealed && color === 'assassin' && (
        <div className="absolute top-1 right-1">
          <svg
            className="w-5 h-5 text-red-500"
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
      )}
    </button>
  );
};

export default WordCard;
