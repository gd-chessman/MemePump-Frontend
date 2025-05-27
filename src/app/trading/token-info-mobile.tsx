"use client"

import type React from "react"
import { Star, ChevronDown } from "lucide-react"
import { useState } from "react"
import { formatNumberWithSuffix, truncateString } from "@/utils/format"
import Link from "next/link"
import { SolonaTokenService } from "@/services/api"
import { useLang } from "@/lang"

type TimeFrame = '5m' | '1h' | '4h' | '24h'

interface TokenInfoMobileProps {
    tokenInfor: any
    myWishlist: any
    wsTokenInfo: any
    statsToken: any
    dataToken: any
    onToggleWishlist: (data: { token_address: string; status: string }) => void
    refetchMyWishlist: () => void
}

export default function TokenInfoMobile({
    tokenInfor,
    myWishlist,
    wsTokenInfo,
    statsToken,
    dataToken,
    onToggleWishlist,
    refetchMyWishlist
}: TokenInfoMobileProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h")
    const { t } = useLang()

    return (
        <div className="flex flex-col w-full">
            {/* Token Header - Always Visible */}
            <div className="bg-neutral-1000 lg:box-shadow-info rounded-xl p-2">
                <div className="flex items-center justify-between min-h-[48px] ">
                    <div className="flex items-center gap-3">
                        <div className="w-[40px] h-[40px] bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <img
                                src={tokenInfor?.logoUrl || '/placeholder.png'}
                                width={40}
                                height={40}
                                alt="Token logo"
                                className="rounded-full object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-semibold text-neutral-100 text-sm capitalize truncate">
                                {tokenInfor?.name}
                                <span className="text-neutral-300 text-xs font-normal ml-2">
                                    {tokenInfor?.symbol}
                                </span>
                            </h2>
                            <div className="flex items-center gap-3 mt-0.5">
                                <div className="text-xs text-neutral-400 flex items-center">
                                    {truncateString(tokenInfor?.address, 12)}
                                </div>
                                <div className="flex items-center gap-1 ">
                                    {tokenInfor?.telegram && (
                                        <Link href={tokenInfor.telegram} target="_blank" className="p-1">
                                            <img src="/telegram.png" alt="Telegram" className="h-3 w-3" />
                                        </Link>
                                    )}
                                    {tokenInfor?.website && (
                                        <Link href={tokenInfor.website} target="_blank" className="p-1">
                                            <img src="/website.png" alt="Website" className="h-3 w-3" />
                                        </Link>
                                    )}
                                    {tokenInfor?.twitter && (
                                        <Link href={tokenInfor.twitter} target="_blank" className="p-1">
                                            <img src="/x.png" alt="Twitter" className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-2">
                        <button
                            className="text-neutral-500 hover:text-yellow-400 p-1"
                            onClick={(e) => {
                                e.stopPropagation()
                                const data = {
                                    token_address: tokenInfor?.address,
                                    status: myWishlist?.tokens?.some((t: { address: string }) => t.address === tokenInfor?.address) ? "off" : "on",
                                }
                                onToggleWishlist(data)
                            }}
                        >
                            <Star
                                className={`w-4 h-4 ${myWishlist?.tokens?.some((t: { address: string }) => t.address === tokenInfor?.address)
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-neutral-500 hover:text-yellow-400"
                                    }`}
                            />
                        </button>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-neutral-500 hover:text-neutral-300 transition-transform p-1"
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="mt-2">
                    <div className="space-y-2">
                        {/* Market Stats */}
                        <div className="bg-neutral-1000 lg:box-shadow-info rounded-xl p-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="border-linear-200 rounded-lg p-2 flex flex-col items-center justify-center">
                                    <div className="text-xs text-neutral-100 font-semibold mb-1.5">Market Cap</div>
                                    <div className="font-medium text-sm text-neutral-100 flex items-center">
                                        ${formatNumberWithSuffix(dataToken.cap || 0)}
                                        {wsTokenInfo?.marketCap?.usd && (
                                            <span className="text-green-400 text-xs ml-1">●</span>
                                        )}
                                    </div>
                                </div>
                                <div className="border-linear-200 rounded-lg p-2 flex flex-col items-center justify-center">
                                    <div className="text-xs text-neutral-100 font-semibold mb-1.5">24h Volume</div>
                                    <div className="font-medium text-sm text-neutral-100 flex items-center">
                                        ${formatNumberWithSuffix(Math.abs(dataToken.aDayVolume || 0))}
                                    </div>
                                </div>
                                <div className="border-linear-200 rounded-lg p-2 flex flex-col items-center justify-center">
                                    <div className="text-xs text-neutral-100 font-semibold mb-1.5">Liquidity</div>
                                    <div className="font-medium text-sm text-neutral-100 flex items-center">
                                        ${formatNumberWithSuffix(dataToken.liquidity || 0)}
                                        {wsTokenInfo?.liquidity?.usd && (
                                            <span className="text-green-400 text-xs ml-1">●</span>
                                        )}
                                    </div>
                                </div>
                                <div className="border-linear-200 rounded-lg p-2 flex flex-col items-center justify-center">
                                    <div className="text-xs text-neutral-100 font-semibold mb-1.5">Holders</div>
                                    <div className="font-medium text-sm text-neutral-100 flex items-center">
                                        {formatNumberWithSuffix(dataToken.holders || 0)}
                                        {wsTokenInfo?.holders && (
                                            <span className="text-green-400 text-xs ml-1">●</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Time Frame Stats */}
                        <div className="bg-neutral-1000 lg:box-shadow-info rounded-xl p-4">
                            <div className="grid grid-cols-4 gap-2">
                                {(['5m', '1h', '4h', '24h'] as TimeFrame[]).map((tf) => (
                                    <button
                                        key={tf}
                                        onClick={() => setTimeFrame(tf)}
                                        className={`flex flex-col gap-1.5 cursor-pointer rounded-lg p-2.5 text-center border-1 border-solid ${timeFrame === tf ? "border-green-400" : "lg:box-shadow-info"
                                            }`}
                                    >
                                        <div className="text-xs font-medium">{tf}</div>
                                        <div className={`font-normal text-xs ${Number(statsToken?.[tf]?.priceChangePercentage) >= 0
                                                ? "text-green-400"
                                                : "text-red-400"
                                            }`}>
                                            {statsToken?.[tf]?.priceChangePercentage?.toFixed(2)}%
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between mt-2 px-3">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="text-xs text-neutral-100 font-medium">Vol</div>
                                    <div className="font-medium text-xs text-red-400">
                                        {formatNumberWithSuffix(dataToken[timeFrame]?.vol || 0)}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="text-xs text-neutral-100 font-medium">Buy</div>
                                    <div className="text-green-400 font-medium text-xs">
                                        {formatNumberWithSuffix(dataToken[timeFrame]?.buy || 0)}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="text-xs text-neutral-100 font-medium">Sells</div>
                                    <div className="text-red-400 font-medium text-xs">
                                        {formatNumberWithSuffix(dataToken[timeFrame]?.sell || 0)}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="text-xs text-neutral-100 font-medium">Net Buy</div>
                                    <div className="text-green-400 font-medium text-xs">
                                        {formatNumberWithSuffix(dataToken[timeFrame]?.netBuy || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 