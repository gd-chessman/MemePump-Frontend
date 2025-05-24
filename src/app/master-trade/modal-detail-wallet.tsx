"use client"

import { useState, useEffect } from "react"
import { Copy, X } from "lucide-react"
import Image from "next/image"

interface Transaction {
  id: string
  token: string
  tokenLogo: string
  type: "Buy" | "Sell"
  total: string
  amount: string
  price: string
  profit: string
  age: string
}

interface DetailMasterModalProps {
  isOpen: boolean
  onClose: () => void
  address: string
}

export default function DetailMasterModal({ isOpen, onClose, address }: DetailMasterModalProps) {
  const [activeTab, setActiveTab] = useState<"DETAILS" | "CHAT">("DETAILS")
  const [timeFilter, setTimeFilter] = useState<"1d" | "7d" | "30d" | "All">("7d")
  const [copiedAddress, setCopiedAddress] = useState(false)

  // Sample data
  const stats = {
    realizedPnL: {
      percentage: 35.48,
      value: 3.9,
      isPositive: true,
    },
    winRate: 25.48,
    totalPnL: {
      value: 3.46,
      percentage: 31.28,
      isPositive: true,
    },
    unrealizedProfits: {
      value: 349.5,
      isPositive: false,
    },
  }

  const transactions: Transaction[] = [
    {
      id: "1",
      token: "The Sandbox",
      tokenLogo: "/sandbox-logo.png",
      type: "Buy",
      total: "567.34 SOL",
      amount: "4M",
      price: "$0.000612",
      profit: "+2.45 SOL",
      age: "6d ago",
    },
    {
      id: "2",
      token: "The Sandbox",
      tokenLogo: "/sandbox-logo.png",
      type: "Buy",
      total: "567.34 SOL",
      amount: "4M",
      price: "$0.000612",
      profit: "+2.45 SOL",
      age: "6d ago",
    },
    {
      id: "3",
      token: "The Sandbox",
      tokenLogo: "/sandbox-logo.png",
      type: "Buy",
      total: "567.34 SOL",
      amount: "4M",
      price: "$0.000612",
      profit: "+2.45 SOL",
      age: "6d ago",
    },
    {
      id: "4",
      token: "The Sandbox",
      tokenLogo: "/sandbox-logo.png",
      type: "Sell",
      total: "567.34 SOL",
      amount: "4M",
      price: "$0.000612",
      profit: "-2.85 SOL",
      age: "6d ago",
    },
  ]

  // Handle copy address
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isOpen, onClose])

  // Prevent scrolling when modal is open
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-[#111111] rounded-xl border border-blue-500/30 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-blue-500/30">
          <h2 className="text-2xl font-bold text-neutral-100 flex items-center">
            <span className="text-cyan-400 mr-2">✦</span>
            DETAIL MASTER
            <span className="text-cyan-400 ml-2">✦</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-neutral-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Address */}
        <div className="p-4 flex items-center">
          <span className="text-neutral-100">{address}</span>
          <button
            onClick={handleCopyAddress}
            className="ml-2 text-gray-400 hover:text-neutral-100 transition-colors"
            title={copiedAddress ? "Copied!" : "Copy address"}
          >
            <Copy className={`h-4 w-4 ${copiedAddress ? "text-green-500" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* Left column */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">Realized PnL</span>
                <div className="bg-gray-800 rounded-full px-2 py-0.5 text-xs text-gray-400 flex items-center">USD</div>
              </div>
              <div className="text-right">
                <span className="text-gray-400">Win Rate</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span
                  className={`text-2xl font-bold ${stats.realizedPnL.isPositive ? "text-green-500" : "text-red-500"}`}
                >
                  {stats.realizedPnL.isPositive ? "+" : "-"}
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
              <span className="text-gray-400">Total PnL</span>
            </div>

            <div className="flex items-center">
              <span className={`text-lg font-bold ${stats.totalPnL.isPositive ? "text-green-500" : "text-red-500"}`}>
                {stats.totalPnL.isPositive ? "+" : "-"}${stats.totalPnL.value}M
              </span>
              <span className={`ml-2 text-sm ${stats.totalPnL.isPositive ? "text-green-500" : "text-red-500"}`}>
                ({stats.totalPnL.isPositive ? "+" : "-"}
                {stats.totalPnL.percentage}%)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Unrealized Profits</span>
              <span className={`${stats.unrealizedProfits.isPositive ? "text-green-500" : "text-red-500"}`}>
                {stats.unrealizedProfits.isPositive ? "+" : "-"}${stats.unrealizedProfits.value}k
              </span>
            </div>
          </div>

          {/* Right column - Chart */}
          <div className="flex flex-col">
            <div className="flex justify-end mb-2">
              <div className="flex bg-gray-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setTimeFilter("1d")}
                  className={`px-2 py-1 text-xs ${timeFilter === "1d" ? "bg-gray-700 text-neutral-100" : "text-gray-400"}`}
                >
                  1d
                </button>
                <button
                  onClick={() => setTimeFilter("7d")}
                  className={`px-2 py-1 text-xs ${timeFilter === "7d" ? "bg-gray-700 text-neutral-100" : "text-gray-400"}`}
                >
                  7d
                </button>
                <button
                  onClick={() => setTimeFilter("30d")}
                  className={`px-2 py-1 text-xs ${timeFilter === "30d" ? "bg-gray-700 text-neutral-100" : "text-gray-400"}`}
                >
                  30d
                </button>
                <button
                  onClick={() => setTimeFilter("All")}
                  className={`px-2 py-1 text-xs ${timeFilter === "All" ? "bg-gray-700 text-neutral-100" : "text-gray-400"}`}
                >
                  All
                </button>
              </div>
            </div>

            {/* Simplified chart representation */}
            <div className="flex-1 flex items-end justify-center space-x-1">
              <div className="h-16 w-4 bg-green-500 rounded-t"></div>
              <div className="h-24 w-4 bg-green-500 rounded-t"></div>
              <div className="h-8 w-4 bg-green-500 rounded-t"></div>
              <div className="h-12 w-4 bg-green-500 rounded-t"></div>
              <div className="h-20 w-4 bg-red-500 rounded-t"></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-4">
          <button
            onClick={() => setActiveTab("DETAILS")}
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              activeTab === "DETAILS"
                ? "bg-gradient-to-r from-indigo-700 to-purple-600 text-neutral-100"
                : "bg-gray-800 text-gray-400 hover:text-gray-300"
            }`}
          >
            DETAILS
          </button>
          <button
            onClick={() => setActiveTab("CHAT")}
            className={`ml-2 px-6 py-2 rounded-full text-sm font-medium ${
              activeTab === "CHAT"
                ? "bg-gradient-to-r from-indigo-700 to-purple-600 text-neutral-100"
                : "bg-gray-800 text-gray-400 hover:text-gray-300"
            }`}
          >
            CHAT
          </button>
        </div>

        {/* Transactions Table */}
        {activeTab === "DETAILS" && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-neutral-100">
                <thead>
                  <tr className="border-b border-blue-500/30 text-gray-400 text-sm">
                    <th className="px-4 py-3 text-left">
                      <div className="flex items-center">
                        Token
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <div className="flex items-center">
                        Type
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <div className="flex items-center">
                        Total (SOL)
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Profit</th>
                    <th className="px-4 py-3 text-left">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-blue-500/10 hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 mr-3 flex-shrink-0">
                            <Image
                              src={transaction.tokenLogo || "/placeholder.svg?height=32&width=32&query=token"}
                              alt={transaction.token}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                          <span>{transaction.token}</span>
                          <button className="ml-2 text-gray-400 hover:text-neutral-100">
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            transaction.type === "Buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-red-500">{transaction.total}</td>
                      <td className="px-4 py-3">{transaction.amount}</td>
                      <td className="px-4 py-3 text-red-500">{transaction.price}</td>
                      <td className="px-4 py-3">
                        <span className={transaction.profit.startsWith("+") ? "text-green-500" : "text-red-500"}>
                          {transaction.profit}
                        </span>
                      </td>
                      <td className="px-4 py-3">{transaction.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chat Tab Content (Placeholder) */}
        {activeTab === "CHAT" && (
          <div className="p-4 h-64 flex items-center justify-center text-gray-400">
            <p>Chat functionality would be implemented here</p>
          </div>
        )}
      </div>
    </div>
  )
}
