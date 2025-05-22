"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Copy, ChevronDown, Crown } from "lucide-react"
import { getMasters } from "@/services/api/MasterTradingService"
import { useQuery } from "@tanstack/react-query"

// Định nghĩa các kiểu dữ liệu
type TradeStatus = "Not Connected" | "Connected" | "Disconnected" | "Paused" | "Pending"
type TradeType = "VIP" | "NORMAL"

interface TradeData {
    id: string
    address: string
    pnl7d: number
    pnlPercent7d: number
    pnl30d: number
    pnlPercent30d: number
    winRate7d: number
    transactions7d: number
    lastTime: string
    type: TradeType
    status: TradeStatus
}

// Định nghĩa các kiểu lọc
type FilterType = "All" | "Not Connected" | "Connected" | "Disconnected" | "Pending"
const styleTextRow = "px-4 py-2 rounded-md text-sm"
const greenBg = "text-theme-green-200 border border-theme-green-200"
const redBg = "text-theme-red-200 border border-theme-red-200"
const yellowBg = "text-theme-yellow-200 border border-theme-yellow-200"
const blueBg = "text-theme-blue-200 border border-theme-blue-200"

export default function MasterTradeTable() {
    const [activeFilter, setActiveFilter] = useState<FilterType>("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [copyNotification, setCopyNotification] = useState<{ show: boolean; address: string }>({ show: false, address: "" })

    const { data: masterTraders = [], refetch: refetchMasterTraders } = useQuery({
        queryKey: ["master-trading/masters"],
        queryFn: getMasters,
    });

    // Transform masterTraders data to match the required format
    const tradeData: TradeData[] = useMemo(() => {
        return masterTraders.map((trader: any) => ({
            id: trader.id?.toString() || "updating",
            address: trader.solana_address || trader.eth_address || "updating",
            pnl7d: trader.pnl7d || "updating",
            pnlPercent7d: trader.pnlPercent7d || "updating",
            pnl30d: trader.pnl30d || "updating",
            pnlPercent30d: trader.pnlPercent30d || "updating",
            winRate7d: trader.winRate7d || "updating",
            transactions7d: trader.transactions7d || "updating",
            lastTime: trader.lastTime || "updating",
            type: trader.type?.toUpperCase() as TradeType || "NORMAL",
            status: trader.connection_status as TradeStatus || "Not Connected"
        }));
    }, [masterTraders]);

    // Đếm số lượng mục theo trạng thái
    const connectedCount = tradeData.filter((item) => item.status === "Connected").length
    const disconnectedCount = tradeData.filter((item) => item.status === "Disconnected").length
    const pendingCount = tradeData.filter((item) => item.status === "Pending").length

    // Lọc dữ liệu dựa trên bộ lọc đang hoạt động và truy vấn tìm kiếm
    const filteredData = useMemo(() => {
        let filtered = tradeData

        // Áp dụng bộ lọc trạng thái
        if (activeFilter !== "All") {
            filtered = filtered.filter((item) => item.status === activeFilter)
        }

        // Áp dụng tìm kiếm
        if (searchQuery) {
            filtered = filtered.filter((item) => item.address.toLowerCase().includes(searchQuery.toLowerCase()))
        }

        return filtered
    }, [tradeData, activeFilter, searchQuery])

    // Xử lý sao chép địa chỉ
    const copyAddress = (address: string) => {
        navigator.clipboard.writeText(address)
        setCopyNotification({ show: true, address })
        // Tự động ẩn thông báo sau 2 giây
        setTimeout(() => {
            setCopyNotification({ show: false, address: "" })
        }, 2000)
    }

    // Xử lý các hành động
    const handleConnect = (id: string) => {
        console.log(`Connecting to ${id}`)
        // Thực hiện logic kết nối ở đây
    }

    const handleDisconnect = (id: string) => {
        console.log(`Disconnecting from ${id}`)
        // Thực hiện logic ngắt kết nối ở đây
    }

    const handlePause = (id: string) => {
        console.log(`Pausing ${id}`)
        // Thực hiện logic tạm dừng ở đây
    }

    const handleReconnect = (id: string) => {
        console.log(`Reconnecting to ${id}`)
        // Thực hiện logic kết nối lại ở đây
    }

    const handleCancel = (id: string) => {
        console.log(`Cancelling ${id}`)
        // Thực hiện logic hủy ở đây
    }

    return (
        <div className="container-body px-[40px] flex flex-col gap-6 pt-[30px] relative mx-auto z-10">
            {/* Thông báo copy */}
            {copyNotification.show && (
                <div className="fixed top-4 right-4 bg-theme-green-200 text-black px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 animate-fade-in-out">
                    Copied address: {copyNotification.address}
                </div>
            )}

            {/* Bộ lọc và Tìm kiếm */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div className="flex flex-wrap gap-6">
                    <button
                        onClick={() => setActiveFilter("All")}
                      
                            className={` rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeFilter === "All" ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
                    >
                        <span className={`${activeFilter === 'All' ? 'gradient-hover ' : ''}`}>All master trade</span>
                    </button>
                    <button
                        onClick={() => setActiveFilter("Not Connected")}
                        className={` rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeFilter === "Not Connected" ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
                    >
                        <span className={`${activeFilter === 'Not Connected' ? 'gradient-hover ' : ''}`}>Not connected</span>
                    </button>
                    <button
                        onClick={() => setActiveFilter("Connected")}
                        className={` rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeFilter === "Connected" ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
                    >
                        <span className={`${activeFilter === 'Connected' ? 'gradient-hover ' : ''}`}>Connected ({connectedCount})</span>
                    </button>
                    <button
                        onClick={() => setActiveFilter("Disconnected")}
                        className={` rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeFilter === "Disconnected" ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
                    >
                        <span className={`${activeFilter === 'Disconnected' ? 'gradient-hover ' : ''}`}>Disconnected ({disconnectedCount})</span>
                    </button>
                    <button
                        onClick={() => setActiveFilter("Pending")}
                        className={` rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeFilter === "Pending" ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
                    >
                        <span className={`${activeFilter === 'Pending' ? 'gradient-hover ' : ''}`}>Pending ({pendingCount})</span>
                    </button>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by wallet address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 bg-[#111111] rounded-full pl-10 pr-4 py-2 text-sm border border-blue-500/30 focus:outline-none focus:border-blue-500 text-white"
                        />
                    </div>

                    <button className="linear-gradient-light dark:create-coin-bg hover:linear-200-bg hover-bg-delay text-black dark:text-neutral-100 text-sm font-medium px-4 py-[6px] rounded-full transition-all duration-500 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Manage Master
                    </button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto rounded-xl border-1 z-10 border-solid border-y-[#15DFFD] border-x-[#720881] bg-theme-black-1/2 bg-opacity-30 backdrop-blur-sm">
                <table className="w-full text-white">
                    <thead>
                        <tr className="border-b border-blue-500/30 text-gray-400 text-sm">
                            <th className={`${styleTextRow} text-left`}>Address</th>
                            <th className={`${styleTextRow} text-left`}>
                                <div className="flex items-center">
                                    7D PnL
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </div>
                            </th>
                            <th className={`${styleTextRow} text-left`}>
                                <div className="flex items-center">
                                    30D PnL
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </div>
                            </th>
                            <th className={`${styleTextRow} text-left`}>
                                <div className="flex items-center">
                                    7D Win Rate
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </div>
                            </th>
                            <th className={`${styleTextRow} text-left`}>
                                <div className="flex items-center">
                                    7D TXs
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </div>
                            </th>
                            <th className={`${styleTextRow} text-left`}>
                                <div className="flex items-center">
                                    Last Time
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </div>
                            </th>
                            <th className={`${styleTextRow} text-left`}>
                                <div className="flex items-center">
                                    Type
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </div>
                            </th>
                            <th className={`${styleTextRow} text-center`}>Status</th>
                            <th className={`${styleTextRow} text-center`}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.id} className="border-b border-blue-500/10 hover:bg-blue-900/10 transition-colors">
                                <td className={`${styleTextRow}`}>
                                    <div className="flex items-center">
                                        <span className="text-white">{item.address}</span>
                                        <button
                                            onClick={() => copyAddress(item.address)}
                                            className="ml-2 text-gray-400 hover:text-white transition-colors group relative"
                                        >
                                            <Copy className="h-4 w-4" />
                                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                Copy address
                                            </span>
                                        </button>
                                    </div>
                                </td>
                                <td className={`${styleTextRow}`}>
                                    <div className="text-theme-green-200">{item.pnl7d}</div>
                                    <div className="text-theme-red-200">{item.pnlPercent7d}</div>
                                </td>
                                <td className={`${styleTextRow}`}>
                                    <div className="text-theme-green-200">{item.pnl30d}</div>
                                    <div className="text-theme-red-200">{item.pnlPercent30d}</div>
                                </td>
                                <td className={`${styleTextRow}`}>{item.winRate7d}</td>
                                <td className={`${styleTextRow}`}>
                                    <div>{item.transactions7d}</div>
                                    <div className="text-theme-primary-400">3/4</div>
                                </td>
                                <td className={`${styleTextRow}`}>{item.lastTime}</td>
                                <td className={`${styleTextRow}`}>
                                    {item.type === "VIP" ? (
                                        <div className="flex items-center text-yellow-500">
                                            <Crown className="h-4 w-4 mr-1" />
                                            VIP
                                        </div>
                                    ) : (
                                        <div className="text-theme-primary-400">NORMAL</div>
                                    )}
                                </td>
                                <td className={`${styleTextRow} text-start`}>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs`}
                                    >
                                        {item.status}
                                    </span>
                                </td>
                                <td className={`${styleTextRow} text-center`}>
                                    <div className="flex justify-center gap-2">
                                        {item.status === "Not Connected" && (
                                            <button
                                                onClick={() => handleConnect(item.id)}
                                                className={`px-3 py-1 ${greenBg} rounded-full text-sm transition-colors`}
                                            >
                                                Connect
                                            </button>
                                        )}
                                        {item.status === "Connected" && (
                                            <>
                                                <button
                                                    onClick={() => handlePause(item.id)}
                                                    className={`px-3 py-1 ${yellowBg} rounded-full text-sm transition-colors`}
                                                >
                                                    Pause
                                                </button>
                                                <button
                                                    onClick={() => handleDisconnect(item.id)}
                                                    className={`px-3 py-1 ${redBg} rounded-full text-sm transition-colors`}
                                                >
                                                    Disconnect
                                                </button>
                                            </>
                                        )}
                                        {(item.status === "Disconnected" || item.status === "Paused") && (
                                            <button
                                                onClick={() => handleReconnect(item.id)}
                                                className={`px-3 py-1 ${greenBg} rounded-full text-sm transition-colors`}
                                            >
                                                Reconnect
                                            </button>
                                        )}
                                        {item.status === "Pending" && (
                                            <button
                                                onClick={() => handleCancel(item.id)}
                                                className={`px-3 py-1 ${yellowBg} rounded-full text-sm transition-colors`}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
