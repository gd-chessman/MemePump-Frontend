import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

type Message = {
  id: string
  sender: {
    name: string
    avatar: string
    isCurrentUser: boolean
  }
  text: string
  timestamp: Date
  country: string
}

interface TradingChatState {
  messages: Message[]
  unreadCount: number
  activeTab: 'chat' | 'trade'
  tokenAddress: string | null
  socket: Socket | null
  isConnected: boolean
  setTokenAddress: (address: string | null) => void
  setActiveTab: (tab: 'chat' | 'trade') => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  incrementUnreadCount: () => void
  resetUnreadCount: () => void
  initializeWebSocket: (token: string, lang: string) => void
  disconnectWebSocket: () => void
}

export const useTradingChatStore = create<TradingChatState>((set, get) => ({
  messages: [],
  unreadCount: 0,
  activeTab: 'chat',
  tokenAddress: null,
  socket: null,
  isConnected: false,

  setTokenAddress: (address) => set({ tokenAddress: address }),

  setActiveTab: (tab) => set((state) => {
    if (tab === 'chat') {
      return { 
        activeTab: tab,
        unreadCount: 0
      };
    }
    return { 
      activeTab: tab,
      unreadCount: state.unreadCount
    };
  }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => {
    const newMessages = [...state.messages, message];
    if (state.activeTab !== 'chat') {
      return { 
        messages: newMessages,
        unreadCount: state.unreadCount + 1
      };
    }
    return { 
      messages: newMessages
    };
  }),

  incrementUnreadCount: () => set((state) => {
    if (state.activeTab !== 'chat') {
      return { unreadCount: state.unreadCount + 1 };
    }
    return state;
  }),

  resetUnreadCount: () => set({ unreadCount: 0 }),

  initializeWebSocket: (token: string, lang: string) => {
    const { tokenAddress, socket } = get();
    if (!tokenAddress || socket) return;

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/chats`, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      path: '/socket.io'
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server - tradingChatStore');
      set({ isConnected: true });
      
      newSocket.emit('join-token', { 
        token_address: tokenAddress,
        lang: lang 
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server - tradingChatStore');
      set({ isConnected: false });
    });

    newSocket.on('message', (response: any) => {
      const wsMessage = response.data;
      if (wsMessage && wsMessage.ch_content && wsMessage.createdAt) {
        const newMessage = {
          id: String(wsMessage.ch_chat_id || Date.now()),
          sender: {
            name: wsMessage.nick_name || "Anonymous",
            avatar: "/token.png",
            isCurrentUser: wsMessage.ch_wallet_address === "YOUR_WALLET_ADDRESS",
          },
          text: wsMessage.ch_content,
          timestamp: new Date(wsMessage.createdAt),
          country: lang
        };
        
        get().addMessage(newMessage);
      }
    });

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    set({ socket: newSocket });
  },

  disconnectWebSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  }
})) 