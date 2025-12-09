// Firebase Authentication Service
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";
import { ref, get, set, serverTimestamp } from "firebase/database";
import { auth, googleProvider, rtdb } from "./config";

/**
 * Check if username is available
 */
export const checkUsernameAvailable = async (username) => {
    const usernameRef = ref(rtdb, `usernames/${username.toLowerCase()}`);
    const snapshot = await get(usernameRef);
    return !snapshot.exists();
};

/**
 * Register a new user with email and password
 */
export const registerWithEmail = async ({
    username,
    displayName,
    phone,
    email,
    password,
}) => {
    // Check username availability first
    const usernameNormalized = username.toLowerCase().trim();
    const isAvailable = await checkUsernameAvailable(usernameNormalized);

    if (!isAvailable) {
        throw new Error("Username already exists, please choose another.");
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    try {
        // Create user profile in RTDB
        const userProfile = {
            uid: user.uid,
            username: usernameNormalized,
            displayName: displayName.trim(),
            phone: phone?.trim() || "",
            email: user.email,
            about: "Hey there! I am using ZyChat.",
            avatarUrl: null,
            role: "user",
            isBanned: false,
            isOnline: true,
            lastSeen: serverTimestamp(),
            createdAt: serverTimestamp(),
        };

        // Write user profile
        await set(ref(rtdb, `users/${user.uid}`), userProfile);

        // Write username index (for uniqueness lookup)
        await set(ref(rtdb, `usernames/${usernameNormalized}`), user.uid);

        return { user, userProfile };
    } catch (error) {
        // If profile creation fails, the user is still in Auth
        // In a production app, you might want to delete the auth user here
        console.error("Error creating user profile:", error);
        throw error;
    }
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

/**
 * Login with Google (optional)
 */
export const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile exists
    const userRef = ref(rtdb, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
        // Generate a unique username for Google users
        const baseUsername = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        let username = baseUsername;
        let counter = 1;

        while (!(await checkUsernameAvailable(username))) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        // Create profile for Google user
        const userProfile = {
            uid: user.uid,
            username,
            displayName: user.displayName || username,
            phone: user.phoneNumber || "",
            email: user.email,
            about: "Hey there! I am using ZyChat.",
            avatarUrl: user.photoURL || null,
            role: "user",
            isBanned: false,
            isOnline: true,
            lastSeen: serverTimestamp(),
            createdAt: serverTimestamp(),
        };

        await set(ref(rtdb, `users/${user.uid}`), userProfile);
        await set(ref(rtdb, `usernames/${username}`), user.uid);
    }

    return user;
};

/**
 * Logout user
 */
export const logoutUser = async () => {
    await signOut(auth);
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChangedListener = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Get user profile from RTDB
 */
export const getUserProfile = async (uid) => {
    const userRef = ref(rtdb, `users/${uid}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
};
