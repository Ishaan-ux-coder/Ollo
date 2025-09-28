// src/pages/Login/index.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to home page after successful login
    } catch (err) {
      setError(err.message);
      console.error("Error signing in:", err);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
      <Navbar />
      <div className="pt-24 container mx-auto px-4 flex justify-center items-center">
        <div className="bg-warm-card rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-warm-text mb-6 text-center">Login</h1>
          {error && <p className="bg-red-200 text-red-800 p-3 rounded-lg mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-600 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-lg text-warm-text bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-warm-primary focus:ring-opacity-50 transition"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-lg text-warm-text bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-warm-primary focus:ring-opacity-50 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-4 px-4 py-3 font-semibold text-white bg-warm-primary rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-warm-primary focus:ring-opacity-50 transition-transform transform hover:scale-105"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;