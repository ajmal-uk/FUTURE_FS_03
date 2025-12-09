import { useNavigate } from "react-router-dom";
import { IconChevronLeft } from "../../components/common/Icons";
import "./Legal.css";

const PrivacyPage = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-page">
            <header className="legal-header">
                <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
                    <IconChevronLeft size={24} />
                </button>
                <h1>Privacy Policy</h1>
            </header>

            <div className="legal-content glass-card">
                <p className="legal-date">Last Updated: {new Date().toLocaleDateString()}</p>

                <section className="legal-section">
                    <h2>1. Information We Collect</h2>
                    <p>At ZyChat, we prioritize your privacy. We collect the minimum information necessary to provide our services:</p>
                    <ul>
                        <li><strong>Account Information:</strong> Username, display name, and optional profile picture.</li>
                        <li><strong>Usage Data:</strong> Connection status and last seen timestamp (can be disabled).</li>
                        <li><strong>Encrypted Content:</strong> Your messages and media are end-to-end encrypted locally before sending. We cannot read your private messages.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>2. How We Use Your Information</h2>
                    <p>We use your data solely to:</p>
                    <ul>
                        <li>Facilitate real-time messaging and calls.</li>
                        <li>Authenticate your identity and prevent fraud.</li>
                        <li>Connect you with other users via the friend request system.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>3. Data Security</h2>
                    <p>
                        ZyChat implements industry-standard security measures, including AES-256-GCM encryption for messages and media.
                        Your private keys are stored only on your device and never transmitted to our servers.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>4. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, please contact us at <a href="mailto:contact.uthakkan@gmail.com">contact.uthakkan@gmail.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPage;
