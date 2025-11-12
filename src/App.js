import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import RoomPage from './pages/Room';
import FriendsPage from './pages/Friends';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/Login';
import EditProfilePage from './pages/Edit/EditProfilePage';
import FaqsPage from './pages/FaqsPage';
import RulesPage from './pages/RulesPage';

import OfficialMeetingPage from './pages/OfficialMeetingPage'; // ZegoCloud Page
import RandomVideoCallPage from './pages/RandomVideoCallPage'; // WebRTC Page
import HistoryPage from './pages/History/HistoryPage'; // <-- IMPORT NEW PAGE


function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/room/:roomId" element={<RoomPage/>} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/edit-profile" element={<EditProfilePage />} />
      <Route path="/room/:roomId" element={<OfficialMeetingPage />} /> {/* Official Meetings */}
      <Route path="/random/:roomId" element={<RandomVideoCallPage />} /> {/* Random Video Call */}
      <Route path="/faqs" element={<FaqsPage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/history" element={<HistoryPage />} /> {/* <-- ADD NEW ROUTE */}
    </Routes>
    
    </>
    
  );
}

export default App;
