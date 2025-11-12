import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { 
  collection, query, where, onSnapshot, doc, updateDoc, 
  deleteDoc, getDocs, documentId, getDoc
} from 'firebase/firestore';
import { Check, X, Phone } from 'lucide-react';

// --- PLACEHOLDER DATA (Unchanged) ---
const placeholderRequests = [
  { id: 'dummyReq1', fromUsername: 'CuriousUser', fromEmail: 'curious@example.com', profileImageUrl: 'https://i.pravatar.cc/150?img=21' },
  { id: 'dummyReq2', fromUsername: 'NewFriend', fromEmail: 'new@example.com', profileImageUrl: null },
];
const placeholderFriends = [
  { id: 'dummyFriend1', username: 'Longtime Pal', email: 'pal@example.com', profileImageUrl: 'https://i.pravatar.cc/150?img=23' },
  { id: 'dummyFriend2', username: 'Gamer Tag', email: 'gamer@example.com', profileImageUrl: 'https://i.pravatar.cc/150?img=24' },
  { id: 'dummyFriend3', username: 'Chatty Cathy', email: 'cathy@example.com', profileImageUrl: 'https://i.pravatar.cc/150?img=25' },
];
// --- END PLACEHOLDER DATA ---

const FriendsPage = () => {
  const { currentUser } = useAuth();
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // --- Combined useEffect for all friend/request logic ---
  useEffect(() => {
    if (!currentUser) return;

    // --- Part A: Function to update the "My Friends" list ---
    const updateFriendsList = async () => {
      setLoadingFriends(true);
      try {
        const q1 = query(
          collection(db, "friendRequests"),
          where("to", "==", currentUser.uid),
          where("status", "==", "accepted")
        );
        const q2 = query(
          collection(db, "friendRequests"),
          where("from", "==", currentUser.uid),
          where("status", "==", "accepted")
        );

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const friendUIDs = new Set();
        snap1.docs.forEach(doc => friendUIDs.add(doc.data().from));
        snap2.docs.forEach(doc => friendUIDs.add(doc.data().to));

        const uidArray = Array.from(friendUIDs);

        if (uidArray.length > 0) {
          const friendsQuery = query(
            collection(db, "userProfiles"),
            where(documentId(), "in", uidArray)
          );
          const friendsSnapshot = await getDocs(friendsQuery);
          const friendsList = friendsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setFriends(friendsList);
        } else {
          setFriends([]);
        }
      } catch (err) {
        console.error("Error fetching friends list: ", err);
      }
      setLoadingFriends(false);
    };

    // --- Part B: Listener for PENDING requests ---
    const requestsQuery = query(
      collection(db, "friendRequests"),
      where("to", "==", currentUser.uid),
      where("status", "==", "pending")
    );
    const unsubRequests = onSnapshot(requestsQuery, async (snapshot) => {
      setLoadingRequests(true);
      const requests = [];
      for (const requestDoc of snapshot.docs) {
        const requestData = requestDoc.data();
        const userProfileRef = doc(db, "userProfiles", requestData.from);
        const userProfileSnap = await getDoc(userProfileRef);
        requests.push({
          id: requestDoc.id,
          ...requestData,
          fromUsername: userProfileSnap.data()?.username || requestData.fromEmail,
          profileImageUrl: userProfileSnap.data()?.profileImageUrl || null,
        });
      }
      setFriendRequests(requests);
      setLoadingRequests(false);
    });

    // --- Part C: Listener for ACCEPTED requests ---
    const acceptedQueryTo = query(
      collection(db, "friendRequests"),
      where("to", "==", currentUser.uid),
      where("status", "==", "accepted")
    );
    const acceptedQueryFrom = query(
      collection(db, "friendRequests"),
      where("from", "==", currentUser.uid),
      where("status", "==", "accepted")
    );
    
    const unsubAcceptedTo = onSnapshot(acceptedQueryTo, () => updateFriendsList());
    const unsubAcceptedFrom = onSnapshot(acceptedQueryFrom, () => updateFriendsList());

    // --- Part D: Initial Load ---
    updateFriendsList();

    // --- Part E: Cleanup ---
    return () => {
      unsubRequests();
      unsubAcceptedTo();
      unsubAcceptedFrom();
    };
  }, [currentUser]);

  // --- 3. Handle Accept Request ("Tick") (WITH LOGGING) ---
  const handleAccept = async (request) => {
    if (!currentUser) return;
    console.log("Accepting request...", request.id);
    const requestRef = doc(db, "friendRequests", request.id);
    try {
      await updateDoc(requestRef, { status: "accepted" });
      console.log("Request accepted successfully in Firestore!");
    } catch (err) {
      console.error("Error accepting friend request: ", err);
      alert(`Error accepting request: ${err.message}. Check console and Firestore Rules.`);
    }
  };

  // --- 4. Handle Reject Request ("Cross") (WITH LOGGING) ---
  const handleReject = async (request) => {
    console.log("Rejecting request...", request.id);
    const requestRef = doc(db, "friendRequests", request.id);
    try {
      await deleteDoc(requestRef);
      console.log("Request rejected successfully in Firestore!");
    } catch (err) {
      console.error("Error rejecting friend request: ", err);
      alert(`Error rejecting request: ${err.message}. Check console and Firestore Rules.`);
    }
  };

  // --- 5. Determine which lists to display (Unchanged) ---
  const displayRequests = friendRequests.length > 0 ? friendRequests : (loadingRequests ? [] : placeholderRequests);
  const displayFriends = friends.length > 0 ? friends : (loadingFriends ? [] : placeholderFriends);
  const isRequestPlaceholder = friendRequests.length === 0 && !loadingRequests;
  const isFriendPlaceholder = friends.length === 0 && !loadingFriends;

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <div className="bg-warm-card rounded-lg shadow-xl p-6 mb-8">
          
          {/* --- Friend Requests Section --- */}
          <h2 className="text-2xl font-bold text-warm-text mb-4">Friend Requests</h2>
          {loadingRequests ? (
            <p className="text-gray-600">Loading requests...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayRequests.length === 0 && !isRequestPlaceholder && (
                <p className="text-gray-500 italic">No pending friend requests.</p>
              )}
              {displayRequests.map(req => (
                <RequestCard 
                  key={req.id} 
                  request={req}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isPlaceholder={isRequestPlaceholder}
                />
              ))}
            </div>
          )}

          {/* --- Divider --- */}
          <div className="border-b border-gray-200 my-8"></div>

          {/* --- My Friends Section --- */}
          <h2 className="text-2xl font-bold text-warm-text mb-4">My Friends</h2>
          {loadingFriends ? (
            <p className="text-gray-600">Loading friends...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayFriends.length === 0 && !isFriendPlaceholder && (
                <p className="text-gray-500 italic">You haven't added any friends yet.</p>
              )}
              {displayFriends.map(friend => (
                <FriendCard 
                  key={friend.id} 
                  friend={friend} 
                  isPlaceholder={isFriendPlaceholder}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- Helper Card Components (Unchanged) ---

const RequestCard = ({ request, onAccept, onReject, isPlaceholder }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
    <div className="flex items-center space-x-3 overflow-hidden">
      {request.profileImageUrl ? (
        <img src={request.profileImageUrl} alt={request.fromUsername} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-warm-secondary flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-warm-primary">
            {(request.fromUsername || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="overflow-hidden">
        <h3 className="text-lg font-semibold text-warm-text truncate">{request.fromUsername}</h3>
        <p className="text-sm text-gray-500 truncate">{request.fromEmail}</p>
      </div>
    </div>
    <div className="flex space-x-2 flex-shrink-0">
      <button
        onClick={() => onAccept(request)}
        disabled={isPlaceholder}
        className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50"
        title="Accept"
      >
        <Check size={20} />
      </button>
      <button
        onClick={() => onReject(request)}
        disabled={isPlaceholder}
        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
        title="Reject"
      >
        <X size={20} />
      </button>
    </div>
  </div>
);

const FriendCard = ({ friend, isPlaceholder }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
    <div className="flex items-center space-x-3 overflow-hidden">
      {friend.profileImageUrl ? (
        <img src={friend.profileImageUrl} alt={friend.username} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-warm-secondary flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-warm-primary">
            {(friend.username || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="overflow-hidden">
        <h3 className="text-lg font-semibold text-warm-text truncate">{friend.username}</h3>
        <p className="text-sm text-gray-500 truncate">{friend.email}</p>
      </div>
    </div>
    <div className="flex space-x-2 flex-shrink-0">
      <button
        disabled={isPlaceholder}
        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
        title="Call (Coming Soon)"
      >
        <Phone size={20} />
      </button>
    </div>
  </div>
);

export default FriendsPage;