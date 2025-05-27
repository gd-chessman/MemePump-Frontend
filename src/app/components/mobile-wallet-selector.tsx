"use client"

import { useState } from "react"
import { Search, Copy, Check, Wallet2 } from "lucide-react"
import { useWallets } from '@/hooks/useWallets'
import type { Wallet } from './list-wallet'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/ui/dropdown-menu"
import { truncateString } from '@/utils/format'

interface MobileWalletSelectorProps {
    selectedWalletId: string | null
    onSelectWallet: (wallet: Wallet) => void
    currentWalletAddress: string
}

export default function MobileWalletSelector({
    selectedWalletId,
    onSelectWallet,
    currentWalletAddress
}: MobileWalletSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
    const { wallets: myWallets } = useWallets()

    const filteredWallets = myWallets?.filter((wallet: Wallet) => {
        if (!searchQuery) return true
        return (
            wallet.wallet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            wallet.solana_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            wallet.wallet_type.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }) || []

    const copyToClipboard = (address: string, e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(address)
        setCopiedAddress(address)
        setTimeout(() => setCopiedAddress(null), 2000)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
                    <div className="flex items-center">
                        <Wallet2 className="h-4 w-4 mr-2" />
                        <span>{truncateString(currentWalletAddress, 12)}</span>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="end" 
                className="w-[calc(100vw-2rem)] max-w-[425px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-0"
            >
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search wallet..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none bg-gray-100 dark:bg-black text-gray-900 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500 dark:focus:ring-[hsl(var(--ring))] border border-gray-200 dark:border-t-theme-primary-300 dark:border-l-theme-primary-300 dark:border-b-theme-secondary-400 dark:border-r-theme-secondary-400 placeholder:text-gray-500 dark:placeholder:text-neutral-400"
                        />
                    </div>
                </div>

                {/* Wallet List */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {filteredWallets.map((wallet: Wallet) => (
                        <div
                            key={wallet.wallet_id}
                            className="flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer border-b border-gray-200 dark:border-neutral-800 last:border-b-0"
                            onClick={() => onSelectWallet(wallet)}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        wallet.wallet_type === "Master"
                                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                            : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                    }`}
                                >
                                    {wallet.wallet_type}
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                                        {wallet.wallet_name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {truncateString(wallet.solana_address, 12)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => copyToClipboard(wallet.solana_address, e)}
                                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700"
                                >
                                    {copiedAddress === wallet.solana_address ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                                {selectedWalletId === wallet.solana_address && (
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
} 