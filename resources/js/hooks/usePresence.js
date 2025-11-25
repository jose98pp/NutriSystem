import { useState, useEffect, useCallback } from 'react';
import echo from '../services/echo';
import axios from 'axios';
import { logApiError } from '../utils/logger';

export function usePresence(userIds = []) {
    const [presences, setPresences] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Fetch initial presence data
    const fetchPresences = useCallback(async () => {
        if (userIds.length === 0) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/presence/get', {
                user_ids: userIds,
            });

            const presenceMap = {};
            response.data.presences.forEach(p => {
                presenceMap[p.user_id] = p;
            });

            setPresences(presenceMap);
        } catch (error) {
            logApiError('/api/presence/get', error, { user_ids: userIds });
        } finally {
            setIsLoading(false);
        }
    }, [userIds]);

    useEffect(() => {
        fetchPresences();
    }, [fetchPresences]);

    // Listen to presence updates
    useEffect(() => {
        const channel = echo.channel('presence');

        channel.listen('.user.online', (e) => {
            setPresences(prev => ({
                ...prev,
                [e.user_id]: {
                    user_id: e.user_id,
                    name: e.name,
                    foto_perfil: e.foto_perfil,
                    status: 'online',
                    is_online: true,
                    last_seen: 'En línea',
                    last_seen_at: e.timestamp,
                },
            }));
        });

        channel.listen('.user.offline', (e) => {
            setPresences(prev => ({
                ...prev,
                [e.user_id]: {
                    ...prev[e.user_id],
                    status: 'offline',
                    is_online: false,
                    last_seen_at: e.last_seen_at,
                },
            }));
        });

        return () => {
            echo.leave('presence');
        };
    }, []);

    return { presences, isLoading, refetch: fetchPresences };
}

export function useTypingIndicator(conversacionId) {
    const [typingUsers, setTypingUsers] = useState([]);

    useEffect(() => {
        if (!conversacionId) return;

        const channel = echo.private(`chat.${conversacionId}`);

        channel.listen('.user.typing', (e) => {
            if (e.is_typing) {
                setTypingUsers(prev => {
                    if (!prev.find(u => u.user_id === e.user_id)) {
                        return [...prev, { user_id: e.user_id, name: e.name }];
                    }
                    return prev;
                });

                // Remove after 3 seconds
                setTimeout(() => {
                    setTypingUsers(prev => prev.filter(u => u.user_id !== e.user_id));
                }, 3000);
            } else {
                setTypingUsers(prev => prev.filter(u => u.user_id !== e.user_id));
            }
        });

        return () => {
            echo.leave(`chat.${conversacionId}`);
        };
    }, [conversacionId]);

    return typingUsers;
}

export function useSendTypingIndicator(conversacionId) {
    const [typingTimeout, setTypingTimeout] = useState(null);

    const sendTyping = useCallback(async (isTyping = true) => {
        if (!conversacionId) return;

        try {
            await axios.post('/api/presence/typing', {
                conversacion_id: conversacionId,
                is_typing: isTyping,
            });
        } catch (error) {
            logApiError('/api/presence/typing', error, { conversacion_id: conversacionId, is_typing: isTyping });
        }
    }, [conversacionId]);

    const handleTyping = useCallback(() => {
        // Clear previous timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Send typing = true
        sendTyping(true);

        // Set timeout to send typing = false after 2 seconds
        const timeout = setTimeout(() => {
            sendTyping(false);
        }, 2000);

        setTypingTimeout(timeout);
    }, [sendTyping, typingTimeout]);

    return handleTyping;
}

export function useUpdatePresence() {
    const updateStatus = useCallback(async (status, socketId = null) => {
        try {
            await axios.post('/api/presence/status', {
                status,
                socket_id: socketId,
            });
        } catch (error) {
            logApiError('/api/presence/status', error, { status, socket_id: socketId });
        }
    }, []);

    // Update to online on mount
    useEffect(() => {
        updateStatus('online');

        // Update to offline on unmount
        return () => {
            updateStatus('offline');
        };
    }, [updateStatus]);

    // Mark as away after 5 minutes of inactivity
    useEffect(() => {
        let inactivityTimer;

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(async () => {
                try {
                    await axios.post('/api/presence/away');
                } catch (error) {
                    logApiError('/api/presence/away', error);
                }
            }, 5 * 60 * 1000); // 5 minutes
        };

        // Listen to user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetTimer);
        });

        resetTimer();

        return () => {
            clearTimeout(inactivityTimer);
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
        };
    }, []);

    return { updateStatus };
}
