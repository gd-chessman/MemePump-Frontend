import { useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getWalletBalanceByAddress } from '@/services/api/TelegramWalletService'

export interface BalanceData {
    sol_balance: number
    sol_balance_usd: number
}

interface Group {
    group_id: number | string
    [key: string]: any
}

type SetSelectedGroupsType = string[] | ((prev: string[]) => string[])
type SetSelectedConnectionsType = string | ((prev: string[]) => string[])

export const useTradingState = (connections: any[] = []) => {
    const [selectedGroups, setSelectedGroups] = useState<string[]>([])
    const [selectedConnections, setSelectedConnections] = useState<string[]>([])
    const [balances, setBalances] = useState<Record<string, BalanceData>>({})
    const [isLoadingBalances, setIsLoadingBalances] = useState(false)
    const queryClient = useQueryClient()

    // Update connections when groups change
    useEffect(() => {
        if (!connections.length) return

        const getConnectionsFromGroups = (groups: string[]) => {
            return connections
                .filter(conn => conn.status === "connect")
                .filter(conn => 
                    conn.joined_groups.some((group: Group) => 
                        groups.includes(group.group_id.toString())
                    )
                )
                .map(conn => conn.member_id.toString())
        }

        if (selectedGroups.length === 0) {
            setSelectedConnections([])
        } else {
            const newConnections = getConnectionsFromGroups(selectedGroups)
            if (JSON.stringify(newConnections) !== JSON.stringify(selectedConnections)) {
                setSelectedConnections(newConnections)
            }
        }
    }, [selectedGroups, connections])

    // Handle group selection
    const handleSetSelectedGroups = useCallback((value: SetSelectedGroupsType) => {
        const newGroups = typeof value === 'function' ? value(selectedGroups) : value
        setSelectedGroups(newGroups)
    }, [selectedGroups])

    // Handle connection selection
    const handleSetSelectedConnections = useCallback((value: SetSelectedConnectionsType) => {
        if (typeof value === 'string') {
            setSelectedConnections(prev => {
                const newConnections = prev.includes(value)
                    ? prev.filter(id => id !== value)
                    : [...prev, value]

                // Update groups based on selected connections
                const selectedGroupsFromConnections = connections
                    .filter(conn => newConnections.includes(conn.member_id.toString()))
                    .flatMap(conn => 
                        conn.joined_groups.map((group: Group) => group.group_id.toString())
                    )
                    .filter((id, index, self) => self.indexOf(id) === index) // Remove duplicates

                setSelectedGroups(selectedGroupsFromConnections)
                return newConnections
            })
        } else {
            setSelectedConnections(value)
        }
    }, [connections])

    const getBalance = async (address: string) => {
        try {
            const balance = await getWalletBalanceByAddress(address)
            return balance
        } catch (error) {
            console.error(`Error fetching balance for ${address}:`, error)
            return {
                sol_balance: 0,
                sol_balance_usd: 0
            }
        }
    }

    // Fetch all balances when connections change
    useEffect(() => {
        const fetchAllBalances = async () => {
            if (!connections.length) return

            setIsLoadingBalances(true)
            const newBalances: Record<string, BalanceData> = {}
            const filteredConnections = connections.filter((connection) => connection.status === "connect")

            try {
                // Fetch balances in parallel for better performance
                const balancePromises = filteredConnections.map(async (connection) => {
                    const balance = await getBalance(connection.member_address)
                    return {
                        id: connection.member_id,
                        balance: {
                            sol_balance: balance?.sol_balance || 0,
                            sol_balance_usd: balance?.sol_balance_usd || 0
                        }
                    }
                })

                const results = await Promise.all(balancePromises)
                
                // Convert array to record
                results.forEach(({ id, balance }) => {
                    newBalances[id] = balance
                })

                setBalances(newBalances)
            } catch (error) {
                console.error('Error fetching balances:', error)
            } finally {
                setIsLoadingBalances(false)
            }
        }

        fetchAllBalances()
    }, [connections])

    const refreshBalance = async (memberId: string, address: string) => {
        try {
            const balance = await getBalance(address)
            setBalances(prev => ({
                ...prev,
                [memberId]: {
                    sol_balance: balance?.sol_balance || 0,
                    sol_balance_usd: balance?.sol_balance_usd || 0
                }
            }))
        } catch (error) {
            console.error(`Error refreshing balance for ${address}:`, error)
        }
    }

    const refreshTradingData = useCallback(() => {
        // Invalidate and refetch all relevant queries
        queryClient.invalidateQueries({ queryKey: ['groups'] })
        queryClient.invalidateQueries({ queryKey: ['myConnects'] })
        queryClient.invalidateQueries({ queryKey: ['tokenAmount'] })
        queryClient.invalidateQueries({ queryKey: ['tradeAmount'] })
    }, [queryClient])

    const handleTradeSubmit = useCallback(async (submitFn: () => Promise<any>) => {
        try {
            const response = await submitFn()
            if (response && (response.status === 201 || response.status === 200 || response.message?.includes('successfully'))) {
                // Reset selections
                setSelectedGroups([])
                setSelectedConnections([])
                
                // Refresh all trading data
                refreshTradingData()
                
                return { success: true }
            }
            return { success: false }
        } catch (error) {
            return { success: false, error }
        }
    }, [refreshTradingData])

    return {
        selectedGroups,
        setSelectedGroups: handleSetSelectedGroups,
        selectedConnections,
        setSelectedConnections: handleSetSelectedConnections,
        balances,
        isLoadingBalances,
        refreshBalance,
        refreshTradingData,
        handleTradeSubmit
    }
} 