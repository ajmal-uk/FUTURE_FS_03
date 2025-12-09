// Admin Users Page
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllUsers, banUser, unbanUser, updateUserProfile } from "../../firebase/rtdbService";
import { Avatar, Loader, Modal } from "../../components/common";
import "./Admin.css";

const AdminUsersPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = getAllUsers((userList) => {
            setUsers(userList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredUsers = users.filter((user) => {
        // Filter by status
        if (filter === "active" && user.isBanned) return false;
        if (filter === "banned" && !user.isBanned) return false;

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                user.username?.toLowerCase().includes(query) ||
                user.displayName?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    const handleBanUser = async (user) => {
        if (!confirm(`Are you sure you want to ban @${user.username}? They will be removed from all groups.`)) {
            return;
        }

        setActionLoading(true);
        try {
            await banUser(user.uid);
            setSelectedUser(null);
        } catch (error) {
            console.error("Error banning user:", error);
            alert("Failed to ban user. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnbanUser = async (user) => {
        if (!confirm(`Are you sure you want to unban @${user.username}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            await unbanUser(user.uid);
            setSelectedUser(null);
        } catch (error) {
            console.error("Error unbanning user:", error);
            alert("Failed to unban user. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleRole = async (user) => {
        const newRole = user.role === "admin" ? "user" : "admin";
        if (!confirm(`Are you sure you want to ${newRole === "admin" ? "promote" : "demote"} @${user.username} to ${newRole}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            await updateUserProfile(user.uid, { role: newRole });
            setSelectedUser(null);
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "Never";
        return new Date(timestamp).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="admin-header-content">
                    <Link to="/admin" className="admin-back">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="admin-title">Manage Users</h1>
                    <p className="admin-subtitle">{users.length} registered users</p>
                </div>
            </header>

            <div className="admin-content">
                {/* Filters */}
                <div className="admin-filters">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${filter === "all" ? "active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            All ({users.length})
                        </button>
                        <button
                            className={`filter-tab ${filter === "active" ? "active" : ""}`}
                            onClick={() => setFilter("active")}
                        >
                            Active ({users.filter((u) => !u.isBanned).length})
                        </button>
                        <button
                            className={`filter-tab ${filter === "banned" ? "active" : ""}`}
                            onClick={() => setFilter("banned")}
                        >
                            Banned ({users.filter((u) => u.isBanned).length})
                        </button>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="input admin-search"
                    />
                </div>

                {/* Users List */}
                <div className="users-list">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.uid}
                            className={`user-card glass-card ${user.isBanned ? "banned" : ""}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <Avatar
                                src={user.avatarUrl}
                                name={user.displayName}
                                size="lg"
                                showStatus
                                isOnline={user.isOnline}
                            />
                            <div className="user-card-info">
                                <div className="user-card-header">
                                    <h3 className="user-card-name">{user.displayName}</h3>
                                    <div className="user-card-badges">
                                        {user.role === "admin" && (
                                            <span className="badge">Admin</span>
                                        )}
                                        {user.isBanned && (
                                            <span className="badge badge-danger">Banned</span>
                                        )}
                                    </div>
                                </div>
                                <p className="user-card-username">@{user.username}</p>
                                <p className="user-card-email">{user.email}</p>
                            </div>
                            <div className="user-card-meta">
                                <p className="user-card-date">
                                    Last seen: {formatDate(user.lastSeen)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="empty-state">
                            <p className="empty-state-text">No users found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* User Detail Modal */}
            <Modal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title="User Details"
                size="md"
            >
                {selectedUser && (
                    <div className="user-detail">
                        <div className="user-detail-header">
                            <Avatar
                                src={selectedUser.avatarUrl}
                                name={selectedUser.displayName}
                                size="xl"
                            />
                            <div>
                                <h3>{selectedUser.displayName}</h3>
                                <p className="text-primary">@{selectedUser.username}</p>
                            </div>
                        </div>

                        <div className="user-detail-info">
                            <div className="detail-row">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{selectedUser.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Phone</span>
                                <span className="detail-value">{selectedUser.phone || "Not set"}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Role</span>
                                <span className="detail-value">{selectedUser.role}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Status</span>
                                <span className="detail-value">
                                    {selectedUser.isBanned ? "Banned" : "Active"}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">About</span>
                                <span className="detail-value">{selectedUser.about}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Last Seen</span>
                                <span className="detail-value">{formatDate(selectedUser.lastSeen)}</span>
                            </div>
                        </div>

                        <div className="user-detail-actions">
                            {selectedUser.isBanned ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleUnbanUser(selectedUser)}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <Loader size="sm" /> : "Unban User"}
                                </button>
                            ) : (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleBanUser(selectedUser)}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <Loader size="sm" /> : "Ban User"}
                                </button>
                            )}

                            <button
                                className="btn btn-secondary"
                                onClick={() => handleToggleRole(selectedUser)}
                                disabled={actionLoading}
                            >
                                {selectedUser.role === "admin" ? "Demote to User" : "Promote to Admin"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminUsersPage;
