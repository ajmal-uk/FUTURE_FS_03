// Firebase Realtime Database Service
import {
    ref,
    get,
    set,
    push,
    update,
    remove,
    onValue,
    onChildAdded,
    onChildChanged,
    query,
    orderByChild,
    equalTo,
    limitToLast,
    serverTimestamp,
    onDisconnect,
} from "firebase/database";
import { rtdb } from "./config";

// ===================== User Operations =====================

/**
 * Get user by UID
 */
export const getUser = async (uid) => {
    const snapshot = await get(ref(rtdb, `users/${uid}`));
    return snapshot.exists() ? snapshot.val() : null;
};

/**
 * Get user by username
 */
export const getUserByUsername = async (username) => {
    const usernameRef = ref(rtdb, `usernames/${username.toLowerCase()}`);
    const snapshot = await get(usernameRef);

    if (!snapshot.exists()) return null;

    const uid = snapshot.val();
    return getUser(uid);
};

/**
 * Update user profile
 */
export const updateUserProfile = async (uid, updates) => {
    const userRef = ref(rtdb, `users/${uid}`);
    await update(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
};

/**
 * Get all users (for admin)
 */
export const getAllUsers = (callback) => {
    const usersRef = ref(rtdb, "users");
    return onValue(usersRef, (snapshot) => {
        const users = [];
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                users.push(child.val());
            });
        }
        callback(users);
    }, (error) => {
        console.error("Error getting all users:", error);
        // Call callback with empty array on error so loading stops
        callback([]);
    });
};

/**
 * Ban user
 */
export const banUser = async (uid) => {
    await updateUserProfile(uid, { isBanned: true, isOnline: false });

    // Remove from all groups/chats
    const chatsRef = ref(rtdb, "chats");
    const chatsSnapshot = await get(chatsRef);

    if (chatsSnapshot.exists()) {
        const updates = {};

        chatsSnapshot.forEach((chatSnap) => {
            const chat = chatSnap.val();
            const chatId = chatSnap.key;

            if (chat.members && chat.members[uid]) {
                updates[`chats/${chatId}/members/${uid}`] = null;

                // Add system message
                const messageId = push(ref(rtdb, `messages/${chatId}`)).key;
                updates[`messages/${chatId}/${messageId}`] = {
                    messageId,
                    senderId: "system",
                    senderUsername: "system",
                    type: "text",
                    text: `User has been removed from ZyChat by admin.`,
                    createdAt: Date.now(),
                    status: "sent",
                };
            }
        });

        if (Object.keys(updates).length > 0) {
            await update(ref(rtdb), updates);
        }
    }
};

/**
 * Unban user
 */
export const unbanUser = async (uid) => {
    await updateUserProfile(uid, { isBanned: false });
};

// ===================== Presence =====================

/**
 * Setup presence for current user
 */
export const setupPresence = (uid) => {
    const userStatusRef = ref(rtdb, `users/${uid}`);
    const presenceRef = ref(rtdb, `presence/${uid}`);
    const connectedRef = ref(rtdb, ".info/connected");

    return onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === true) {
            // Set online status
            update(userStatusRef, {
                isOnline: true,
                lastSeen: serverTimestamp(),
            });

            set(presenceRef, {
                isOnline: true,
                lastSeen: serverTimestamp(),
            });

            // Setup onDisconnect
            onDisconnect(userStatusRef).update({
                isOnline: false,
                lastSeen: serverTimestamp(),
            });

            onDisconnect(presenceRef).set({
                isOnline: false,
                lastSeen: serverTimestamp(),
            });
        }
    });
};

/**
 * Set user offline
 */
export const setUserOffline = async (uid) => {
    await update(ref(rtdb, `users/${uid}`), {
        isOnline: false,
        lastSeen: serverTimestamp(),
    });

    await set(ref(rtdb, `presence/${uid}`), {
        isOnline: false,
        lastSeen: serverTimestamp(),
    });
};

// ===================== Chat Operations =====================

/**
 * Generate chat ID for 1-on-1 chats
 */
export const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join("_");
};

/**
 * Create or get 1-on-1 chat
 */
