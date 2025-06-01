'use client'
import { Search, Star } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import token from '@/assets/svgs/token.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from '@tanstack/react-query'
import { getNewCoins, getSearchTokenInfor, getTopCoins } from '@/services/api/OnChainService'
import { formatNumberWithSuffix } from '@/utils/format'
import { SolonaTokenService } from '@/services/api'
import { useDebounce } from '@/hooks/useDebounce'
import { useLang } from '@/lang/useLang'
import PumpFun from '@/app/components/pump-fun'
import { getMyWishlist, getTokenInforByAddress } from '@/services/api/SolonaTokenService'

const ListToken = () => {
    const { t } = useLang()
    const router = useRouter()
    const [sortBy, setSortBy] = useState("volume_1h_usd");
    const [sortType, setSortType] = useState("desc");
    const [activeTab, setActiveTab] = useState("trending");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const debouncedSearchQuery = useDebounce(searchQuery, 600);
    const [isSearching, setIsSearching] = useState(false);
    const [pendingWishlist, setPendingWishlist] = useState<Record<string, boolean>>({});
    const { data: topCoins, isLoading: isLoadingTopCoins } = useQuery({
        queryKey: ["topCoins", sortBy, sortType],
        queryFn: () => getTopCoins({ sort_by: sortBy, sort_type: sortType, offset: 3, limit: 50 }),
        // refetchInterval: 10000,
    });

    const { data: newCoins, isLoading: isLoadingNewCoins } = useQuery({
        queryKey: ["newCoins"],
        queryFn: () => getNewCoins({ offset: 3, limit: 50 }),
        refetchInterval: 10000,
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

    useEffect(() => {
        // Handle search query first
        if (debouncedSearchQuery) {
            setTokenList(listToken?.data || []);
            return;
        }

        // Handle different tabs
        switch (activeTab) {
            case "trending":
                setTokenList(topCoins);
                break;
            case "new":
                setTokenList(newCoins);
                break;
            case "favorite":
                setTokenList(myWishlist.tokens);
                break;
            case "category":
                setTokenList(newCoins);
                break;
            default:
                setTokenList(topCoins);
        }
    }, [debouncedSearchQuery, listToken, topCoins, newCoins, myWishlist, activeTab]);
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
        const isAdding = status === "on";

        // Optimistically update UI
        setPendingWishlist(prev => ({
            ...prev,
            [token_address]: isAdding
        }));

        try {
            await SolonaTokenService.toggleWishlist(data);
            // After successful API call, refetch the wishlist
            await refetchMyWishlist();
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            // Revert optimistic update on error
            setPendingWishlist(prev => ({
                ...prev,
                [token_address]: !isAdding
            }));
        } finally {
            // Clear pending state after a short delay
            setTimeout(() => {
                setPendingWishlist(prev => {
                    const newState = { ...prev };
                    delete newState[token_address];
                    return newState;
                });
            }, 500);
        }
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

    console.log("tokenList", tokenList)
    return (
        <div className='dark:bg-theme-neutral-1000 bg-white shadow-inset rounded-xl pr-0 pb-0 flex-1 pt-3 overflow-hidden'>
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
                            className={`text-sm cursor-pointer p-1 px-3 rounded-xl font-normal shrink-0 ${activeTab === "trending" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                            onClick={() => setActiveTab("trending")}
                        >
                            {t('trading.listToken.trending')}
                        </button>
                        <button
                            className={`text-sm cursor-pointer p-1 px-3 rounded-xl font-normal shrink-0 ${activeTab === "new" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                            onClick={() => setActiveTab("new")}
                        >
                            {t('trading.listToken.new')}
                        </button>
                        <button
                            className={`text-sm cursor-pointer p-1 px-3 rounded-xl font-normal shrink-0 ${activeTab === "favorite" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                            onClick={() => {
                                setActiveTab("favorite")
                                refetchMyWishlist()
                            }}
                        >
                            {t('trading.listToken.favorite')}
                        </button>
                        <button
                            className={`text-sm cursor-pointer p-1 px-3 rounded-xl font-normal shrink-0 ${activeTab === "category" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "dark:text-theme-neutral-100"}`}
                            onClick={() => {
                                setActiveTab("category")
                                refetchMyWishlist()
                            }}
                        >
                            {t('trading.listToken.category')}
                        </button>
                    </div>
                </div>

                <div className="flex-grow h-[calc(100%-20px)] custom-scroll overflow-y-scroll mt-2">
                    {Array.isArray(tokenList) && tokenList?.map((item: any, i: number) => {
                        const address = searchQuery.length > 0 ? item.poolAddress : item.address;
                        return (
                            <div
                                key={i}
                                className="flex items-center justify-between border-b border-neutral-800 group dark:hover:bg-neutral-800/50 hover:bg-theme-green-300 rounded "
                            >
                                <div className='flex items-center gap-2'>
                                    <button className="text-neutral-500 px-2 py-2 cursor-pointer" onClick={() => handleToggleWishlist({ token_address: item.address, status: isTokenInWishlist(item.address) ? "off" : "on" })}>
                                        <Star className={`w-4 h-4 ${isTokenInWishlist(item.address) ? "text-yellow-500 fill-yellow-500" : "text-neutral-500 hover:text-yellow-400"}`} />
                                    </button>
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleChangeToken(address)}>
                                        <img src={item.logo_uri ?? item.logoUrl ?? "/placeholder.png"} alt="" width={24} height={24} className='w-[24px] h-[24px] rounded-full object-cover' />
                                        <div className='flex gap-1 items-center'>

                                            <span className='text-xs font-light dark:text-neutral-300 text-neutral-800'>{item.symbol}</span>
                                        </div>
                                    </div>
                                    {item.program.includes("pumpfun") && (
                                        <span className='cursor-pointer' onClick={() => window.open(`https://pump.fun/coin/${address}`, '_blank')}>{(item.market == "pumpfun" || item.program == "pumpfun-amm") && <PumpFun />}</span>
                                    )}
                                    {item.program === "orca" && (
                                        <img 
                                        src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png"
                                        alt="orca logo"
                                        width={16}
                                        height={16}
                                        className="rounded-full"
                                        />
                                    )}
                                    {item.program === "raydium-clmm" && (
                                        <img 
                                        src="https://raydium.io/favicon.ico"
                                        alt="raydium logo"
                                        width={16}
                                        height={16}
                                        className="rounded-full"
                                        />
                                    )}
                                </div>
                                <div className="text-right pr-3 flex flex-col cursor-pointer" onClick={() => handleChangeToken(address)}>
                                    <span className='dark:text-theme-neutral-100 text-theme-neutral-800 text-xs font-medium'>${formatNumberWithSuffix(item.volume_24h_usd)}</span>
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
