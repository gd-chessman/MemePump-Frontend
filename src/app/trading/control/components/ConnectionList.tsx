import React from 'react'
import { Copy, Check } from 'lucide-react'
import { truncateString } from '@/utils/format'

interface ConnectionListProps {
    connections: any[]
    selectedConnections: string[]
    onSelectConnection: (id: string) => void
    copiedAddress: string | null
    onCopyAddress: (address: string) => void
}

export const ConnectionList: React.FC<ConnectionListProps> = ({
    connections,
    selectedConnections,
    onSelectConnection,
    copiedAddress,
    onCopyAddress,
}) => {
    return (
        <div className="h-full overflow-y-auto">
            <div className="px-4">
                {connections.map((item) => (
                    <div
                        key={item.member_id}
                        onClick={() => onSelectConnection(item.member_id.toString())}
                        className="flex items-center p-2 rounded-lg hover:bg-[#1a1a1a] cursor-pointer relative"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                                <p className="text-sm font-medium text-white truncate">
                                    {item.name}
                                </p>
                                <p className="ml-2 text-xs text-gray-400">{item.ticker}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-400 truncate">
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
                        </div>
                        <button
                            className={`w-6 h-6 rounded-full border ${
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