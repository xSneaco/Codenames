'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Divider,
  Spinner,
} from '@heroui/react';
import { createLobby, checkLobbyExists } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateLobby = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const lobby = await createLobby(playerName.trim());
      // Store player name for the lobby page
      sessionStorage.setItem('playerName', playerName.trim());
      router.push(`/lobby/${lobby.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lobby');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinLobby = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!lobbyCode.trim()) {
      setError('Please enter a lobby code');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const exists = await checkLobbyExists(lobbyCode.trim());
      if (!exists) {
        setError('Lobby not found');
        setIsJoining(false);
        return;
      }

      // Store player name for the lobby page
      sessionStorage.setItem('playerName', playerName.trim());
      router.push(`/lobby/${lobbyCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join lobby');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            CODENAMES
          </h1>
          <p className="text-gray-400 text-sm">The word guessing party game</p>
        </CardHeader>
        <CardBody className="space-y-6 pt-6">
          {/* Player Name Input */}
          <Input
            label="Your Name"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            variant="bordered"
            size="lg"
            maxLength={50}
          />

          {/* Error Display */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Create Lobby */}
          <Button
            color="success"
            size="lg"
            className="w-full"
            onPress={handleCreateLobby}
            isDisabled={isCreating || isJoining}
            isLoading={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create New Lobby'}
          </Button>

          <div className="flex items-center gap-4">
            <Divider className="flex-1" />
            <span className="text-gray-500 text-sm">OR</span>
            <Divider className="flex-1" />
          </div>

          {/* Join Lobby */}
          <div className="space-y-4">
            <Input
              label="Lobby Code"
              placeholder="Enter 6-character code"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
              variant="bordered"
              size="lg"
              maxLength={6}
              className="uppercase"
            />
            <Button
              color="primary"
              size="lg"
              className="w-full"
              onPress={handleJoinLobby}
              isDisabled={isCreating || isJoining}
              isLoading={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join Lobby'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
