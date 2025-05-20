"use client"

import { useState } from "react"
import { Search, Copy, Check } from "lucide-react"
import Image from "next/image"
import token from "@/assets/svgs/token.svg"
import ChatTrading from "./chat"
import { useQuery } from "@tanstack/react-query"
import { getMyConnects } from "@/services/api/MasterTradingService"
import { truncateString } from "@/utils/format"

type TradeItem = {
  id: string
  name: string
  ticker: string
  address: string
  avatar: string
  hasNotification?: boolean
  isSelected?: boolean
}

export default function MasterTradeChat() {
  const [activeTab, setActiveTab] = useState<"trade" | "chat">("trade")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const { data: myConnects = [] } = useQuery({
    queryKey: ["myConnects"],
    queryFn: getMyConnects,
    refetchOnWindowFocus: false
  });

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }
  console.log("myConnects", myConnects)
  const handleSelectItem = (id: string) => {
    setSelectedItem(id === selectedItem ? null : id)
  }

  return (
    <div className="w-full h-full bg-[#111111] rounded-xl flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex h-[30px] bg-neutral-1000 my-3 mx-3 rounded-xl relative">
        <button
          className={`flex-1 rounded-xl text-sm cursor-pointer font-medium uppercase text-center ${activeTab === "trade" ? "linear-gradient-connect" : "text-neutral-400"}`}
          onClick={() => setActiveTab("trade")}
        >
          TRADE
        </button>
        <button
          className={`flex-1 rounded-xl cursor-pointer text-sm font-medium uppercase text-center ${activeTab === "chat" ? "linear-gradient-connect" : "text-neutral-400"}`}
          onClick={() => setActiveTab("chat")}
        >
          CHAT
        </button>
        <div className="absolute right-1 top-0">
          <div className="bg-blue-500 text-white text-xs rounded-full px-1 py-1">+10</div>
        </div>
      </div>

      {activeTab === "trade" ? (
        <>
          {/* Search */}
          <div className="px-4 pb-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none ">
                <Search className="h-3 w-3 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Master trade"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 max-h-6 text-xs pr-4 bg-[#1a1a1a] rounded-full  focus:outline-none border-1 border-t-theme-primary-300 border-l-theme-primary-300 border-b-theme-secondary-400 border-r-theme-secondary-400 text-neutral-200 font-normal"
              />
            </div>
          </div>
         

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4">
            {myConnects.map((item: any) => (
              <div key={item.connection_id} onClick={() => handleSelectItem(item.connection_id)} className="flex items-center p-2 rounded-lg hover:bg-[#1a1a1a] cursor-pointer relative">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <p className="ml-2 text-xs text-gray-400">{item.ticker}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-xs text-gray-400 truncate">{truncateString(item.member_address, 10)}</p>
                    <button
                      onClick={() => handleCopyAddress(item.member_address)}
                      className="ml-1 text-gray-400 hover:text-gray-300"
                    >
                      {copiedAddress === item.member_address ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  className={`w-6 h-6 rounded-full border ${item.connection_id === 47 ? "border-transparent linear-gradient-blue" : "border-gray-600 hover:border-gray-400"
                    }`}
                />

              </div>
            ))}Báo cáo ngày 19/05/2025:
            - Cập nhật tính năng yêu thích token,  Ghép API info Token, search token trong view Trading (Done)
            - Ghép API phần Buy Sell (80%)
          </div>
        </>
      ) : (
        <ChatTrading />
      )}
    </div>
  )
}
