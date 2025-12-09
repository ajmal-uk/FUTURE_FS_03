// Authentication Page - Login/Register
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    checkUsernameAvailable,
} from "../../firebase/authService";
import { Loader } from "../../components/common";
import "./Auth.css";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [usernameChecking, setUsernameChecking] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        displayName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isAdmin, isBanned } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !isBanned) {
            const from = location.state?.from?.pathname || (isAdmin ? "/admin" : "/app");
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, isAdmin, isBanned, navigate, location]);

    // Show banned message
    useEffect(() => {
        if (location.state?.banned) {
            setError("Your account has been restricted. Please contact support.");
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");

        if (name === "username") {
            setUsernameError("");
        }
    };

    // Check username availability on blur
    const handleUsernameBlur = async () => {
        if (!formData.username || isLogin) return;

        const username = formData.username.toLowerCase().trim();
        if (username.length < 3) {
            setUsernameError("Username must be at least 3 characters");
            return;
        }

        if (!/^[a-z0-9_]+$/.test(username)) {
            setUsernameError("Username can only contain letters, numbers, and underscores");
            return;
        }

        setUsernameChecking(true);
        try {
            const available = await checkUsernameAvailable(username);
            if (!available) {
                setUsernameError("Username already taken. Please choose another.");
            }
        } catch (err) {
            console.error("Error checking username:", err);
        } finally {
            setUsernameChecking(false);
        }
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError("Please fill in all required fields");
            return false;
        }

        if (!isLogin) {
            if (!formData.username || !formData.displayName) {
                setError("Please fill in all required fields");
                return false;
            }

            if (formData.username.length < 3) {
                setError("Username must be at least 3 characters");
                return false;
            }

            if (formData.password.length < 6) {
                setError("Password must be at least 6 characters");
                return false;
            }

            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return false;
            }

            if (usernameError) {
                setError(usernameError);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError("");

        try {
            if (isLogin) {
                await loginWithEmail(formData.email, formData.password);
            } else {
                await registerWithEmail({
                    username: formData.username.toLowerCase().trim(),
                    displayName: formData.displayName.trim(),
                    phone: formData.phone.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                });
            }
            // Navigation handled by useEffect
        } catch (err) {
            console.error("Auth error:", err);
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");

        try {
            await loginWithGoogle();
        } catch (err) {
            console.error("Google login error:", err);
            setError(err.message || "Google sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left Panel - Branding */}
            <div className="auth-branding">
                <Link to="/" className="auth-logo">
                    <span className="logo-icon">💬</span>
                    <span className="logo-text">ZyChat</span>
                </Link>
                <h1 className="auth-branding-title">
                    Connect with anyone,<br />anywhere.
                </h1>
                <ul className="auth-features">
                    <li>✓ Real-time messaging</li>
                    <li>✓ Group conversations</li>
                    <li>✓ Audio & video calls</li>
                    <li>✓ Status sharing</li>
                    <li>✓ Secure & private</li>
                </ul>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="auth-form-container">
                <div className="auth-card glass-card">
                    {/* Tabs */}
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${isLogin ? "active" : ""}`}
                            onClick={() => {
                                setIsLogin(true);
                                setError("");
                            }}
                        >
                            Sign In
                        </button>
                        <button
                            className={`auth-tab ${!isLogin ? "active" : ""}`}
                            onClick={() => {
                                setIsLogin(false);
                                setError("");
                            }}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form */}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && <div className="auth-error">{error}</div>}

                        {!isLogin && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Username *</label>
                                    <div className="input-with-icon">
                                        <span className="input-prefix">@</span>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            onBlur={handleUsernameBlur}
                                            placeholder="your_unique_username"
                                            className={`input ${usernameError ? "input-error" : ""}`}
                                            autoComplete="username"
                                        />
                                        {usernameChecking && (
                                            <span className="input-suffix">
                                                <Loader size="sm" />
                                            </span>
                                        )}
                                    </div>
                                    {usernameError && (
                                        <p className="form-error">{usernameError}</p>
                                    )}
                                    <p className="form-hint">
                                        Your unique handle. Letters, numbers, and underscores only.
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Display Name *</label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        placeholder="Your Name"
                                        className="input"
                                        autoComplete="name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone (optional)</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 234 567 8900"
                                        className="input"
                                        autoComplete="tel"
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="input"
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="input"
                                autoComplete={isLogin ? "current-password" : "new-password"}
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label">Confirm Password *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="input"
                                    autoComplete="new-password"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg auth-submit"
                            disabled={loading || usernameChecking}
                        >
                            {loading ? (
                                <Loader size="sm" />
                            ) : isLogin ? (
                                "Sign In"
                            ) : (
                                "Create Account"
                            )}
                        </button>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        <button
                            type="button"
                            className="btn btn-secondary btn-lg auth-google"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <span className="google-icon">G</span>
                            Continue with Google
                        </button>
                    </form>

                    <p className="auth-switch">
                        {isLogin ? (
                            <>
                                Don&apos;t have an account?{" "}
                                <button onClick={() => setIsLogin(false)}>Sign up</button>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <button onClick={() => setIsLogin(true)}>Sign in</button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
