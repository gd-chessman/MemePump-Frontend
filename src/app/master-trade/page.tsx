"use client"

import { useState, useMemo, useEffect, useCallback, use } from "react"
import { Search, Copy, ChevronDown, Crown, Loader2 } from "lucide-react"
import { getMasterById, getMasters } from "@/services/api/MasterTradingService"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { MasterTradingService } from "@/services/api"
import ConnectToMasterModal from "../components/connect-master-trade-modal"
import { truncateString } from "@/utils/format"
import DetailMasterModal from "./modal-detail-wallet"
import { getInforWallet } from "@/services/api/TelegramWalletService"
import { useLang } from '@/lang/useLang'

// Định nghĩa các kiểu dữ liệu
type TradeStatus = "Not Connected" | "connect" | "disconnect" | "pause" | "pending" | "block"
type TradeType = "VIP" | "NORMAL"

interface TradeData {
    id: number
    address: string
    pnl7d: number | string
    pnlPercent7d: number | string
    pnl30d: number | string
    pnlPercent30d: number | string
    winRate7d: number | string
    transactions7d: {
        wins: number;
        losses: number;
    }
    lastTime: string
    type: TradeType
    status: TradeStatus
}

interface Trader {
    id?: string;
    solana_address?: string;
    eth_address?: string;
    pnl7d?: number;
    pnlPercent7d?: number;
    pnl30d?: number;
    pnlPercent30d?: number;
    winRate7d?: number;
    transactions7d?: {
        wins: number;
        losses: number;
    };
    lastTime?: string;
    type?: string;
    connect_status?: TradeStatus;
    info?: any;
}

interface MasterDetail {
    "1d": {
        totalPnL: number;
        totalChange: number;
        percentageChange: number;
        winPercentage: number;
        wins: number;
        losses: number;
    };
    "7d": {
        totalPnL: number;
        totalChange: number;
        percentageChange: number;
        winPercentage: number;
        wins: number;
        losses: number;
    };
    "30d": {
        totalPnL: number;
        totalChange: number;
        percentageChange: number;
        winPercentage: number;
        wins: number;
        losses: number;
    };
    address: string;
    lastTime?: string;
    status?: TradeStatus;
    id?: string;
}

// Định nghĩa các kiểu lọc
type FilterType = "All" | "Not Connected" | "connect" | "disconnect" | "pause" | "pending"
const styleTextRow = "px-4 py-1 text-xs"
const blueBg = "text-theme-blue-200 border border-theme-blue-200"
const textHeaderTable = "text-xs font-normal dark:text-neutral-200 text-neutral-900"

// Add these new style constants
const mobileContainerClass = "px-4 md:px-[40px]" // Reduced padding on mobile
const mobileFilterWrapperClass = "w-full md:w-auto overflow-x-auto md:overflow-visible flex-none lg:flex-1"
const mobileFilterButtonClass = "whitespace-nowrap rounded-sm text-xs md:text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer flex-shrink-0"
const mobileSearchWrapperClass = "flex flex-col md:flex-row items-start md:items-center gap-4 w-full" // Stack search on mobile
const mobileTableWrapperClass = "overflow-x-auto rounded-xl border-1 z-10 border-solid border-y-theme-primary-100 border-x-theme-purple-200 dark:bg-theme-black-1/2 bg-white bg-opacity-30 backdrop-blur-sm relative md:block hidden" // Hide table on mobile
const mobileCardWrapperClass = "flex flex-col gap-4 md:hidden" // Show cards on mobile only
const mobileCardClass = "rounded-xl border-1 z-10 border-solid border-y-theme-primary-100 border-x-theme-purple-200 dark:bg-theme-black-1/2 bg-white bg-opacity-30 backdrop-blur-sm p-4" // Card style for mobile

// Add new wrapper class for the filter buttons container
const filterButtonsWrapperClass = "flex gap-2 md:gap-6 md:flex-wrap min-w-max md:min-w-0 pb-2 md:pb-0"