export const createOrGetChat = async (uid1, uid2) => {
    const chatId = getChatId(uid1, uid2);
    const chatRef = ref(rtdb, `chats/${chatId}`);
    const snapshot = await get(chatRef);

    if (!snapshot.exists()) {
        // Create new chat
        const chatData = {
            chatId,
            isGroup: false,
            createdBy: uid1,
            createdAt: serverTimestamp(),
            members: {
                [uid1]: true,
                [uid2]: true,
            },
        };
        await set(chatRef, chatData);
    }

    return chatId;
};

/**
 * Create group chat
 */
export const createGroupChat = async ({
    groupName,
    groupIconUrl,
    createdBy,
    memberIds,
}) => {
    const chatRef = push(ref(rtdb, "chats"));
    const chatId = chatRef.key;

    const members = {};
    memberIds.forEach((uid) => {
        members[uid] = true;
    });
    members[createdBy] = true;

    const chatData = {
        chatId,
        isGroup: true,
        groupName,
        groupIconUrl: groupIconUrl || null,
        createdBy,
        createdAt: serverTimestamp(),
        members,
    };

    await set(chatRef, chatData);
    return chatId;
};

/**
 * Get chat by ID
 */
export const getChat = async (chatId) => {
    const snapshot = await get(ref(rtdb, `chats/${chatId}`));
    return snapshot.exists() ? snapshot.val() : null;
};

/**
 * Subscribe to user's chats
 */
export const subscribeToChats = (uid, callback) => {
    const chatsRef = ref(rtdb, "chats");

    return onValue(chatsRef, async (snapshot) => {
        const chats = [];

        try {
            if (snapshot.exists()) {
                const promises = [];

                snapshot.forEach((chatSnap) => {
                    const chat = chatSnap.val();
                    const chatId = chatSnap.key; // Get the chat ID from the snapshot key
                    if (chat.members && chat.members[uid]) {
                        promises.push(
                            (async () => {
                                try {
                                    // Get last message
                                    const messagesRef = query(
                                        ref(rtdb, `messages/${chatId}`),
                                        orderByChild("createdAt"),
                                        limitToLast(1)
                                    );
                                    const msgSnapshot = await get(messagesRef);
                                    let lastMessage = null;

                                    if (msgSnapshot.exists()) {
                                        msgSnapshot.forEach((msgSnap) => {
                                            lastMessage = msgSnap.val();
                                        });
                                    }

                                    // For 1-on-1 chats, get other user's info
                                    let otherUser = null;
                                    if (!chat.isGroup) {
                                        const memberIds = Object.keys(chat.members);
                                        const otherUid = memberIds.find((id) => id !== uid);
                                        if (otherUid) {
                                            otherUser = await getUser(otherUid);
                                        }
                                    }

                                    return {
                                        ...chat,
                                        chatId,
                                        lastMessage,
                                        otherUser,
                                    };
                                } catch (err) {
                                    console.error("Error fetching chat details:", err);
                                    return { ...chat, chatId, lastMessage: null, otherUser: null };
                                }
                            })()
                        );
                    }
                });

                const results = await Promise.all(promises);
                chats.push(...results);
            }

            // Sort by last message time
            chats.sort((a, b) => {
                const timeA = a.lastMessage?.createdAt || a.createdAt || 0;
                const timeB = b.lastMessage?.createdAt || b.createdAt || 0;
                return timeB - timeA;
            });
        } catch (error) {
            console.error("Error processing chats:", error);
        }

        callback(chats);
    }, (error) => {
        console.error("Error subscribing to chats:", error);
        // Still call callback with empty array on error
        callback([]);
    });
};

/**
 * Update group info
 */
export const updateGroupInfo = async (chatId, updates) => {
    await update(ref(rtdb, `chats/${chatId}`), updates);
};

/**
 * Add member to group
 */
export const addGroupMember = async (chatId, uid) => {
    await set(ref(rtdb, `chats/${chatId}/members/${uid}`), true);
};

/**
 * Remove member from group
 */
export const removeGroupMember = async (chatId, uid) => {
    await remove(ref(rtdb, `chats/${chatId}/members/${uid}`));
};

