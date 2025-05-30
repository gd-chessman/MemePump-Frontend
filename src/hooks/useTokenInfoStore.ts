import { create } from 'zustand'

interface StoreState {
  dataInfo: any
  setDataInfo: (dataInfo: any) => void
  reset: () => void
}

const initialState = {
  dataInfo: null,
}

export const useTokenInfoStore = create<StoreState>((set) => ({
  ...initialState,

  setDataInfo: (dataInfo: any) => 
    set({ dataInfo }),

  reset: () => set(initialState),
}))
