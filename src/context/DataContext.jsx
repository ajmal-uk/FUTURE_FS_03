// Data Context - Global state caching to prevent re-fetching on navigation
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    subscribeToChats,
    subscribeToConnections,
    subscribeToConnectionRequests,
    getCallHistory,
    getUserStatuses,
    subscribeToContactStatuses,
} from '../firebase/rtdbService';

const DataContext = createContext();

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Local storage keys
const STORAGE_KEYS = {
    CHATS: 'zychat_cache_chats',
    CONNECTIONS: 'zychat_cache_connections',
    REQUESTS: 'zychat_cache_requests',
    CALLS: 'zychat_cache_calls',
    SETTINGS: 'zychat_app_settings',
};

export const DataProvider = ({ children }) => {
    const { currentUser } = useAuth();

    // Cached data state
    const [chats, setChats] = useState([]);
    const [connections, setConnections] = useState([]);
    const [connectionRequests, setConnectionRequests] = useState([]);
    const [callHistory, setCallHistory] = useState([]);
    const [contactStatuses, setContactStatuses] = useState([]);
    const [myStatuses, setMyStatuses] = useState([]);

    // Loading states
    const [chatsLoading, setChatsLoading] = useState(true);
    const [connectionsLoading, setConnectionsLoading] = useState(true);
    const [callsLoading, setCallsLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(true);

    // Timestamps for cache validation
    const [lastFetch, setLastFetch] = useState({});

    // App settings (compression, etc.)
    const [appSettings, setAppSettings] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return saved ? JSON.parse(saved) : {
            compressImages: true,
            cacheEnabled: true,
            maxCacheSize: 50, // MB
        };
    });

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(appSettings));
    }, [appSettings]);

    // Update a single setting
    const updateSetting = useCallback((key, value) => {
        setAppSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    // Subscribe to chats
    useEffect(() => {
        if (!currentUser) {
            setChats([]);
            setChatsLoading(false);
            return;
        }

        setChatsLoading(true);
        const unsubscribe = subscribeToChats(currentUser.uid, (chatList) => {
            setChats(chatList);
            setChatsLoading(false);
            setLastFetch(prev => ({ ...prev, chats: Date.now() }));
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Subscribe to connections
    useEffect(() => {
        if (!currentUser) {
            setConnections([]);
            setConnectionsLoading(false);
            return;
        }

        setConnectionsLoading(true);
        const unsubscribe = subscribeToConnections(currentUser.uid, (connList) => {
            setConnections(connList);
            setConnectionsLoading(false);
            setLastFetch(prev => ({ ...prev, connections: Date.now() }));
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Subscribe to connection requests
    useEffect(() => {
        if (!currentUser) {
            setConnectionRequests([]);
            return;
        }

        const unsubscribe = subscribeToConnectionRequests(currentUser.uid, (requests) => {
            setConnectionRequests(requests);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Fetch call history
    useEffect(() => {
        if (!currentUser) {
            setCallHistory([]);
            setCallsLoading(false);
            return;
        }

        const fetchCalls = async () => {
            setCallsLoading(true);
            try {
                const calls = await getCallHistory(currentUser.uid);
                setCallHistory(calls);
            } catch (error) {
                console.error('Error fetching call history:', error);
            } finally {
                setCallsLoading(false);
                setLastFetch(prev => ({ ...prev, calls: Date.now() }));
            }
        };

        fetchCalls();
    }, [currentUser]);

    // Fetch statuses
    useEffect(() => {
        if (!currentUser) {
            setMyStatuses([]);
            setContactStatuses([]);
            setStatusLoading(false);
            return;
        }

        const fetchStatuses = async () => {
            setStatusLoading(true);
            try {
                const statuses = await getUserStatuses(currentUser.uid);
                setMyStatuses(statuses);
            } catch (error) {
                console.error('Error fetching statuses:', error);
            } finally {
                setStatusLoading(false);
            }
        };

        fetchStatuses();
    }, [currentUser]);

    // Subscribe to contact statuses when connections change
    useEffect(() => {
        if (!currentUser || connections.length === 0) {
            setContactStatuses([]);
            return;
        }

        const contactUids = connections.map(c => c.uid);
        const unsubscribe = subscribeToContactStatuses(contactUids, (statuses) => {
            setContactStatuses(statuses);
        });

        return () => unsubscribe();
    }, [currentUser, connections]);

    // Refresh call history manually
    const refreshCallHistory = useCallback(async () => {
        if (!currentUser) return;
        setCallsLoading(true);
        try {
            const calls = await getCallHistory(currentUser.uid);
            setCallHistory(calls);
            setLastFetch(prev => ({ ...prev, calls: Date.now() }));
        } catch (error) {
            console.error('Error refreshing call history:', error);
        } finally {
            setCallsLoading(false);
        }
    }, [currentUser]);

    // Refresh my statuses
    const refreshMyStatuses = useCallback(async () => {
        if (!currentUser) return;
        try {
            const statuses = await getUserStatuses(currentUser.uid);
            setMyStatuses(statuses);
        } catch (error) {
            console.error('Error refreshing statuses:', error);
        }
    }, [currentUser]);

    // Clear all cache
    const clearCache = useCallback(() => {
        setChats([]);
        setConnections([]);
        setConnectionRequests([]);
        setCallHistory([]);
        setContactStatuses([]);
        setMyStatuses([]);
        setLastFetch({});

        // Clear localStorage cache
        Object.values(STORAGE_KEYS).forEach(key => {
            if (key !== STORAGE_KEYS.SETTINGS) {
                localStorage.removeItem(key);
            }
        });
    }, []);

    // Get estimated cache size
    const getCacheSize = useCallback(() => {
        let totalSize = 0;
        Object.values(STORAGE_KEYS).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                totalSize += new Blob([item]).size;
            }
        });
        return (totalSize / (1024 * 1024)).toFixed(2); // Return in MB
    }, []);

    const value = {
        // Data
        chats,
        connections,
        connectionRequests,
        callHistory,
        contactStatuses,
        myStatuses,

        // Loading states
        chatsLoading,
        connectionsLoading,
        callsLoading,
        statusLoading,

        // Settings
        appSettings,
        updateSetting,

        // Actions
        refreshCallHistory,
        refreshMyStatuses,
        clearCache,
        getCacheSize,

        // Cache info
        lastFetch,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export default DataContext;
