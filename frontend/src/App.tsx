import { Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { GameProvider } from './contexts/GameContext';
import Home from './components/Home';
import LobbyPage from './pages/LobbyPage';

function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby/:lobbyId" element={<LobbyPage />} />
        </Routes>
      </GameProvider>
    </SocketProvider>
  );
}

export default App;
