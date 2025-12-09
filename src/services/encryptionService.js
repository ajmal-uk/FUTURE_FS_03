// End-to-End Encryption Service using Web Crypto API
// Uses AES-256-GCM for symmetric encryption with ECDH key exchange

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

/**
 * Generate a new key pair for a user (ECDH for key exchange)
 */
export const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true,
        ['deriveKey', 'deriveBits']
    );

    // Export public key for sharing
    const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
    const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

    return {
        publicKey: JSON.stringify(publicKeyJwk),
        privateKey: JSON.stringify(privateKeyJwk),
    };
};

/**
 * Import a public key from JWK format
 */
const importPublicKey = async (publicKeyString) => {
    const jwk = JSON.parse(publicKeyString);
    return await window.crypto.subtle.importKey(
        'jwk',
        jwk,
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true,
        []
    );
};

/**
 * Import a private key from JWK format
 */
const importPrivateKey = async (privateKeyString) => {
    const jwk = JSON.parse(privateKeyString);
    return await window.crypto.subtle.importKey(
        'jwk',
        jwk,
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true,
        ['deriveKey', 'deriveBits']
    );
};

/**
 * Derive a shared secret key from own private key and recipient's public key
 */
const deriveSharedKey = async (privateKeyString, publicKeyString) => {
    const privateKey = await importPrivateKey(privateKeyString);
    const publicKey = await importPublicKey(publicKeyString);

    return await window.crypto.subtle.deriveKey(
        {
            name: 'ECDH',
            public: publicKey,
        },
        privateKey,
        {
            name: ALGORITHM,
            length: KEY_LENGTH,
        },
        false,
        ['encrypt', 'decrypt']
    );
};

/**
 * Generate a random IV
 */
const generateIV = () => {
    return window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
};

/**
 * Convert ArrayBuffer to Base64
 */
const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

/**
 * Convert Base64 to ArrayBuffer
 */
const base64ToArrayBuffer = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

/**
 * Encrypt text message
 */
export const encryptMessage = async (message, myPrivateKey, recipientPublicKey) => {
    try {
        const sharedKey = await deriveSharedKey(myPrivateKey, recipientPublicKey);
        const iv = generateIV();
        const encoder = new TextEncoder();
        const data = encoder.encode(message);

        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: ALGORITHM,
                iv: iv,
            },
            sharedKey,
            data
        );

        // Combine IV and encrypted data
        return {
            encrypted: true,
            iv: arrayBufferToBase64(iv),
            data: arrayBufferToBase64(encryptedData),
        };
    } catch (error) {
        console.error('Encryption error:', error);
        return { encrypted: false, text: message };
    }
};

/**
 * Decrypt text message
 */
export const decryptMessage = async (encryptedObj, myPrivateKey, senderPublicKey) => {
    try {
        if (!encryptedObj.encrypted) {
            return encryptedObj.text || encryptedObj;
        }

        const sharedKey = await deriveSharedKey(myPrivateKey, senderPublicKey);
        const iv = new Uint8Array(base64ToArrayBuffer(encryptedObj.iv));
        const encryptedData = base64ToArrayBuffer(encryptedObj.data);

        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: ALGORITHM,
                iv: iv,
            },
            sharedKey,
            encryptedData
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        console.error('Decryption error:', error);
        return '[Unable to decrypt message]';
    }
};

/**
 * Encrypt file/image blob
 */
export const encryptFile = async (file, myPrivateKey, recipientPublicKey) => {
    try {
        const sharedKey = await deriveSharedKey(myPrivateKey, recipientPublicKey);
        const iv = generateIV();

        const arrayBuffer = await file.arrayBuffer();

        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: ALGORITHM,
                iv: iv,
            },
            sharedKey,
            arrayBuffer
        );

        // Create encrypted blob with metadata
        const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });

        return {
            blob: encryptedBlob,
            iv: arrayBufferToBase64(iv),
            originalType: file.type,
            originalName: file.name,
            encrypted: true,
        };
    } catch (error) {
        console.error('File encryption error:', error);
        return { blob: file, encrypted: false };
    }
};

