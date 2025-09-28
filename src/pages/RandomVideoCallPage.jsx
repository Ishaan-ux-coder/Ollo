import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

const RandomVideoCallPage = () => {
  const { roomId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pc = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const iceCandidateQueue = useRef([]);

  const [callStatus, setCallStatus] = useState("Connecting...");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [remoteUser, setRemoteUser] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    pc.current = new RTCPeerConnection(servers);
    const peerConnection = pc.current;

    const setupCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        remoteStreamRef.current = new MediaStream();
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current;

        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        peerConnection.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            remoteStreamRef.current.addTrack(track);
          });
          setCallStatus("Connected");
        };
        
        await joinOrCreateRoom();
        listenForMessages();

      } catch (error) {
        console.error("Error during call setup:", error);
        setCallStatus("Waiting for a partner to connect...");
      }
    };

    const joinOrCreateRoom = async () => {
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnapshot = await getDoc(roomRef);
      const candidatesCollection = collection(db, `rooms/${roomId}/iceCandidates`);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) addDoc(candidatesCollection, event.candidate.toJSON());
      };

      if (!roomSnapshot.exists()) {
        const offerDescription = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offerDescription);
        await setDoc(roomRef, { 
            offer: { sdp: offerDescription.sdp, type: offerDescription.type },
            creatorId: currentUser.uid,
            creatorEmail: currentUser.email
        });

        const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
          const data = snapshot.data();
          if (peerConnection && !peerConnection.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            peerConnection.setRemoteDescription(answerDescription).then(() => {
              iceCandidateQueue.current.forEach(candidate => peerConnection.addIceCandidate(candidate));
              iceCandidateQueue.current = [];
            });
            setRemoteUser({ uid: data.joinerId, email: data.joinerEmail });
          }
        });
        return unsubscribeRoom;
      } else {
        const roomData = roomSnapshot.data();
        setRemoteUser({ uid: roomData.creatorId, email: roomData.creatorEmail });
        const offer = roomData.offer;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answerDescription = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answerDescription);
        await updateDoc(roomRef, { 
            answer: { sdp: answerDescription.sdp, type: answerDescription.type },
            joinerId: currentUser.uid,
            joinerEmail: currentUser.email
        });
      }

      const unsubscribeCandidates = onSnapshot(candidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            if (peerConnection?.remoteDescription) {
                peerConnection.addIceCandidate(candidate);
            } else {
                iceCandidateQueue.current.push(candidate);
            }
          }
        });
      });
      return unsubscribeCandidates;
    };

    const listenForMessages = () => {
      const messagesCollection = collection(db, `rooms/${roomId}/messages`);
      const q = query(messagesCollection, orderBy("timestamp", "asc"));
      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => doc.data()));
      });
      return unsubscribeMessages;
    };

    const unsubscribers = [];
    setupCall().then(unsubs => {
        if(unsubs) {
            if(Array.isArray(unsubs)) {
                unsubscribers.push(...unsubs);
            } else {
                unsubscribers.push(unsubs);
            }
        }
    });

    return () => {
      unsubscribers.forEach(unsub => unsub && unsub());
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
      if (pc.current) pc.current.close();
    };
  }, [roomId, currentUser, navigate]);

  const handleSendMessage = async () => {
    if (inputValue.trim() && currentUser) {
      const messagesCollection = collection(db, `rooms/${roomId}/messages`);
      await addDoc(messagesCollection, {
        text: inputValue,
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        timestamp: serverTimestamp(),
      });
      setInputValue('');
    }
  };

  const handleAddFriend = async () => {
    if (currentUser && remoteUser) {
        alert(`Friend request sent to ${remoteUser.email}!`);
        const requestRef = collection(db, "friendRequests");
        await addDoc(requestRef, {
          from: currentUser.uid,
          to: remoteUser.uid,
          status: 'pending',
          fromEmail: currentUser.email,
          createdAt: serverTimestamp(),
        });
    }
  };

  // --- NEW FUNCTION ---
  const handleNextChat = () => {
    const newRoomCode = Math.random().toString(36).substring(2, 8);
    navigate(`/random/${newRoomCode}`);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white font-sans">
      <Navbar />
      <div className="pt-16 h-[calc(100vh-4rem)] w-full flex">
        <div className="w-3/5 h-full p-4 flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-center">{callStatus}</h1>
            <div className="flex flex-grow gap-4 justify-center items-center">
                <div className="w-1/2 aspect-square bg-black rounded-lg overflow-hidden">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <div className="w-1/2 aspect-square bg-black rounded-lg overflow-hidden">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
            </div>
        </div>
        <div className="w-2/5 h-full p-4">
            <div className="bg-warm-card h-full w-full rounded-lg p-6 shadow-lg flex flex-col">
                <h2 className="text-2xl font-bold text-warm-text mb-4">Chat & Actions</h2>
                <div className="flex-grow overflow-y-auto mb-4 p-2 bg-white rounded">
                    {messages.map((msg, index) => (
                        <div key={index} className={`mb-2 ${msg.senderId === currentUser.uid ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-2 rounded-lg ${msg.senderId === currentUser.uid ? 'bg-warm-primary text-white' : 'bg-gray-200 text-warm-text'}`}>
                                <p className="text-sm font-bold">{msg.senderId === currentUser.uid ? 'You' : msg.senderEmail}</p>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex mb-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-grow px-4 py-2 text-warm-text bg-white border-2 border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-warm-primary"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="px-6 py-2 font-semibold text-white bg-warm-primary rounded-r-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-warm-primary"
                    >
                        Send
                    </button>
                </div>
                {remoteUser && (
                    <button
                        onClick={handleAddFriend}
                        className="w-full mb-4 px-4 py-3 font-semibold text-warm-text bg-warm-secondary rounded-lg hover:bg-opacity-90"
                    >
                        Add {remoteUser.email} as a Friend
                    </button>
                )}
                {/* --- NEW BUTTON --- */}
                <button
                    onClick={handleNextChat}
                    className="w-full px-4 py-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                    Find New Partner
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RandomVideoCallPage;