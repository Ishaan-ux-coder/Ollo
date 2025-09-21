// src/pages/Home/index.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const HomePage = () => {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = useCallback(() => {
    if (roomCode) navigate(`/room/${roomCode}`);
  }, [navigate, roomCode]);

  const handleCreateRoom = useCallback(() => {
    const newRoomCode = Math.random().toString(36).substring(2, 8);
    navigate(`/room/${newRoomCode}`);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full font-sans">
      
      {/* --- Video Background --- */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
        src="/videos/bg-video.mp4"
      />
      
      {/* --- Dark Overlay for Readability --- */}
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-[-1]" />

      <Navbar />
      
      <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-5xl">
          {/* --- SVG Illustration Column --- */}
          <div className="hidden lg:block w-1/2 p-8">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path 
                className="fill-current text-warm-primary opacity-20" 
                d="M48.4,-67.9C63.2,-58.9,76.2,-46,82.3,-30.5C88.4,-15,87.7,3,81.4,18.5C75.1,34,63.2,47,49.5,57.8C35.8,68.6,20.3,77.2,3.3,78.8C-13.7,80.4,-30.7,75,-44.4,66.1C-58.1,57.2,-68.5,44.9,-74.6,30.5C-80.7,16.1,-82.5, -0.4,-77.8,-15.1C-73.1,-29.8,-61.9,-42.7,-49.2,-52.6C-36.5,-62.5,-22.3,-69.5,-6.9,-72.1C8.5,-74.8,23.6,-73,48.4,-67.9Z" 
                transform="translate(100 100)" 
              />
            </svg>
          </div>
          
          {/* --- Login Card Column --- */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="w-full max-w-md p-8 space-y-8 bg-warm-card rounded-2xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-warm-text">Welcome to Ollo</h1>
                    <p className="mt-2 text-gray-500">Join a meeting or create one instantly.</p>
                </div>
                <div className="space-y-4">
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      placeholder="Enter Room Code"
                      className="w-full px-4 py-3 text-lg text-warm-text bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-warm-primary focus:ring-opacity-50 transition"
                    />
                    <button
                      onClick={handleJoinRoom}
                      className="w-full px-4 py-3 font-semibold text-white bg-warm-primary rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-warm-primary focus:ring-opacity-50 transition-transform transform hover:scale-105"
                    >
                      Join Room
                    </button>
                </div>
                <div className="flex items-center justify-center">
                    <div className="w-1/3 border-b border-gray-300"></div>
                    <span className="px-4 text-sm font-medium text-gray-400">OR</span>
                    <div className="w-1/3 border-b border-gray-300"></div>
                </div>
                <button
                    onClick={handleCreateRoom}
                    className="w-full px-4 py-3 font-semibold text-warm-text bg-warm-secondary rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-warm-secondary focus:ring-opacity-50 transition-transform transform hover:scale-105"
                >
                    Create a New Room
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;