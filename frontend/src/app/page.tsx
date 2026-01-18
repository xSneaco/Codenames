'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody, Divider, Spinner } from '@heroui/react';
import { Plus, DoorOpen } from 'lucide-react';
import { createLobby } from '@/utils/api';
import { colors } from '@/styles/colors';

export default function HomePage() {
  const router = useRouter();
  const [lobbyCode, setLobbyCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateLobby = async () => {
    try {
      setIsCreating(true);
      setError(null);
      const { id } = await createLobby();
      router.push(`/lobby/${id}`);
    } catch (err) {
      setError('Failed to create lobby. Please try again.');
      console.error('Error creating lobby:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinLobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (lobbyCode.trim()) {
      router.push(`/lobby/${lobbyCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements can be added here if needed */}

      <div className="w-full max-w-lg z-10">
        <div className="flex flex-col gap-10">
          {/* Title */}
          <div className="text-center space-y-4">
            <h1
              className="text-7xl font-black tracking-tighter text-center"
              style={{
                color: colors.accent.main,
              }}
            >
              CODENAMES
            </h1>
            <p className="text-text-secondary text-xl font-light tracking-wide">
              The classic word game, reimagined.
            </p>
          </div>

          <Card className="bg-[#1a1f29] border border-white/10 shadow-xl">
            <CardBody className="gap-8 p-8">
              {/* Create Lobby Button */}
              <div className="space-y-4">
                <Button
                  size="lg"
                  className="flex flex-row w-full h-16 text-xl font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: colors.accent.main,
                  }}
                  onPress={handleCreateLobby}
                  isDisabled={isCreating}
                >
                  {isCreating ? <Spinner size="sm" color="white" /> : <Plus />}
                  {isCreating ? 'Creating World...' : 'Create New Game'}
                </Button>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-sm font-medium" style={{ color: colors.status.error }}>
                      {error}
                    </p>
                  </div>
                )}
              </div>

              <div className="relative">
                <Divider className="bg-white/10" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-sm text-text-secondary font-medium uppercase tracking-wider bg-[#1a1f29]">
                  OR
                </span>
              </div>

              {/* Join Lobby Form */}
              <form onSubmit={handleJoinLobby} className="flex flex-col gap-6">
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm block">Join Existing Lobby</label>
                  <Input
                    placeholder="Enter lobby code"
                    value={lobbyCode}
                    onValueChange={setLobbyCode}
                    size="lg"
                    variant="bordered"
                    startContent={<DoorOpen className="text-text-secondary" size={20} />}
                    classNames={{
                      input: "text-white",
                      inputWrapper: "border-white/10 hover:border-white/30 transition-colors bg-white/5",
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  variant="ghost"
                  className="w-full h-12 text-white font-semibold border-white/20 hover:bg-white/10"
                  isDisabled={!lobbyCode.trim()}
                >
                  Join Game
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Footer / Copyright / Version could go here */}
      <div className="absolute bottom-6 text-center text-text-secondary/30 text-xs">
        v1.0.0 • Codenames Clone
      </div>
    </div>
  )
}
