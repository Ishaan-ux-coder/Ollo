import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase'; // storage is no longer needed here
import { doc, setDoc, getDoc } from "firebase/firestore";

const EditProfilePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "userProfiles", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || '');
          setAge(data.age || '');
          setDob(data.dob || '');
          setCountry(data.country || '');
        }
      } catch (err) {
        setError("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const profileData = { username, age, dob, country };
      const docRef = doc(db, "userProfiles", currentUser.uid);
      await setDoc(docRef, profileData, { merge: true });
      
      setSuccess("Profile saved successfully!");
    } catch (err) {
      setError("Failed to save profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
            <Navbar />
            <div className="pt-24 container mx-auto px-4 text-center text-white">Loading profile...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
      <Navbar />
      <div className="pt-24 container mx-auto px-4 flex justify-center items-center">
        <div className="bg-warm-card rounded-lg shadow-xl p-8 max-w-lg w-full">
          <h1 className="text-3xl font-bold text-warm-text mb-6 text-center">Edit Profile</h1>
          {error && <p className="bg-red-200 text-red-800 p-3 rounded-lg mb-4 text-center">{error}</p>}
          {success && <p className="bg-green-200 text-green-800 p-3 rounded-lg mb-4 text-center">{success}</p>}
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-gray-600 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 text-lg text-warm-text bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-warm-primary focus:ring-opacity-50 transition"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 text-lg text-warm-text bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-warm-primary focus:ring-opacity-50 transition"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 text-lg text-warm-text bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-warm-primary focus:ring-opacity-50 transition"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 text-lg text-warm-text bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-warm-primary focus:ring-opacity-50 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 px-4 py-3 font-semibold text-white bg-warm-primary rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;