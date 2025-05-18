"use client"

import type React from "react"

import { Star } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import token from '@/assets/svgs/token.svg'
import { truncateString } from "@/utils/format"
import website from '@/assets/svgs/website.svg'
import telegram from '@/assets/svgs/tele-icon.svg'
import x from '@/assets/svgs/x-icon.svg'
import { getTokenInforByAddress } from "@/services/api/SolonaTokenService"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
type TimeFrame = '5m' | '1h' | '4h' | '24h'

export default function TokenInfo() {
  const searchParams = useSearchParams();
  const address = searchParams?.get("address");
  const { data: tokenInfor, refetch } = useQuery({
    queryKey: ["token-infor", address],
    queryFn: () => getTokenInforByAddress(address),
  });
  const [activeTab, setActiveTab] = useState("all")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h")
  const dataToken = {
    name: 'axeinfinity',
    image: token,
    symbol: 'AXE',
    address: '0x1234567890123456789012345678901234567890',
    cap: '$994.56M',
    aDayVolume: '$994.56M',
    liquidity: '$994.56M',
    holders: '$994.56M',
    '5m': {
      vol: '$7.7M',
      buy: '$994.56M',
      sell: '$994.56M',
      netBuy: '$994.56M',
    },
    '1h': {
      vol: '$994.56M',
      buy: '$7.7M',
      sell: '$994.56M',
      netBuy: '$994.56M',
    },
    '4h': {
      vol: '$994.56M',
      buy: '$7.7M',
      sell: '$994.56M',
      netBuy: '$994.56M',
    },
    '24h': {
      vol: '$994.56M',
      buy: '$7.7M',
      sell: '$994.56M',
      netBuy: '$994.56M',
    }

  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-neutral-1000 box-shadow-info rounded-xl p-3 h-full flex flex-col ">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Image src={tokenInfor?.logoUrl || ''} width={40} height={40} alt="Token logo" className="rounded-full" />
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
            <button className="ml-auto">
              <Star className="w-4 h-4 text-neutral-500 hover:text-yellow-400" />
            </button> 
            <div className="flex items-center gap-2">
              <Link href={tokenInfor?.telegram || ""} target="_blank"><Image src={telegram} alt="Website" className="h-4 w-4"/></Link>
              <Link href={tokenInfor?.website || ""} target="_blank"><Image src={website} alt="Website" className="h-4 w-4"/></Link>
              <Link href={tokenInfor?.twitter || ""} target="_blank"><Image src={x} alt="Website" className="h-4 w-4"/></Link>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className=" border-linear-200 rounded-lg p-[10px] flex flex-col items-center justify-center">
            <div className="text-xs text-neutral-100 font-semibold mb-1">Market Cap</div>
            <div className="font-medium text-sm text-neutral-100 flex items-center">
              {dataToken.cap}
              <span className="text-green-400 text-xs ml-1">↑</span>
            </div>
          </div>
          <div className=" border-linear-200 rounded-lg p-[10px] flex flex-col items-center justify-center">
            <div className="text-xs text-neutral-100 font-semibold mb-1">24h Volume</div>
            <div className="font-medium text-sm text-neutral-100 flex items-center">
              {dataToken.aDayVolume}
              <span className="text-red-400 text-xs ml-1">↓</span>
            </div>
          </div>
          <div className=" border-linear-200 rounded-lg p-[10px] flex flex-col items-center justify-center">
            <div className="text-xs text-neutral-100 font-semibold mb-1">Liquidity</div>
            <div className="font-medium text-sm text-neutral-100 flex items-center">
              {dataToken.liquidity}
              <span className="text-green-400 text-xs ml-1">↑</span>
            </div>
          </div>
          <div className=" border-linear-200 rounded-lg p-[10px] flex flex-col items-center justify-center">
            <div className="text-xs text-neutral-100 font-semibold mb-1">Holders</div>
            <div className="font-medium text-sm text-neutral-100">
              {dataToken.holders}
            </div>
          </div>
        </div>

      </div>
      <div className="bg-neutral-1000 box-shadow-info rounded-xl p-3 h-full flex gap-3 flex-col ">
        <div className="grid grid-cols-4 gap-2 ">
          <button onClick={() => setTimeFrame("5m")} className={`flex flex-col gap-1 cursor-pointer rounded-lg p-2 text-center border-1 border-solid  ${timeFrame === "5m" ? "border-green-400" : "box-shadow-info"}`}>
            <div className="text-xs">5m</div>
            <div className="text-red-400 font-normal text-xs">-12.67%</div>
          </button>
          <button onClick={() => setTimeFrame("1h")} className={`flex flex-col gap-1 cursor-pointer rounded-lg p-2 text-center border-1 border-solid  ${timeFrame === "1h" ? "border-green-400" : "box-shadow-info"}`}>
            <div className="text-xs">1h</div>
            <div className="text-green-400 font-normal text-xs">12.67%</div>
          </button>
          <button onClick={() => setTimeFrame("4h")} className={`flex flex-col gap-1 cursor-pointer rounded-lg p-2 text-center border-1 border-solid  ${timeFrame === "4h" ? "border-green-400" : "box-shadow-info"}`}>
            <div className="text-xs">4h</div>
            <div className="text-green-400 font-normal text-xs">12.67%</div>
          </button>
          <button onClick={() => setTimeFrame("24h")} className={`flex flex-col gap-1 cursor-pointer rounded-lg p-2 text-center border-1 border-solid  ${timeFrame === "24h" ? "border-green-400" : "box-shadow-info"}`}>
            <div className="text-xs">24h</div>
            <div className="text-green-400 font-normal text-xs">1200.67%</div>
          </button>
        </div>
        <div className="flex justify-between mx-1">
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-neutral-100">Vol</div>
            <div className="font-medium text-xs">{dataToken[timeFrame].vol}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-neutral-100">Buy</div>
            <div className="text-green-400 font-medium text-xs">{dataToken[timeFrame].buy}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-neutral-100">Sells</div>
            <div className="text-red-400 font-medium text-xs">{dataToken[timeFrame].sell}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-neutral-100">Net Buy</div>
            <div className="text-green-400 font-medium text-xs">{dataToken[timeFrame].netBuy}</div>
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
