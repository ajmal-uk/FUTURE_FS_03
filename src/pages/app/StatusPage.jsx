// Status Page
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    createStatus,
    getUserStatuses,
    subscribeToContactStatuses,
    getAllUsers,
} from "../../firebase/rtdbService";
import { uploadChatImage } from "../../services/cloudinaryService";
import { Avatar, Loader, Modal } from "../../components/common";
import "./Status.css";

const StatusPage = () => {
    const { currentUser, userProfile } = useAuth();
    const [myStatuses, setMyStatuses] = useState([]);
    const [contactStatuses, setContactStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewingStatus, setViewingStatus] = useState(null);
    const [viewingIndex, setViewingIndex] = useState(0);

    const fileInputRef = useRef(null);

    // Load statuses
    useEffect(() => {
        if (!currentUser) return;

        const loadData = async () => {
            // Get my statuses
            const statuses = await getUserStatuses(currentUser.uid);
            setMyStatuses(statuses);

            // Get all users for contacts (simplified - in production, use contacts list)
            const unsubscribe = getAllUsers((users) => {
                const contactUids = users
                    .filter((u) => u.uid !== currentUser.uid && !u.isBanned)
                    .map((u) => u.uid);

                // Subscribe to contact statuses
                const unsubStatus = subscribeToContactStatuses(contactUids, (statuses) => {
                    setContactStatuses(statuses);
                    setLoading(false);
                });

                return () => unsubStatus();
            });

            return () => unsubscribe();
        };

        loadData();
    }, [currentUser]);

    const handleAddStatus = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const mediaUrl = await uploadChatImage(file);
            const caption = prompt("Add a caption (optional):") || "";

            await createStatus(currentUser.uid, { mediaUrl, caption });

            // Refresh my statuses
            const statuses = await getUserStatuses(currentUser.uid);
            setMyStatuses(statuses);
        } catch (error) {
            console.error("Error adding status:", error);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const openStatusViewer = (statusData, index = 0) => {
        setViewingStatus(statusData);
        setViewingIndex(index);
        setViewerOpen(true);
    };

    const nextStatus = () => {
        if (!viewingStatus) return;
        if (viewingIndex < viewingStatus.statuses.length - 1) {
            setViewingIndex(viewingIndex + 1);
        } else {
            setViewerOpen(false);
        }
    };

    const prevStatus = () => {
        if (viewingIndex > 0) {
            setViewingIndex(viewingIndex - 1);
        }
    };

    if (loading) {
        return (
            <div className="status-loading">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="status-page">
            <header className="status-header">
                <h1 className="status-title">Status</h1>
            </header>

            {/* My Status */}
            <section className="status-section">
                <h2 className="status-section-title">My Status</h2>
                <div
                    className="my-status-card"
                    onClick={() => {
                        if (myStatuses.length > 0) {
                            openStatusViewer({ user: userProfile, statuses: myStatuses });
                        } else {
                            fileInputRef.current?.click();
                        }
                    }}
                >
                    <div className="my-status-avatar">
                        <Avatar
                            src={userProfile?.avatarUrl}
                            name={userProfile?.displayName}
                            size="lg"
                        />
                        {myStatuses.length === 0 && (
                            <span className="my-status-add">+</span>
                        )}
                    </div>
                    <div className="my-status-info">
                        <p className="my-status-name">My Status</p>
                        <p className="my-status-text">
                            {myStatuses.length > 0
                                ? `${myStatuses.length} status update${myStatuses.length > 1 ? "s" : ""}`
                                : "Tap to add status"}
                        </p>
                    </div>
                    {uploading && <Loader size="sm" />}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAddStatus}
                    hidden
                />

                {myStatuses.length > 0 && (
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        + Add New Status
                    </button>
                )}
            </section>

            {/* Recent Updates */}
            <section className="status-section">
                <h2 className="status-section-title">Recent Updates</h2>

                {contactStatuses.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-state-text">No recent status updates</p>
                    </div>
                ) : (
                    <div className="status-list">
                        {contactStatuses.map((item) => (
                            <div
                                key={item.user.uid}
                                className="status-item"
                                onClick={() => openStatusViewer(item)}
                            >
                                <div className="status-ring">
                                    <Avatar
                                        src={item.user.avatarUrl}
                                        name={item.user.displayName}
                                        size="lg"
                                    />
                                </div>
                                <div className="status-item-info">
                                    <p className="status-item-name">{item.user.displayName}</p>
                                    <p className="status-item-time">
                                        {new Date(item.statuses[item.statuses.length - 1].createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Status Viewer Modal */}
            {viewerOpen && viewingStatus && (
                <div className="status-viewer" onClick={() => setViewerOpen(false)}>
                    <div className="status-viewer-content" onClick={(e) => e.stopPropagation()}>
                        <div className="status-viewer-header">
                            <Avatar
                                src={viewingStatus.user?.avatarUrl}
                                name={viewingStatus.user?.displayName}
                                size="sm"
                            />
                            <div className="status-viewer-info">
                                <p className="status-viewer-name">{viewingStatus.user?.displayName}</p>
                                <p className="status-viewer-time">
                                    {new Date(viewingStatus.statuses[viewingIndex].createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setViewerOpen(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="status-viewer-progress">
                            {viewingStatus.statuses.map((_, i) => (
                                <div
                                    key={i}
                                    className={`progress-bar ${i <= viewingIndex ? "active" : ""}`}
                                />
                            ))}
                        </div>

                        <img
                            src={viewingStatus.statuses[viewingIndex].mediaUrl}
                            alt="Status"
                            className="status-viewer-image"
                        />

                        {viewingStatus.statuses[viewingIndex].caption && (
                            <p className="status-viewer-caption">
                                {viewingStatus.statuses[viewingIndex].caption}
                            </p>
                        )}

                        <div className="status-viewer-nav">
                            <button
                                className="status-nav-btn prev"
                                onClick={prevStatus}
                                disabled={viewingIndex === 0}
                            >
                                ‹
                            </button>
                            <button
                                className="status-nav-btn next"
                                onClick={nextStatus}
                            >
                                {viewingIndex === viewingStatus.statuses.length - 1 ? "✕" : "›"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusPage;
