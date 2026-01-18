import axios, { AxiosInstance } from 'axios';
import { Lobby } from '@/types';

// Use same origin to go through nginx proxy
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || `${window.location.origin}/api`;
};

const api: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createLobby = async (): Promise<{ id: string }> => {
  const response = await api.post<{ id: string }>('/lobbies');
  return response.data;
};

export const getLobby = async (id: string): Promise<Lobby> => {
  const response = await api.get<Lobby>(`/lobbies/${id}`);
  return response.data;
};

export const uploadWordlist = async (lobbyId: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  await api.post(`/lobbies/${lobbyId}/wordlist`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;
