import { useNavigate } from "react-router-dom";
import { IconChevronLeft } from "../../components/common/Icons";
import "./Legal.css";

const TermsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-page">
            <header className="legal-header">
                <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
                    <IconChevronLeft size={24} />
                </button>
                <h1>Terms of Service</h1>
            </header>

            <div className="legal-content glass-card">
                <p className="legal-date">Last Updated: {new Date().toLocaleDateString()}</p>

                <section className="legal-section">
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing or using ZyChat, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
                </section>

                <section className="legal-section">
                    <h2>2. User Conduct</h2>
                    <p>You agree not to use the service to:</p>
                    <ul>
                        <li>Violate any laws or regulations.</li>
                        <li>Send spam (`unsolicited messages`) or harass other users.</li>
                        <li>Distribute malware or malicious content.</li>
                        <li>Attempt to bypass security measures.</li>
                    </ul>
                    <p>Violation of these terms may result in account suspension or termination.</p>
                </section>

                <section className="legal-section">
                    <h2>3. Service Availability</h2>
                    <p>
                        We strive to keep ZyChat available 24/7 but cannot guarantee uninterrupted service. We may update or modify the service at any time.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>4. Disclaimer</h2>
                    <p>
                        The service is provided "as is" without warranties of any kind. We are not responsible for user-generated content or interactions.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>5. Contact</h2>
                    <p>
                        For any legal inquiries, please contact us at <a href="mailto:contact.uthakkan@gmail.com">contact.uthakkan@gmail.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsPage;
