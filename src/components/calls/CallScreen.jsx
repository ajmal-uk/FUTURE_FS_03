// Call Screen Component with Enhanced UI and SVG Icons
import { useRef, useEffect, useState } from "react";
import { useCall } from "../../context/CallContext";
import { Avatar } from "../common";
import { IconPhone, IconVideo, IconVideoOff, IconVolume2, IconVolumeX, IconCamera } from "../common/Icons";
import "./Call.css";

const CallScreen = () => {
    const {
        currentCall,
        callStatus,
        localStream,
        remoteStream,
        callerInfo,
        endCall,
        toggleMute,
        toggleVideo,
    } = useCall();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [showEndAnimation, setShowEndAnimation] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const ringbackRef = useRef(null);

    // Play ringback tone when calling (outgoing)
    useEffect(() => {
        if (callStatus === "ringing" && currentCall?.isOutgoing) {
            const audio = new Audio();
            audio.src = "data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAABMACwALABMAGQATABkAEwAZABMAGQATABkAGQAZABkAGQAZABMAGQATABkAEwALABMACwA";
            audio.loop = true;
            audio.volume = 0.3;
            audio.play().catch(console.error);
            ringbackRef.current = audio;
        }

        if (callStatus === "connected" && ringbackRef.current) {
            ringbackRef.current.pause();
            ringbackRef.current = null;
        }

        return () => {
            if (ringbackRef.current) {
                ringbackRef.current.pause();
                ringbackRef.current = null;
            }
        };
    }, [callStatus, currentCall]);

    // Attach local stream to video element
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream to video element
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Call duration timer
    useEffect(() => {
        let interval;
        if (callStatus === "connected") {
            interval = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [callStatus]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleToggleMute = () => {
        const muted = toggleMute();
        setIsMuted(muted);
    };

    const handleToggleVideo = () => {
        const videoOff = toggleVideo();
        setIsVideoOff(videoOff);
    };

    const handleEndCall = async () => {
        setShowEndAnimation(true);

        const endSound = new Audio();
        endSound.src = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAB/f39/f399fXt7eXl3dw==";
        endSound.volume = 0.5;
        endSound.play().catch(console.error);

        setTimeout(() => {
            endCall();
        }, 500);
    };

    if (!currentCall) return null;

    const isVideoCall = currentCall.type === "video";

    return (
        <div className={`call-screen ${isVideoCall ? "video" : "audio"} ${showEndAnimation ? "ending" : ""}`}>
            {/* Video Elements */}
            {isVideoCall && (
                <>
                    <video
                        ref={remoteVideoRef}
                        className="call-video remote"
                        autoPlay
                        playsInline
                    />
                    {!isVideoOff && (
                        <video
                            ref={localVideoRef}
                            className="call-video local"
                            autoPlay
                            playsInline
                            muted
                        />
                    )}
                    {isVideoOff && (
                        <div className="call-video local video-off">
                            <IconCamera size={32} />
                        </div>
                    )}
                </>
            )}

            {/* Audio Call UI */}
            {!isVideoCall && (
                <div className="call-audio-ui">
                    <div className={`call-avatar-pulse ${callStatus === "connected" ? "connected" : ""}`}>
                        <Avatar
                            src={callerInfo?.avatarUrl}
                            name={callerInfo?.displayName}
                            size="2xl"
                        />
                    </div>
                    <h2 className="call-name">{callerInfo?.displayName || "Unknown"}</h2>
                </div>
            )}

            {/* Call Info */}
            <div className="call-info">
                <p className="call-status-text">
                    {callStatus === "ringing" && "Calling..."}
                    {callStatus === "connecting" && "Connecting..."}
                    {callStatus === "connected" && formatDuration(callDuration)}
                </p>
            </div>

            {/* Call Controls */}
            <div className="call-controls">
                <button
                    className={`call-control-btn ${isMuted ? "active" : ""}`}
                    onClick={handleToggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <IconVolumeX size={24} /> : <IconVolume2 size={24} />}
                </button>

                {isVideoCall && (
                    <button
                        className={`call-control-btn ${isVideoOff ? "active" : ""}`}
                        onClick={handleToggleVideo}
                        title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                    >
                        {isVideoOff ? <IconVideoOff size={24} /> : <IconVideo size={24} />}
                    </button>
                )}

                <button
                    className="call-control-btn end"
                    onClick={handleEndCall}
                    title="End call"
                >
                    <IconPhone size={24} />
                </button>
            </div>

            {/* End Animation Overlay */}
            {showEndAnimation && (
                <div className="call-end-overlay">
                    <div className="call-end-icon">
                        <IconPhone size={48} />
                    </div>
                    <p>Call Ended</p>
                </div>
            )}
        </div>
    );
};

export default CallScreen;
