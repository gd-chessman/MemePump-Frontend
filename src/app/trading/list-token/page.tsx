'use client'
import { Search, Star } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import token from '@/assets/svgs/token.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getNewCoins, getSearchTokenInfor, getTopCoins } from '@/services/api/OnChainService'
import { formatNumberWithSuffix } from '@/utils/format'
import { SolonaTokenService } from '@/services/api'
import { useDebounce } from '@/hooks/useDebounce'
import { useLang } from '@/lang/useLang'
import PumpFun from '@/app/components/pump-fun'
import { getListTokenAllCategory, getMyWishlist, getTokenInforByAddress, getTokenByCategory } from '@/services/api/SolonaTokenService'
import { useWsSubscribeTokens } from "@/hooks/useWsSubscribeTokens";
import notify from "@/app/components/notify"
import { getTokenCategorys } from '@/services/api/TelegramWalletService'
import { useTranslate } from "@/hooks/useTranslate";

const TranslatedCategory = ({ name }: { name: string }) => {
    const { translatedText } = useTranslate(name);
    return <>{translatedText || name}</>;
};

const ListToken = () => {
    const { t } = useLang()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [sortBy, setSortBy] = useState("volume_1h_usd");
    const [sortType, setSortType] = useState("desc");
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('activeTabTrading') || "trending";
        }
        return "trending";
    });
    const [timeFilter, setTimeFilter] = useState("24h");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const debouncedSearchQuery = useDebounce(searchQuery, 600);
    const [isSearching, setIsSearching] = useState(false);
    const [pendingWishlist, setPendingWishlist] = useState<Record<string, boolean>>({});
    const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});
    const { data: topCoins, isLoading: isLoadingTopCoins } = useQuery({
        queryKey: ["topCoins", sortBy, sortType],
        queryFn: () => getTopCoins({ sort_by: sortBy, sort_type: sortType, offset: 3, limit: 50 }),
        // refetchInterval: 10000,
    });

    const { tokens: newCoins, isLoading: isLoadingNewCoins } = useWsSubscribeTokens({ limit: 50 });

    const { data: tokenAllCategory = [] } = useQuery({
        queryKey: ["token-all-category"],
        queryFn: () => getListTokenAllCategory(),
    });

    const { data: myWishlist, refetch: refetchMyWishlist } = useQuery({
        queryKey: ["myWishlist"],
        queryFn: getMyWishlist,
        refetchOnMount: true,
    });

    const { data: listToken, isLoading: isQueryLoading } = useQuery({
        queryKey: ["searchTokens", debouncedSearchQuery],
        queryFn: () => getSearchTokenInfor(debouncedSearchQuery),
        enabled: debouncedSearchQuery.length > 0, // Remove minimum length requirement
        staleTime: 10000, // Reduce stale time to 10 seconds
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false, // Prevent refetch on window focus
    })

    const [tokenList, setTokenList] = useState<any[]>([]);
    const [selectedTokenAddress, setSelectedTokenAddress] = useState<string | null>(null);
    const { data: tokenInfo } = useQuery({
        queryKey: ["token-infor", selectedTokenAddress],
        queryFn: () => selectedTokenAddress ? getTokenInforByAddress(selectedTokenAddress) : null,
        enabled: !!selectedTokenAddress,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["token-categories"],
        queryFn: getTokenCategorys,
    });

    const { data: categoryTokens, isLoading: isLoadingCategoryTokens } = useQuery({
        queryKey: ["category-tokens", selectedCategory],
        queryFn: () => selectedCategory ? getTokenByCategory(selectedCategory) : null,
        enabled: !!selectedCategory && activeTab === "category",
    });

    useEffect(() => {
        // Handle search query first
        if (debouncedSearchQuery) {
            setTokenList(listToken?.data || []);
            return;
        }

        // Handle different tabs
        let filteredList;
        switch (activeTab) {
            case "trending":
                filteredList = topCoins;
                break;
            case "new":
                filteredList = newCoins?.map(token => ({
                    ...token,
                    market_cap: token.marketCap * 100,
                    volume_24h_usd: token.marketCap * 100,
                    volume_24h_change_percent: 0,
                    volume_1h_change_percent: 0,
                    volume_4h_change_percent: 0,
                    volume_5m_change_percent: 0,
                    poolAddress: token.address
                }));
                break;
            case "favorite":
                filteredList = myWishlist?.tokens || [];
                break;
            case "category":
                filteredList = tokenAllCategory?.map((token: any) => ({
                    ...token,
                    volume_24h_usd: token.volume_24h_usd,
                    volume_24h_change_percent: 0,
                    volume_1h_change_percent: 0,
                    volume_4h_change_percent: 0,
                    volume_5m_change_percent: 0,
                    poolAddress: token.address
                }));
                break;
            default:
                filteredList = topCoins;
        }

        // Apply time filter if data exists
        if (Array.isArray(filteredList)) {
            filteredList = filteredList.map(item => {
                // Get the appropriate volume change percent based on time filter
                let volume_change_percent;
                switch (timeFilter) {
                    case "5m":
                        volume_change_percent = item.volume_5m_change_percent;
                        break;
                    case "1h":
                        volume_change_percent = item.volume_1h_change_percent;
                        break;
                    case "4h":
                        volume_change_percent = item.volume_4h_change_percent;
                        break;
                    case "24h":
                    default:
                        volume_change_percent = item.volume_24h_change_percent;
                }

                return {
                    ...item,
                    volume_change_percent,
                    // Use volume_24h_usd as fallback for all time periods since specific volumes aren't available
                    volume_usd: item.volume_24h_usd
                };
            });

            // Sort by volume_change_percent in descending order
            if (activeTab === "trending") {
                filteredList.sort((a, b) => {
                    const aVolumeChange = a.volume_change_percent || 0;
                    const bVolumeChange = b.volume_change_percent || 0;
                    return bVolumeChange - aVolumeChange;
                });
            }
        }

        setTokenList(filteredList);
    }, [debouncedSearchQuery, listToken, topCoins, newCoins, myWishlist, activeTab, timeFilter]);
    // Add paste handler
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault(); // Prevent default paste behavior
        const pastedText = e.clipboardData.getData('text').trim();
        setSearchQuery(pastedText);
    };

    const handleChangeToken = (address: string) => {
        console.log("address", address)
        router.push(`/trading?address=${address}`);
        setSearchQuery("");
    }

    const handleToggleWishlist = async (data: { token_address: string; status: string }) => {
        const { token_address, status } = data;

        // Prevent multiple toggles for the same token
        if (isToggling[token_address]) {
            return;
        }

        const isAdding = status === "on";

        // Update UI immediately without any delay
        setPendingWishlist(prev => ({
            ...prev,
            [token_address]: isAdding
        }));

        // Update wishlist data immediately
        if (myWishlist) {
            if (isAdding) {
                // Find token info from current tokenList
                const tokenInfo = tokenList.find((token: any) => token.address === token_address);
                const newTokens = tokenInfo
                    ? [tokenInfo, ...myWishlist.tokens]
                    : [{ address: token_address }, ...myWishlist.tokens];

                queryClient.setQueryData(["myWishlist"], {
                    ...myWishlist,
                    tokens: newTokens
                });
            } else {
                const newTokens = myWishlist.tokens.filter((t: { address: string }) => t.address !== token_address);
                queryClient.setQueryData(["myWishlist"], {
                    ...myWishlist,
                    tokens: newTokens
                });
            }
        }

        try {
            // Call API
            await SolonaTokenService.toggleWishlist(data);

            // Show success notification
            notify({
                message: isAdding
                    ? `${t("tableDashboard.toast.add")} ${t("tableDashboard.toast.wishlist")} ${t("tableDashboard.toast.success")}`
                    : `${t("tableDashboard.toast.remove")} ${t("tableDashboard.toast.wishlist")} ${t("tableDashboard.toast.success")}`,
                type: 'success'
            });
        } catch (error) {
            // Show error notification
            notify({
                message: isAdding
                    ? `${t("tableDashboard.toast.add")} ${t("tableDashboard.toast.wishlist")} ${t("tableDashboard.toast.failed")}`
                    : `${t("tableDashboard.toast.remove")} ${t("tableDashboard.toast.wishlist")} ${t("tableDashboard.toast.failed")}`,
                type: 'error'
            });

            // Revert optimistic update
            if (myWishlist) {
                queryClient.setQueryData(["myWishlist"], myWishlist);
            }
        }

        // Clear pending state after a very short delay
        setTimeout(() => {
            setPendingWishlist(prev => {
                const newState = { ...prev };
                delete newState[token_address];
                return newState;
            });
        }, 100);
    }

    const isTokenInWishlist = (address: string) => {
        // Check pending state first, then fall back to actual wishlist state
        if (address in pendingWishlist) {
            return pendingWishlist[address];
        }
        return myWishlist?.tokens?.some((t: { address: string }) => t.address === address) ?? false;
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const getRelativeTime = (date: string) => {
        const now = new Date();
        const created = new Date(date);
        const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return t("time.secondsAgo", { seconds: diffInSeconds });
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return t("time.minutesAgo", { minutes });
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return t("time.hoursAgo", { hours });
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return t("time.daysAgo", { days });
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (typeof window !== 'undefined') {
            localStorage.setItem('activeTabTrading', tab);
        }
        if (tab === "favorite" || tab === "category") {
            refetchMyWishlist();
        }
        // Reset selectedCategory when switching away from category tab
        if (tab !== "category") {
            setSelectedCategory("");
        }
    };

    const [categoryOption, setCategoryOption] = useState<string>("");
    const handleCategoryChange = (categorySlug: string) => {
        setCategoryOption(categorySlug)
        setSelectedCategory(categorySlug);
    };
    return (
        <div className='dark:bg-theme-neutral-1000 bg-white shadow-inset rounded-xl pr-0 pb-0 flex-1 pt-1 overflow-hidden'>
            {/* <div className="relative mb-3 pr-3 px-3">
                <div className="flex relative items-center dark:bg-neutral-800 bg-white rounded-full px-3 py-1 border-1 border-t-theme-primary-300 border-l-theme-primary-300 border-b-theme-secondary-400 border-r-theme-secondary-400">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onPaste={handlePaste}
                        placeholder={t('trading.interface.searchPlaceholder')}
                        className="bg-transparent pl-6 w-full text-sm focus:outline-none dark:placeholder:text-theme-neutral-100 placeholder:text-theme-neutral-800"
                    />
                    {isSearching ? (
                        <div className="absolute right-3 top-1.5">
                            <div className="animate-spin h-4 w-4 border-2 border-neutral-400 border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <Search className="absolute left-3 top-1.5 h-4 w-4 text-muted-foreground" />
                    )}
                </div>
                {searchQuery.length > 0 && searchQuery.length < 2 && (
                    <p className="text-xs text-neutral-400 mt-1 ml-2">{t('trading.interface.minSearchLength')}</p>
                )}
            </div> */}

            <div className='pr-1 h-full'>
                <div
                    ref={scrollContainerRef}
                    className={`flex gap-2 px-2 pt-1 custom-scroll bg-theme-neutral-200 dark:bg-theme-neutral-1000 overflow-x-auto whitespace-nowrap min-w-[280px] pb-1 max-w-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="flex gap-2">
                        <button
                            className={`text-xs cursor-pointer p-1 px-3 rounded-xl font-normal shrink-0 ${activeTab === "trending" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                            onClick={() => handleTabChange("trending")}
                        >
                            {t('trading.listToken.trending')}
                        </button>
                        <button
                            className={`flex items-center gap-1 text-xs cursor-pointer p-1 px-3 rounded-xl font-normal shrink-0 ${activeTab === "new" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                            onClick={() => handleTabChange("new")}
                        >
                            {t('trading.listToken.new')} <PumpFun />
                        </button>
                        <button
                            className={`text-xs cursor-pointer p-1 px-3 rounded-xl font-normal shrink-0 ${activeTab === "favorite" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                            onClick={() => handleTabChange("favorite")}
                        >
                            {t('trading.listToken.favorite')}
                        </button>
                        <button
                            className={`text-xs cursor-pointer p-1 px-3 rounded-xl font-normal shrink-0 ${activeTab === "category" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                            onClick={() => handleTabChange("category")}
                        >
                            {activeTab === 'category' ? (
                                <select
                                    className="bg-transparent border-none focus:outline-none cursor-pointer flex flex-col text-neutral-100 dark:gradient-hover"
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <option value="" className="dark:!text-theme-neutral-100 p-1 !text-theme-neutral-1000 dark:!bg-theme-neutral-1000 flex-1">{t('tableDashboard.tabs.category')}</option>
                                    {categories.map((category: any) => (
                                        <option key={category.id} value={category.slug} className="dark:!text-theme-neutral-100 p-1 !text-theme-neutral-1000 dark:!bg-theme-neutral-1000 flex-1">
                                            <TranslatedCategory name={category.name} />
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span>{t('tableDashboard.tabs.category')}</span>
                            )}
                        </button>
                    </div>

                </div>
                {activeTab !== "favorite" && activeTab !== "new" && (
                    <div>
                        <div className="flex border-t border-b py-1 border-neutral-700 pl-2 gap-1">
                            <button
                                className={`text-[10px] cursor-pointer p-[2px] px-3 rounded-xl font-normal shrink-0 ${timeFilter === "5m" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                                onClick={() => setTimeFilter("5m")}
                            >
                                {t('tokenInfo.timeFrames.5m')}
                            </button>
                            <button
                                className={`text-[10px] cursor-pointer p-[2px] px-3 rounded-xl font-normal shrink-0 ${timeFilter === "1h" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                                onClick={() => setTimeFilter("1h")}
                            >
                                {t('tokenInfo.timeFrames.1h')}
                            </button>
                            <button
                                className={`text-[10px] cursor-pointer p-[2px] px-3 rounded-xl font-normal shrink-0 ${timeFilter === "4h" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                                onClick={() => setTimeFilter("4h")}
                            >
                                {t('tokenInfo.timeFrames.4h')}
                            </button>
                            <button
                                className={`text-[10px] cursor-pointer p-[2px] px-3 rounded-xl font-normal shrink-0 ${timeFilter === "24h" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                                onClick={() => setTimeFilter("24h")}
                            >
                                {t('tokenInfo.timeFrames.24h')}
                            </button>

                        </div>
                    </div>
                )}

                <div className="flex-grow h-[calc(100%-20px)] custom-scroll overflow-y-scroll mt-2">
                    {Array.isArray(tokenList) && tokenList?.filter(e => categoryOption?.length > 0 ? e.category.name === categoryOption : true)?.map((item: any, i: number) => {
                        const address = searchQuery.length > 0 ? item.poolAddress : item.address;
                        return (
                            <div
                                key={i}
                                className="flex items-center justify-between border-b h-[45px] border-neutral-800 group dark:hover:bg-neutral-800/50 hover:bg-theme-green-300 rounded "
                            >
                                <div className='flex items-center gap-2'>
                                    <button
                                        className={`text-neutral-500 px-2 py-2 cursor-pointer ${isToggling[item.address] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => !isToggling[item.address] && handleToggleWishlist({
                                            token_address: item.address,
                                            status: isTokenInWishlist(item.address) ? "off" : "on"
                                        })}
                                        disabled={isToggling[item.address]}
                                    >
                                        <Star className={`w-4 h-4 ${isTokenInWishlist(item.address) ? "text-yellow-500 fill-yellow-500" : "text-neutral-500 hover:text-yellow-400"}`} />
                                    </button>
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleChangeToken(address)}>
                                        <img
                                            src={item?.logo_uri || item?.logoUrl || "/logo.png"}
                                            alt=""
                                            width={24}
                                            height={24}
                                            className='w-[24px] h-[24px] rounded-full object-cover'
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "/logo.png";
                                            }}
                                        />
                                        {item?.program?.includes("pumpfun") && (
                                            <span className='cursor-pointer' onClick={() => window.open(`https://pump.fun/coin/${address}`, '_blank')}>{(item?.market == "pumpfun" || item?.program == "pumpfun-amm" || item?.program == "pumpfun") && <PumpFun />}</span>
                                        )}
                                        {item?.program?.includes("orca") && (
                                            <img
                                                src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png"
                                                alt="orca logo"
                                                width={12}
                                                height={12}
                                                className="rounded-full"
                                            />
                                        )}
                                        {item?.program?.includes("meteora") && (
                                            <img
                                                src="https://www.meteora.ag/icons/v2.svg"
                                                alt="metora logo"
                                                width={12}
                                                height={12}
                                                className="rounded-full"
                                            />
                                        )}
                                        {item?.program?.includes("raydium") && (
                                            <img
                                                src="https://raydium.io/favicon.ico"
                                                alt="raydium logo"
                                                width={12}
                                                height={12}
                                                className="rounded-full"
                                            />
                                        )}
                                        <div className='flex gap-1 items-center'>

                                            <span className='text-xs font-light dark:text-neutral-300 text-neutral-800'>{item.symbol}</span>
                                        </div>
                                    </div>

                                </div>
                                <div className="text-right pr-3 flex flex-col gap-1 cursor-pointer" onClick={() => handleChangeToken(address)}>
                                    <span className='dark:text-theme-neutral-100 text-theme-neutral-800 text-xs font-medium'>${formatNumberWithSuffix(item.volume_usd)}</span>
                                    {activeTab === "new" ? (
                                        <span className="text-xs font-medium dark:text-theme-neutral-100 text-theme-neutral-800">
                                            {getRelativeTime(item.createdAt)}
                                        </span>
                                    ) : (
                                        item.volume_change_percent !== undefined && (
                                            <span className={`text-xs font-medium ${item.volume_change_percent > 0
                                                ? 'text-theme-green-200'
                                                : item.volume_change_percent < 0
                                                    ? 'text-theme-red-100'
                                                    : 'dark:text-theme-neutral-100 text-theme-neutral-800'
                                                }`}>{formatNumberWithSuffix(item.volume_change_percent) ?? 0}%</span>
                                        )
                                    )}
                                </div>

                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default ListToken
