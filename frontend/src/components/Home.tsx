import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLobby } from '../utils/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [lobbyCode, setLobbyCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateLobby = async () => {
    try {
      setIsCreating(true);
      setError(null);
      const { id } = await createLobby();
      navigate(`/lobby/${id}`);
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
      navigate(`/lobby/${lobbyCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 mb-4">
            Codenames
          </h1>
          <p className="text-gray-400 text-lg">
            The classic word game, now online
          </p>
        </div>

        {/* Create Lobby Button */}
        <div className="mb-8">
          <button
            onClick={handleCreateLobby}
            disabled={isCreating}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/25"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              'Create New Lobby'
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Join Lobby Form */}
        <form onSubmit={handleJoinLobby} className="space-y-4">
          <div>
            <label
              htmlFor="lobbyCode"
              className="block text-gray-300 text-sm font-medium mb-2"
            >
              Join Existing Lobby
            </label>
            <input
              type="text"
              id="lobbyCode"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value)}
              placeholder="Enter lobby code"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={!lobbyCode.trim()}
            className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Lobby
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>2+ players required to start a game</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
