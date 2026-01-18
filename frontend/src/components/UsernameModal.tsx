'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Avatar, Card, CardBody } from '@heroui/react';
import { User } from 'lucide-react';
import { colors } from '@/styles/colors';

interface UsernameModalProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('codenames_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('Please enter a username');
      return;
    }

    if (trimmedUsername.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    if (trimmedUsername.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    localStorage.setItem('codenames_username', trimmedUsername);
    setError(null);
    onSubmit(trimmedUsername);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <Card
        className="max-w-md w-full bg-[#151921] border border-white/10 shadow-2xl"
      >
        <CardBody className="p-8 gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-accent-main p-0.5 mb-4 shadow-none">
                 <div className="w-full h-full rounded-full bg-[#151921] flex items-center justify-center border-4 border-transparent">
                    <User size={32} className="text-white" />
                 </div>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white">
                  Identification
                </h2>
                <p className="text-text-secondary text-sm">
                  Enter your codename to join the operation
                </p>
              </div>
            </div>

            <div className="space-y-4">
               <div>
                  <Input
                    value={username}
                    onValueChange={(val) => {
                      setUsername(val);
                      setError(null);
                    }}
                    placeholder="E.g. Agent Smith"
                    autoFocus
                    maxLength={20}
                    size="lg"
                    variant="bordered"
                    classNames={{
                      inputWrapper: "bg-black/20 border-white/10 hover:border-accent-main focus-within:border-accent-main h-14 transition-colors",
                      input: "text-white text-lg text-center font-bold",
                    }}
                  />
                  {error && (
                    <p className="text-red-500 text-xs text-center mt-2 font-medium bg-red-500/10 py-1 rounded">
                      {error}
                    </p>
                  )}
               </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-white font-bold h-12 uppercase tracking-wide transition-transform"
                  style={{
                    backgroundColor: colors.accent.main,
                    boxShadow: 'none'
                  }}
                  isDisabled={!username.trim()}
                >
                  Confirm Identity
                </Button>
            </div>

            <p className="text-xs text-center text-white/20">
               By joining you accept the mission parameters.
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default UsernameModal;
