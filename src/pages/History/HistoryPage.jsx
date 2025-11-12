import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
// --- NEW IMPORTS ---
import { 
  collection, query, where, onSnapshot, orderBy, Timestamp, 
  addDoc, serverTimestamp, getDocs 
} from 'firebase/firestore';
import { UserPlus } from 'lucide-react'; // For the button icon
// --- END NEW IMPORTS ---

// --- UPDATED PLACEHOLDER DATA (with UIDs) ---
const placeholderHistory = [
  {
    id: 'dummy1',
    connectedWithUid: 'dummy_uid_1', // Added UID
    connectedWithUsername: 'Alice',
    profileImageUrl: 'https://i.pravatar.cc/150?img=11',
    timestamp: Timestamp.fromDate(new Date(new Date().setHours(10, 30, 0, 0))),
  },
  {
    id: 'dummy2',
    connectedWithUid: 'dummy_uid_2', // Added UID
    connectedWithUsername: 'Bob',
    profileImageUrl: 'https://i.pravatar.cc/150?img=12',
    timestamp: Timestamp.fromDate(new Date(new Date().setHours(11, 45, 0, 0))),
  },
  {
    id: 'dummy3',
    connectedWithUid: 'dummy_uid_3', // Added UID
    connectedWithUsername: 'Charlie (No Pic)',
    profileImageUrl: null,
    timestamp: Timestamp.fromDate(new Date(new Date().setHours(13, 0, 0, 0))),
  },
  // ... (rest of the placeholders also have dummy UIDs)
  {
    id: 'dummy4',
    connectedWithUid: 'dummy_uid_4',
    connectedWithUsername: 'David',
    profileImageUrl: 'https://i.pravatar.cc/150?img=14',
    timestamp: Timestamp.fromDate(new Date(new Date().setHours(14, 15, 0, 0))),
  },
  {
    id: 'dummy5',
    connectedWithUid: 'dummy_uid_5',
    connectedWithUsername: 'Eva',
    profileImageUrl: 'https://i.pravatar.cc/150?img=15',
    timestamp: Timestamp.fromDate(new Date(new Date().setHours(15, 0, 0, 0))),
  },
  {
    id: 'dummy6',
    connectedWithUid: 'dummy_uid_6',
    connectedWithUsername: 'Frank',
    profileImageUrl: 'https://i.pravatar.cc/150?img=16',
    timestamp: Timestamp.fromDate(new Date(new Date().setHours(16, 30, 0, 0))),
  },
];
// --- End of Placeholder Data ---


const HistoryPage = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  // --- NEW: State to track friend request status ---
  const [requestStatus, setRequestStatus] = useState({}); // e.g., { 'user123': 'sent', 'user456': 'sending' }

  useEffect(() => {
    if (!currentUser) return;
    
    // ... (rest of the useEffect to fetch history is unchanged) ...
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const historyQuery = query(
      collection(db, 'userProfiles', currentUser.uid, 'history'),
      where('timestamp', '>=', today),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(historyData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching history: ", error);
      setLoading(false);
    });
    return () => unsubscribe();

  }, [currentUser]);

  // --- NEW: Function to handle adding a friend ---
  const handleAddFriend = async (targetUser) => {
    if (!currentUser || !targetUser || currentUser.uid === targetUser.connectedWithUid) {
      return;
    }
    
    const targetUid = targetUser.connectedWithUid;
    setRequestStatus(prev => ({ ...prev, [targetUid]: 'sending' }));

    try {
      // Check if a request already exists (either way)
      const q1 = query(collection(db, "friendRequests"), 
        where("from", "==", currentUser.uid), 
        where("to", "==", targetUid)
      );
      const q2 = query(collection(db, "friendRequests"), 
        where("from", "==", targetUid), 
        where("to", "==", currentUser.uid)
      );

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      if (!snap1.empty || !snap2.empty) {
        // A request (or friendship) already exists
        setRequestStatus(prev => ({ ...prev, [targetUid]: 'sent' }));
        return;
      }

      // If no request exists, create one
      const requestRef = collection(db, "friendRequests");
      await addDoc(requestRef, {
        from: currentUser.uid,
        to: targetUid,
        status: 'pending',
        fromEmail: currentUser.email, // You might want to add fromUsername too
        createdAt: serverTimestamp(),
      });
      
      setRequestStatus(prev => ({ ...prev, [targetUid]: 'sent' }));

    } catch (err) {
      console.error("Error sending friend request: ", err);
      setRequestStatus(prev => ({ ...prev, [targetUid]: 'idle' })); // Reset on error
    }
  };


  // --- UPDATED: HistoryCard component ---
  const HistoryCard = ({ item, onAddFriend, status, currentUserId }) => {
    const isPlaceholder = item.id.startsWith('dummy');
    const isSelf = item.connectedWithUid === currentUserId;
    
    const getButtonText = () => {
      switch (status) {
        case 'sending':
          return 'Sending...';
        case 'sent':
          return 'Request Sent';
        default:
          return 'Add Friend';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between">
        <div>
          <div className="w-full aspect-square">
            {item.profileImageUrl ? (
              <img src={item.profileImageUrl} alt={item.connectedWithUsername} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-warm-secondary flex items-center justify-center">
                <span className="text-5xl font-bold text-warm-primary">
                  {(item.connectedWithUsername || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-md font-bold text-warm-text truncate">{item.connectedWithUsername}</h3>
            <p className="text-sm text-gray-500">
              {item.timestamp
                ? (item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp))
                    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''}
            </p>
          </div>
        </div>

        {/* --- NEW: Add Friend Button --- */}
        {!isPlaceholder && !isSelf && (
          <div className="p-2">
            <button
              onClick={() => onAddFriend(item)}
              disabled={status === 'sending' || status === 'sent'}
              className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors
                ${status === 'sent' 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-warm-primary text-white hover:bg-opacity-90 disabled:bg-gray-400'
                }`}
            >
              <UserPlus size={16} />
              <span>{getButtonText()}</span>
            </button>
          </div>
        )}
      </div>
    );
  };
  // --- End of HistoryCard ---

  const isLoading = loading;
  const hasRealHistory = history.length > 0;
  const showPlaceholders = !isLoading && !hasRealHistory;
  const displayData = hasRealHistory ? history : (showPlaceholders ? placeholderHistory : []);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <div className="bg-warm-card rounded-lg shadow-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-warm-text mb-4">Today's History</h1>
          
          {isLoading ? (
            <p className="text-gray-600">Loading history...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {displayData.map(item => (
                <HistoryCard 
                  key={item.id} 
                  item={item}
                  onAddFriend={handleAddFriend}
                  status={requestStatus[item.connectedWithUid] || 'idle'}
                  currentUserId={currentUser?.uid}
                />
              ))}
            </div>
          )}

          {/* --- REMOVED: The placeholder text <p> tag that was here --- */}

          {/* Show this message if loading is done and BOTH lists are empty */}
          {!isLoading && !hasRealHistory && !showPlaceholders && (
             <p className="text-gray-600">You haven't connected with anyone today.</p>
          )}

        </div>
      </div>
    </div>
  );
};

export default HistoryPage;