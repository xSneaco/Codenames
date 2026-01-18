const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface CreateLobbyResponse {
  id: string;
  status: string;
  createdAt: string;
}

interface LobbyResponse {
  id: string;
  status: string;
  hostId: number | null;
  createdAt: string;
}

export async function createLobby(hostName?: string): Promise<CreateLobbyResponse> {
  const response = await fetch(`${API_BASE_URL}/lobbies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hostName: hostName || 'anonymous' }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create lobby' }));
    throw new Error(error.message || 'Failed to create lobby');
  }

  return response.json();
}

export async function getLobby(lobbyId: string): Promise<LobbyResponse> {
  const response = await fetch(`${API_BASE_URL}/lobbies/${lobbyId.toUpperCase()}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Lobby not found');
    }
    const error = await response.json().catch(() => ({ message: 'Failed to get lobby' }));
    throw new Error(error.message || 'Failed to get lobby');
  }

  return response.json();
}

export async function checkLobbyExists(lobbyId: string): Promise<boolean> {
  try {
    await getLobby(lobbyId);
    return true;
  } catch {
    return false;
  }
}
