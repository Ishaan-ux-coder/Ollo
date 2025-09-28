// src/pages/Room/index.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { ZIM } from "zego-zim-web";

const RoomPage = () => {
    const { roomId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const zpRef = useRef(null);
    const meetingEl = useRef(null);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSendMessage = () => {
        if (inputValue.trim() && zpRef.current) {
            const message = { text: inputValue, sender: 'You' };
            const command = JSON.stringify(message);
            zpRef.current.sendInRoomCommand(command)
                .then((res) => {
                    if (res.errorCode === 0) {
                        setMessages(prevMessages => [...prevMessages, message]);
                        setInputValue('');
                    } else {
                        console.error("Failed to send message, error code: ", res.errorCode);
                    }
                })
                .catch(err => {
                    console.error("Failed to send message: ", err);
                });
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const appID = 362786641;
        const serverSecret = "634e84d1f7b556f359b9f90cb3decd75";
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomId,
            currentUser.uid,
            currentUser.email
        );
        
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.addPlugins({ ZIM });
        zpRef.current = zp;

        zp.joinRoom({
            container: meetingEl.current,
            showPrejoinView: false,
            turnOnMicrophoneWhenJoining: false,
            turnOnCameraWhenJoining: false,
            scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
            showRoomDetailsButton: false,
            showUserList: false,
            showPinButton: false,
            showLayoutButton: false,
            
            avatarBuilder: (user) => (
                <div className="w-full h-full bg-warm-secondary flex items-center justify-center">
                    <div className="w-24 h-24 text-4xl font-semibold bg-black bg-opacity-20 rounded-full flex items-center justify-center text-warm-text">
                        {user.userName?.charAt(0).toUpperCase()}
                    </div>
                </div>
            ),
            
            onInRoomCommandReceived: (fromUser, command) => {
                try {
                    const message = JSON.parse(command);
                    message.sender = fromUser.userName;
                    setMessages(prevMessages => [...prevMessages, message]);
                } catch (error) {
                    console.error("Error parsing received message:", error);
                }
            },

            bottomToolbarConfig: { 
                buttons: [
                    ZegoUIKitPrebuilt.CameraButton,
                    ZegoUIKitPrebuilt.MicrophoneButton,
                    ZegoUIKitPrebuilt.EndCallButton,
                ],
            },
        });

        return () => {
            if (zpRef.current) {
                zpRef.current.destroy();
                zpRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // <-- Run this effect only once

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
            <Navbar />
            <div className="pt-16 h-screen w-full flex">
                <div ref={meetingEl} className="w-2/5 h-full p-2" />
                <div className="w-3/5 h-full p-4">
                    <div className="bg-warm-card h-full w-full rounded-lg p-6 shadow-lg flex flex-col">
                        <h2 className="text-2xl font-bold text-warm-text mb-4">Chat & Actions</h2>
                        <div className="flex-grow overflow-y-auto mb-4 p-2 bg-white rounded">
                            {messages.map((message, index) => (
                                <div key={index} className={`text-warm-text mb-2 ${message.sender === 'You' ? 'text-right' : 'text-left'}`}>
                                     <strong>{message.sender}: </strong>
                                    <span className={`inline-block p-2 rounded-lg ${message.sender === 'You' ? 'bg-warm-primary text-white' : 'bg-gray-200'}`}>
                                        {message.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomPage;