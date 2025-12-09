// Admin User Detail Page
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getUser, banUser, unbanUser, updateUserProfile } from "../../firebase/rtdbService";
import { Avatar, Loader } from "../../components/common";
import "./Admin.css";

const AdminUserDetailPage = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await getUser(uid);
                if (!userData) {
                    navigate("/admin/users");
                    return;
                }
                setUser(userData);
            } catch (error) {
                console.error("Error loading user:", error);
                navigate("/admin/users");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [uid, navigate]);

    const handleBan = async () => {
        if (!confirm(`Are you sure you want to ban @${user.username}?`)) return;

        setActionLoading(true);
        try {
            await banUser(user.uid);
            setUser((prev) => ({ ...prev, isBanned: true }));
        } catch (error) {
            console.error("Error banning user:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnban = async () => {
        if (!confirm(`Are you sure you want to unban @${user.username}?`)) return;

        setActionLoading(true);
        try {
            await unbanUser(user.uid);
            setUser((prev) => ({ ...prev, isBanned: false }));
        } catch (error) {
            console.error("Error unbanning user:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleRole = async () => {
        const newRole = user.role === "admin" ? "user" : "admin";
        if (!confirm(`Change role to ${newRole}?`)) return;

        setActionLoading(true);
        try {
            await updateUserProfile(user.uid, { role: newRole });
            setUser((prev) => ({ ...prev, role: newRole }));
        } catch (error) {
            console.error("Error updating role:", error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <Loader size="lg" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="admin-header-content">
                    <Link to="/admin/users" className="admin-back">
                        ← Back to Users
                    </Link>
                    <h1 className="admin-title">User Details</h1>
                </div>
            </header>

            <div className="admin-content">
                <div className="user-profile-card glass-card">
                    <div className="user-profile-header">
                        <Avatar
                            src={user.avatarUrl}
                            name={user.displayName}
                            size="2xl"
                            showStatus
                            isOnline={user.isOnline}
                        />
                        <div className="user-profile-info">
                            <h2>{user.displayName}</h2>
                            <p className="text-primary">@{user.username}</p>
                            <div className="user-badges">
                                {user.role === "admin" && <span className="badge">Admin</span>}
                                {user.isBanned && <span className="badge badge-danger">Banned</span>}
                                {user.isOnline && <span className="badge badge-success">Online</span>}
                            </div>
                        </div>
                    </div>

                    <div className="user-profile-details">
                        <div className="detail-section">
                            <h3>Contact Information</h3>
                            <div className="detail-row">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{user.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Phone</span>
                                <span className="detail-value">{user.phone || "Not set"}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>Profile</h3>
                            <div className="detail-row">
                                <span className="detail-label">About</span>
                                <span className="detail-value">{user.about}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Role</span>
                                <span className="detail-value">{user.role}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>Account Status</h3>
                            <div className="detail-row">
                                <span className="detail-label">Status</span>
                                <span className="detail-value">
                                    {user.isBanned ? "Banned" : "Active"}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Last Seen</span>
                                <span className="detail-value">
                                    {user.lastSeen
                                        ? new Date(user.lastSeen).toLocaleString()
                                        : "Never"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="user-profile-actions">
                        {user.isBanned ? (
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleUnban}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Loader size="sm" /> : "Unban User"}
                            </button>
                        ) : (
                            <button
                                className="btn btn-danger btn-lg"
                                onClick={handleBan}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Loader size="sm" /> : "Ban User"}
                            </button>
                        )}

                        <button
                            className="btn btn-secondary btn-lg"
                            onClick={handleToggleRole}
                            disabled={actionLoading}
                        >
                            {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailPage;
