// Features Page
import { Link } from "react-router-dom";
import "./Features.css";

const FeaturesPage = () => {
    const featureDetails = [
        {
            icon: "💬",
            title: "One-to-One Chat",
            description: "Private conversations with instant message delivery",
            details: [
                "Real-time message sync across devices",
                "Read receipts and delivery status",
                "Text, images, audio, and file sharing",
                "Typing indicators",
                "Message history preserved",
            ],
        },
        {
            icon: "👥",
            title: "Group Conversations",
            description: "Collaborate with teams, friends, and communities",
            details: [
                "Create groups with unlimited members",
                "Custom group names and icons",
                "Admin controls for group management",
                "Add or remove members easily",
                "Shared media and files",
            ],
        },
        {
            icon: "📸",
            title: "Status / Stories",
            description: "Share moments that disappear after 24 hours",
            details: [
                "Photo status updates",
                "Captions for your media",
                "See who viewed your status",
                "View contacts' status updates",
                "Auto-expires for privacy",
            ],
        },
        {
            icon: "📞",
            title: "Audio & Video Calls",
            description: "High-quality calls powered by WebRTC",
            details: [
                "One-on-one audio calls",
                "Face-to-face video calls",
                "Low latency connections",
                "In-call mute and video toggle",
                "Call history and logs",
            ],
        },
        {
            icon: "🔍",
            title: "User Search",
            description: "Find anyone by their unique username",
            details: [
                "Search users by @username",
                "View user profiles",
                "Start chats instantly",
                "Unique usernames for identity",
                "Quick user discovery",
            ],
        },
        {
            icon: "🛡️",
            title: "Admin Controls",
            description: "Powerful moderation tools for organizations",
            details: [
                "User management dashboard",
                "Ban/unban users",
                "View all registered users",
                "Monitor user activity",
                "Automatic group removal on ban",
            ],
        },
        {
            icon: "🟢",
            title: "Presence & Status",
            description: "See who's online in real-time",
            details: [
                "Online/offline indicators",
                "Last seen timestamps",
                "Real-time presence updates",
                "Privacy-respecting design",
                "Automatic status sync",
            ],
        },
        {
            icon: "📁",
            title: "Media Sharing",
            description: "Share images, audio, and files seamlessly",
            details: [
                "Image uploads via Cloudinary",
                "Voice message recording",
                "File attachments",
                "Optimized media delivery",
                "Secure cloud storage",
            ],
        },
    ];

    return (
        <div className="features-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav-container">
                    <Link to="/" className="landing-logo">
                        <span className="logo-icon">💬</span>
                        <span className="logo-text">ZyChat</span>
                    </Link>
                    <div className="landing-nav-links">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/auth" className="btn btn-primary">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="features-hero">
                <h1 className="features-hero-title">
                    Powerful Features for<br />
                    <span className="hero-title-accent">Modern Communication</span>
                </h1>
                <p className="features-hero-subtitle">
                    Discover everything ZyChat has to offer. Built for speed, designed for you.
                </p>
            </section>

            {/* Features List */}
            <section className="features-list">
                {featureDetails.map((feature, index) => (
                    <div
                        key={index}
                        className={`feature-detail-card glass-card ${index % 2 === 1 ? "reverse" : ""
                            }`}
                    >
                        <div className="feature-detail-icon">{feature.icon}</div>
                        <div className="feature-detail-content">
                            <h2 className="feature-detail-title">{feature.title}</h2>
                            <p className="feature-detail-description">{feature.description}</p>
                            <ul className="feature-detail-list">
                                {feature.details.map((detail, i) => (
                                    <li key={i}>
                                        <span className="check-icon">✓</span>
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </section>

            {/* CTA */}
            <section className="features-cta">
                <div className="cta-content glass-card">
                    <h2 className="cta-title">Start Using ZyChat Today</h2>
                    <p className="cta-text">
                        Experience all these features and more. Create your free account now.
                    </p>
                    <Link to="/auth" className="btn btn-primary btn-lg">
                        Get Started Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="logo-icon">💬</span>
                        <span className="logo-text">ZyChat</span>
                    </div>
                    <p className="footer-copyright">
                        © {new Date().getFullYear()} ZyChat. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default FeaturesPage;
