// Incoming Call Modal with Sound and SVG Icons
import { useEffect, useRef } from "react";
import { useCall } from "../../context/CallContext";
import { Avatar } from "../common";
import { IconPhone, IconVideo } from "../common/Icons";
import "./Call.css";

const IncomingCallModal = () => {
    const { incomingCall, callerInfo, acceptCall, rejectCall } = useCall();
    const audioRef = useRef(null);

    // Play ringing sound
    useEffect(() => {
        if (incomingCall) {
            // Create and play ringtone
            const audio = new Audio();
            audio.src = "data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAABkAGQAZABkAKQAZACkAGQApABkAKQAZACkAGQApABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAA==";
            audio.loop = true;
            audio.volume = 0.5;
            audio.play().catch(console.error);
            audioRef.current = audio;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [incomingCall]);

    if (!incomingCall) return null;

    const handleAccept = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        acceptCall();
    };

    const handleReject = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        rejectCall();
    };

    return (
        <div className="call-modal-backdrop">
            <div className="call-modal glass-card">
                <div className="call-modal-content">
                    <div className="call-avatar-ring">
                        <Avatar
                            src={callerInfo?.avatarUrl}
                            name={callerInfo?.displayName}
                            size="2xl"
                        />
                    </div>
                    <h2 className="call-modal-name">{callerInfo?.displayName || "Unknown"}</h2>
                    <p className="call-modal-type">
                        Incoming {incomingCall.type === "video" ? "Video" : "Audio"} Call
                    </p>
                    <p className="call-modal-ringing">
                        <span className="ringing-dot"></span>
                        <span className="ringing-dot"></span>
                        <span className="ringing-dot"></span>
                    </p>
                </div>
                <div className="call-modal-actions">
                    <button
                        className="call-btn decline"
                        onClick={handleReject}
                    >
                        <span className="call-btn-icon">
                            <IconPhone size={28} />
                        </span>
                        <span className="call-btn-label">Decline</span>
                    </button>
                    <button
                        className="call-btn accept"
                        onClick={handleAccept}
                    >
                        <span className="call-btn-icon">
                            {incomingCall.type === "video" ? <IconVideo size={28} /> : <IconPhone size={28} />}
                        </span>
                        <span className="call-btn-label">Accept</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
