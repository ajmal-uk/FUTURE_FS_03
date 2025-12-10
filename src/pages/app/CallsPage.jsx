// Calls Page - Call History (using cached data)
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCall } from "../../context/CallContext";
import { useData } from "../../context/DataContext";
import { getUser } from "../../firebase/rtdbService";
import { Avatar, Loader } from "../../components/common";
import "./Calls.css";

const CallsPage = () => {
    const { currentUser } = useAuth();
    const { startCall } = useCall();
    const { callHistory, callsLoading, refreshCallHistory } = useData();
    const [enrichedCalls, setEnrichedCalls] = useState([]);
    const [enriching, setEnriching] = useState(true);

    // Enrich calls with user data
    useEffect(() => {
        if (!currentUser || callsLoading || callHistory.length === 0) {
            setEnrichedCalls([]);
            setEnriching(false);
            return;
        }

        const enrichCalls = async () => {
            setEnriching(true);
            const enriched = await Promise.all(
                callHistory.map(async (call) => {
                    const otherUid = call.callerId === currentUser.uid
                        ? call.calleeId
                        : call.callerId;
                    const otherUser = await getUser(otherUid);
                    return {
                        ...call,
                        otherUser,
                        isOutgoing: call.callerId === currentUser.uid,
                    };
                })
            );
            setEnrichedCalls(enriched);
            setEnriching(false);
        };

        enrichCalls();
    }, [currentUser, callHistory, callsLoading]);

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else if (days === 1) {
            return "Yesterday";
        } else if (days < 7) {
            return date.toLocaleDateString([], { weekday: "short" });
        } else {
            return date.toLocaleDateString([], { month: "short", day: "numeric" });
        }
    };

    const getCallIcon = (call) => {
        if (call.type === "video") {
            return call.isOutgoing ? "📹↗" : "📹↙";
        }
        return call.isOutgoing ? "📞↗" : "📞↙";
    };

    const getCallStatus = (call) => {
        switch (call.status) {
            case "ended":
                return call.isOutgoing ? "Outgoing" : "Incoming";
            case "rejected":
                return call.isOutgoing ? "Not answered" : "Declined";
            default:
                return call.status;
        }
    };

    const handleCall = async (userId, type) => {
        try {
            await startCall(userId, type);
        } catch (error) {
            console.error("Failed to start call:", error);
        }
    };

    if (callsLoading || enriching) {
        return (
            <div className="calls-loading">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="calls-page">
            <header className="calls-header">
                <h1 className="calls-title">Calls</h1>
            </header>

            {enrichedCalls.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📞</div>
                    <h3 className="empty-state-title">No call history</h3>
                    <p className="empty-state-text">
                        Your call history will appear here.
                    </p>
                </div>
            ) : (
                <div className="calls-list">
                    {enrichedCalls.map((call) => (
                        <div key={call.callId} className="call-item">
                            <Avatar
                                src={call.otherUser?.avatarUrl}
                                name={call.otherUser?.displayName}
                                size="lg"
                            />
                            <div className="call-item-info">
                                <p className="call-item-name">
                                    {call.otherUser?.displayName || "Unknown"}
                                </p>
                                <p className="call-item-details">
                                    <span className="call-icon">{getCallIcon(call)}</span>
                                    {getCallStatus(call)} • {formatTime(call.startedAt)}
                                </p>
                            </div>
                            <div className="call-item-actions">
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleCall(call.otherUser?.uid, "audio")}
                                    title="Audio call"
                                >
                                    📞
                                </button>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleCall(call.otherUser?.uid, "video")}
                                    title="Video call"
                                >
                                    📹
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CallsPage;
