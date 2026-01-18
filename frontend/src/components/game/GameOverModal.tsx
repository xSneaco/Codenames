'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { cn } from '@/lib/utils';

interface GameOverModalProps {
  isOpen: boolean;
  winner: 'red' | 'blue' | null;
  reason?: 'all_words' | 'black_word';
  isHost: boolean;
  onNewGame: () => void;
  onClose: () => void;
}

export function GameOverModal({
  isOpen,
  winner,
  reason,
  isHost,
  onNewGame,
  onClose,
}: GameOverModalProps) {
  const winnerText = winner === 'red' ? 'Red Team' : 'Blue Team';
  const reasonText =
    reason === 'black_word'
      ? 'The assassin was revealed!'
      : 'All words have been found!';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-2">
          <span className="text-4xl">🎉</span>
          <span
            className={cn(
              'text-2xl font-bold',
              winner === 'red' ? 'text-red-500' : 'text-blue-500'
            )}
          >
            {winnerText} Wins!
          </span>
        </ModalHeader>
        <ModalBody className="text-center">
          <p className="text-gray-400">{reasonText}</p>
        </ModalBody>
        <ModalFooter className="flex justify-center gap-4">
          {isHost && (
            <Button color="success" size="lg" onPress={onNewGame}>
              Play Again
            </Button>
          )}
          <Button variant="bordered" onPress={onClose}>
            {isHost ? 'Close' : 'Waiting for host to start new game...'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
