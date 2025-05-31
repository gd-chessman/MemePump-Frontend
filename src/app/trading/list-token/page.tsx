'use client'
import { Search, Star } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
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
    const debouncedSearchQuery = useDebounce(searchQuery, 600);
    const [isSearching, setIsSearching] = useState(false);
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
        try {
            const response = await SolonaTokenService.toggleWishlist(data);
            
            // If API returns 404, set selected token and call API again
            if (response?.status === 404) {
                setSelectedTokenAddress(data.token_address);
                // Call API again after setting selected token
                await SolonaTokenService.toggleWishlist(data);
            }
            
            await refetchMyWishlist();
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    }

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
                <div className="flex gap-2 px-2 bg-theme-neutral-200 dark:bg-theme-neutral-1000">
                    <button
                        className={`text-sm cursor-pointer p-1 px-3 rounded-xl font-normal ${activeTab === "trending" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "text-theme-neutral-100"}`}
                        onClick={() => setActiveTab("trending")}
                    >
                        {t('trading.listToken.trending')}
                    </button>
                    <button
                        className={`text-sm cursor-pointer p-1 px-3 rounded-xl font-normal ${activeTab === "new" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "text-theme-neutral-100"}`}
                        onClick={() => setActiveTab("new")}
                    >
                        {t('trading.listToken.new')}
                    </button>
                    <button
                        className={`text-sm cursor-pointer p-1 px-3 rounded-xl font-normal ${activeTab === "favorite" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "text-theme-neutral-100"}`}
                        onClick={() => {
                            setActiveTab("favorite")
                            refetchMyWishlist()
                        }}
                    >
                        {t('trading.listToken.favorite')}
                    </button>
                </div>

                <div className="flex-grow h-[calc(100%-20px)] overflow-y-scroll">
                    {Array.isArray(tokenList) && tokenList?.map((item: any, i: number) => {
                        const address = searchQuery.length > 0 ? item.poolAddress : item.address;
                        console.log("item", item)
                        return (
                            <div
                                key={i}
                                className="flex items-center gap-2 py-2 border-b border-neutral-800 group dark:hover:bg-neutral-800/50 hover:bg-theme-green-300 px-2 rounded cursor-pointer"
                            >
                                <button className="text-neutral-500" onClick={() => handleToggleWishlist({ token_address: item.address, status: item.is_wishlist ? "off" : "on" })}>
                                    {/* {i <= 2 ? <FontAwesomeIcon icon={['fas', 'star']} className='text-yellow-400'/> : <Star className="h-4 w-4" />} */}
                                    <Star className={`w-4 h-4 ${myWishlist?.tokens?.some((t: { address: string }) => t.address === item.address) ? "text-yellow-500 fill-yellow-500" : "text-neutral-500 hover:text-yellow-400"}`} />
                                </button>
                                <div className="flex items-center gap-2" onClick={() => handleChangeToken(address)}>
                                    <img src={item.logo_uri ?? item.logoUrl ?? "/placeholder.png"} alt="" width={24} height={24} className='rounded-full' />
                                    <div className='flex gap-1 items-center'>
                                        <span className="text-xs font-semibold dark:text-theme-neutral-100 text-theme-neutral-800 capitalize">{item.name}</span>
                                        <span className='text-xs font-light text-neutral-300'>{item.symbol}</span>
                                    </div>
                                    {(item.market == "pumpfun" || item.program == "pumpfun-amm") && <PumpFun />}
                                </div>
                                <div className="text-right">
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
