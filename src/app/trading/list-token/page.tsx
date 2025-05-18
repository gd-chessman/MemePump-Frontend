'use client'
import { Search, Star } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import token from '@/assets/svgs/token.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from '@tanstack/react-query'
import { getTopCoins } from '@/services/api/OnChainService'
import { formatNumberWithSuffix } from '@/utils/format'

const ListToken = () => {
    const [sortBy, setSortBy] = useState("volume_1h_usd");
    const [sortType, setSortType] = useState("desc");
    const [activeTab, setActiveTab] = useState("all")
    const { data: topCoins, isLoading: isLoadingTopCoins } = useQuery({
        queryKey: ["topCoins", sortBy, sortType],
        queryFn: () => getTopCoins({ sort_by: sortBy, sort_type: sortType, offset: 3, limit: 50 }),
        refetchInterval: 10000,
      });
    return (
        <div className='bg-neutral-1000 box-shadow-info rounded-xl p-3 pr-0 pb-0 h-[69%] overflow-hidden'>
            <div className="relative mb-4 pr-3">
                <div className="flex relative items-center bg-neutral-800 rounded-full px-3 py-1 border-1 border-t-theme-primary-300 border-l-theme-primary-300 border-b-theme-secondary-400 border-r-theme-secondary-400">
                    <input
                        type="text"
                        placeholder="Token Name / Address"
                        className="bg-transparent pl-6 w-full text-sm focus:outline-none "
                    />
                    <Search className=" absolute left-3 top-1.5 h-4 w-4 text-muted-foreground " />
                </div>
            </div>

           <div className='pr-1 h-full'>
           <div className="flex  border-neutral-800 mb-2 justify-between pr-1">
                <button
                    className={`text-sm cursor-pointer py-1 px-2 rounded-xs font-normal ${activeTab === "all" ? "text-neutral-100 linear-gradient-connect" : "text-neutral-400"}`}
                    onClick={() => setActiveTab("all")}
                >
                    All token markets
                </button>
                <button
                    className={`text-sm cursor-pointer p-1 ${activeTab === "new" ? "text-white linear-gradient-connect" : "text-neutral-400"}`}
                    onClick={() => setActiveTab("new")}
                >
                    New & trending
                </button>
                <button
                    className={`text-sm cursor-pointer p-1 ${activeTab === "meme" ? "text-white linear-gradient-connect" : "text-neutral-400"}`}
                    onClick={() => setActiveTab("meme")}
                >
                    Meme
                </button>
            </div>

            <div className="flex-grow h-[calc(100%-100px)] overflow-y-scroll">
                {topCoins?.map((item: any, i: number) => (
                        <div
                            key={i}
                            className="flex items-center justify-between py-2 border-b border-neutral-800 group hover:bg-neutral-800/50 px-2 rounded"
                        >
                            <div className="flex items-center gap-2">
                                <button className="text-neutral-500">
                                    {i <= 2 ? <FontAwesomeIcon icon={['fas', 'star']} className='text-yellow-400'/> : <Star className="h-4 w-4" />}
                                </button>
                                <Image src={item.logo_uri || "/placeholder.png"} alt="axie" width={24} height={24} className='rounded-full' />
                                <div className='flex gap-1 items-center'>
                                    <span className="text-xs font-semibold text-neutral-100 capitalize">{item.name}</span>
                                    <span className='text-xs font-light text-neutral-300'>{item.symbol}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className='text-neutral-100 text-xs font-medium'>${formatNumberWithSuffix(item.volume_24h_usd)}</span>
                            </div>
                        </div>
                    ))}
            </div>
           </div>
        </div>
    )
}

export default ListToken