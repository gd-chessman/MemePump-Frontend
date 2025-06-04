"use client"
import type React from "react"
import { Globe, Users, Pill, User, ChefHat, Layers, Target, Copy, Zap, Search } from "lucide-react"
import { useWsSubscribeTokens } from "@/hooks/useWsSubscribeTokens";
import { truncateString } from "@/utils/format";
import { formatNumber } from "../tradingview-chart/ChartMobile";
import PumpFun from "../pump-fun";
import { useState } from "react";
import { useLang } from "@/lang";
import { useRouter } from "next/navigation";

// Skeleton card component for loading state
function SkeletonCard() {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-neutral-900">
      <div className="flex items-stretch gap-3">
        <div className="h-full flex-shrink-0">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
        <div className="ml-auto flex-1 flex flex-col justify-between">
          <div className="flex items-start justify-between flex-wrap">
            <div className="flex-1">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-32 mb-2" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-24" />
            </div>
            <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse w-20" />
          </div>
          <div className="flex justify-end items-center gap-2 mt-2">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component to render a list of token cards
export default function TokenList() {
  const { tokens: wsTokens } = useWsSubscribeTokens({ limit: 36 });
  
  // Show skeleton loading when tokens array is empty or has length less than 1
  if (!wsTokens || wsTokens.length < 1) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(36)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {wsTokens?.map((token) => (
        <SingleTokenCard 
          key={token.id} 
          token={{
            id: token.id.toString(),
            name: token.symbol,
            ticker: token.symbol,
            fullName: token.name,
            logo: token.logoUrl || "/placeholder.png",
            // time: "Just now",
            address: token.address,
            price: token.marketCap,
            marketCap: token.marketCap,
            program: token.program,
            change24h: 0, // This data is not available in wsTokens
            volume: 0, // This data is not available in wsTokens
            holders: 0, // This data is not available in wsTokens
            transactions: { count: 0, volume: 0 }, // This data is not available in wsTokens
            social: { twitter: false, telegram: false, website: false, tiktok: false }, // This data is not available in wsTokens
            percentages: {
              holders: 0, // This data is not available in wsTokens
              liquidity: parseFloat(token.liquidity) / 1000000, // Convert to millions
              run: token.isVerified
            }
          }} 
        />
      ))}
    </div>
  )
}



function Twitter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}

function TikTok(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

// Component to render a single token card (internal to this file)
function SingleTokenCard({ token }: any) {
  const { t } = useLang() 
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTrade = () => {
    router.push(`/trading?address=${token.address}`);
  };

  console.log("token", token);
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-neutral-900 transition-colors duration-200 hover:border-green-500/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 cursor-pointer">
      <div className="flex items-stretch gap-3">
        {/* Left side - Image section */}
        <div className="h-full flex-shrink-0">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-[#2532a1] p-0.5">
              {(!imageLoaded || imageError) && (
                <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded-full" />
              )}
              <div className="relative w-[84px] h-[84px] overflow-hidden rounded-full">
                <img
                  src={imageError ? `/placeholder.svg?height=48&width=48&query=${token.name}+logo` : (token.logo || `/placeholder.svg?height=48&width=48&query=${token.name}+logo`)}
                  alt={token.name}
                  className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              </div>
            </div>
            {
              token.program?.startsWith("pumpfun") && (
                <div className="absolute bottom-1 right-1 w-6 h-6 dark:bg-zinc-800 bg-zinc-100 rounded-full border-2 dark:border-zinc-900 border-zinc-200 flex items-center justify-center">
                  <PumpFun />
                </div>
              )
            }
          </div>
        </div>

        {/* Right side - Content section */}
        <div className="ml-auto flex-1 flex flex-col justify-between">
          <div className="flex items-start justify-between flex-wrap ">
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-lg text-zinc-900 dark:text-white whitespace-nowrap max-w-[8rem] truncate">{token.name}</span>
                <span className="text-zinc-600 dark:text-zinc-400 text-sm truncate max-w-[8rem] whitespace-nowrap">{token.fullName}</span>
              </div>
              <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 gap-1.5 mt-0.5">
                <span>{token.time}</span>
                <span className="text-zinc-700">|</span>
                <span className="text-xs">{truncateString(token.address, 12)}</span>
                {copied ? (
                  <svg className="h-3 w-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <Copy className="h-3 w-3 text-zinc-400 cursor-pointer hover:text-white" onClick={handleCopy} />
                )}
                <span className="text-zinc-700">|</span>
                {token.social?.twitter && (
                  <Twitter className="h-3.5 w-3.5 text-zinc-400 cursor-pointer hover:text-white" />
                )}
                {token.social?.website && <Globe className="h-3.5 w-3.5 text-zinc-400 cursor-pointer hover:text-white" />}
                {token.social?.tiktok && <TikTok className="h-3.5 w-3.5 text-zinc-400 cursor-pointer hover:text-white" />}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <button 
                onClick={handleTrade}
                className="text-white lg:max-w-auto max-w-[120px] group relative bg-gradient-to-t from-theme-primary-500 to-theme-secondary-400 py-1.5 md:py-2 px-3 md:px-4 lg:px-5 rounded-full text-[11px] md:text-xs transition-all duration-500 hover:from-theme-blue-100 hover:to-theme-blue-200 hover:scale-105 hover:shadow-lg hover:shadow-theme-primary-500/30 active:scale-95 w-full md:w-auto flex items-center justify-center"
              >
                <Zap className="h-4 w-4 mr-1.5 text-green-400" />
                {t("trading.trade")}
              </button>
             
            </div>
          </div>
          <div className="flex justify-end items-center gap-2 text-xs mt-2 mr-2">
                <span className="text-zinc-600 dark:text-neutral-400 text-sm whitespace-nowrap">{t("trading.marketCap")}</span>
                <span className="text-zinc-800 dark:text-zinc-300 text-sm">{formatNumber(Number(token.marketCap * 100))}</span>
              </div>
        </div>
      </div>
    </div>
  )
}