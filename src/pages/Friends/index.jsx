import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';

const FriendsPage = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  // Fetch friend requests
  useEffect(() => {
    if (!currentUser) return;

    const requestsQuery = query(collection(db, 'friendRequests'), where('to', '==', currentUser.uid), where('status', '==', 'pending'));
    
    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(requestsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch friends list
  useEffect(() => {
    if (!currentUser) return;

    const userProfileRef = doc(db, 'userProfiles', currentUser.uid);

    const unsubscribe = onSnapshot(userProfileRef, async (docSnap) => {
      if (docSnap.exists() && docSnap.data().friends) {
        const friendUIDs = docSnap.data().friends;
        if (friendUIDs.length === 0) {
            setFriends([]);
            return;
        }
        const friendPromises = friendUIDs.map(uid => getDoc(doc(db, 'userProfiles', uid)));
        const friendDocs = await Promise.all(friendPromises);
        const friendsData = friendDocs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFriends(friendsData);
      } else {
        setFriends([]);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAcceptRequest = async (requestId, fromId) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' });

      const currentUserProfileRef = doc(db, 'userProfiles', currentUser.uid);
      const friendProfileRef = doc(db, 'userProfiles', fromId);

      await updateDoc(currentUserProfileRef, { friends: arrayUnion(fromId) });
      await updateDoc(friendProfileRef, { friends: arrayUnion(currentUser.uid) });
      
    } catch (error) {
      console.error("Error accepting friend request: ", error);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, 'friendRequests', requestId));
    } catch (error) {
      console.error("Error declining friend request: ", error);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        {/* Friend Requests Section */}
        <div className="bg-warm-card rounded-lg shadow-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-warm-text mb-4">Friend Requests</h1>
          {requests.length > 0 ? (
            <ul className="space-y-4">
              {requests.map(req => (
                <li key={req.id} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                  <span className="text-gray-700">{req.fromEmail}</span>
                  <div>
                    <button onClick={() => handleAcceptRequest(req.id, req.from)} className="bg-green-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-green-600">Accept</button>
                    <button onClick={() => handleDeclineRequest(req.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">You have no new friend requests.</p>
          )}
        </div>

        {/* Friends List Section */}
        <div className="bg-warm-card rounded-lg shadow-xl p-6">
          <h1 className="text-3xl font-bold text-warm-text mb-4">Your Friends</h1>
          {friends.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map(friend => (
                    <div key={friend.id} className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
                        {/* --- REPLACED IMAGE WITH AVATAR --- */}
                        <div className="w-16 h-16 rounded-full bg-warm-secondary flex items-center justify-center">
                            <span className="text-2xl font-bold text-warm-text">
                                {(friend.username || friend.email || 'U').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-warm-text">{friend.username || 'No username'}</h3>
                            <p className="text-gray-500">{friend.email}</p>
                        </div>
                    </div>
                ))}
             </div>
          ) : (
            <p className="text-gray-600">Your friends list is empty. Add some friends!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;