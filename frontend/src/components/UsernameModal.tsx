import React, { useState, useEffect } from 'react';

interface UsernameModalProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load saved username from localStorage on mount
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

    // Save to localStorage
    localStorage.setItem('codenames_username', trimmedUsername);
    setError(null);
    onSubmit(trimmedUsername);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome to Codenames!</h2>
          <p className="text-gray-400 mt-2">Enter your name to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              placeholder="Your name"
              autoFocus
              maxLength={20}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-center text-lg"
            />
            {error && (
              <p className="mt-2 text-red-400 text-sm text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            Join Game
          </button>
        </form>

        {/* Footer */}
        <p className="text-gray-500 text-xs text-center mt-4">
          Your name will be saved for future games
        </p>
      </div>
    </div>
  );
};

export default UsernameModal;
