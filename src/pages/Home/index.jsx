// src/pages/Home/index.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Copy, ClipboardCheck } from 'lucide-react';

const HomePage = () => {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);

  // For Official Meetings (ZegoCloud)
  const handleJoinOfficialRoom = useCallback(() => {
    if (roomCode) navigate(`/room/${roomCode}`);
  }, [navigate, roomCode]);

  // For Random Video Chat (WebRTC)
  const handleStartRandomChat = useCallback(() => {
    const newRoomCode = Math.random().toString(36).substring(2, 8);
    navigate(`/random/${newRoomCode}`);
  }, [navigate]);

  const handleFindFriends = useCallback(() => {
    navigate('/friends');
  }, [navigate]);

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
        await navigator.clipboard.writeText(roomCode);
        setIsCopied(true);
        // Reset the "Copied" icon after 2 seconds
        setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
        console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="min-h-screen w-full font-sans">
      
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
        src="/videos/bg-video.mp4"
      />
      
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-[-1]" />

      <Navbar />
      
      <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-warm-card rounded-2xl shadow-2xl">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-warm-text">Welcome to Ollo</h1>
                <p className="mt-2 text-gray-500">Your new video conferencing experience.</p>
            </div>
            <div className="space-y-4">
                <div className="flex space-x-2">
            {/* Wrapper to position the icon */}
            <div className="relative w-full">
                <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => {
                        setRoomCode(e.target.value);
                        setIsCopied(false); // Resets icon on typing
                    }}
                    placeholder="Enter Meeting Code"
                    // Adjust padding to make room for the icon
                    className="w-full pl-4 pr-12 py-3 text-lg text-warm-text bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-warm-primary focus:ring-opacity-50 transition"
                />
                {/* The new copy button */}
                <button
                    type="button" 
                    onClick={handleCopyCode}
                    disabled={!roomCode}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-warm-primary disabled:opacity-50"
                    title="Copy code"
                >
                    {isCopied ? (
                        <ClipboardCheck size={20} className="text-green-600" />
                    ) : (
                        <Copy size={20} />
                    )}
                </button>
            </div>

            {/* Your original Join button (unchanged) */}
            <button
                onClick={handleJoinOfficialRoom}
                className="px-6 py-3 font-semibold text-white bg-warm-primary rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-warm-primary focus:ring-opacity-50 transition-transform transform hover:scale-105"
            >
                Join
            </button>
          </div>
            </div>
            <div className="flex items-center justify-center">
                <div className="w-1/3 border-b border-gray-300"></div>
                <span className="px-4 text-sm font-medium text-gray-400">OR</span>
                <div className="w-1/3 border-b border-gray-300"></div>
            </div>
            <button
                onClick={handleStartRandomChat}
                className="w-full px-4 py-3 font-semibold text-warm-text bg-warm-secondary rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-warm-secondary focus:ring-opacity-50 transition-transform transform hover:scale-105"
            >
                Random Video Chat
            </button>
            <button
                onClick={handleFindFriends}
                className="w-full px-4 py-3 font-semibold text-warm-text bg-warm-secondary rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-warm-secondary focus:ring-opacity-50 transition-transform transform hover:scale-105"
            >
                Find Friends
            </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;