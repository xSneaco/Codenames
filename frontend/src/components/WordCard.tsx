'use client';

import { CardType } from '@/types';

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
    bg: '#b91c1c',
    border: '#ef4444',
    text: 'white',
  },
  blue: {
    bg: '#1d4ed8',
    border: '#3b82f6',
    text: 'white',
  },
  neutral: {
    bg: '#fcd34d',
    border: '#f59e0b',
    text: '#1a1a1a',
  },
  assassin: {
    bg: '#171717',
    border: '#525252',
    text: 'white',
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

  // Modern Card Visualization
  let containerClasses = "group relative w-full aspect-[4/3] rounded-xl flex items-center justify-center p-3 transition-all duration-300 select-none overflow-hidden touch-manipulation outline-none";
  let contentClasses = "relative z-10 font-black uppercase tracking-wide text-xs sm:text-sm md:text-base lg:text-lg text-center leading-tight break-words";
  let style: React.CSSProperties = {};

  if (isRevealed) {
    // Revealed State
    style = {
      backgroundColor: styles.bg,
      color: styles.text,
      boxShadow: 'none',
    };
    containerClasses += " opacity-90 scale-[0.98]";

    // Add distinct border for accessibility/clarity
    if (['red', 'blue', 'assassin'].includes(color)) {
      containerClasses += " ring-2 ring-white/20";
    }
  } else {
    // Hidden State
    if (isSelected) {
      // Logic for "pending selection"
      containerClasses += " bg-accent-main cursor-pointer shadow-lg scale-105 z-20 ring-2 ring-white animate-pulse";
      contentClasses += " text-white";
    } else if (isSpymaster) {
      // Spymaster View
      containerClasses += " bg-gray-800 border-2 border-dashed";
      style = {
        borderColor: styles.border,
        color: styles.text === '#1a1a1a' ? '#fbbf24' : styles.border // adjust neutral color for dark mode visibility
      };
      // Reduce word opacity for spymaster to emphasize the color border
      contentClasses += " opacity-80";
    } else {
      // Default Operative View
      containerClasses += " bg-[#232a35] border border-white/5 shadow-md";
      contentClasses += " text-gray-300";

      if (isClickable) {
        containerClasses += " cursor-pointer hover:bg-[#2e3645] hover:-translate-y-1 hover:shadow-lg hover:border-white/20 active:scale-95";
        contentClasses += " group-hover:text-white";
      } else {
        containerClasses += " opacity-40 cursor-not-allowed grayscale";
      }
    }
  }

  return (
    <div
      className={containerClasses}
      style={style}
      onClick={isClickable ? onClick : undefined}
      role="button"
      tabIndex={isClickable ? 0 : -1}
      aria-label={`${word} ${isRevealed ? `(${color})` : ''}`}
    >
      {/* Pattern Texture */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />

      {/* Shine Effect on Hover (if clickable) - REMOVED for simplicity */}
      {isClickable && !isRevealed && !isSelected && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-white transition-opacity pointer-events-none" />
      )}

      {/* Spymaster Indicator (Corner Dot) */}
      {isSpymaster && !isRevealed && (
        <div
          className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: styles.bg }}
        />
      )}

      {/* Content */}
      <span className={contentClasses}>
        {word}
      </span>

      {/* Revealed Icon Overlay */}
      {isRevealed && (
         <div className="absolute top-1 left-1 opacity-40 text-xs">
            {color === 'assassin' && '☠️'}
            {color === 'neutral' && '🕊️'}
         </div>
      )}
    </div>
  );
};

export default WordCard;
