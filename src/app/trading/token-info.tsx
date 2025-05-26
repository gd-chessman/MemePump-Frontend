"use client"

import type React from "react"

import { Star } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import token from '@/assets/svgs/token.svg'
import { formatNumberWithSuffix, truncateString } from "@/utils/format"
import website from '@/assets/svgs/website.svg'
import telegram from '@/assets/svgs/tele-icon.svg'
import x from '@/assets/svgs/x-icon.svg'
import { getMyWishlist, getTokenInforByAddress } from "@/services/api/SolonaTokenService"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { SolonaTokenService } from "@/services/api"
import { useLang } from "@/lang";
import { UpdateFavorite } from "../components/UpdateFavorite"
import { io } from 'socket.io-client';
import { getStatsToken } from "@/services/api/OnChainService"
type TimeFrame = '5m' | '1h' | '4h' | '24h'

export default function TokenInfo() {
  const searchParams = useSearchParams();
  const address = searchParams?.get("address");
  const { t } = useLang();  
  const { data: tokenInfor, refetch } = useQuery({
    queryKey: ["token-infor", address],
    queryFn: () => getTokenInforByAddress(address),
  });

  const { data: statsToken, refetch: refetchStatsToken, isLoading, error } = useQuery({
    queryKey: ["statsToken", address],
    queryFn: () => getStatsToken(address)
  });
  console.log("statsToken", statsToken)
  const { data: myWishlist, refetch: refetchMyWishlist } = useQuery({
    queryKey: ["myWishlist"],
    queryFn: getMyWishlist,
    refetchOnMount: true,
  });
  console.log("statsToken", statsToken)
 
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h")
  const [socket, setSocket] = useState<any>(null);
  const [wsTokenInfo, setWsTokenInfo] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [marketCap, setMarketCap] = useState<number>(0);

  // Only listen for marketCap updates from chart
  useEffect(() => {
    const handleMarketCapUpdate = (event: CustomEvent) => {
      const { marketCap: newMarketCap } = event.detail;
      setMarketCap(newMarketCap);
      console.log("FIX MC newMarketCap", newMarketCap);
    };

    window.addEventListener('marketCapUpdate', handleMarketCapUpdate as EventListener);
    return () => {
      window.removeEventListener('marketCapUpdate', handleMarketCapUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    // Reset state when address changes
    setWsTokenInfo(null);

    // Initialize socket connection for other data
    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}/token-info`, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (address) {
        socketInstance.emit('subscribe', { tokenAddress: address });
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('tokenInfo', (data: any) => {
      if (data?.tokenAddress === address) {
        setWsTokenInfo(data);
      }
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance && address) {
        socketInstance.emit('unsubscribe', { tokenAddress: address });
      }
      socketInstance.disconnect();
    };
  }, [address]);

  const dataToken = {
    name: tokenInfor?.name,
    image: tokenInfor?.logoUrl,
    symbol: tokenInfor?.symbol,
    address: tokenInfor?.address,
    cap: marketCap || wsTokenInfo?.marketCap?.usd || tokenInfor?.marketCap || 0,
    aDayVolume: statsToken?.['24h']?.volume?.total || tokenInfor?.volume24h,
    liquidity: wsTokenInfo?.liquidity?.usd || tokenInfor?.liquidity,
    holders: wsTokenInfo?.holders || tokenInfor?.holders,
    '5m': {
      difference: statsToken?.['5m']?.priceChangePercentage?.toFixed(2) + '%' || "0%",
      vol: statsToken?.['5m']?.volume?.total?.toFixed(2) || "updating",
      buy: statsToken?.['5m']?.volume?.buys?.toFixed(2) || "updating",
      sell: statsToken?.['5m']?.volume?.sells?.toFixed(2) || "updating",
      netBuy: (statsToken?.['5m']?.volume?.buys - statsToken?.['5m']?.volume?.sells)?.toFixed(2) || "updating",
    },
    '1h': {
      difference: statsToken?.['1h']?.priceChangePercentage?.toFixed(2) + '%' || "0%",
      vol: statsToken?.['1h']?.volume?.total?.toFixed(2) || "updating",
      buy: statsToken?.['1h']?.volume?.buys?.toFixed(2) || "updating",
      sell: statsToken?.['1h']?.volume?.sells?.toFixed(2) || "updating",
      netBuy: (statsToken?.['1h']?.volume?.buys - statsToken?.['1h']?.volume?.sells)?.toFixed(2) || "updating",
    },
    '4h': {
      difference: statsToken?.['4h']?.priceChangePercentage?.toFixed(2) + '%' || "0%",
      vol: statsToken?.['4h']?.volume?.total?.toFixed(2) || "updating",
      buy: statsToken?.['4h']?.volume?.buys?.toFixed(2) || "updating",
      sell: statsToken?.['4h']?.volume?.sells?.toFixed(2) || "updating",
      netBuy: (statsToken?.['4h']?.volume?.buys - statsToken?.['4h']?.volume?.sells)?.toFixed(2) || "updating",
    },
    '24h': {
      difference: statsToken?.['24h']?.priceChangePercentage?.toFixed(2) + '%' || "0%",
      vol: statsToken?.['24h']?.volume?.total?.toFixed(2) || "updating",
      buy: statsToken?.['24h']?.volume?.buys?.toFixed(2) || "updating",
      sell: statsToken?.['24h']?.volume?.sells?.toFixed(2) || "updating",
      netBuy: (statsToken?.['24h']?.volume?.buys - statsToken?.['24h']?.volume?.sells)?.toFixed(2) || "updating",
    }
  }
  console.log("dataToken", dataToken)
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-neutral-1000 box-shadow-info rounded-xl p-3 h-full flex flex-col ">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <img src={tokenInfor?.logoUrl || '/placeholder.png'} width={40} height={40} alt="Token logo" className="rounded-full" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-100 text-sm capitalize">{tokenInfor?.name} &ensp; <span className="text-neutral-300 text-sm font-normal">{tokenInfor?.symbol}</span></h2>
              <div className="text-xs text-neutral-400 flex items-center">
                {truncateString(tokenInfor?.address, 12)}
                <button className="ml-1 text-neutral-500 hover:text-neutral-300">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between h-[40px]">
            <button className="ml-auto" onClick={(e) => {
              e.stopPropagation();
              const data = {
                token_address: tokenInfor?.address,
                status: myWishlist?.tokens?.some((t: { address: string }) => t.address === tokenInfor?.address) ? "off" : "on",
              };
              SolonaTokenService.toggleWishlist(data).then(() => {
                refetchMyWishlist();
              });
            }}>
              <Star className={`w-4 h-4 ${myWishlist?.tokens?.some((t: { address: string }) => t.address === tokenInfor?.address) ? "text-yellow-500 fill-yellow-500" : "text-neutral-500 hover:text-yellow-400"}`} />
            </button>
            <div className="flex items-center gap-2">
              {tokenInfor?.telegram && (
                <Link href={tokenInfor.telegram} target="_blank"><img src={"/telegram.png"} alt="Telegram" className="h-4 w-4"/></Link>
              )}
              {tokenInfor?.website && (
                <Link href={tokenInfor.website} target="_blank"><img src={"/website.png"} alt="Website" className="h-4 w-4"/></Link>
              )}
              {tokenInfor?.twitter && (
                <Link href={tokenInfor.twitter} target="_blank"><img src={"/x.png"} alt="Twitter" className="h-4 w-4"/></Link>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className=" border-linear-200 rounded-lg p-[10px] flex flex-col items-center justify-center">
            <div className="text-xs text-neutral-100 font-semibold mb-1">Market Cap</div>
            <div className="font-medium text-sm text-neutral-100 flex items-center">
              ${formatNumberWithSuffix(dataToken.cap || 0)}
              {wsTokenInfo?.marketCap?.usd && (
                <span className="text-green-400 text-xs ml-1">●</span>
              )}
            </div>
          </div>
          <div className=" border-linear-200 rounded-lg p-[10px] flex flex-col items-center justify-center">
            <div className="text-xs text-neutral-100 font-semibold mb-1">24h Volume</div>
            <div className="font-medium text-sm text-neutral-100 flex items-center">
              ${formatNumberWithSuffix(Math.abs(dataToken.aDayVolume || 0))}
            </div>
          </div>
          <div className=" border-linear-200 rounded-lg p-[10px] flex flex-col items-center justify-center">
            <div className="text-xs text-neutral-100 font-semibold mb-1">Liquidity</div>
            <div className="font-medium text-sm text-neutral-100 flex items-center">
              ${formatNumberWithSuffix(dataToken.liquidity || 0)}
              {wsTokenInfo?.liquidity?.usd && (
                <span className="text-green-400 text-xs ml-1">●</span>
              )}
            </div>
          </div>
          <div className=" border-linear-200 rounded-lg p-[10px] flex flex-col items-center justify-center">
            <div className="text-xs text-neutral-100 font-semibold mb-1">Holders</div>
            <div className="font-medium text-sm text-neutral-100 flex items-center">
              {formatNumberWithSuffix(dataToken.holders || 0)}
              {wsTokenInfo?.holders && (
                <span className="text-green-400 text-xs ml-1">●</span>
              )}
            </div>
          </div>
        </div>

      </div>
      <div className="bg-neutral-1000 box-shadow-info rounded-xl p-3 h-full flex gap-3 flex-col ">
        <div className="grid grid-cols-4 gap-2 ">
          <button onClick={() => setTimeFrame("5m")} className={`flex flex-col gap-1 cursor-pointer rounded-lg p-2 text-center border-1 border-solid  ${timeFrame === "5m" ? "border-green-400" : "box-shadow-info"}`}>
            <div className="text-xs">5m</div>
            <div className={`font-normal text-xs ${Number(statsToken?.['5m']?.priceChangePercentage) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {statsToken?.['5m']?.priceChangePercentage?.toFixed(2)}%
            </div>
          </button>
          <button onClick={() => setTimeFrame("1h")} className={`flex flex-col gap-1 cursor-pointer rounded-lg p-2 text-center border-1 border-solid  ${timeFrame === "1h" ? "border-green-400" : "box-shadow-info"}`}>
            <div className="text-xs">1h</div>
            <div className={`font-normal text-xs ${Number(statsToken?.['1h']?.priceChangePercentage) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {statsToken?.['1h']?.priceChangePercentage?.toFixed(2)}%
            </div>
          </button>
          <button onClick={() => setTimeFrame("4h")} className={`flex flex-col gap-1 cursor-pointer rounded-lg p-2 text-center border-1 border-solid  ${timeFrame === "4h" ? "border-green-400" : "box-shadow-info"}`}>
            <div className="text-xs">4h</div>
            <div className={`font-normal text-xs ${Number(statsToken?.['4h']?.priceChangePercentage) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {statsToken?.['4h']?.priceChangePercentage?.toFixed(2)}%
            </div>
          </button>
          <button onClick={() => setTimeFrame("24h")} className={`flex flex-col gap-1 cursor-pointer rounded-lg p-2 text-center border-1 border-solid  ${timeFrame === "24h" ? "border-green-400" : "box-shadow-info"}`}>
            <div className="text-xs">24h</div>
            <div className={`font-normal text-xs ${Number(statsToken?.['24h']?.priceChangePercentage) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {statsToken?.['24h']?.priceChangePercentage?.toFixed(2)}%
            </div>
          </button>
        </div>
        <div className="flex justify-between mx-4">
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-neutral-100">Vol</div>
            <div className="font-medium text-xs text-red-400">{formatNumberWithSuffix(dataToken[timeFrame]?.vol || 0)}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-neutral-100">Buy</div>
            <div className="text-green-400 font-medium text-xs">{formatNumberWithSuffix(dataToken[timeFrame]?.buy || 0)}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-neutral-100">Sells</div>
            <div className="text-red-400 font-medium text-xs">{formatNumberWithSuffix(dataToken[timeFrame]?.sell || 0)}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-neutral-100">Net Buy</div>
            <div className="text-green-400 font-medium text-xs">{formatNumberWithSuffix(dataToken[timeFrame]?.netBuy || 0)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  )
}
