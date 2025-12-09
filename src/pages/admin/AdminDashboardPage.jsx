// Admin Dashboard Page
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../../firebase/rtdbService";
import { ref, get } from "firebase/database";
import { rtdb } from "../../firebase/config";
import { Loader } from "../../components/common";
import "./Admin.css";

const AdminDashboardPage = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        bannedUsers: 0,
        totalChats: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Get users
                const usersSnapshot = await get(ref(rtdb, "users"));
                let totalUsers = 0;
                let activeUsers = 0;
                let bannedUsers = 0;

                if (usersSnapshot.exists()) {
                    usersSnapshot.forEach((child) => {
                        const user = child.val();
                        totalUsers++;
                        if (user.isBanned) {
                            bannedUsers++;
                        } else {
                            activeUsers++;
                        }
                    });
                }

                // Get chats count
                const chatsSnapshot = await get(ref(rtdb, "chats"));
                const totalChats = chatsSnapshot.exists()
                    ? Object.keys(chatsSnapshot.val()).length
                    : 0;

                setStats({
                    totalUsers,
                    activeUsers,
                    bannedUsers,
                    totalChats,
                });
            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

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
                    <Link to="/app/chats" className="admin-back">
                        ← Back to App
                    </Link>
                    <h1 className="admin-title">Admin Dashboard</h1>
                    <p className="admin-subtitle">Manage your ZyChat application</p>
                </div>
            </header>

            <div className="admin-content">
                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card glass-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <p className="stat-value">{stats.totalUsers}</p>
                            <p className="stat-label">Total Users</p>
                        </div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <p className="stat-value">{stats.activeUsers}</p>
                            <p className="stat-label">Active Users</p>
                        </div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon">🚫</div>
                        <div className="stat-info">
                            <p className="stat-value">{stats.bannedUsers}</p>
                            <p className="stat-label">Banned Users</p>
                        </div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon">💬</div>
                        <div className="stat-info">
                            <p className="stat-value">{stats.totalChats}</p>
                            <p className="stat-label">Total Chats</p>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <section className="admin-section">
                    <h2 className="admin-section-title">Quick Actions</h2>
                    <div className="admin-links">
                        <Link to="/admin/users" className="admin-link glass-card">
                            <span className="admin-link-icon">👥</span>
                            <div className="admin-link-content">
                                <h3>Manage Users</h3>
                                <p>View, ban, and manage all registered users</p>
                            </div>
                            <span className="admin-link-arrow">→</span>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
