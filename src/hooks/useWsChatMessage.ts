import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useLang } from '@/lang/useLang';

interface ChatMetrics {
    connectedClients: number;
    messagesSent: number;
    activeRooms: Set<string>;
    lastUpdated: Date;
}

interface TypingUser {
    wallet_address: string;
    isTyping: boolean;
}

interface UseWsChatMessageProps {
    chatType: 'all' | 'token' | 'group';
    tokenAddress?: string;
    groupId?: any;
}

interface UseWsChatMessageReturn {
    message: {
        ch_chat_id: number;
        ch_content: string;
        ch_status: string;
        createdAt: string;
        ch_wallet_address: string;
    } | null;
    isConnected: boolean;
    metrics: ChatMetrics;
    typingUsers: TypingUser[];
    isLoading: boolean;
    handleTyping: () => void;
}

export const useWsChatMessage = ({ chatType, tokenAddress, groupId }: UseWsChatMessageProps): UseWsChatMessageReturn => {
    const { lang } = useLang();
    
    const { payloadToken, token } = useAuth();
    const [message, setMessage] = useState<{
        ch_chat_id: number;
        ch_content: string;
        ch_status: string;
        createdAt: string;
        ch_wallet_address: string;
    } | null>(null);
    const [metrics, setMetrics] = useState<ChatMetrics>({
        connectedClients: 0,
        messagesSent: 0,
        activeRooms: new Set(),
        lastUpdated: new Date()
    });
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const TYPING_TIMEOUT = 3000;

    useEffect(() => {
        // Initialize WebSocket connection
        const initializeSocket = () => {
            socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL}/chats`, {
                transports: ['websocket'],
                auth: { token: token },
                reconnection: true,
                reconnectionAttempts: 5,
                timeout: 10000,
                path: '/socket.io'
            });

            // Connection handlers
            socketRef.current.on('connect', () => {
                console.log('✅ Connected to WebSocket server - useWsChatMessage');
                setIsConnected(true);
                
                // Join chat based on type
                switch (chatType) {
                    case 'all':
                        socketRef.current?.emit('join-chat', { type: 'all', lang: lang });
                        break;
                    case 'token':
                        if (tokenAddress) {
                            socketRef.current?.emit('join-token', { token_address: tokenAddress, lang: lang });
                        }
                        break;
                    case 'group':
                        if (groupId) {
                            socketRef.current?.emit('join-group', { group_id: groupId, lang: lang });
                        }
                        break;
                    default:
                        console.warn('Unknown chat type:', chatType);
                }
            });

            socketRef.current.on('disconnect', () => {
                console.log('❌ Disconnected from WebSocket server - useWsChatMessage');
                setIsConnected(false);
            });

            // Message handlers
            socketRef.current.on('message', (response: any) => {
                setMessage(response.data);
            });

            socketRef.current.on('typing', (data: TypingUser) => {
                setTypingUsers(prev => {
                    const existingUser = prev.find(u => u.wallet_address === data.wallet_address);
                    if (existingUser) {
                        return prev.map(u => 
                            u.wallet_address === data.wallet_address ? { ...u, isTyping: true } : u
                        );
                    }
                    return [...prev, { ...data, isTyping: true }];
                });

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                    setTypingUsers(prev => 
                        prev.filter(u => u.wallet_address !== data.wallet_address)
                    );
                }, TYPING_TIMEOUT);
            });

            socketRef.current.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            socketRef.current.on('get-metrics', (data: ChatMetrics) => {
                setMetrics(data);
            });
        };

        initializeSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [chatType, tokenAddress, groupId, lang]);

    const handleTyping = () => {
        const tokenPayload = payloadToken as { wallet_id: number };
        if (tokenPayload?.wallet_id) {
            socketRef.current?.emit('typing', { wallet_id: tokenPayload.wallet_id });
        }
    };

    return {
        message,
        isConnected,
        metrics,
        typingUsers,
        isLoading,
        handleTyping
    };
}; 