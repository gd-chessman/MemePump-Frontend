"use client"

import { useState, useEffect, useRef } from "react"
import { Copy, X, Send } from "lucide-react"
import Image from "next/image"
import { getOrderHistoriesByOwner, getOrdersMyWallet } from "@/services/api/OnChainService"
import { useQuery } from "@tanstack/react-query"
import { truncateString } from "@/utils/format"
import { checkMaster } from "@/services/api/MasterTradingService"
import { getGroupHistories } from "@/services/api/ChatService"
import { useLang } from "@/lang/useLang"
import MasterMessage from "@/app/components/chat/MasterMessage"
import { useWsChatMessage } from "@/hooks/useWsChatMessage"
import { ChatService } from "@/services/api"
import { useMasterChatStore } from "@/store/masterChatStore"
import { Dialog, DialogContent } from "@/ui/dialog"

interface Transaction {
  tx: string
  type: "buy" | "sell"
  from: {
    address: string
    amount: number
    token: {
      name: string
      symbol: string
      image: string
      decimals: number
    }
    priceUsd: number
  }
  to: {
    address: string
    amount: number
    token: {
      name: string
      symbol: string
      image: string
      decimals: number
    }
    priceUsd: number
  }
  price: {
    usd: number
    sol: string | number
  }
  volume: {
    usd: number
    sol: number
  }
  wallet: string
  program: string
  time: number
  amount: number
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: string
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface DetailMasterModalProps {
  isOpen: boolean
  onClose: () => void
  info: any
}

type WsMessage = {
  _id?: string;
  ch_chat_id: number;
  ch_content: string;
  ch_status: string;
  createdAt: string;
  ch_wallet_address: string;
  nick_name?: string;
  country?: string;
  ch_lang?: string;
};

export default function DetailMasterModal({ isOpen, onClose, info }: DetailMasterModalProps) {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState<"DETAILS" | "CHAT">("DETAILS")
  const [timeFilter, setTimeFilter] = useState<"1d" | "7d" | "30d" | "All">("7d")
  const [copiedAddress, setCopiedAddress] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState("")
  const { messages, setMessages, addMessage, clearMessages } = useMasterChatStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: "50",
    hasNextPage: false,
    hasPreviousPage: false
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: checkMasterData } = useQuery({
    queryKey: ["checkMaster"],
    queryFn: () => checkMaster(info?.address || ""),
    enabled: Boolean(isOpen && info?.address),
  });

  const { data: ordersMyWallet, refetch, isLoading, error } = useQuery({
    queryKey: ["ordersMyWallet", info?.address, currentPage],
    queryFn: () => {
      return getOrdersMyWallet(info?.address || "", currentPage);
    },
    enabled: Boolean(isOpen && info?.address),
  });
  const { data: chatGroupHistoriesMember } = useQuery({
    queryKey: ["chatGroupHistoriesMember", checkMasterData?.groupConnect],
    queryFn: () => getGroupHistories(checkMasterData?.groupConnect, lang),
    enabled: Boolean(checkMasterData?.groupConnect),
  });

  const { message: wsMessage } = useWsChatMessage({
    chatType: "group",
    groupId: checkMasterData?.groupConnect,
  }) as { message: WsMessage | null };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await ChatService.sendGroupMessage(inputMessage, checkMasterData?.groupConnect, lang);
      setInputMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(info?.address || "")
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const getTimeFilterData = () => {
    if (!info?.info?.historic?.summary) {
      return null;
    }

    if (timeFilter === "All") {
      return {
        totalChange: info.info.summary.total,
        percentageChange: ((info.info.summary.total / info.info.summary.totalInvested) * 100),
        winPercentage: info.info.summary.winPercentage,
        wins: info.info.summary.totalWins,
        losses: info.info.summary.totalLosses
      };
    }

    return info.info.historic.summary[timeFilter];
  };

  const timeFilterData = getTimeFilterData();

