// Auth Context - Manages authentication state and user profile
import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChangedListener, logoutUser } from "../firebase/authService";
import { getUser, setupPresence, setUserOffline } from "../firebase/rtdbService";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase/config";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeProfile = null;
        let unsubscribePresence = null;

        const unsubscribeAuth = onAuthStateChangedListener(async (user) => {
            setCurrentUser(user);

            if (user) {
                // Subscribe to user profile changes
                const userRef = ref(rtdb, `users/${user.uid}`);
                unsubscribeProfile = onValue(userRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const profile = snapshot.val();
                        setUserProfile(profile);

                        // If user is banned, log them out
                        if (profile.isBanned) {
                            logoutUser();
                            setCurrentUser(null);
                            setUserProfile(null);
                        }
                    } else {
                        setUserProfile(null);
                    }
                    setLoading(false);
                });

                // Setup presence
                unsubscribePresence = setupPresence(user.uid);
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) unsubscribeProfile();
            if (unsubscribePresence) unsubscribePresence();
        };
    }, []);

    const logout = async () => {
        if (currentUser) {
            await setUserOffline(currentUser.uid);
        }
        await logoutUser();
        setCurrentUser(null);
        setUserProfile(null);
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        logout,
        isAuthenticated: !!currentUser && !!userProfile,
        isAdmin: userProfile?.role === "admin",
        isBanned: userProfile?.isBanned,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
