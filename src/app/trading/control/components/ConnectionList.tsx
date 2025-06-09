import React from 'react'
import { Copy, Check } from 'lucide-react'
import { formatNumberWithSuffix3, truncateString } from '@/utils/format'
import { useLang } from '@/lang/useLang'

export interface ConnectionListProps {
    connections: any[]
    selectedConnections: string[]
    onSelectConnection: (id: string) => void
    copiedAddress: string | null
    onCopyAddress: (address: string) => void
    isLoading?: boolean
    balances?: Record<string, any>
    onRefreshBalance?: (memberId: string, address: string) => Promise<void>
}

export const ConnectionList: React.FC<ConnectionListProps> = ({
    connections,
    selectedConnections,
    onSelectConnection,
    copiedAddress,
    onCopyAddress,
    isLoading: externalLoading = false,
    balances,
    onRefreshBalance
}) => {
    const { t } = useLang()
    const isLoading = externalLoading

    const handleSelectConnection = (id: string) => {
        onSelectConnection(id)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-theme-primary-400"></div>
            </div>
        )
    }
    if (!connections || connections.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-neutral-400">
                No connections found
            </div>
        )
    }

    const handleRefreshBalance = async (memberId: string, address: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (onRefreshBalance) {
            await onRefreshBalance(memberId, address)
        }
    }
    console.log("connections", connections)
    return (
        <div className="h-full overflow-y-auto bg-gray-300/50 dark:bg-transparent rounded-xl">
            <div className="">
                {connections.filter(conn => conn.status === "connect").map((item) => (
                    <div
                        key={item.member_id}
                        onClick={() => handleSelectConnection(item.member_id.toString())}
                        className="flex items-center p-2 px-4 lg:rounded-lg dark:hover:bg-[#1a1a1a] hover:bg-theme-green-300 cursor-pointer relative dark:border-none border-b border-gray-400 dark:border-theme-neutral-700"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                                <p className="text-sm font-medium dark:text-white text-black truncate">
                                    {item.name}
                                </p>
                                <p className="ml-2 text-xs text-gray-400 dark:text-gray-500">{item.ticker}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-theme-neutral-800 dark:text-gray-500 truncate">
                                    {truncateString(item.member_address, 10)}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onCopyAddress(item.member_address)
                                    }}
                                    className="ml-1 text-gray-400 hover:text-gray-300"
                                >
                                    {copiedAddress === item.member_address ? (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <span>{formatNumberWithSuffix3(balances?.[item.member_id]?.sol_balance || 0)} SOL</span>
                                    <span>${formatNumberWithSuffix3(balances?.[item.member_id]?.sol_balance_usd || 0)}</span>
                                    <button
                                        onClick={(e) => handleRefreshBalance(item.member_id, item.member_address, e)}
                                        className="ml-1 text-gray-400 hover:text-gray-300"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button
                            className={`w-4 h-4 rounded-full border ${
                                selectedConnections.includes(item.member_id.toString())
                                    ? "border-transparent linear-gradient-blue"
                                    : "border-gray-600 hover:border-gray-400"
                            }`}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
} 
