"use client"

import type React from "react"

import { Star, Check } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import token from '@/assets/svgs/token.svg'
import { formatNumberWithSuffix, truncateString } from "@/utils/format"
import website from '@/assets/svgs/website.svg'
import telegram from '@/assets/svgs/tele-icon.svg'
import x from '@/assets/svgs/x-icon.svg'
import { getMyWishlist, getTokenInforByAddress } from "@/services/api/SolonaTokenService"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { SolonaTokenService } from "@/services/api"
import { useLang } from "@/lang";
import { UpdateFavorite } from "../components/UpdateFavorite"
import { io } from 'socket.io-client';
import { getStatsToken } from "@/services/api/OnChainService"
import TokenInfoMobile from "./token-info-mobile"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import BgGradientBox from "../components/bg-gradient-box"
import { useTokenInfoStore } from "@/hooks/useTokenInfoStore"
import PumpFun from "../components/pump-fun"
import notify from "@/app/components/notify"

type TimeFrame = '5m' | '1h' | '4h' | '24h'

export default function TokenInfo() {
  const searchParams = useSearchParams();
  const address = searchParams?.get("address");
  const { t } = useLang();
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { setDataInfo } = useTokenInfoStore();
  const queryClient = useQueryClient();
  const { data: tokenInfor, refetch } = useQuery({
    queryKey: ["token-infor", address],
    queryFn: () => getTokenInforByAddress(address),
  });

  const { data: statsToken, refetch: refetchStatsToken, isLoading, error } = useQuery({
    queryKey: ["statsToken", address],
    queryFn: () => getStatsToken(address)
  });
  const { data: myWishlist, refetch: refetchMyWishlist } = useQuery({
    queryKey: ["myWishlist"],
    queryFn: getMyWishlist,
    refetchOnMount: true,
  });

  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h")
  const [socket, setSocket] = useState<any>(null);
  const [wsTokenInfo, setWsTokenInfo] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [marketCap, setMarketCap] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);

  const toggleWishlistMutation = useMutation({
    mutationFn: (data: { token_address: string; status: string }) => SolonaTokenService.toggleWishlist(data),
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["myWishlist"] });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(["myWishlist"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["myWishlist"], (old: any) => {
        const isCurrentlyFavorite = old?.tokens?.some((t: { address: string }) => t.address === data.token_address);
        const updatedTokens = isCurrentlyFavorite
          ? old.tokens.filter((t: { address: string }) => t.address !== data.token_address)
          : [...(old?.tokens || []), { address: data.token_address }];
        return { ...old, tokens: updatedTokens };
      });

      return { previousWishlist };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["myWishlist"], context?.previousWishlist);
      notify({ 
        message: newData.status === "on" 
          ? `${t("tableDashboard.toast.add")} ${t("tableDashboard.toast.wishlist")} ${t("tableDashboard.toast.failed")}` 
          : `${t("tableDashboard.toast.remove")} ${t("tableDashboard.toast.wishlist")} ${t("tableDashboard.toast.failed")}`, 
        type: 'error' 
      });
    },
    onSuccess: (data, variables) => {
      refetchMyWishlist();
      notify({ 
        message: variables.status === "on" 
          ? `${t("tableDashboard.toast.add")} ${t("tableDashboard.toast.wishlist")} ${t("tableDashboard.toast.success")}` 
          : `${t("tableDashboard.toast.remove")} ${t("tableDashboard.toast.wishlist")} ${t("tableDashboard.toast.success")}`, 
        type: 'success' 
      });
    },
  });

  // Only listen for marketCap updates from chart
  useEffect(() => {
    const handleMarketCapUpdate = (event: CustomEvent) => {
      const { marketCap: newMarketCap } = event.detail;
      setMarketCap(newMarketCap);
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

  useEffect(() => {
    // Update store with token data whenever these values change
    setDataInfo({
      marketCap: dataToken.cap || 0,
      volume24h: dataToken.aDayVolume || 0,
      liquidity: dataToken.liquidity || 0,
      holders: dataToken.holders || 0
    });
  }, [dataToken.cap, dataToken.aDayVolume, dataToken.liquidity, dataToken.holders, setDataInfo]);

  const handleToggleWishlist = (data: { token_address: string; status: string }) => {
    toggleWishlistMutation.mutate(data);
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(tokenInfor?.address || '');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // If mobile, render mobile component
  if (isMobile) {
    return (
      <TokenInfoMobile
        tokenInfor={tokenInfor}
        myWishlist={myWishlist}
        wsTokenInfo={wsTokenInfo}
        statsToken={statsToken}
        dataToken={dataToken}
        onToggleWishlist={handleToggleWishlist}
        refetchMyWishlist={refetchMyWishlist}
      />
    )
  }

  // Desktop version
  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <div className="dark:bg-theme-neutral-1000 bg-white shadow-inset shadow-md rounded-xl p-3 h-full flex flex-col ">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center">
                <img src={tokenInfor?.logoUrl || '/placeholder.png'} alt="Token logo" className="rounded-full object-cover w-10 h-auto" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-start">
                  <div className="flex flex-col mb-1"><h2 className="font-semibold dark:text-neutral-100 text-theme-neutral-800 text-sm capitalize">{tokenInfor?.name}</h2>
                    <div className="flex items-center justify-between gap-2">
                      <span className="dark:text-neutral-300 text-neutral-800 text-xs font-normal">{tokenInfor?.symbol}</span>
                      {tokenInfor?.program.includes("pumpfun") && (
                        <span className='cursor-pointer' onClick={() => window.open(`https://pump.fun/coin/${address}`, '_blank')}>{(tokenInfor.market == "pumpfun" || tokenInfor.program == "pumpfun-amm") && <PumpFun />}</span>
                      )}
                      {tokenInfor?.program.includes("orca") && (
                        <img
                          src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png"
                          alt="orca logo"
                          width={12}
                          height={12}
                          className="rounded-full"
                        />
                      )}
                      {tokenInfor?.program.includes("meteora") && (
                        <img
                          src="https://www.meteora.ag/icons/v2.svg"
                          alt="metora logo"
                          width={12}
                          height={12}
                          className="rounded-full"
                        />
                      )}
                      {tokenInfor?.program.includes("raydium") && (
                        <img
                          src="https://raydium.io/favicon.ico"
                          alt="raydium logo"
                          width={12}
                          height={12}
                          className="rounded-full"
                        />
                      )}
                    </div></div>

                </div>
                <div className="text-xs text-neutral-400 flex items-center">
                  {truncateString(tokenInfor?.address, 12)}
                  <button
                    onClick={handleCopyAddress}
                    className="ml-1 text-neutral-500 hover:text-neutral-300 relative group"
                    title="Copy address"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-theme-green-200" />
                    ) : (
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {isCopied ? t('common.copy.copied') : t('common.copy.copyAddress')}
                    </span>
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
                handleToggleWishlist(data);
              }}>
                <Star className={`w-4 h-4 ${myWishlist?.tokens?.some((t: { address: string }) => t.address === tokenInfor?.address) ? "text-yellow-500 fill-yellow-500" : "text-neutral-500 hover:text-yellow-400"}`} />
              </button>
              <div className="flex items-center gap-2">
                {tokenInfor?.telegram && (
                  <Link href={tokenInfor.telegram} target="_blank"><img src={"/telegram-icon.png"} alt="Telegram" className="h-4 w-4" /></Link>
                )}
                {tokenInfor?.website && (
                  <Link href={tokenInfor.website} target="_blank"><img src={"/website.png"} alt="Website" className="h-4 w-4" /></Link>
                )}
                {tokenInfor?.twitter && (
                  <Link href={tokenInfor.twitter} target="_blank"><img src={"/x.png"} alt="Twitter" className="h-4 w-4" /></Link>
                )}
              </div>
            </div>
          </div>
          {/* <div className="grid grid-cols-2 gap-2">
            <BgGradientBox>
              <div className="dark:bg-theme-neutral-1000 bg-white border-linear-200 rounded-xl p-[10px] flex flex-col items-center justify-center">
                <div className="text-xs dark:text-neutral-100 text-theme-neutral-800 font-semibold mb-1">{t('trading.tokenInfo.marketCap')}</div>
                <div className="font-medium text-sm dark:text-neutral-100 text-theme-neutral-800 flex items-center">
                  ${formatNumberWithSuffix(dataToken.cap || 0)}
                  {wsTokenInfo?.marketCap?.usd && (
                    <span className="text-theme-green-200 font-medium text-xs ml-1">●</span>
                  )}
                </div>
              </div>
            </BgGradientBox>
            <BgGradientBox>
              <div className="dark:bg-theme-neutral-1000 bg-white border-linear-200 rounded-xl p-[10px] flex flex-col items-center justify-center">
                <div className="text-xs dark:text-neutral-100 text-theme-neutral-800 font-semibold mb-1">{t('trading.tokenInfo.volume24h')}</div>
                <div className="font-medium text-sm dark:text-neutral-100 text-theme-neutral-800 flex items-center">
                  ${formatNumberWithSuffix(Math.abs(dataToken.aDayVolume || 0))}
                </div>
              </div>
            </BgGradientBox>
            <BgGradientBox>
              <div className="dark:bg-theme-neutral-1000 bg-white border-linear-200 rounded-xl p-[10px] flex flex-col items-center justify-center">
                <div className="text-xs dark:text-neutral-100 text-theme-neutral-800 font-semibold mb-1">{t('trading.tokenInfo.liquidity')}</div>
                <div className="font-medium text-sm dark:text-neutral-100 text-theme-neutral-800 flex items-center">
                  ${formatNumberWithSuffix(dataToken.liquidity || 0)}
                  {wsTokenInfo?.liquidity?.usd && (
                    <span className="text-theme-green-200 font-medium text-xs ml-1">●</span>
                  )}
                </div>
              </div>
            </BgGradientBox>
            <BgGradientBox>
              <div className="dark:bg-theme-neutral-1000 bg-white border-linear-200 rounded-xl p-[10px] flex flex-col items-center justify-center">
                <div className="text-xs dark:text-neutral-100 text-theme-neutral-800 font-semibold mb-1">{t('trading.tokenInfo.holders')}</div>
                <div className="font-medium text-sm dark:text-neutral-100 text-theme-neutral-800 flex items-center">
                  {formatNumberWithSuffix(dataToken.holders || 0)}
                  {wsTokenInfo?.holders && (
                    <span className="text-theme-green-200 font-medium text-xs ml-1">●</span>
                  )}
                </div>
              </div>
            </BgGradientBox>
          </div> */}

        </div >
        <>
          <div className="dark:bg-theme-neutral-1000 bg-white shadow-inset shadow-md rounded-xl p-3 h-full flex gap-3 flex-col ">
            <div className="grid grid-cols-4 gap-2 ">
              <button onClick={() => setTimeFrame("5m")} className={`flex bg-theme-neutral-200 dark:bg-transparent dark:border-1 flex-col gap-1 cursor-pointer rounded-lg p-2 text-center  ${timeFrame === "5m" ? "border-green-400 border-1" : "dark:shadow-custom border-none "}`}>
                <div className="text-xs">{t('trading.tokenInfo.timeFrames.5m')}</div>
                <div className={`font-normal text-xs ${Number(statsToken?.['5m']?.priceChangePercentage) >= 0 ? "text-theme-green-200 font-medium" : "text-red-400"}`}>
                  {statsToken?.['5m']?.priceChangePercentage?.toFixed(2)}%
                </div>
              </button>
              <button onClick={() => setTimeFrame("1h")} className={`flex bg-theme-neutral-200 dark:bg-transparent dark:border-1 flex-col gap-1 cursor-pointer rounded-lg p-2 text-center  ${timeFrame === "1h" ? "border-green-400 border-1" : "dark:shadow-custom border-none"}`}>
                <div className="text-xs">{t('trading.tokenInfo.timeFrames.1h')}</div>
                <div className={`font-normal text-xs ${Number(statsToken?.['1h']?.priceChangePercentage) >= 0 ? "text-theme-green-200 font-medium" : "text-red-400"}`}>
                  {statsToken?.['1h']?.priceChangePercentage?.toFixed(2)}%
                </div>
              </button>
              <button onClick={() => setTimeFrame("4h")} className={`flex bg-theme-neutral-200 dark:bg-transparent dark:border-1 flex-col gap-1 cursor-pointer rounded-lg p-2 text-center  ${timeFrame === "4h" ? "border-green-400 border-1" : "dark:shadow-custom border-none"}`}>
                <div className="text-xs">{t('trading.tokenInfo.timeFrames.4h')}</div>
                <div className={`font-normal text-xs ${Number(statsToken?.['4h']?.priceChangePercentage) >= 0 ? "text-theme-green-200 font-medium" : "text-red-400"}`}>
                  {statsToken?.['4h']?.priceChangePercentage?.toFixed(2)}%
                </div>
              </button>
              <button onClick={() => setTimeFrame("24h")} className={`flex bg-theme-neutral-200 dark:bg-transparent dark:border-1 flex-col gap-1 cursor-pointer rounded-lg p-2 text-center  ${timeFrame === "24h" ? "border-green-400 border-1" : "dark:shadow-custom border-none"}`}>
                <div className="text-xs">{t('trading.tokenInfo.timeFrames.24h')}</div>
                <div className={`font-normal text-xs ${Number(statsToken?.['24h']?.priceChangePercentage) >= 0 ? "text-theme-green-200 font-medium" : "text-red-400"}`}>
                  {statsToken?.['24h']?.priceChangePercentage?.toFixed(2)}%
                </div>
              </button>
            </div>
            <div className="flex justify-between mx-4">
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs dark:text-neutral-100 text-theme-neutral-800">{t('trading.tokenInfo.vol')}</div>
                <div className="font-medium text-xs text-red-400">{formatNumberWithSuffix(dataToken[timeFrame]?.vol || 0)}</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs dark:text-neutral-100 text-theme-neutral-800">{t('trading.tokenInfo.buy')}</div>
                <div className="text-theme-green-200 font-medium text-xs">{formatNumberWithSuffix(dataToken[timeFrame]?.buy || 0)}</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs dark:text-neutral-100 text-theme-neutral-800">{t('trading.tokenInfo.sells')}</div>
                <div className="text-red-400 font-medium text-xs">{formatNumberWithSuffix(dataToken[timeFrame]?.sell || 0)}</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs dark:text-neutral-100 text-theme-neutral-800">{t('trading.tokenInfo.netBuy')}</div>
                <div className="text-theme-green-200 font-medium text-xs">{formatNumberWithSuffix(dataToken[timeFrame]?.netBuy || 0)}</div>
              </div>
            </div>
          </div>
        </>
      </div >
    </>
  )
}
