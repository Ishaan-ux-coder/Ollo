import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signOut } from 'firebase/auth';
// Added "Navigation" icon for location fetch
import { User, Cake, MapPin, Milestone, Save, LogOut, X, Navigation } from 'lucide-react';

const EditProfilePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(true);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false); // For location button
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
          // --- UPDATE 1: Default username to email if it's not set ---
          setUsername(data.username || currentUser.email || '');
          setBio(data.bio || '');
          setDob(data.dob || '');
          setLocation(data.location || data.country || '');
          setGender(data.gender || '');
        } else {
          // --- UPDATE 2: Default username to email if no profile exists ---
          setUsername(currentUser.email || '');
        }
      } catch (err) {
        setError("Failed to fetch profile data.");
        console.error(err);
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
      const profileData = { username, bio, dob, location, gender };
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

  // --- NEW: Function to fetch user's real-time location ---
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using a free, no-key reverse geocoding API
          const response = await fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`);
          if (!response.ok) throw new Error('Failed to fetch location data.');
          
          const data = await response.json();
          
          // Extract city, state, or a fallback display name
          const userLocation = data.address?.city || data.address?.state || data.display_name;
          
          if (userLocation) {
            setLocation(userLocation.split(',')[0]); // Take the first part (e.g., "Delhi")
          } else {
            setError("Could not determine location name.");
          }
        } catch (err) {
          console.error(err);
          setError("Failed to find location from coordinates.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        if (err.code === 1) {
          setError("Please allow location access in your browser.");
        } else {
          setError("Unable to retrieve your location.");
        }
        setIsFetchingLocation(false);
      }
    );
  };
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out', error);
      setError('Failed to sign out');
    }
  };

  const InfoRow = ({ icon, label, children }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-gray-600">{label}</span>
      </div>
      <div className="w-1/2">
        {children}
      </div>
    </div>
  );

  const FormInput = ({...props}) => (
    <input 
      {...props}
      className="w-full bg-transparent text-warm-text text-right outline-none focus:text-black disabled:opacity-50"
    />
  );
  
  const FormSelect = ({ children, ...props }) => (
    <select
      {...props}
      className="w-full bg-transparent text-warm-text text-right outline-none appearance-none"
    >
      {children}
    </select>
  );

  // ... (loading spinner code remains the same) ...

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
      <Navbar />
      <div className="pt-24 container mx-auto px-4 flex justify-center items-center">
        <div className="bg-warm-card rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
          
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-warm-text">My Profile</h1>
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-warm-text">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center border-b border-gray-200">
            <div className="w-24 h-24 rounded-full bg-warm-secondary flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-warm-primary">
                {(username || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-warm-text">{username || 'New User'}</h2>
              {/* This "Save" button is your "edit option" */}
              <button onClick={handleSave} className="bg-warm-primary text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 hover:bg-opacity-90">
                <Save size={14} />
                <span>{loading ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Your bio"
              className="bg-transparent text-gray-500 text-center outline-none mt-1"
            />
            <span className="text-sm text-gray-500 mt-1">
              ID: {currentUser.uid.substring(0, 10)}...
            </span>
          </div>

          <form onSubmit={handleSave}>
            {error && <p className="bg-red-100 text-red-700 p-3 m-4 rounded-lg text-center">{error}</p>}
            {success && <p className="bg-green-100 text-green-700 p-3 m-4 rounded-lg text-center">{success}</p>}

            <InfoRow icon={<User size={20} className="text-warm-primary opacity-80" />} label="Username">
              <FormInput
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </InfoRow>

            <InfoRow icon={<Cake size={20} className="text-warm-primary opacity-80" />} label="Birthday">
              <FormInput
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{ colorScheme: 'light' }}
              />
            </InfoRow>
            
            <InfoRow icon={<Milestone size={20} className="text-warm-primary opacity-80" />} label="Gender">
              <FormSelect value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="" className="bg-warm-card">Select...</option>
                <option value="male" className="bg-warm-card">Male</option>
                <option value="female" className="bg-warm-card">Female</option>
                <option value="other" className="bg-warm-card">Other</option>
              </FormSelect>
            </InfoRow>

            {/* --- UPDATED: Location Row with Fetch Button --- */}
            <InfoRow icon={<MapPin size={20} className="text-warm-primary opacity-80" />} label="Location">
              <div className="flex items-center space-x-2">
                <FormInput
                  type="text"
                  value={location}
                  placeholder="e.g. Delhi"
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isFetchingLocation} // Disable input while fetching
                />
                <button
                  type="button" // Important: prevent form submission
                  onClick={handleFetchLocation}
                  disabled={isFetchingLocation}
                  className="text-warm-primary hover:text-warm-bg-start p-1 disabled:opacity-50"
                  title="Use my current location"
                >
                  {isFetchingLocation ? (
                    // Simple spinner
                    <div className="w-4 h-4 border-2 border-warm-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Navigation size={16} />
                  )}
                </button>
              </div>
            </InfoRow>
          </form>

          <div className="p-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-2 p-3 font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;