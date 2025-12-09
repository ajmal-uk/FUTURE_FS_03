// Call Context - WebRTC call management with Firebase RTDB signaling
import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
    createCall,
    updateCallStatus,
    setCallOffer,
    setCallAnswer,
    addIceCandidate,
    subscribeToIncomingCalls,
    subscribeToCallSignaling,
    getUser,
} from "../firebase/rtdbService";

const CallContext = createContext(null);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error("useCall must be used within a CallProvider");
    }
    return context;
};

// STUN servers for ICE
const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
};

export const CallProvider = ({ children }) => {
    const { currentUser, userProfile } = useAuth();

    const [currentCall, setCurrentCall] = useState(null);
    const [callStatus, setCallStatus] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isCallUIOpen, setIsCallUIOpen] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [callerInfo, setCallerInfo] = useState(null);

    const peerConnectionRef = useRef(null);
    const unsubscribeSignalingRef = useRef(null);

    // Clean up peer connection
    const cleanupCall = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
        }

        if (remoteStream) {
            remoteStream.getTracks().forEach((track) => track.stop());
            setRemoteStream(null);
        }

        if (unsubscribeSignalingRef.current) {
            unsubscribeSignalingRef.current();
            unsubscribeSignalingRef.current = null;
        }

        setCurrentCall(null);
        setCallStatus(null);
        setIsCallUIOpen(false);
        setIncomingCall(null);
        setCallerInfo(null);
    }, [localStream, remoteStream]);

    // Get user media based on call type
    const getUserMedia = async (type) => {
        const constraints = {
            audio: true,
            video: type === "video",
        };
        return navigator.mediaDevices.getUserMedia(constraints);
    };

    // Create peer connection
    const createPeerConnection = (callId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                addIceCandidate(callId, event.candidate.toJSON());
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            const remote = new MediaStream();
            event.streams[0].getTracks().forEach((track) => {
                remote.addTrack(track);
            });
            setRemoteStream(remote);
        };

        // Handle connection state
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
                endCall();
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    };

    // Start outgoing call
    const startCall = async (calleeId, type) => {
        if (!currentUser) return;

        try {
            // Get local media
            const stream = await getUserMedia(type);
            setLocalStream(stream);

            // Create call in RTDB
            const callId = await createCall({
                callerId: currentUser.uid,
                calleeId,
                type,
            });

            setCurrentCall({ callId, calleeId, type, isOutgoing: true });
            setCallStatus("ringing");
            setIsCallUIOpen(true);

            // Create peer connection
            const pc = createPeerConnection(callId);

            // Add local tracks
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await setCallOffer(callId, {
                type: offer.type,
                sdp: offer.sdp,
            });

            // Subscribe to call signaling
            unsubscribeSignalingRef.current = subscribeToCallSignaling(callId, {
                onAnswer: async (answer) => {
                    if (pc.signalingState === "have-local-offer") {
                        await pc.setRemoteDescription(new RTCSessionDescription(answer));
                        setCallStatus("connected");
                    }
                },
                onCandidate: async (candidate) => {
                    if (pc.remoteDescription) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                },
                onStatusChange: (status) => {
                    setCallStatus(status);
                    if (status === "rejected" || status === "ended") {
                        cleanupCall();
                    }
                },
            });

            // Get callee info
            const calleeInfo = await getUser(calleeId);
            setCallerInfo(calleeInfo);
        } catch (error) {
            console.error("Error starting call:", error);
            cleanupCall();
            throw error;
        }
    };

    // Accept incoming call
    const acceptCall = async () => {
        if (!incomingCall || !currentUser) return;

        try {
            const { callId, callerId, type } = incomingCall;

            // Get local media
            const stream = await getUserMedia(type);
            setLocalStream(stream);

            setCurrentCall({ callId, calleeId: callerId, type, isOutgoing: false });
            setCallStatus("connecting");
            setIsCallUIOpen(true);
            setIncomingCall(null);

            // Update call status
            await updateCallStatus(callId, "accepted");

            // Create peer connection
            const pc = createPeerConnection(callId);

            // Add local tracks
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Subscribe to signaling to get offer
            const { ref, get } = await import("firebase/database");
            const { rtdb } = await import("../firebase/config");

            const offerSnapshot = await get(ref(rtdb, `calls/${callId}/signaling/offer`));
            if (offerSnapshot.exists()) {
                const offer = offerSnapshot.val();
                await pc.setRemoteDescription(new RTCSessionDescription(offer));

                // Create answer
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await setCallAnswer(callId, {
                    type: answer.type,
                    sdp: answer.sdp,
                });

                setCallStatus("connected");
            }

            // Subscribe to candidates
            unsubscribeSignalingRef.current = subscribeToCallSignaling(callId, {
                onCandidate: async (candidate) => {
                    if (pc.remoteDescription) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                },
                onStatusChange: (status) => {
                    setCallStatus(status);
                    if (status === "ended") {
                        cleanupCall();
                    }
                },
            });
        } catch (error) {
            console.error("Error accepting call:", error);
            cleanupCall();
        }
    };

    // Reject incoming call
    const rejectCall = async () => {
        if (!incomingCall) return;

        try {
            await updateCallStatus(incomingCall.callId, "rejected");
            setIncomingCall(null);
            setCallerInfo(null);
        } catch (error) {
            console.error("Error rejecting call:", error);
        }
    };

    // End current call
    const endCall = async () => {
        if (currentCall) {
            try {
                await updateCallStatus(currentCall.callId, "ended");
            } catch (error) {
                console.error("Error ending call:", error);
            }
        }
        cleanupCall();
    };

    // Toggle mute
    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                return !audioTrack.enabled;
            }
        }
        return false;
    };

    // Toggle video
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                return !videoTrack.enabled;
            }
        }
        return false;
    };

    // Listen for incoming calls
    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = subscribeToIncomingCalls(currentUser.uid, async (call) => {
            if (!currentCall && !incomingCall) {
                setIncomingCall(call);
                const caller = await getUser(call.callerId);
                setCallerInfo(caller);
            }
        });

        return () => unsubscribe();
    }, [currentUser, currentCall, incomingCall]);

    const value = {
        currentCall,
        callStatus,
        localStream,
        remoteStream,
        isCallUIOpen,
        incomingCall,
        callerInfo,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
    };

    return (
        <CallContext.Provider value={value}>
            {children}
        </CallContext.Provider>
    );
};

export default CallContext;
