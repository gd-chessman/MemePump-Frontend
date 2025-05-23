import { create } from 'zustand'

export type Message = {
  id: string
  sender: {
    name: string
    isCurrentUser: boolean
  }
  text: string
  timestamp: Date
  country: string
}

interface WidgetChatState {
  messages: Message[]
  unreadCount: number
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  incrementUnreadCount: () => void
  resetUnreadCount: () => void
}

export const useWidgetChatStore = create<WidgetChatState>((set) => ({
  messages: [],
  unreadCount: 0,

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => {
    const newMessages = [...state.messages, message];
    return { 
      messages: newMessages,
      unreadCount: state.unreadCount + 1
    };
  }),

  incrementUnreadCount: () => set((state) => ({ 
    unreadCount: state.unreadCount + 1 
  })),

  resetUnreadCount: () => set({ unreadCount: 0 })
})) 