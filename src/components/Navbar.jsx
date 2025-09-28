import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OlloLogo from '../assets/ollo_logo.png';
import { useAuth } from '../context/AuthContext'; // 👈 Check this import path
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const { currentUser } = useAuth(); // This line causes the error if AuthProvider is missing
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-warm-nav p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-3xl font-bold tracking-wide flex items-center space-x-3">
          <img src={OlloLogo} alt="Ollo Logo" className="h-8 w-8 object-contain" />
          <span className="text-warm-primary">Ollo</span>
        </Link>

        <div className="flex items-center space-x-8">
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/friends" className="text-gray-300 hover:text-white transition duration-300">
              Friends
            </Link>
            <Link to="/buy-tokens" className="text-gray-300 hover:text-white transition duration-300">
              Buy Tokens
            </Link>
            <Link to="/faqs" className="text-gray-300 hover:text-white transition duration-300">
              FAQs
            </Link>
            <Link to="/rules" className="text-gray-300 hover:text-white transition duration-300">
              Rules
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  className="text-gray-300 hover:text-white focus:outline-none"
                >
                  Profile
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/edit-profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition duration-300">
                  Login
                </Link>
                <Link to="/signup" className="bg-warm-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition duration-300">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;