export default function MasterTradeTable() {
    const [activeFilter, setActiveFilter] = useState<FilterType>("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [showConnectModal, setShowConnectModal] = useState<string>("")
    const [infoWallet, setInfoWallet] = useState<any>(null)
    const [inforWallet, setInforWallet] = useState<any>(null)
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
    const [copyNotification, setCopyNotification] = useState<{ show: boolean; address: string }>({ show: false, address: "" })
    const [isLoading, setIsLoading] = useState(true)
    const [combinedMasterData, setCombinedMasterData] = useState<(Trader & MasterDetail)[]>([])
    const router = useRouter()
    const { t } = useLang()

    const roundToTwoDecimals = (value: number | undefined | null): number | string => {
        if (value === undefined || value === null) return "updating";
        // Multiply by 100, round up, then divide by 100 to get 2 decimal places
        return Math.ceil(value * 100) / 100;
    };
    const { data: myWalletInfor, refetch } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
    });

    const formatLastTime = (timestamp: string | undefined | null): string => {
        if (!timestamp) return t('masterTrade.page.timeAgo.updating');
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffInSeconds < 60) {
                return t('masterTrade.page.timeAgo.seconds', { count: diffInSeconds });
            }

            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) {
                return t('masterTrade.page.timeAgo.minutes', { count: diffInMinutes });
            }

            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) {
                return t('masterTrade.page.timeAgo.hours', { count: diffInHours });
            }

            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) {
                return t('masterTrade.page.timeAgo.days', { count: diffInDays });
            }

            const diffInWeeks = Math.floor(diffInDays / 7);
            if (diffInWeeks < 4) {
                return t('masterTrade.page.timeAgo.weeks', { count: diffInWeeks });
            }

            const diffInMonths = Math.floor(diffInDays / 30);
            if (diffInMonths < 12) {
                return t('masterTrade.page.timeAgo.months', { count: diffInMonths });
            }

            const diffInYears = Math.floor(diffInDays / 365);
            return t('masterTrade.page.timeAgo.years', { count: diffInYears });
        } catch (error) {
            return t('masterTrade.page.timeAgo.updating');
        }
    };

    const { data: masterTraders = [], refetch: refetchMasterTraders, isLoading: isLoadingMasters } = useQuery({
        queryKey: ["master-trading/masters"],
        queryFn: getMasters,
    });

    const { data: masterDetails = [], isLoading: isLoadingDetails, refetch: refetchMasterDetails } = useQuery({
        queryKey: ["master-trading/details", masterTraders.map((t: Trader) => t.solana_address || t.eth_address)],
        queryFn: async () => {
            const details = await Promise.all(
                masterTraders.map(async (trader: Trader) => {
                    const address = trader.solana_address || trader.eth_address;

                    if (!address) return null;
                    try {
                        const data = await getMasterById(address);
                        const statusConnection = trader.connect_status === "connect" ? data : null;
                        return { ...data.historic.summary, address, lastTime: data?.pnl_since, info: statusConnection };
                    } catch (error) {
                        return null;
                    }
                })
            );
            return details;
        },
        enabled: masterTraders.length > 0,
    });

    // Handle initial data from masterTraders
    useEffect(() => {
        if (!masterTraders?.length) return;

        const initialData = masterTraders.map((trader: Trader) => ({
            ...trader,
            address: trader.solana_address || trader.eth_address,
            "7d": { totalChange: 0, percentageChange: 0, winPercentage: 0, wins: 0, losses: 0 },
            "30d": { totalChange: 0, percentageChange: 0 },
            lastTime: null,
            info: null
        }));

        setCombinedMasterData(initialData);
        setIsLoading(false);
    }, [masterTraders]);

    // Update with masterDetails when available
    useEffect(() => {
        if (!masterDetails?.length || !combinedMasterData.length) return;

        const updateData = () => {
            const updatedData = combinedMasterData.map(trader => {
                const details = masterDetails.find(detail => detail?.address === trader.address);
                if (!details) return trader;

                return {
                    ...trader,
                    ...details,
                    address: trader.address,
                    connect_status: trader.connect_status
                };
            });

            setCombinedMasterData(updatedData);
        };

        // Use setTimeout to avoid React state update conflicts
        setTimeout(updateData, 0);
    }, [masterDetails, router, combinedMasterData]);


    // Update tradeData to use combinedMasterData
    const tradeData = useMemo(() => {
        return combinedMasterData.map((trader) => {
            const sevenDayData = trader["7d"] || { totalChange: 0, percentageChange: 0, winPercentage: 0, wins: 0, losses: 0 };
            const thirtyDayData = trader["30d"] || { totalChange: 0, percentageChange: 0 };

            return {
                id: trader.id,
                address: trader.address,
                pnl7d: roundToTwoDecimals(sevenDayData.totalChange),
                pnlPercent7d: roundToTwoDecimals(sevenDayData.percentageChange),
                pnl30d: roundToTwoDecimals(thirtyDayData.totalChange),
                pnlPercent30d: roundToTwoDecimals(thirtyDayData.percentageChange),
                winRate7d: roundToTwoDecimals(sevenDayData.winPercentage),
                transactions7d: {
                    wins: sevenDayData.wins,
                    losses: sevenDayData.losses
                },
                lastTime: formatLastTime(trader.lastTime),
                info: trader.info,
                type: trader.type || "NORMAL" as TradeType,
                status: (trader.connect_status ?? "Not Connected") as TradeStatus
            };
        });
    }, [combinedMasterData]);

    // Đếm số lượng mục theo trạng thái
    const connectedCount = tradeData.filter((item) => item.status === "connect").length
    const notConnectedCount = tradeData.filter((item) => item.status === "Not Connected").length
    const disconnectedCount = tradeData.filter((item) => item.status === "disconnect").length
    const pendingCount = tradeData.filter((item) => item.status === "pending").length
    const pausedCount = tradeData.filter((item) => item.status === "pause").length

    // Lọc dữ liệu dựa trên bộ lọc đang hoạt động và truy vấn tìm kiếm
    const filteredData = useMemo(() => {
        let filtered = tradeData;

        // Áp dụng bộ lọc trạng thái
        if (activeFilter !== "All") {
            filtered = filtered.filter((item) => item.status === activeFilter);
        }

        // Áp dụng tìm kiếm
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((item) => {
                const fullAddress = item.address.toLowerCase();
                const truncatedAddress = truncateString(item.address, 12).toLowerCase();
                return fullAddress.includes(searchLower) || truncatedAddress.includes(searchLower);
            });
        }

        return filtered;
    }, [tradeData, activeFilter, searchQuery]);
    console.log("filteredData")
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
    const handleConnect = async (inforWallet?: any) => {
        if (inforWallet.type !== "vip" && inforWallet.status == null) {
            setShowConnectModal(inforWallet.address)
        } else if (inforWallet.status === "pause") {
            await handleMemberConnectStatus(inforWallet, "connect")
        } else {
            await handleMemberConnect(inforWallet)
        }
        refetchMasterTraders()
    }
    const handleMemberConnect = async (inforWallet?: any) => {
        await MasterTradingService.connectMaster({
            option_limit: "price",
            price_limit: "0.01",
            master_wallet_address: inforWallet.address,
        });
    }
    const handleMemberConnectStatus = async (inforWallet?: any, status?: string) => {
        try {
            await MasterTradingService.memberSetConnect({
                master_address: inforWallet.address,
                master_id: inforWallet.id,
                status: status,
            });
            // Refetch both queries to ensure UI updates
            await Promise.all([
                refetchMasterTraders(),
                refetchMasterDetails()
            ]);
        } catch (error) {
            console.error("Error pausing master:", error);
        }
    }

    // Loading skeleton component
    const TableSkeleton = () => (
        <tr className="border-b border-blue-500/10 animate-pulse">
            <td className={`${styleTextRow}`}>
                <div className="h-4 bg-gray-700 rounded w-32"></div>
            </td>
            <td className={`${styleTextRow}`}>
                <div className="h-4 bg-gray-700 rounded w-20"></div>
            </td>
            <td className={`${styleTextRow}`}>
                <div className="h-4 bg-gray-700 rounded w-20"></div>
            </td>
            <td className={`${styleTextRow}`}>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
            </td>
            <td className={`${styleTextRow}`}>
                <div className="h-4 bg-gray-700 rounded w-12"></div>
            </td>
            <td className={`${styleTextRow}`}>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
            </td>
            <td className={`${styleTextRow}`}>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
            </td>
            <td className={`${styleTextRow}`}>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
            </td>
            <td className={`${styleTextRow}`}>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
            </td>
        </tr>
    );

    // Helper function to get trader details
    const getTraderDetails = (address: string) => {
        return combinedMasterData.find((t: (Trader & MasterDetail)) => t.address === address);
    };

    const getValueColor = (value: number | string): string => {
        if (typeof value === 'string') {
            // Handle "updating" case
            if (value === "updating") return 'dark:text-neutral-200 text-neutral-900';
            // Convert string to number
            const numValue = Number(value);
            if (isNaN(numValue)) return 'dark:text-neutral-200 text-neutral-900';
            // Use a small epsilon to handle floating point comparison
            if (numValue > 0.0001) return 'text-theme-green-200';
            if (numValue < -0.0001) return 'text-theme-red-200';
            return 'dark:text-neutral-200 text-neutral-900';
        }
        // For number type
        if (value > 0.0001) return 'text-theme-green-200';
        if (value < -0.0001) return 'text-theme-red-200';
        return 'dark:text-neutral-200 text-neutral-900';
    };

    return (
        <div className={`lg:container-glow pb-4 lg:pb-0 h-screen lg:h-[92vh] ${mobileContainerClass} flex flex-col gap-4 md:gap-6 pt-[20px] md:pt-[30px] relative mx-auto z-10`}>
            {/* Thông báo copy */}
            {copyNotification.show && (
                <div className="fixed top-4 right-4 bg-theme-green-200 text-black px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 animate-fade-in-out">
                    Copied address: {copyNotification.address}
                </div>
            )}

            {/* Filters and Search - Updated for mobile */}
            <div className={mobileSearchWrapperClass}>
                <div className={mobileFilterWrapperClass}>
                    <div className={filterButtonsWrapperClass}>
                        <button
                            onClick={() => setActiveFilter("All")}
                            className={`${mobileFilterButtonClass} ${activeFilter === "All" ? 'dark:bg-[#0F0F0F] bg-theme-blue-100' : 'border-transparent'}`}
                        >
                            <span className={`text-theme-black-100 dark:text-theme-neutral-100`}>{t('masterTrade.page.filters.all')} ({tradeData.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveFilter("Not Connected")}
                            className={`${mobileFilterButtonClass} ${activeFilter === "Not Connected" ? 'dark:bg-[#0F0F0F] bg-theme-blue-100' : 'border-transparent'}`}
                        >
                            <span className={`text-theme-black-100 dark:text-theme-neutral-100`}>{t('masterTrade.page.filters.notConnected')} ({notConnectedCount})</span>
                        </button>
                        <button
                            onClick={() => setActiveFilter("connect")}
                            className={`${mobileFilterButtonClass} ${activeFilter === "connect" ? 'dark:bg-[#0F0F0F] bg-theme-blue-100' : 'border-transparent'}`}
                        >
                            <span className={`text-theme-black-100 dark:text-theme-neutral-100`}>{t('masterTrade.page.filters.connected')} ({connectedCount})</span>
                        </button>
                        <button
                            onClick={() => setActiveFilter("disconnect")}
                            className={`${mobileFilterButtonClass} ${activeFilter === "disconnect" ? 'dark:bg-[#0F0F0F] bg-theme-blue-100' : 'border-transparent'}`}
                        >
                            <span className={`text-theme-black-100 dark:text-theme-neutral-100`}>{t('masterTrade.page.filters.disconnected')} ({disconnectedCount})</span>
                        </button>
                        <button
                            onClick={() => setActiveFilter("pause")}
                            className={`${mobileFilterButtonClass} ${activeFilter === "pause" ? 'dark:bg-[#0F0F0F] bg-theme-blue-100' : 'border-transparent'}`}
                        >
                            <span className={`text-theme-black-100 dark:text-theme-neutral-100`}>{t('masterTrade.page.filters.paused')} ({pausedCount})</span>
                        </button>
                        <button
                            onClick={() => setActiveFilter("pending")}
                            className={`${mobileFilterButtonClass} ${activeFilter === "pending" ? 'dark:bg-[#0F0F0F] bg-theme-blue-100' : 'border-transparent'}`}
                        >
                            <span className={`text-theme-black-100 dark:text-theme-neutral-100`}>{t('masterTrade.page.filters.pending')} ({pendingCount})</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-rowitems-start md:items-center gap-4 w-full justify-between md:w-auto">
                    <div className="relative flex-1 w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={t('masterTrade.page.search.placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="rounded-full py-2 pl-10 pr-4 w-full md:w-64 text-xs md:text-sm focus:outline-none bg-gray-100 dark:bg-black text-gray-900 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500 dark:focus:ring-[hsl(var(--ring))] max-h-[30px] border border-gray-200 dark:border-t-theme-primary-300 dark:border-l-theme-primary-300 dark:border-b-theme-secondary-400 dark:border-r-theme-secondary-400 placeholder:text-gray-500 dark:placeholder:text-neutral-400 placeholder:text-xs"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {myWalletInfor?.role !== "member" && (
                        <button className="lg:max-w-auto max-w-[300px] group relative bg-gradient-to-t from-theme-primary-500 to-theme-secondary-400 py-1.5 md:py-2 px-3 md:px-4 lg:px-5 rounded-full text-[11px] md:text-xs transition-all duration-500 hover:from-theme-blue-100 hover:to-theme-blue-200 hover:scale-105 hover:shadow-lg hover:shadow-theme-primary-500/30 active:scale-95 lg:w-full md:w-auto flex" onClick={() => router.push("/master-trade/manage")}>
                            <span className="flex items-center gap-2 text-theme-neutral-100 z-10">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
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
                                {t('masterTrade.page.manageMaster')}
                            </span>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-theme-primary-300 to-theme-secondary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop Table */}
            <div className={mobileTableWrapperClass}>
                <div className="overflow-x-auto rounded-xl border-1 z-10 border-solid border-y-theme-primary-100 border-x-theme-purple-200 dark:bg-theme-black-1/2 bg-opacity-30 backdrop-blur-sm relative p-3">
                    <table className="w-full dark:text-theme-neutral-100 text-theme-neutral-900">
                        <thead>
                            <tr className="border-b border-blue-500/30 text-gray-400 text-sm">
                                <th className={`${styleTextRow} text-left ${textHeaderTable} w-[15%]`}>{t('masterTrade.page.table.address')}</th>
                                <th className={`${styleTextRow} text-center ${textHeaderTable} w-[12%]`}>
                                    <div className={`flex items-center justify-center ${textHeaderTable}`}>
                                        {t('masterTrade.page.table.pnl7d')}
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th className={`${styleTextRow} text-center w-[12%]`}>
                                    <div className={`flex items-center justify-center ${textHeaderTable}`}>
                                        {t('masterTrade.page.table.pnl30d')}
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th className={`${styleTextRow} text-center w-[10%]`}>
                                    <div className={`flex items-center justify-center ${textHeaderTable}`}>
                                        {t('masterTrade.page.table.winRate7d')}
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th className={`${styleTextRow} text-left w-[8%]`}>
                                    <div className={`flex items-center ${textHeaderTable}`}>
                                        {t('masterTrade.page.table.transactions7d')}
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th className={`${styleTextRow} text-left w-[10%]`}>
                                    <div className={`flex items-center ${textHeaderTable}`}>
                                        {t('masterTrade.page.table.lastTime')}
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th className={`${styleTextRow} text-left w-[8%]`}>
                                    <div className={`flex items-center ${textHeaderTable}`}>
                                        {t('masterTrade.page.table.type')}
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th className={`${styleTextRow} text-start ${textHeaderTable} w-[8%]`}>{t('masterTrade.page.table.status')}</th>
                                <th className={`${styleTextRow} text-start ${textHeaderTable} whitespace-nowrap`}>{t('masterTrade.page.table.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                // Show 5 skeleton rows while loading
                                Array(5).fill(0).map((_, index) => (
                                    <TableSkeleton key={index} />
                                ))
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-8 text-neutral-400">
                                        {t('masterTrade.page.table.noData')}
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="border-b border-blue-500/10 hover:bg-blue-900/10 transition-colors">
                                        <td className={`${styleTextRow}`}>
                                            <div className="flex items-center text-xs font-normal text-neutral-200">
                                                <span className="dark:text-theme-neutral-100 text-theme-neutral-900 text-xs font-medium">{truncateString(item.address, 12)}</span>
                                                <button
                                                    onClick={() => copyAddress(item.address)}
                                                    className="ml-2 dark:text-theme-neutral-100 text-theme-neutral-900 transition-colors group relative"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:text-theme-neutral-100 text-theme-neutral-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                        {t('masterTrade.page.actions.copy')}
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className={`${styleTextRow} text-center`}>
                                            <div className={`text-xs ${getValueColor(Number(item.pnlPercent7d))}`}>{item.pnlPercent7d} %</div>
                                            <div className={`text-xs ${getValueColor(Number(item.pnl7d))}`}>${item.pnl7d}</div>
                                        </td>
                                        <td className={`${styleTextRow} text-center`}>
                                            <div className={`text-xs ${getValueColor(Number(item.pnlPercent30d))}`}>{item.pnlPercent30d} %</div>
                                            <div className={`text-xs ${getValueColor(Number(item.pnl30d))}`}>${item.pnl30d}</div>
                                        </td>
                                        <td className={`${styleTextRow} text-center`}>
                                            <div className={`${getValueColor(Number(item.winRate7d))}`}>{item.winRate7d}%</div>
                                        </td>
                                        <td className={`${styleTextRow} text-xs flex flex-col gap-1`}>
                                            <div>
                                                <span className="text-xs">{item.transactions7d.wins + item.transactions7d.losses}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <div className="text-theme-green-200 text-xs">{item.transactions7d.wins}</div>
                                                <div className="text-theme-red-200 text-xs">{item.transactions7d.losses}</div>
                                            </div>
                                            {/* <div className="text-theme-primary-400">3/4</div> */}
                                        </td>
                                        <td className={`${styleTextRow} text-xs`}>{item.lastTime}</td>
                                        <td className={`${styleTextRow}`}>
                                            {item.type === "vip" ? (
                                                <div className="flex items-center text-theme-yellow-200 text-xs">
                                                    <Crown className="h-4 w-4 mr-1" />
                                                    {t('masterTrade.page.traderType.vip')}
                                                </div>
                                            ) : (
                                                <div className="text-theme-primary-400 text-xs">
                                                    {t('masterTrade.page.traderType.normal')}
                                                </div>
                                            )}
                                        </td>
                                        <td className={`${styleTextRow} text-start`}>
                                            <span
                                                className={` py-1 rounded-full text-xs`}
                                            >
                                                {t(`masterTrade.page.status.${item.status.toLowerCase()}`)}
                                            </span>
                                        </td>
                                        <td className={`${styleTextRow} text-center`}>
                                            <div className="flex  gap-1 justify-start">
                                                {item.status === "Not Connected" && (
                                                    <button
                                                        onClick={() => {
                                                            handleConnect(item)
                                                            setInforWallet(getTraderDetails(item.address))
                                                        }}
                                                        className={`px-3 py-1 text-theme-green-200 border border-theme-green-200 hover:dark:text-theme-neutral-100 hover:bg-theme-green-200 rounded-full transition-colors text-xs`}
                                                    >
                                                        {t('masterTrade.page.actions.connect')}
                                                    </button>
                                                )}
                                                {(item.status === "connect" || item.status === "pause") && (
                                                    <div className="flex gap-1" >
                                                        <button
                                                            onClick={() => {
                                                                setShowDetailModal(true)
                                                                setInfoWallet(item)
                                                            }}
                                                            className={`px-3 py-1 ${blueBg} rounded-full transition-colors text-xs`}
                                                        >
                                                            {t('masterTrade.page.actions.details')}
                                                        </button>
                                                        {item.status === "connect" ? (
                                                            <button
                                                                onClick={() => handleMemberConnectStatus(item, "pause")}
                                                                className="flex-1 px-3 py-1.5 text-theme-yellow-200 border border-theme-yellow-200 hover:dark:text-theme-neutral-100 hover:bg-theme-yellow-200 rounded-full transition-colors text-xs text-center"
                                                            >
                                                                {t('masterTrade.page.actions.pause')}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    handleConnect(item)
                                                                    setInforWallet(getTraderDetails(item.address))
                                                                }}
                                                                className="flex-1 px-3 py-1.5 text-theme-green-200 border border-theme-green-200 hover:dark:text-theme-neutral-100 hover:bg-theme-green-200 rounded-full transition-colors text-xs text-center"
                                                            >
                                                                {t('masterTrade.page.actions.connect')}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                handleMemberConnectStatus(item, "disconnect")
                                                            }}
                                                            className={`px-3 py-1 text-theme-red-200 border border-theme-red-200 hover:dark:text-theme-neutral-100 hover:bg-theme-red-200 rounded-full transition-colors text-xs`}
                                                        >
                                                            {t('masterTrade.page.actions.disconnect')}
                                                        </button>
                                                    </div>
                                                )}
                                                {(item.status === "disconnect") && (
                                                    <button
                                                        onClick={() => {
                                                            handleMemberConnectStatus(item, "connect")
                                                        }}
                                                        className={`px-3 py-1 text-theme-green-200 border border-theme-green-200 hover:dark:text-theme-neutral-100 hover:bg-theme-green-200 rounded-full transition-colors text-xs`}
                                                    >
                                                        {t('masterTrade.page.actions.reconnect')}
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-theme-primary-300" />
                                <span className="text-sm text-neutral-200">{t('common.loading')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Cards */}
            <div className={mobileCardWrapperClass}>
                {isLoading ? (
                    // Mobile loading skeleton
                    Array(3).fill(0).map((_, index) => (
                        <div key={index} className={mobileCardClass}>
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-700 rounded"></div>
                                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                        {t('masterTrade.page.table.noData')}
                    </div>
                ) : (
                    filteredData.map((item) => (
                        <div key={item.id} className={mobileCardClass}>
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <span className="dark:text-theme-neutral-100 text-theme-neutral-900 text-sm font-medium">{truncateString(item.address, 12)}</span>
                                    <button
                                        onClick={() => copyAddress(item.address)}
                                        className="ml-2 dark:text-theme-neutral-100 text-theme-neutral-900"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.type === "vip" ? (
                                        <div className="flex items-center text-theme-yellow-200 text-xs">
                                            <Crown className="h-4 w-4 mr-1" />
                                            {t('masterTrade.page.traderType.vip')}
                                        </div>
                                    ) : (
                                        <div className="text-theme-primary-400 text-xs">
                                            {t('masterTrade.page.traderType.normal')}
                                        </div>
                                    )}
                                    <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'connect' ? 'bg-theme-green-200/20 text-theme-green-200' :
                                        item.status === 'disconnect' ? 'bg-theme-red-200/20 text-theme-red-200' :
                                            'bg-theme-yellow-200/20 text-theme-yellow-200'}`}>
                                        {t(`masterTrade.page.status.${item.status.toLowerCase()}`)}
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="flex lg:block gap-1">
                                    <div className="text-neutral-400 mb-1">{t('masterTrade.page.table.pnl7d')}</div>
                                    <div className={`${getValueColor(Number(item.pnlPercent7d))}`}>{item.pnlPercent7d}%</div>
                                    <div className={`${getValueColor(Number(item.pnl7d))}`}>${item.pnl7d}</div>
                                </div>
                                <div className="flex lg:block gap-1">
                                    <div className="text-neutral-400 mb-1">{t('masterTrade.page.table.pnl30d')}</div>
                                    <div className={`${getValueColor(Number(item.pnlPercent30d))}`}>{item.pnlPercent30d}%</div>
                                    <div className={`${getValueColor(Number(item.pnl30d))}`}>${item.pnl30d}</div>
                                </div>
                                <div className="flex lg:block gap-1">
                                    <div className="text-neutral-400 mb-1">{t('masterTrade.page.table.winRate7d')}</div>
                                    <div className={`${getValueColor(Number(item.winRate7d))}`}>{item.winRate7d}%</div>
                                </div>
                                <div className="flex lg:block gap-1">
                                    <div className="text-neutral-400 mb-1">{t('masterTrade.page.table.transactions7d')}</div>
                                    <div className="flex gap-2">
                                        <span className="text-theme-green-200">{item.transactions7d.wins}W</span>
                                        <span className="text-theme-red-200">{item.transactions7d.losses}L</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer - Actions */}
                            <div className="lg:mt-4 pt-3 border-t border-blue-500/10">
                                <div className="flex flex-wrap gap-2">
                                    {item.status === "Not Connected" && (
                                        <button
                                            onClick={() => {
                                                handleConnect(item)
                                                setInforWallet(getTraderDetails(item.address))
                                            }}
                                            className="flex-1 px-3 py-1.5 text-theme-green-200 border border-theme-green-200 hover:dark:text-theme-neutral-100 hover:bg-theme-green-200 rounded-full transition-colors text-xs text-center"
                                        >
                                            {t('masterTrade.page.actions.connect')}
                                        </button>
                                    )}
                                    {(item.status === "connect" || item.status === "pause") && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setShowDetailModal(true)
                                                    setInfoWallet(item)
                                                }}
                                                className="flex-1 px-3 py-1.5 text-theme-blue-200 border border-theme-blue-200 hover:dark:text-theme-neutral-100 hover:bg-theme-blue-200 rounded-full transition-colors text-xs text-center"
                                            >
                                                {t('masterTrade.page.actions.details')}
                                            </button>
                                            {item.status === "connect" ? (
                                                <button
                                                    onClick={() => handleMemberConnectStatus(item, "pause")}
                                                    className="flex-1 px-3 py-1.5 text-theme-yellow-200 border border-theme-yellow-200 hover:dark:text-theme-neutral-100 hover:bg-theme-yellow-200 rounded-full transition-colors text-xs text-center"
                                                >
                                                    {t('masterTrade.page.actions.pause')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        handleConnect(item)
                                                        setInforWallet(getTraderDetails(item.address))
                                                    }}
                                                    className="flex-1 px-3 py-1.5 text-theme-green-200 border border-theme-green-200 hover:dark:text-theme-neutral-100 hover:bg-theme-green-200 rounded-full transition-colors text-xs text-center"
                                                >
                                                    {t('masterTrade.page.actions.connect')}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleMemberConnectStatus(item, "disconnect")}
                                                className="flex-1 px-3 py-1.5 text-theme-red-200 border border-theme-red-200 hover:dark:text-theme-neutral-100 hover:bg-theme-red-200 rounded-full transition-colors text-xs text-center"
                                            >
                                                {t('masterTrade.page.actions.disconnect')}
                                            </button>
                                        </>
                                    )}
                                    {item.status === "disconnect" && (
                                        <button
                                            onClick={() => handleMemberConnectStatus(item, "connect")}
                                            className="lg:w-auto mx-auto lg:mx-0 w-36 px-3 py-1.5 text-theme-green-200 border border-theme-green-200 hover:dark:text-theme-neutral-100 hover:bg-theme-green-200 rounded-full transition-colors text-xs text-center"
                                        >
                                            {t('masterTrade.page.actions.reconnect')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Keep existing modals */}
            <ConnectToMasterModal
                refetchMasterTraders={refetchMasterTraders}
                inforWallet={inforWallet}
                onClose={() => setShowConnectModal("")}
                masterAddress={showConnectModal}
                isMember={true}
                onConnect={handleConnect}
            />
            <DetailMasterModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                info={infoWallet}
            />
        </div>
    )
}
