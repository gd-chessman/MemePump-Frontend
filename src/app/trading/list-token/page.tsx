'use client'
import { Search, Star } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import token from '@/assets/svgs/token.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from '@tanstack/react-query'
import { getTopCoins } from '@/services/api/OnChainService'
import { formatNumberWithSuffix } from '@/utils/format'
import { SolonaTokenService } from '@/services/api'
import { useDebounce } from '@/hooks/useDebounce'
import { useLang } from '@/lang/useLang'

const ListToken = () => {
    const { t } = useLang()
    const router = useRouter()
    const [sortBy, setSortBy] = useState("volume_1h_usd");
    const [sortType, setSortType] = useState("desc");
    const [activeTab, setActiveTab] = useState("new");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchQuery = useDebounce(searchQuery, 200);
    const { data: topCoins, isLoading: isLoadingTopCoins } = useQuery({
        queryKey: ["topCoins", sortBy, sortType],
        queryFn: () => getTopCoins({ sort_by: sortBy, sort_type: sortType, offset: 3, limit: 50 }),
        refetchInterval: 10000,
    });
    const [tokenList, setTokenList] = useState(topCoins);

    useEffect(() => {
        const searchTokens = async () => {
            if (debouncedSearchQuery.length < 2) {
                setTokenList(topCoins || []);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const res = await SolonaTokenService.getSearchTokenInfor(
                    debouncedSearchQuery,
                    18
                );
                setTokenList(res.tokens || []);
            } catch (error) {
                console.error("Error searching tokens:", error);
            } finally {
                setIsSearching(false);
            }
        };

        searchTokens();
    }, [debouncedSearchQuery, topCoins]);

    return (
        <div className='dark:bg-theme-neutral-1000 bg-white shadow-inset rounded-xl pr-0 pb-0 h-[69%] pt-3 overflow-hidden'>
            <div className="relative mb-4 pr-3 px-3">
                <div className="flex relative items-center dark:bg-neutral-800 bg-white rounded-full px-3 py-1 border-1 border-t-theme-primary-300 border-l-theme-primary-300 border-b-theme-secondary-400 border-r-theme-secondary-400">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
            </div>

           <div className='pr-1 h-full'>
           <div className="flex gap-2 pr-1 pb-2 bg-theme-neutral-200 dark:bg-theme-neutral-1000">
                <button
                    className={`text-sm cursor-pointer p-1 px-3 rounded-xl font-normal ${activeTab === "new" ? "text-theme-neutral-100 dark:linear-gradient-connect bg-linear-200" : "text-neutral-800"}`}
                    onClick={() => setActiveTab("new")}
                >
                    {t('trading.listToken.newTrending')}
                </button>
            </div>

            <div className="flex-grow h-[calc(100%-100px)] overflow-y-scroll">
                {tokenList?.map((item: any, i: number) => (
                        <div
                            key={i}
                            onClick={() => router.push(`/trading?address=${item.address}`)}
                            className="flex items-center justify-between py-2 border-b border-neutral-800 group hover:bg-neutral-800/50 px-2 rounded cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <button className="text-neutral-500">
                                    {/* {i <= 2 ? <FontAwesomeIcon icon={['fas', 'star']} className='text-yellow-400'/> : <Star className="h-4 w-4" />} */}
                                    <Star className="h-4 w-4" />
                                </button>
                                <Image src={item.logo_uri || "/placeholder.png"} alt="axie" width={24} height={24} className='rounded-full' />
                                <div className='flex gap-1 items-center'>
                                    <span className="text-xs font-semibold dark:text-theme-neutral-100 text-theme-neutral-800 capitalize">{item.name}</span>
                                    <span className='text-xs font-light text-neutral-300'>{item.symbol}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className='dark:text-theme-neutral-100 text-theme-neutral-800 text-xs font-medium'>${formatNumberWithSuffix(item.volume_24h_usd)}</span>
                            </div>
                        </div>
                    ))}
            </div>
           </div>
        </div>
    )
}

export default ListToken