  const stats = {
    realizedPnL: {
      percentage: timeFilterData ? ((timeFilterData.totalChange / (info?.info?.summary?.totalInvested || 1)) * 100).toFixed(2) : "0.00",
      value: timeFilterData ? Math.abs(timeFilterData.totalChange).toFixed(2) : "0.00",
      isPositive: timeFilterData ? timeFilterData.totalChange > 0 : false,
    },
    winRate: timeFilterData?.winPercentage ? Number(timeFilterData.winPercentage).toFixed(2) : "0.00",
    totalPnL: {
      value: timeFilterData ? Math.abs(timeFilterData.totalChange).toFixed(2) : "0.00",
      percentage: timeFilterData ? timeFilterData.percentageChange.toFixed(2) : "0.00",
      isPositive: timeFilterData ? timeFilterData.totalChange > 0 : false,
    },
    unrealizedProfits: {
      value: info?.info?.summary ? Math.abs(info.info.summary.unrealized).toFixed(2) : "0.00",
      isPositive: info?.info?.summary ? info.info.summary.unrealized > 0 : false,
    },
  }

  const formatTransaction = (trade: any): Transaction => {
    return {
      tx: trade.tx,
      type: trade.type,
      from: trade.from,
      to: trade.to,
      price: trade.price,
      volume: trade.volume,
      wallet: trade.wallet,
      program: trade.program,
      time: trade.time,
      amount: trade.type === "buy" ? trade.to.amount : trade.from.amount
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isOpen) {
      clearMessages()
    }
  }, [isOpen, clearMessages])

  useEffect(() => {
    if (wsMessage && checkMasterData?.groupConnect) {
      const newMessage = {
        id: wsMessage._id || String(wsMessage.ch_chat_id),
        sender: {
          name: wsMessage.nick_name || wsMessage.ch_wallet_address || "Anonymous",
          isCurrentUser: false,
        },
        text: wsMessage.ch_content,
        timestamp: new Date(wsMessage.createdAt || Date.now()),
        country: wsMessage.country || lang
      }
      addMessage(newMessage)
    }
  }, [wsMessage, addMessage, lang, checkMasterData?.groupConnect])

  useEffect(() => {
    if (chatGroupHistoriesMember?.data) {
      const formattedMessages = chatGroupHistoriesMember.data.map((msg: any) => ({
        id: msg._id || String(msg.ch_chat_id),
        sender: {
          name: msg.nick_name || msg.ch_wallet_address || "Anonymous",
          isCurrentUser: false,
        },
        text: msg.ch_content,
        timestamp: new Date(msg.createdAt || Date.now()),
        country: msg.country || lang
      }));
      setMessages(formattedMessages);
    }
  }, [chatGroupHistoriesMember, setMessages, lang]);

  useEffect(() => {
    if (ordersMyWallet?.data?.pagination) {
      setPaginationInfo(ordersMyWallet.data.pagination)
    }
  }, [ordersMyWallet])

  if (!isOpen || !info) return null;

  return (
    <div className="fixed inset-0 flex z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-[64px] right-0 w-1/2 h-[calc(100vh-64px)] bg-[#111111] border-l border-blue-500/30 shadow-lg flex flex-col p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-neutral-100 flex items-center">
            <span className="text-cyan-400 mr-2">✦</span>
            {t("masterTrade.page.manageMaster")}
            <span className="text-cyan-400 ml-2">✦</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-neutral-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex gap-4 flex-col flex-1 overflow-y-auto mt-4">
          {/* Address */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-100">{truncateString(info?.address || "", 12)}</span>
            <button
              onClick={handleCopyAddress}
              className="text-gray-400 hover:text-neutral-100 transition-colors"
              title={copiedAddress ? t("common.copy.copied") : t("common.copy.copyAddress")}
            >
              <Copy className={`h-4 w-4 ${copiedAddress ? "text-green-500" : ""}`} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">{t("trading.panel.balance")}</span>
                  <div className="bg-gray-800 rounded-full px-2 py-0.5 text-xs text-gray-400 flex items-center">USD</div>
                </div>
                <div className="text-right">
                  <span className="text-gray-400">{t("masterTrade.page.table.winRate7d")}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span
                    className={`text-2xl font-bold ${stats.realizedPnL.isPositive ? "text-green-500" : "text-red-500"}`}
                  >
                    {stats.realizedPnL.percentage}%
                  </span>
                  <span className={`ml-2 text-sm ${stats.realizedPnL.isPositive ? "text-green-500" : "text-red-500"}`}>
                    {stats.realizedPnL.isPositive ? "+" : "-"}${stats.realizedPnL.value}M
                  </span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-neutral-100">{stats.winRate}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t("masterTrade.page.table.pnl7d")}</span>
                <div className="flex items-center">
                  <span className={`text-lg font-bold ${stats.totalPnL.isPositive ? "text-green-500" : "text-red-500"}`}>
                    {stats.totalPnL.isPositive ? "+" : "-"}${stats.totalPnL.value}M
                  </span>
                  <span className={`ml-2 text-sm ${stats.totalPnL.isPositive ? "text-green-500" : "text-red-500"}`}>
                    ({stats.totalPnL.percentage}%)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t("trading.panel.balance")}</span>
                <span className={`${stats.unrealizedProfits.isPositive ? "text-green-500" : "text-red-500"}`}>
                  {stats.unrealizedProfits.isPositive ? "+" : "-"}${stats.unrealizedProfits.value}k
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-end mb-2">
                <div className="flex bg-gray-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setTimeFilter("1d")}
                    className={`px-2 py-1 text-xs ${timeFilter === "1d" ? "bg-gray-700 text-neutral-100" : "text-gray-400"}`}
                  >
                    {t("masterTrade.page.filters.1d")}
                  </button>
                  <button
                    onClick={() => setTimeFilter("7d")}
                    className={`px-2 py-1 text-xs ${timeFilter === "7d" ? "bg-gray-700 text-neutral-100" : "text-gray-400"}`}
                  >
                    {t("masterTrade.page.filters.7d")}
                  </button>
                  <button
                    onClick={() => setTimeFilter("30d")}
                    className={`px-2 py-1 text-xs ${timeFilter === "30d" ? "bg-gray-700 text-neutral-100" : "text-gray-400"}`}
                  >
                    {t("masterTrade.page.filters.30d")}
                  </button>
                  <button
                    onClick={() => setTimeFilter("All")}
                    className={`px-2 py-1 text-xs ${timeFilter === "All" ? "bg-gray-700 text-neutral-100" : "text-gray-400"}`}
                  >
                    {t("masterTrade.page.filters.all")}
                  </button>
                </div>
              </div>

              <div className="flex-1 flex items-end justify-center space-x-1 h-32">
                <div className="h-16 w-4 bg-green-500 rounded-t"></div>
                <div className="h-24 w-4 bg-green-500 rounded-t"></div>
                <div className="h-8 w-4 bg-green-500 rounded-t"></div>
                <div className="h-12 w-4 bg-green-500 rounded-t"></div>
                <div className="h-20 w-4 bg-red-500 rounded-t"></div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex px-4 justify-end">
            <div className="flex rounded-full border-gray-200 dark:border-neutral-800 h-[35px] bg-gray-100 dark:bg-theme-neutral-1000">
              <button
                className={`flex-1 rounded-full px-6 min-w-[150px] text-sm cursor-pointer font-medium uppercase text-center ${activeTab === "DETAILS" ? "bg-blue-500 text-white dark:linear-gradient-connect" : "text-gray-500 dark:text-neutral-400"}`}
                onClick={() => setActiveTab("DETAILS")}
              >
                {t("masterTrade.page.table.details")}
              </button>
              <button
                className={`flex-1 rounded-full px-6 min-w-[150px]  cursor-pointer text-sm font-medium uppercase text-center ${activeTab === "CHAT" ? "bg-blue-500 text-white dark:linear-gradient-connect" : "text-gray-500 dark:text-neutral-400"}`}
                onClick={() => setActiveTab("CHAT")}
              >
                {t("masterTrade.tabs.chat")}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "DETAILS" && (
            <>
              <div className="overflow-x-auto rounded-xl border-1 z-10 border-solid border-y-theme-primary-100 border-x-theme-purple-200 bg-theme-black-1/2 bg-opacity-30 backdrop-blur-sm relative">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-32 text-red-500">
                    {t("common.error")}
                  </div>
                ) : !ordersMyWallet?.data?.trades?.length ? (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    {t("transactionHistory.noTransactions")}
                  </div>
                ) : (
                  <table className="w-full text-neutral-100">
                    <thead>
                      <tr className="border-b border-blue-500/30 text-gray-400 text-sm">
                        <th className="px-4 py-3 text-left">{t("trading.token")}</th>
                        <th className="px-4 py-3 text-left">{t("transactionHistory.type")}</th>
                        <th className="px-4 py-3 text-left">{t("transactionHistory.total")}</th>
                        <th className="px-4 py-3 text-left">{t("transactionHistory.amount")}</th>
                        <th className="px-4 py-3 text-left">{t("trading.price")}</th>
                        <th className="px-4 py-3 text-left">{t("transactionHistory.time")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersMyWallet.data.trades.map((trade: any) => {
                        const transaction = formatTransaction(trade)
                        return (
                          <tr key={transaction.tx} className="border-b border-gray-200">
                            <td className="py-2 px-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={transaction.type === "buy" ? transaction.to.token.image : transaction.from.token.image} 
                                    alt={transaction.type === "buy" ? transaction.to.token.symbol : transaction.from.token.symbol} 
                                    className="w-6 h-6 rounded-full" 
                                  />
                                  <span>{transaction.type === "buy" ? transaction.to.token.symbol : transaction.from.token.symbol}</span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <span className="truncate max-w-[150px]">
                                    {truncateString(transaction.type === "buy" ? transaction.to.address : transaction.from.address, 12)}
                                  </span>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(transaction.type === "buy" ? transaction.to.address : transaction.from.address)
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                    title={t("common.copy.copyAddress")}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-1 rounded ${transaction.type === "buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {transaction.type === "buy" ? t("trading.panel.buy") : t("trading.panel.sell")}
                              </span>
                            </td>
                            <td className="py-2 px-4">
                              ${((transaction.type === "buy" ? transaction.to.amount : transaction.from.amount) * transaction.volume.usd).toFixed(6)}
                            </td>
                            <td className="py-2 px-4">
                              {transaction.amount.toFixed(6)}
                            </td>
                            <td className="py-2 px-4">
                              ${transaction.volume.usd.toFixed(6)}
                            </td>
                            <td className="py-2 px-4">
                              {(() => {
                                const now = new Date().getTime();
                                const txTime = transaction.time;
                                const diffInSeconds = Math.floor((now - txTime) / 1000);
                                
                                if (diffInSeconds < 60) {
                                  return t("masterTrade.page.timeAgo.seconds", { count: diffInSeconds });
                                } else if (diffInSeconds < 3600) {
                                  return t("masterTrade.page.timeAgo.minutes", { count: Math.floor(diffInSeconds / 60) });
                                } else if (diffInSeconds < 86400) {
                                  return t("masterTrade.page.timeAgo.hours", { count: Math.floor(diffInSeconds / 3600) });
                                } else if (diffInSeconds < 2592000) {
                                  return t("masterTrade.page.timeAgo.days", { count: Math.floor(diffInSeconds / 86400) });
                                } else {
                                  return t("masterTrade.page.timeAgo.months", { count: Math.floor(diffInSeconds / 2592000) });
                                }
                              })()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {activeTab === "CHAT" && (
            <div className="overflow-x-auto rounded-xl border-1 z-10 border-solid border-y-theme-primary-100 border-x-theme-purple-200 bg-theme-black-1/2 bg-opacity-30 backdrop-blur-sm flex-1 flex flex-col">
              {/* Chat Messages */}
              {checkMasterData?.groupConnect && checkMasterData?.isConnect ? (
                <>
                  <div className="flex-1 overflow-y-auto px-4 space-y-4 p-4">
                    {messages.map((msg) => (
                      <MasterMessage
                        key={msg.id}
                        message={{
                          ch_id: msg.id,
                          ch_content: msg.text,
                          ch_wallet_address: msg.sender.name,
                          ch_is_master: msg.sender.isCurrentUser,
                          ch_lang: msg.country,
                          createdAt: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : new Date(msg.timestamp).toISOString(),
                          chat_id: msg.id,
                          chat_type: "group",
                          ch_status: "send",
                          country: msg.country,
                          nick_name: msg.sender.name,
                          _id: msg.id
                        }}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-blue-500/10 p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder={t("masterTrade.manage.chat.type_a_message")}
                        className="flex-1 bg-theme-black-1/2 border border-blue-500/10 rounded-lg px-4 py-2 text-sm text-neutral-100 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-neutral-400">
                  {!checkMasterData?.groupConnect ? (
                    <p>{t("masterTrade.manage.chat.noMessages")}</p>
                  ) : !checkMasterData?.isConnect ? (
                    <p>{t("masterTrade.manage.chat.noMessages")}</p>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
