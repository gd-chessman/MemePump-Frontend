"use client"

import { useState } from "react"

type Transaction = {
  time: string
  type: "BUY" | "SELL"
  price: string
  amount: string
  total: string
  source: string
  hash: string
  status: "COMPLETED" | "PENDING" | "FAILED"
  address: string
}

export default function TransactionHistory() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all")

  const transactions: Transaction[] = [
    {
      time: "21:55:26 07/08/2025",
      type: "SELL",
      price: "$150.02M",
      amount: "768",
      total: "$150.02M",
      source: "solfl",
      hash: "9BBNF...bgpump",
      status: "COMPLETED",
      address: "9BBNF...bgpump",
    },
    {
      time: "21:55:26 07/08/2025",
      type: "SELL",
      price: "$150.02M",
      amount: "768",
      total: "$150.02M",
      source: "solfl",
      hash: "9BBNF...bgpump",
      status: "COMPLETED",
      address: "9BBNF...bgpump",
    },
    {
      time: "21:55:26 07/08/2025",
      type: "SELL",
      price: "$150.02M",
      amount: "768",
      total: "$150.02M",
      source: "solfl",
      hash: "9BBNF...bgpump",
      status: "COMPLETED",
      address: "9BBNF...bgpump",
    },
    {
      time: "21:55:26 07/08/2025",
      type: "SELL",
      price: "$150.02M",
      amount: "768",
      total: "$150.02M",
      source: "solfl",
      hash: "9BBNF...bgpump",
      status: "COMPLETED",
      address: "9BBNF...bgpump",
    },
    {
      time: "21:55:26 07/08/2025",
      type: "SELL",
      price: "$150.02M",
      amount: "768",
      total: "$150.02M",
      source: "solfl",
      hash: "9BBNF...bgpump",
      status: "COMPLETED",
      address: "9BBNF...bgpump",
    },
    {
      time: "21:55:26 07/08/2025",
      type: "BUY",
      price: "$150.02M",
      amount: "768",
      total: "$150.02M",
      source: "solfl",
      hash: "9BBNF...bgpump",
      status: "COMPLETED",
      address: "9BBNF...bgpump",
    },
    {
        time: "21:55:26 07/08/2025",
        type: "BUY",
        price: "$150.02M",
        amount: "768",
        total: "$150.02M",
        source: "solfl",
        hash: "9BBNF...bgpump",
        status: "COMPLETED",
        address: "9BBNF...bgpump",
      },
      {
        time: "21:55:26 07/08/2025",
        type: "BUY",
        price: "$150.02M",
        amount: "768",
        total: "$150.02M",
        source: "solfl",
        hash: "9BBNF...bgpump",
        status: "COMPLETED",
        address: "9BBNF...bgpump",
      },
      {
        time: "21:55:26 07/08/2025",
        type: "BUY",
        price: "$150.02M",
        amount: "768",
        total: "$150.02M",
        source: "solfl",
        hash: "9BBNF...bgpump",
        status: "COMPLETED",
        address: "9BBNF...bgpump",
      },
      {
        time: "21:55:26 07/08/2025",
        type: "BUY",
        price: "$150.02M",
        amount: "768",
        total: "$150.02M",
        source: "solfl",
        hash: "9BBNF...bgpump",
        status: "COMPLETED",
        address: "9BBNF...bgpump",
      },
  ]

  return (
    <div className="box-shadow-info rounded-xl p-3 overflow-hidden bg-white dark:bg-neutral-1000">
      <div className="flex border-gray-200 dark:border-neutral-800 h-[30px] bg-gray-100 dark:bg-theme-neutral-1000 rounded-xl">
        <button 
          className={`flex-1 rounded-xl text-sm cursor-pointer font-medium uppercase text-center ${activeTab === "all" ? "bg-blue-500 text-white dark:linear-gradient-connect" : "text-gray-500 dark:text-neutral-400"}`}
          onClick={() => setActiveTab("all")}
        >
          ALL TRANSACTIONS
        </button>
        <button
          className={`flex-1 rounded-xl cursor-pointer text-sm font-medium uppercase text-center ${activeTab === "my" ? "bg-blue-500 text-white dark:linear-gradient-connect" : "text-gray-500 dark:text-neutral-400"}`}
          onClick={() => setActiveTab("my")}
        >
          MY TRANSACTIONS
        </button>
      </div>

      <div className="mt-3 bg-gray-50 dark:bg-[#0F0F0F] rounded-xl relative">
        <div className="overflow-x-auto max-h-[330px] w-full">
          <table className="w-full text-sm table-fixed">
            <thead className="sticky top-0 z-10 bg-white dark:bg-[#0F0F0F]">
              <tr className="border-b border-gray-200 dark:border-neutral-800">
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[15%]">Time</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[8%]">Type</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[10%]">Price</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[8%]">Amount</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[10%]">Total</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[8%]">Source</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[15%]">Transaction Hash</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[10%]">Status</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[16%]">Address</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-neutral-800/30 border-b border-gray-100 dark:border-neutral-800/50">
                  <td className="px-4 py-2 truncate text-gray-600 dark:text-neutral-300">{tx.time}</td>
                  <td className={`px-4 text-xs py-2 font-medium truncate ${tx.type === "BUY" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>{tx.type}</td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">{tx.price}</td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">{tx.amount}</td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">{tx.total}</td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">{tx.source}</td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">{tx.hash}</td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">{tx.status}</td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium flex items-center truncate">
                    {tx.address}
                    <button className="ml-1 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
