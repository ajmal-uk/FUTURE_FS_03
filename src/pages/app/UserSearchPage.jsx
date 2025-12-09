// User Search Page - With Friend Request System
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    searchUsers,
    getConnectionStatus,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
    subscribeToConnectionRequests,
    subscribeToConnections,
    createOrGetChat
} from "../../firebase/rtdbService";
import { Avatar, Loader } from "../../components/common";
import { IconSearch, IconPlus, IconX, IconMessageSquare } from "../../components/common/Icons";
import "./UserSearch.css";

const UserSearchPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [connectionStatuses, setConnectionStatuses] = useState({});
    const [pendingRequests, setPendingRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [activeTab, setActiveTab] = useState("search"); // search, requests, connections
    const [actionLoading, setActionLoading] = useState({});

    // Subscribe to incoming requests
    useEffect(() => {
        if (!currentUser) return;

        const unsubRequests = subscribeToConnectionRequests(currentUser.uid, (requests) => {
            setPendingRequests(requests);
        });

        const unsubConnections = subscribeToConnections(currentUser.uid, (conns) => {
            setConnections(conns);
        });

        return () => {
            unsubRequests();
            unsubConnections();
        };
    }, [currentUser]);

    // Handle search
    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!searchQuery.trim() || !currentUser) return;

        setSearching(true);
        setSearchResults([]);

        try {
            const results = await searchUsers(searchQuery.trim(), currentUser.uid);
            setSearchResults(results);

            // Get connection status for each result
            const statuses = {};
            for (const user of results) {
                statuses[user.uid] = await getConnectionStatus(currentUser.uid, user.uid);
            }
            setConnectionStatuses(statuses);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    };

    // Send connection request
    const handleSendRequest = async (userId) => {
        if (!currentUser) return;

        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const result = await sendConnectionRequest(currentUser.uid, userId);
            if (result === "connected") {
                setConnectionStatuses(prev => ({ ...prev, [userId]: "connected" }));
            } else {
                setConnectionStatuses(prev => ({ ...prev, [userId]: "pending_sent" }));
            }
        } catch (error) {
            console.error("Error sending request:", error);
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    // Cancel request
    const handleCancelRequest = async (userId) => {
        if (!currentUser) return;

        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            await cancelConnectionRequest(currentUser.uid, userId);
            setConnectionStatuses(prev => ({ ...prev, [userId]: "none" }));
        } catch (error) {
            console.error("Error canceling request:", error);
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    // Accept request
    const handleAcceptRequest = async (request) => {
        setActionLoading(prev => ({ ...prev, [request.fromUid]: true }));
        try {
            await acceptConnectionRequest(request.fromUid, currentUser.uid);
        } catch (error) {
            console.error("Error accepting request:", error);
        } finally {
            setActionLoading(prev => ({ ...prev, [request.fromUid]: false }));
        }
    };

    // Reject request
    const handleRejectRequest = async (request) => {
        setActionLoading(prev => ({ ...prev, [request.fromUid]: true }));
        try {
            await rejectConnectionRequest(request.fromUid, currentUser.uid);
        } catch (error) {
            console.error("Error rejecting request:", error);
        } finally {
            setActionLoading(prev => ({ ...prev, [request.fromUid]: false }));
        }
    };

    // Open chat with connected user
    const handleOpenChat = async (userId) => {
        if (!currentUser) return;

        setActionLoading(prev => ({ ...prev, [`chat_${userId}`]: true }));
        try {
            const chatId = await createOrGetChat(currentUser.uid, userId);
            navigate(`/app/chats/${chatId}`);
        } catch (error) {
            console.error("Error opening chat:", error);
        } finally {
            setActionLoading(prev => ({ ...prev, [`chat_${userId}`]: false }));
        }
    };

    // Render connection button based on status
    const renderConnectionButton = (user) => {
        const status = connectionStatuses[user.uid];
        const loading = actionLoading[user.uid];

        if (loading) {
            return <button className="btn btn-secondary btn-sm" disabled><Loader size="sm" /></button>;
        }

        switch (status) {
            case "connected":
                return (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenChat(user.uid)}
                    >
                        <IconMessageSquare size={16} /> Chat
                    </button>
                );
            case "pending_sent":
                return (
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCancelRequest(user.uid)}
                    >
                        Pending ✕
                    </button>
                );
            case "pending_received":
                return (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAcceptRequest({ fromUid: user.uid })}
                    >
                        Accept
                    </button>
                );
            default:
                return (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSendRequest(user.uid)}
                    >
                        <IconPlus size={16} /> Add
                    </button>
                );
        }
    };

    return (
        <div className="search-page">
            <header className="search-header">
                <h1 className="search-title">Connect</h1>
                {pendingRequests.length > 0 && (
                    <span className="request-badge">{pendingRequests.length}</span>
                )}
            </header>

            {/* Tabs */}
            <div className="search-tabs">
                <button
                    className={`search-tab ${activeTab === "search" ? "active" : ""}`}
                    onClick={() => setActiveTab("search")}
                >
                    <IconSearch size={18} /> Find Users
                </button>
                <button
                    className={`search-tab ${activeTab === "requests" ? "active" : ""}`}
                    onClick={() => setActiveTab("requests")}
                >
                    Requests {pendingRequests.length > 0 && <span className="tab-badge">{pendingRequests.length}</span>}
                </button>
                <button
                    className={`search-tab ${activeTab === "connections" ? "active" : ""}`}
                    onClick={() => setActiveTab("connections")}
                >
                    Friends ({connections.length})
                </button>
            </div>

            <div className="search-content">
                {/* Search Tab */}
                {activeTab === "search" && (
                    <>
                        <form className="search-form" onSubmit={handleSearch}>
                            <div className="search-input-wrapper">
                                <IconSearch size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or @username..."
                                    className="search-input"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!searchQuery.trim() || searching}
                            >
                                {searching ? <Loader size="sm" /> : "Search"}
                            </button>
                        </form>

                        <div className="search-results">
                            {searching && (
                                <div className="search-loading">
                                    <Loader />
                                    <p>Searching...</p>
                                </div>
                            )}

                            {!searching && searchResults.length === 0 && searchQuery && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">🔍</div>
                                    <h3 className="empty-state-title">No users found</h3>
                                    <p className="empty-state-text">
                                        Try searching with a different name or username.
                                    </p>
                                </div>
                            )}

                            {!searching && searchResults.length === 0 && !searchQuery && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">👥</div>
                                    <h3 className="empty-state-title">Find Friends</h3>
                                    <p className="empty-state-text">
                                        Search by name or username to connect with others.
                                    </p>
                                </div>
                            )}

                            {searchResults.map((user) => (
                                <div key={user.uid} className="user-card glass-card">
                                    <Avatar
                                        src={user.avatarUrl}
                                        name={user.displayName}
                                        size="lg"
                                        showStatus
                                        isOnline={user.isOnline}
                                    />
                                    <div className="user-card-info">
                                        <h3 className="user-card-name">{user.displayName}</h3>
                                        <p className="user-card-username">@{user.username}</p>
                                    </div>
                                    {renderConnectionButton(user)}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Requests Tab */}
                {activeTab === "requests" && (
                    <div className="requests-list">
                        {pendingRequests.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📬</div>
                                <h3 className="empty-state-title">No pending requests</h3>
                                <p className="empty-state-text">
                                    When someone sends you a friend request, it will appear here.
                                </p>
                            </div>
                        ) : (
                            pendingRequests.map((request) => (
                                <div key={request.requestId} className="request-card glass-card">
                                    <Avatar
                                        src={request.fromUser?.avatarUrl}
                                        name={request.fromUser?.displayName}
                                        size="lg"
                                    />
                                    <div className="request-card-info">
                                        <h3 className="request-card-name">{request.fromUser?.displayName}</h3>
                                        <p className="request-card-username">@{request.fromUser?.username}</p>
                                        <p className="request-card-time">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="request-card-actions">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleAcceptRequest(request)}
                                            disabled={actionLoading[request.fromUid]}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleRejectRequest(request)}
                                            disabled={actionLoading[request.fromUid]}
                                        >
                                            <IconX size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Connections Tab */}
                {activeTab === "connections" && (
                    <div className="connections-list">
                        {connections.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">👋</div>
                                <h3 className="empty-state-title">No connections yet</h3>
                                <p className="empty-state-text">
                                    Find and connect with friends to start chatting!
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setActiveTab("search")}
                                >
                                    Find Friends
                                </button>
                            </div>
                        ) : (
                            connections.map((conn) => (
                                <div key={conn.uid} className="connection-card glass-card">
                                    <Avatar
                                        src={conn.user?.avatarUrl}
                                        name={conn.user?.displayName}
                                        size="lg"
                                        showStatus
                                        isOnline={conn.user?.isOnline}
                                    />
                                    <div className="connection-card-info">
                                        <h3 className="connection-card-name">{conn.user?.displayName}</h3>
                                        <p className="connection-card-username">@{conn.user?.username}</p>
                                    </div>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleOpenChat(conn.uid)}
                                        disabled={actionLoading[`chat_${conn.uid}`]}
                                    >
                                        {actionLoading[`chat_${conn.uid}`] ? <Loader size="sm" /> : (
                                            <><IconMessageSquare size={16} /> Chat</>
                                        )}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSearchPage;
