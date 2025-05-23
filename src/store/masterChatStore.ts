import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MasterMessage = {
  id: string;
  sender: {
    name: string;
    isCurrentUser: boolean;
  };
  text: string;
  timestamp: Date;
  country: string;
};

interface MasterChatStore {
  messages: MasterMessage[];
  setMessages: (messages: MasterMessage[]) => void;
  addMessage: (message: MasterMessage) => void;
  clearMessages: () => void;
}

export const useMasterChatStore = create<MasterChatStore>()(
  persist(
    (set) => ({
      messages: [],
      setMessages: (messages) => {
        console.log('Setting messages in store:', messages);
        set({ messages });
      },
      addMessage: (message) => {
        console.log('Adding message to store:', message);
        set((state) => {
          const newMessages = [...state.messages, message];
          console.log('New messages state:', newMessages);
          return { messages: newMessages };
        });
      },
      clearMessages: () => {
        console.log('Clearing messages in store');
        set({ messages: [] });
      },
    }),
    {
      name: 'master-chat-storage',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
); 