// ===================== Message Operations =====================

/**
 * Send message
 */
export const sendMessage = async (chatId, {
    senderId,
    senderUsername,
    type,
    text,
    mediaUrl,
    fileName,
}) => {
    const messageRef = push(ref(rtdb, `messages/${chatId}`));
    const messageId = messageRef.key;

    const message = {
        messageId,
        senderId,
        senderUsername,
        type,
        text: text || null,
        mediaUrl: mediaUrl || null,
        fileName: fileName || null,
        createdAt: serverTimestamp(),
        status: "sent",
    };

    await set(messageRef, message);
    return message;
};

/**
 * Subscribe to messages in a chat
 */
export const subscribeToMessages = (chatId, callback) => {
    const messagesRef = query(
        ref(rtdb, `messages/${chatId}`),
        orderByChild("createdAt")
    );

    return onValue(messagesRef, (snapshot) => {
        const messages = [];
        if (snapshot.exists()) {
            snapshot.forEach((msgSnap) => {
                messages.push(msgSnap.val());
            });
        }
        callback(messages);
    });
};

// ===================== Typing Status =====================

/**
 * Set typing status
 */
export const setTypingStatus = async (chatId, uid, isTyping) => {
    await set(ref(rtdb, `typeStatus/${chatId}/${uid}`), {
        isTyping,
        timestamp: serverTimestamp(),
    });
};

/**
 * Subscribe to typing status
 */
export const subscribeToTypingStatus = (chatId, currentUid, callback) => {
    const typingRef = ref(rtdb, `typeStatus/${chatId}`);

    return onValue(typingRef, (snapshot) => {
        const typingUsers = [];
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const data = child.val();
                if (child.key !== currentUid && data.isTyping) {
                    typingUsers.push(child.key);
                }
            });
        }
        callback(typingUsers);
    });
};

// ===================== Status (Stories) =====================

/**
 * Create status
 */
export const createStatus = async (uid, { mediaUrl, caption }) => {
    const statusRef = push(ref(rtdb, `status/${uid}`));
    const statusId = statusRef.key;
    const now = Date.now();

    const status = {
        statusId,
        mediaUrl,
        caption: caption || "",
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
    };

    await set(statusRef, status);
    return status;
};

/**
 * Get user's statuses
 */
export const getUserStatuses = async (uid) => {
    const snapshot = await get(ref(rtdb, `status/${uid}`));
    const statuses = [];
    const now = Date.now();

    if (snapshot.exists()) {
        snapshot.forEach((child) => {
            const status = child.val();
            // Only include non-expired statuses
            if (status.expiresAt > now) {
                statuses.push(status);
            }
        });
    }

    return statuses;
};

/**
 * Subscribe to contacts' statuses
 */
export const subscribeToContactStatuses = (contactUids, callback) => {
    const statusRef = ref(rtdb, "status");

    return onValue(statusRef, async (snapshot) => {
        const contactStatuses = [];
        const now = Date.now();

        if (snapshot.exists()) {
            for (const uid of contactUids) {
                const userStatuses = [];
                const userStatusRef = snapshot.child(uid);

                if (userStatusRef.exists()) {
                    userStatusRef.forEach((child) => {
                        const status = child.val();
                        if (status.expiresAt > now) {
                            userStatuses.push(status);
                        }
                    });

                    if (userStatuses.length > 0) {
                        const user = await getUser(uid);
                        contactStatuses.push({
                            user,
                            statuses: userStatuses,
                        });
                    }
                }
            }
        }

        callback(contactStatuses);
    });
};

// ===================== Call Operations =====================

/**
 * Create call
 */
export const createCall = async ({
    callerId,
    calleeId,
    type,
}) => {
    const callRef = push(ref(rtdb, "calls"));
    const callId = callRef.key;

    const call = {
        callId,
        callerId,
        calleeId,
        type,
        status: "ringing",
        startedAt: serverTimestamp(),
        endedAt: null,
    };

    await set(callRef, call);
    return callId;
};

/**
 * Update call status
 */
export const updateCallStatus = async (callId, status) => {
    const updates = { status };
    if (status === "ended" || status === "rejected") {
        updates.endedAt = serverTimestamp();
    }
    await update(ref(rtdb, `calls/${callId}`), updates);
};

