import { create } from 'zustand'

interface ConnectListState {
  // State
  connectList: string[]
  
  // Actions
  setConnectList: (list: string[]) => void
  getConnectList: () => string[]
}

export const useConnectListStore = create<ConnectListState>((set, get) => ({
  // Initial state
  connectList: [],

  // Actions
  setConnectList: (list: string[]) => set({ connectList: list }),
  
  getConnectList: () => get().connectList,
}))
