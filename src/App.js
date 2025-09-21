import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import RoomPage from './pages/Room';
import FriendsPage from './pages/Friends';



function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/room/:roomId" element={<RoomPage/>} />
      <Route path="/friends" element={<FriendsPage />} />
    </Routes>
    
    </>
    
  );
}

export default App;