/**
 * Set call signaling data
 */
export const setCallOffer = async (callId, offer) => {
    await set(ref(rtdb, `calls/${callId}/signaling/offer`), offer);
};

export const setCallAnswer = async (callId, answer) => {
    await set(ref(rtdb, `calls/${callId}/signaling/answer`), answer);
};

export const addIceCandidate = async (callId, candidate) => {
    const candidateRef = push(ref(rtdb, `calls/${callId}/signaling/candidates`));
    await set(candidateRef, candidate);
};

/**
 * Subscribe to incoming calls
 */
export const subscribeToIncomingCalls = (uid, callback) => {
    const callsRef = query(
        ref(rtdb, "calls"),
        orderByChild("calleeId"),
        equalTo(uid)
    );

    return onValue(callsRef, (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const call = child.val();
                if (call.status === "ringing") {
                    callback(call);
                }
            });
        }
    });
};

/**
 * Subscribe to call signaling
 */
export const subscribeToCallSignaling = (callId, callbacks) => {
    const { onAnswer, onCandidate, onStatusChange } = callbacks;

    const unsubscribers = [];

    // Listen for answer
    if (onAnswer) {
        const answerRef = ref(rtdb, `calls/${callId}/signaling/answer`);
        unsubscribers.push(
            onValue(answerRef, (snapshot) => {
                if (snapshot.exists()) {
                    onAnswer(snapshot.val());
                }
            })
        );
    }

    // Listen for candidates
    if (onCandidate) {
        const candidatesRef = ref(rtdb, `calls/${callId}/signaling/candidates`);
        unsubscribers.push(
            onChildAdded(candidatesRef, (snapshot) => {
                onCandidate(snapshot.val());
            })
        );
    }

    // Listen for status changes
    if (onStatusChange) {
        const statusRef = ref(rtdb, `calls/${callId}/status`);
        unsubscribers.push(
            onValue(statusRef, (snapshot) => {
                if (snapshot.exists()) {
                    onStatusChange(snapshot.val());
                }
            })
        );
    }

    return () => {
        unsubscribers.forEach((unsub) => unsub());
    };
};

/**
 * Get call history
 */
export const getCallHistory = async (uid) => {
    const callsRef = ref(rtdb, "calls");
    const snapshot = await get(callsRef);
    const calls = [];

    if (snapshot.exists()) {
        snapshot.forEach((child) => {
            const call = child.val();
            if (call.callerId === uid || call.calleeId === uid) {
                calls.push(call);
            }
        });
    }

    // Sort by startedAt desc
    calls.sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
    return calls;
};

// ===================== Connection Requests =====================

/**
 * Send a connection request to another user
 */
export const sendConnectionRequest = async (fromUid, toUid) => {
    const requestId = `${fromUid}_${toUid}`;
    const requestRef = ref(rtdb, `connectionRequests/${requestId}`);

    // Check if request already exists
    const existingRequest = await get(requestRef);
    if (existingRequest.exists()) {
        throw new Error("Request already sent");
    }

    // Check if reverse request exists (they sent us a request)
    const reverseRequestRef = ref(rtdb, `connectionRequests/${toUid}_${fromUid}`);
    const reverseRequest = await get(reverseRequestRef);
    if (reverseRequest.exists()) {
        // Auto-accept if they already sent us a request
        await acceptConnectionRequest(toUid, fromUid);
        return "connected";
    }

    // Check if already connected
    const existingConnection = await get(ref(rtdb, `connections/${fromUid}/${toUid}`));
    if (existingConnection.exists()) {
        throw new Error("Already connected");
    }

    await set(requestRef, {
        fromUid,
        toUid,
        status: "pending",
        createdAt: Date.now(),
    });

    return "sent";
};

/**
 * Accept a connection request
 */
