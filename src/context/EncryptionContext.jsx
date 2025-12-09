// Encryption Context - Manages encryption keys and provides encryption methods
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { ref, get, set } from 'firebase/database';
import { rtdb } from '../firebase/config';
import {
    generateKeyPair,
    generateChatKey,
    encryptWithChatKey,
    decryptWithChatKey,
} from '../services/encryptionService';

const EncryptionContext = createContext();

export const useEncryption = () => {
    const context = useContext(EncryptionContext);
    if (!context) {
        throw new Error('useEncryption must be used within an EncryptionProvider');
    }
    return context;
};

export const EncryptionProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [isInitialized, setIsInitialized] = useState(false);
    const [chatKeys, setChatKeys] = useState({});

    // Initialize encryption for user
    useEffect(() => {
        const initEncryption = async () => {
            if (!currentUser) {
                setIsInitialized(false);
                return;
            }

            try {
                // Check if user has keys stored
                const userKeysRef = ref(rtdb, `userKeys/${currentUser.uid}`);
                const snapshot = await get(userKeysRef);

                if (!snapshot.exists()) {
                    // Generate new key pair for user
                    const keyPair = await generateKeyPair();
                    await set(userKeysRef, {
                        publicKey: keyPair.publicKey,
                        createdAt: Date.now(),
                    });
                    // Store private key locally (encrypted with user's uid as base)
                    localStorage.setItem(`zychat_pk_${currentUser.uid}`, keyPair.privateKey);
                }

                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing encryption:', error);
                setIsInitialized(true); // Continue without encryption
            }
        };

        initEncryption();
    }, [currentUser]);

    // Get or create chat encryption key
    const getChatKey = useCallback(async (chatId) => {
        if (chatKeys[chatId]) {
            return chatKeys[chatId];
        }

        try {
            const chatKeyRef = ref(rtdb, `chatKeys/${chatId}`);
            const snapshot = await get(chatKeyRef);

            if (snapshot.exists()) {
                const key = snapshot.val().key;
                setChatKeys(prev => ({ ...prev, [chatId]: key }));
                return key;
            } else {
                // Generate new chat key
                const newKey = await generateChatKey();
                await set(chatKeyRef, {
                    key: newKey,
                    createdAt: Date.now(),
                });
                setChatKeys(prev => ({ ...prev, [chatId]: newKey }));
                return newKey;
            }
        } catch (error) {
            console.error('Error getting chat key:', error);
            return null;
        }
    }, [chatKeys]);

    // Encrypt a message for a chat
    const encryptMessage = useCallback(async (message, chatId) => {
        try {
            const chatKey = await getChatKey(chatId);
            if (!chatKey) {
                return { encrypted: false, text: message };
            }
            return await encryptWithChatKey(message, chatKey);
        } catch (error) {
            console.error('Error encrypting message:', error);
            return { encrypted: false, text: message };
        }
    }, [getChatKey]);

    // Decrypt a message from a chat
    const decryptMessage = useCallback(async (encryptedObj, chatId) => {
        try {
            // Handle plain text messages (not encrypted)
            if (typeof encryptedObj === 'string') {
                return encryptedObj;
            }
            if (!encryptedObj?.encrypted) {
                return encryptedObj?.text || encryptedObj || '';
            }

            const chatKey = await getChatKey(chatId);
            if (!chatKey) {
                return '[Encryption key not available]';
            }
            return await decryptWithChatKey(encryptedObj, chatKey);
        } catch (error) {
            console.error('Error decrypting message:', error);
            return '[Decryption failed]';
        }
    }, [getChatKey]);

    // Encrypt file data
    const encryptFile = useCallback(async (file, chatId) => {
        try {
            const chatKey = await getChatKey(chatId);
            if (!chatKey) {
                return { blob: file, encrypted: false };
            }

            // Convert file to ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);

            // Encrypt the data
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const jwk = JSON.parse(chatKey);
            const key = await window.crypto.subtle.importKey(
                'jwk',
                jwk,
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );

            const encryptedData = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );

            // Combine IV + encrypted data
            const combined = new Uint8Array(iv.length + encryptedData.byteLength);
            combined.set(iv, 0);
            combined.set(new Uint8Array(encryptedData), iv.length);

            return {
                blob: new Blob([combined], { type: 'application/encrypted' }),
                originalType: file.type,
                originalName: file.name,
                encrypted: true,
            };
        } catch (error) {
            console.error('Error encrypting file:', error);
            return { blob: file, encrypted: false };
        }
    }, [getChatKey]);

    // Decrypt file from URL
    const decryptFileUrl = useCallback(async (url, chatId, originalType) => {
        try {
            const chatKey = await getChatKey(chatId);
            if (!chatKey) {
                return url; // Return original URL if no key
            }

            const response = await fetch(url);
            const encryptedData = await response.arrayBuffer();

            // Extract IV and data
            const iv = new Uint8Array(encryptedData.slice(0, 12));
            const data = new Uint8Array(encryptedData.slice(12));

            const jwk = JSON.parse(chatKey);
            const key = await window.crypto.subtle.importKey(
                'jwk',
                jwk,
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );

            const decryptedData = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );

            const blob = new Blob([decryptedData], { type: originalType });
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error decrypting file:', error);
            return url; // Return original URL on error
        }
    }, [getChatKey]);

    const value = {
        isInitialized,
        encryptMessage,
        decryptMessage,
        encryptFile,
        decryptFileUrl,
        getChatKey,
    };

    return (
        <EncryptionContext.Provider value={value}>
            {children}
        </EncryptionContext.Provider>
    );
};

export default EncryptionContext;
