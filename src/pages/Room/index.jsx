// src/pages/Room/index.jsx
import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import Navbar from "../../components/Navbar";

const RoomPage = () => {
    const { roomId } = useParams();

    const myMeeting = useCallback(async (element) => {
        if (!element) return;

        const appID = 362786641;
        const serverSecret = "634e84d1f7b556f359b9f90cb3decd75";
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID, serverSecret, roomId, Date.now().toString(), "Prakhar"
        );
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
            container: element,
            showPrejoinView: false,
            turnOnMicrophoneWhenJoining: false,
            turnOnCameraWhenJoining: false,
            scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
            
            // --- MODIFICATION IS HERE ---
            avatarBuilder: (user) => {
                return (
                    // UPDATED: Replaced the gradient with a solid background color
                    <div className="w-full h-full bg-warm-secondary flex items-center justify-center">
                        <div className="w-24 h-24 text-4xl font-semibold bg-black bg-opacity-20 rounded-full flex items-center justify-center text-warm-text">
                            {user.userName?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                );
            },
            
            // Your bottomToolbarConfig remains here
            bottomToolbarConfig: { 
                buttons: [
                    ZegoUIKitPrebuilt.CameraButton,
                    ZegoUIKitPrebuilt.MicrophoneButton,
                    {
                        text: 'Raise Hand',
                        onClick: () => {
                            alert('You raised your hand!');
                        },
                    },
                    ZegoUIKitPrebuilt.ChatButton,
                    ZegoUIKitPrebuilt.EndCallButton,
                ],
            },
        });
    }, [roomId]);

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-warm-bg-start to-warm-bg-end font-sans">
            <Navbar />
            <div className="pt-16 h-screen w-full flex">
                <div ref={myMeeting} className="w-2/5 h-full p-2" />
                <div className="w-3/5 h-full p-4">
                    <div className="bg-warm-card h-full w-full rounded-lg p-6 shadow-lg flex flex-col">
                        <h2 className="text-2xl font-bold text-warm-text mb-4">Chat & Actions</h2>
                        {/* ... (rest of your actions area) ... */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomPage;