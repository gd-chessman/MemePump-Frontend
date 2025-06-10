import { create } from 'zustand'

interface ConnectListState {
  // State
  connectList: string[]
  selectedConnections: string[]
  selectedGroups: string[]
  
  // Actions
  setConnectList: (list: string[]) => void
  getConnectList: () => string[]
  setSelectedConnections: (connections: string[]) => void
  setSelectedGroups: (groups: string[]) => void
  refetchConnections: () => void
}

export const useConnectListStore = create<ConnectListState>((set, get) => ({
  // Initial state
  connectList: [],
  selectedConnections: [],
  selectedGroups: [],

  // Actions
  setConnectList: (list: string[]) => set({ connectList: list }),
  
  getConnectList: () => get().connectList,
  
  setSelectedConnections: (connections: string[]) => set({ selectedConnections: connections }),
  
  setSelectedGroups: (groups: string[]) => set({ selectedGroups: groups }),

  refetchConnections: () => {
    // This will be called from components to trigger refetch
    // The actual refetch logic is handled by React Query
  },
}))
