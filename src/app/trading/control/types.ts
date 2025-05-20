export interface CryptoCurrency {
    symbol: string
    balance: number
    name: string
}

export type TradingMode = "buy" | "sell"

export interface TradingPanelProps {
    defaultMode: TradingMode
    currency: CryptoCurrency
    isConnected: boolean
    onConnect: () => void
    selectedGroups: string[]
    setSelectedGroups: (groups: string[]) => void
    selectedConnections: string[]
    setSelectedConnections: (connections: string[]) => void
}

export interface MasterTradeChatProps {
    selectedGroups: string[]
    setSelectedGroups: (groups: string[]) => void
    selectedConnections: string[]
    setSelectedConnections: (connections: string[]) => void
} 