/**
 * Decrypt file/image
 */
export const decryptFile = async (encryptedUrl, iv, originalType, myPrivateKey, senderPublicKey) => {
    try {
        const response = await fetch(encryptedUrl);
        const encryptedData = await response.arrayBuffer();

        const sharedKey = await deriveSharedKey(myPrivateKey, senderPublicKey);
        const ivBuffer = new Uint8Array(base64ToArrayBuffer(iv));

        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: ALGORITHM,
                iv: ivBuffer,
            },
            sharedKey,
            encryptedData
        );

        // Create blob URL for decrypted content
        const decryptedBlob = new Blob([decryptedData], { type: originalType });
        return URL.createObjectURL(decryptedBlob);
    } catch (error) {
        console.error('File decryption error:', error);
        return null;
    }
};

/**
 * Simple symmetric encryption for local storage (for private key storage)
 */
export const encryptForStorage = async (data, password) => {
    const encoder = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        passwordKey,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );

    const iv = generateIV();
    const encryptedData = await window.crypto.subtle.encrypt(
        { name: ALGORITHM, iv: iv },
        key,
        encoder.encode(data)
    );

    return {
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        data: arrayBufferToBase64(encryptedData),
    };
};

/**
 * Decrypt from local storage
 */
export const decryptFromStorage = async (encryptedObj, password) => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const passwordKey = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const salt = new Uint8Array(base64ToArrayBuffer(encryptedObj.salt));
    const key = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        passwordKey,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );

    const iv = new Uint8Array(base64ToArrayBuffer(encryptedObj.iv));
    const decryptedData = await window.crypto.subtle.decrypt(
        { name: ALGORITHM, iv: iv },
        key,
        base64ToArrayBuffer(encryptedObj.data)
    );

    return decoder.decode(decryptedData);
};

/**
 * Generate a chat-specific encryption key (for group chats or simpler implementation)
 */
export const generateChatKey = async () => {
    const key = await window.crypto.subtle.generateKey(
        {
            name: ALGORITHM,
            length: KEY_LENGTH,
        },
        true,
        ['encrypt', 'decrypt']
    );

    const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
    return JSON.stringify(exportedKey);
};

/**
 * Encrypt with chat key (simpler symmetric encryption for groups)
 */
export const encryptWithChatKey = async (message, chatKeyString) => {
    try {
        const jwk = JSON.parse(chatKeyString);
        const key = await window.crypto.subtle.importKey(
            'jwk',
            jwk,
            { name: ALGORITHM },
            false,
            ['encrypt']
        );

        const iv = generateIV();
        const encoder = new TextEncoder();
        const data = encoder.encode(message);

        const encryptedData = await window.crypto.subtle.encrypt(
            { name: ALGORITHM, iv: iv },
            key,
            data
        );

        return {
            encrypted: true,
            iv: arrayBufferToBase64(iv),
            data: arrayBufferToBase64(encryptedData),
        };
    } catch (error) {
        console.error('Chat encryption error:', error);
        return { encrypted: false, text: message };
    }
};

/**
 * Decrypt with chat key
 */
export const decryptWithChatKey = async (encryptedObj, chatKeyString) => {
    try {
        if (!encryptedObj?.encrypted) {
            return encryptedObj?.text || encryptedObj || '';
        }

        const jwk = JSON.parse(chatKeyString);
        const key = await window.crypto.subtle.importKey(
            'jwk',
            jwk,
            { name: ALGORITHM },
            false,
            ['decrypt']
        );

        const iv = new Uint8Array(base64ToArrayBuffer(encryptedObj.iv));
        const encryptedData = base64ToArrayBuffer(encryptedObj.data);

        const decryptedData = await window.crypto.subtle.decrypt(
            { name: ALGORITHM, iv: iv },
            key,
            encryptedData
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        console.error('Chat decryption error:', error);
        return '[Encrypted message]';
    }
};
