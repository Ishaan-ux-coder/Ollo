// src/pages/Friends/index.jsx
import React from 'react';
import Navbar from '../../components/Navbar';

const FriendsPage = () => {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <div className="bg-warm-card rounded-lg shadow-xl p-6">
          <h1 className="text-3xl font-bold text-warm-text mb-4">Your Friends</h1>
          {/* Placeholder content */}
          <p className="text-gray-600">Your friends list will appear here soon!</p>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;