import { useNavigate } from "react-router-dom";
import { IconChevronLeft, IconMessageSquare } from "../../components/common/Icons";
import "../legal/Legal.css";

const HelpPage = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-page">
            <header className="legal-header">
                <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
                    <IconChevronLeft size={24} />
                </button>
                <h1>Help & Support</h1>
            </header>

            <div className="legal-content glass-card">
                <section className="legal-section">
                    <h2>Contact Support</h2>
                    <p>
                        Need assistance with ZyChat? Our support team is here to help you with any issues or questions you may have.
                    </p>

                    <div className="contact-card">
                        <div className="contact-icon">
                            <IconMessageSquare size={32} />
                        </div>
                        <div className="contact-info">
                            <h3>Email Support</h3>
                            <p>For all inquiries, please contact us at:</p>
                            <a href="mailto:contact.uthakkan@gmail.com" className="contact-email">
                                contact.uthakkan@gmail.com
                            </a>
                            <p className="contact-note">We typically respond within 24 hours.</p>
                        </div>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>Frequently Asked Questions</h2>

                    <div className="faq-item">
                        <h3>How do I reset my password?</h3>
                        <p>Currently, password reset is handled securely via email. Please contact support if you simply cannot access your account.</p>
                    </div>

                    <div className="faq-item">
                        <h3>Is my Chat Secure?</h3>
                        <p>Yes, ZyChat uses end-to-end encryption for all personal messaging, ensuring only you and the recipient can read your messages.</p>
                    </div>

                    <div className="faq-item">
                        <h3>How do I report a bug?</h3>
                        <p>Please send an email to our support address with a detailed description of the issue and any screenshots if possible.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HelpPage;
