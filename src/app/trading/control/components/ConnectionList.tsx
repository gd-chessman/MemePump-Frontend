import React, { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { formatNumberWithSuffix3, truncateString } from '@/utils/format'
import { useLang } from '@/lang/useLang'
import { getWalletBalanceByAddress } from '@/services/api/TelegramWalletService'

interface ConnectionListProps {
    connections: any[]
    selectedConnections: string[]
    onSelectConnection: (id: string) => void
    copiedAddress: string | null
    onCopyAddress: (address: string) => void
}

interface BalanceData {
    sol_balance: number;
    sol_balance_usd: number;
}

export const ConnectionList: React.FC<ConnectionListProps> = ({
    connections,
    selectedConnections,
    onSelectConnection,
    copiedAddress,
    onCopyAddress,
}) => {

    const { t } = useLang();
    const [balances, setBalances] = useState<Record<string, BalanceData>>({});

    const getBalance = async (address: string) => {
        const balance = await getWalletBalanceByAddress(address)
        return balance
    }

    useEffect(() => {
        const fetchAllBalances = async () => {
            const newBalances: Record<string, BalanceData> = {};
            const filteredConnections = connections.filter((connection) => connection.status === "connect");
            for (const connection of filteredConnections) {
                try {
                    const balance = await getBalance(connection.member_address);
                    newBalances[connection.member_id] = {
                        sol_balance: balance?.sol_balance || 0,
                        sol_balance_usd: balance?.sol_balance_usd || 0
                    };
                } catch (error) {
                    console.error(`Error fetching balance for ${connection.member_address}:`, error);
                    newBalances[connection.member_id] = {
                        sol_balance: 0,
                        sol_balance_usd: 0
                    };
                }
            }
            
            setBalances(newBalances);
        };

        if (connections.length > 0) {
            fetchAllBalances();
        }
    }, [connections]);

    return (
        <div className="h-full overflow-y-auto bg-gray-300/50 dark:bg-transparent rounded-xl">
            <div className="">
                {connections.filter(conn => conn.status === "connect").map((item) => (
                    <div
                        key={item.member_id}
                        onClick={() => onSelectConnection(item.member_id.toString())}
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
                                <div>{formatNumberWithSuffix3(balances[item.member_id]?.sol_balance || 0)} SOL</div>
                                <div>${formatNumberWithSuffix3(balances[item.member_id]?.sol_balance_usd || 0)}</div>
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
