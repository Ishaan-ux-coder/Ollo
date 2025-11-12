import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; 
import { doc, getDoc } from "firebase/firestore"; 
import logo from '../assets/ollo_logo.png';
import { Video, Users, History } from 'lucide-react'; // <-- Import History icon

const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, "userProfiles", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUsername(docSnap.data().username || '');
          }
        } catch (err) {
          console.error("Failed to fetch profile for navbar", err);
        }
      };
      fetchProfile();
    }
  }, [currentUser]); 

  const handleFindCall = () => {
    // --- FIX: Navigate to the *start* of the random chat flow ---
    // This will generate a new code and navigate, just like your Home page button
    const newRoomCode = Math.random().toString(36).substring(2, 8);
    navigate(`/random/${newRoomCode}`);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-warm-nav shadow-lg z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="Ollo Logo" className="h-10 w-10" />
          <span className="text-3xl font-bold text-white tracking-wider">Ollo</span>
        </Link>

        {/* Navigation Links */}
        {currentUser ? (
          // --- LOGGED IN STATE ---
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-warm-secondary hover:text-white transition duration-300">Home</Link>
            <Link to="/friends" className="text-warm-secondary hover:text-white transition duration-300">Friends</Link>
            
            {/* --- NEW LINK --- */}
            <Link to="/history" className="text-warm-secondary hover:text-white transition duration-300">History</Link>
            
            <Link to="/rules" className="text-warm-secondary hover:text-white transition duration-300">Rules</Link>
            <Link to="/faqs" className="text-warm-secondary hover:text-white transition duration-300">FAQs</Link>

            {/* "Find Call" Button */}
            <button
              onClick={handleFindCall}
              className="hidden sm:flex items-center space-x-2 bg-warm-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-full font-semibold transition duration-300 shadow-md"
            >
              <Video size={20} />
              <span>Find Call</span>
            </button>

            {/* Profile Avatar */}
            <Link to="/edit-profile" title="My Profile">
              <div className="w-10 h-10 rounded-full bg-warm-secondary flex items-center justify-center text-warm-primary font-bold text-lg hover:bg-opacity-90 transition duration-300 cursor-pointer">
                {(username || currentUser.email || 'U').charAt(0).toUpperCase()}
              </div>
            </Link>

          </div>
        ) : (
          // --- LOGGED OUT STATE ---
          <div className="flex items-center space-x-6">
            <Link to="/rules" className="text-warm-secondary hover:text-white transition duration-300">Rules</Link>
            <Link to="/faqs" className="text-warm-secondary hover:text-white transition duration-300">FAQs</Link>
            <Link to="/login" className="text-warm-secondary hover:text-white transition duration-300">Login</Link>
            <Link to="/signup" className="bg-warm-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-full font-semibold transition duration-300">Sign Up</Link>
          </div>
        )}
      </div>

      {/* Mobile "Find Call" Button (Bottom Bar) */}
      {currentUser && (
        <div className="sm:hidden fixed bottom-0 left-0 w-full bg-warm-nav p-4 flex justify-around">
          <button
            onClick={handleFindCall}
            className="flex flex-col items-center text-warm-primary"
          >
            <Video size={24} />
            <span className="text-xs mt-1">Find Call</span>
          </button>
          <Link to="/friends" className="flex flex-col items-center text-warm-secondary">
            <Users size={24} />
            <span className="text-xs mt-1">Friends</span>
          </Link>
          {/* --- NEW LINK --- */}
          <Link to="/history" className="flex flex-col items-center text-warm-secondary">
            <History size={24} />
            <span className="text-xs mt-1">History</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;