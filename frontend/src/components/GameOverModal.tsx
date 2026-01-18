'use client';

import { Button, Card, CardBody, Avatar } from '@heroui/react';
import { Trophy, Home, RefreshCw } from 'lucide-react';
import { Team } from '@/types';
import { colors } from '@/styles/colors';

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
      gradient: 'bg-red-800',
      color: 'danger' as const,
      glow: '',
    },
    blue: {
      gradient: 'bg-blue-800',
      color: 'primary' as const,
      glow: '',
    },
  };

  const winnerColors = teamColors[winner];

  const getReasonText = () => {
    if (reason === 'assassin') {
      const loser = winner === 'red' ? 'Blue' : 'Red';
      return `${loser} Team hit the assassin!`;
    }
    return 'Mission Accomplished!';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      {/* Confetti decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-sm opacity-60"
            style={{
              background: i % 2 === 0 ? '#ef4444' : '#3b82f6',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${1 + Math.random() * 2}s infinite`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      <Card
        className="max-w-md w-full overflow-hidden border-2 shadow-xl"
        style={{
            borderColor: winner === 'red' ? '#dc2626' : '#2563eb',
        }}
      >
        {/* Victory Header */}
        <div
          className={`${winnerColors.gradient} p-10 text-center relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 border border-white/20 shadow-lg animate-bounce">
                <Trophy size={48} className="text-yellow-400" />
            </div>

            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                {winner} Team<br/>Wins!
            </h2>
            <div className="mt-4 px-4 py-1.5 bg-black/20 rounded-full border border-white/10">
                <p className="text-white/90 text-sm font-medium">
                {getReasonText()}
                </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <CardBody className="p-8 bg-[#151921]">
          <div className="flex flex-col gap-4">
            <Button
              size="lg"
              className="w-full font-bold text-lg h-14"
              color={winnerColors.color}
              variant="shadow"
              startContent={<RefreshCw size={20} />}
              onPress={onPlayAgain}
            >
              Play Again
            </Button>

            <Button
              size="lg"
              variant="bordered"
              className="w-full font-bold h-12 text-white/70 hover:text-white border-white/10 hover:border-white/30"
              startContent={<Home size={20} />}
              onPress={onBackToLobby}
            >
              Back to Lobby
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default GameOverModal;
