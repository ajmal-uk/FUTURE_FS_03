// Landing Page
import { Link } from "react-router-dom";
import "./Landing.css";

const LandingPage = () => {
    const features = [
        {
            icon: "💬",
            title: "Real-Time Chats",
            description: "Instant messaging with real-time delivery and read receipts.",
        },
        {
            icon: "👥",
            title: "Group Conversations",
            description: "Create groups for your teams, friends, or communities.",
        },
        {
            icon: "📸",
            title: "Status Sharing",
            description: "Share moments that disappear after 24 hours.",
        },
        {
            icon: "📞",
            title: "Audio & Video Calls",
            description: "Crystal-clear voice and video calls with anyone.",
        },
        {
            icon: "🔒",
            title: "Secure & Private",
            description: "Your conversations are protected and private.",
        },
        {
            icon: "⚡",
            title: "Lightning Fast",
            description: "Built for speed with real-time Firebase infrastructure.",
        },
    ];

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav-container">
                    <Link to="/" className="landing-logo">
                        <span className="logo-icon">💬</span>
                        <span className="logo-text">ZyChat</span>
                    </Link>
                    <div className="landing-nav-links">
                        <Link to="/features" className="nav-link">Features</Link>
                        <Link to="/auth" className="btn btn-primary">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Fast, Secure,<br />
                        <span className="hero-title-accent">Real-Time Chat.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Chat one-to-one, in groups, share status, and jump into audio or video calls – all in your browser.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/auth" className="btn btn-primary btn-lg">
                            Open ZyChat
                        </Link>
                        <Link to="/features" className="btn btn-secondary btn-lg">
                            View Features
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-mockup glass-card">
                        <div className="mockup-header">
                            <div className="mockup-avatar"></div>
                            <div className="mockup-info">
                                <div className="mockup-name"></div>
                                <div className="mockup-status"></div>
                            </div>
                        </div>
                        <div className="mockup-messages">
                            <div className="mockup-message received">
                                <div className="message-bubble">Hey! Have you tried ZyChat yet? 🚀</div>
                            </div>
                            <div className="mockup-message sent">
                                <div className="message-bubble">Just downloading it now! Looks amazing ✨</div>
                            </div>
                            <div className="mockup-message received">
                                <div className="message-bubble">Let's start a group call! 📞</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Everything You Need</h2>
                    <p className="section-subtitle">
                        All the features you love, reimagined for the modern web.
                    </p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card glass-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content glass-card">
                    <h2 className="cta-title">Ready to Get Started?</h2>
                    <p className="cta-text">
                        Join ZyChat today and experience the future of real-time communication.
                    </p>
                    <Link to="/auth" className="btn btn-primary btn-lg">
                        Create Your Account
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
                    <p className="footer-tagline">
                        Fast, secure, real-time conversations with anyone, anywhere.
                    </p>
                    <div className="footer-links">
                        <Link to="/features">Features</Link>
                        <Link to="/auth">Sign In</Link>
                    </div>
                    <p className="footer-copyright">
                        © {new Date().getFullYear()} ZyChat. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
