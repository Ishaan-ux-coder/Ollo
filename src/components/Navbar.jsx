// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import OlloLogo from '../assets/ollo_logo.png';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-warm-nav p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-3xl font-bold tracking-wide flex items-center space-x-3">
          <img src={OlloLogo} alt="Ollo Logo" className="h-8 w-8 object-contain" />
          <span className="text-warm-primary">Ollo</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex space-x-6">
          {/* ADDED: Friends Link */}
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
      </div>
    </nav>
  );
};

export default Navbar;