export const acceptConnectionRequest = async (fromUid, toUid) => {
    const requestId = `${fromUid}_${toUid}`;
    const requestRef = ref(rtdb, `connectionRequests/${requestId}`);

    // Add to both users' connections
    const updates = {};
    updates[`connections/${fromUid}/${toUid}`] = { connectedAt: Date.now() };
    updates[`connections/${toUid}/${fromUid}`] = { connectedAt: Date.now() };

    await update(ref(rtdb), updates);

    // Remove the request
    await remove(requestRef);

    return true;
};

/**
 * Reject a connection request
 */
export const rejectConnectionRequest = async (fromUid, toUid) => {
    const requestId = `${fromUid}_${toUid}`;
    const requestRef = ref(rtdb, `connectionRequests/${requestId}`);
    await remove(requestRef);
    return true;
};

/**
 * Cancel a sent connection request
 */
export const cancelConnectionRequest = async (fromUid, toUid) => {
    const requestId = `${fromUid}_${toUid}`;
    const requestRef = ref(rtdb, `connectionRequests/${requestId}`);
    await remove(requestRef);
    return true;
};

/**
 * Get connection status between two users
 */
export const getConnectionStatus = async (uid1, uid2) => {
    // Check if connected
    const connectionRef = ref(rtdb, `connections/${uid1}/${uid2}`);
    const connectionSnap = await get(connectionRef);
    if (connectionSnap.exists()) {
        return "connected";
    }

    // Check if request sent
    const sentRequestRef = ref(rtdb, `connectionRequests/${uid1}_${uid2}`);
    const sentRequestSnap = await get(sentRequestRef);
    if (sentRequestSnap.exists()) {
        return "pending_sent";
    }

    // Check if request received
    const receivedRequestRef = ref(rtdb, `connectionRequests/${uid2}_${uid1}`);
    const receivedRequestSnap = await get(receivedRequestRef);
    if (receivedRequestSnap.exists()) {
        return "pending_received";
    }

    return "none";
};

/**
 * Subscribe to incoming connection requests
 */
export const subscribeToConnectionRequests = (uid, callback) => {
    const requestsRef = ref(rtdb, "connectionRequests");

    return onValue(requestsRef, async (snapshot) => {
        const requests = [];

        if (snapshot.exists()) {
            const promises = [];

            snapshot.forEach((child) => {
                const request = child.val();
                if (request.toUid === uid && request.status === "pending") {
                    promises.push(
                        (async () => {
                            const fromUser = await getUser(request.fromUid);
                            return { ...request, requestId: child.key, fromUser };
                        })()
                    );
                }
            });

            const results = await Promise.all(promises);
            requests.push(...results);
        }

        // Sort by createdAt desc
        requests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(requests);
    });
};

/**
 * Subscribe to user's connections
 */
export const subscribeToConnections = (uid, callback) => {
    const connectionsRef = ref(rtdb, `connections/${uid}`);

    return onValue(connectionsRef, async (snapshot) => {
        const connections = [];

        if (snapshot.exists()) {
            const promises = [];

            snapshot.forEach((child) => {
                const connectedUid = child.key;
                promises.push(
                    (async () => {
                        const user = await getUser(connectedUid);
                        return { ...child.val(), uid: connectedUid, user };
                    })()
                );
            });

            const results = await Promise.all(promises);
            connections.push(...results);
        }

        callback(connections);
    });
};

/**
 * Check if two users are connected
 */
export const areUsersConnected = async (uid1, uid2) => {
    const connectionRef = ref(rtdb, `connections/${uid1}/${uid2}`);
    const snapshot = await get(connectionRef);
    return snapshot.exists();
};

/**
 * Search users by username or display name
 */
export const searchUsers = async (query, currentUid) => {
    const usersRef = ref(rtdb, "users");
    const snapshot = await get(usersRef);
    const results = [];

    if (snapshot.exists()) {
        const queryLower = query.toLowerCase();

        snapshot.forEach((child) => {
            const user = child.val();
            if (user.uid === currentUid) return; // Skip self
            if (user.isBanned) return; // Skip banned users

            const usernameMatch = user.username?.toLowerCase().includes(queryLower);
            const displayNameMatch = user.displayName?.toLowerCase().includes(queryLower);

            if (usernameMatch || displayNameMatch) {
                results.push(user);
            }
        });
    }

    return results.slice(0, 20); // Limit to 20 results
};

