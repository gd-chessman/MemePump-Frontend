"use client"

import { useState, useMemo } from "react"
import { Search, Copy, ChevronDown, Crown } from "lucide-react"

// Định nghĩa các kiểu dữ liệu
type TradeStatus = "Not Connected" | "Connected" | "Disconnected" | "Paused" | "Pending"
type TradeType = "VIP" | "NORMAL"

interface TradeData {
  id: string
  address: string
  pnl7d: number
  pnlPercent7d: number
  pnl30d: number
  pnlPercent30d: number
  winRate7d: number
  transactions7d: number
  lastTime: string
  type: TradeType
  status: TradeStatus
}

// Định nghĩa các kiểu lọc
type FilterType = "All" | "Not Connected" | "Connected" | "Disconnected" | "Pending"

export default function MasterTradeTable() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Dữ liệu mẫu
  const tradeData: TradeData[] = useMemo(
    () =>
      Array(18)
        .fill(null)
        .map((_, index) => {
          // Tạo dữ liệu ngẫu nhiên cho mỗi hàng
          const statuses: TradeStatus[] = ["Not Connected", "Connected", "Disconnected", "Paused", "Pending"]
          const types: TradeType[] = ["VIP", "NORMAL"]

          // Phân bổ trạng thái theo mẫu trong hình ảnh
          let status: TradeStatus
          if (index < 6) {
            status = "Not Connected"
          } else if (index < 9) {
            status = "Connected"
          } else if (index < 10 || (index >= 12 && index < 13) || (index >= 15 && index < 16)) {
            status = "Disconnected"
          } else if (index < 11 || (index >= 13 && index < 14) || (index >= 16 && index < 17)) {
            status = "Paused"
          } else {
            status = "Pending"
          }

          // Phân bổ loại theo mẫu trong hình ảnh
          const type = index < 6 ? "VIP" : "NORMAL"

          return {
            id: `trade-${index}`,
            address: `T034...mnop`,
            pnl7d: 90.6,
            pnlPercent7d: -7.6,
            pnl30d: 90.6,
            pnlPercent30d: -7.6,
            winRate7d: 100,
            transactions7d: 5,
            lastTime: "6d ago",
            type,
            status,
          }
        }),
    [],
  )

  // Đếm số lượng mục theo trạng thái
  const connectedCount = tradeData.filter((item) => item.status === "Connected").length
  const disconnectedCount = tradeData.filter((item) => item.status === "Disconnected").length
  const pendingCount = tradeData.filter((item) => item.status === "Pending").length

  // Lọc dữ liệu dựa trên bộ lọc đang hoạt động và truy vấn tìm kiếm
  const filteredData = useMemo(() => {
    let filtered = tradeData

    // Áp dụng bộ lọc trạng thái
    if (activeFilter !== "All") {
      filtered = filtered.filter((item) => item.status === activeFilter)
    }

    // Áp dụng tìm kiếm
    if (searchQuery) {
      filtered = filtered.filter((item) => item.address.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return filtered
  }, [tradeData, activeFilter, searchQuery])

  // Xử lý sao chép địa chỉ
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    // Có thể thêm thông báo toast ở đây
  }

  // Xử lý các hành động
  const handleConnect = (id: string) => {
    console.log(`Connecting to ${id}`)
    // Thực hiện logic kết nối ở đây
  }

  const handleDisconnect = (id: string) => {
    console.log(`Disconnecting from ${id}`)
    // Thực hiện logic ngắt kết nối ở đây
  }

  const handlePause = (id: string) => {
    console.log(`Pausing ${id}`)
    // Thực hiện logic tạm dừng ở đây
  }

  const handleReconnect = (id: string) => {
    console.log(`Reconnecting to ${id}`)
    // Thực hiện logic kết nối lại ở đây
  }

  const handleCancel = (id: string) => {
    console.log(`Cancelling ${id}`)
    // Thực hiện logic hủy ở đây
  }

  return (
    <div className="container-body px-[40px] flex flex-col gap-6 pt-[30px] relative mx-auto z-10">
      {/* Bộ lọc và Tìm kiếm */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("All")}
            className={`px-4 py-2 rounded-md text-sm ${
              activeFilter === "All" ? "bg-blue-500 text-white" : "bg-[#111111] text-gray-300 hover:bg-[#222222]"
            }`}
          >
            All master trade
          </button>
          <button
            onClick={() => setActiveFilter("Not Connected")}
            className={`px-4 py-2 rounded-md text-sm ${
              activeFilter === "Not Connected"
                ? "bg-blue-500 text-white"
                : "bg-[#111111] text-gray-300 hover:bg-[#222222]"
            }`}
          >
            Not connected
          </button>
          <button
            onClick={() => setActiveFilter("Connected")}
            className={`px-4 py-2 rounded-md text-sm ${
              activeFilter === "Connected" ? "bg-blue-500 text-white" : "bg-[#111111] text-gray-300 hover:bg-[#222222]"
            }`}
          >
            Connected ({connectedCount})
          </button>
          <button
            onClick={() => setActiveFilter("Disconnected")}
            className={`px-4 py-2 rounded-md text-sm ${
              activeFilter === "Disconnected"
                ? "bg-blue-500 text-white"
                : "bg-[#111111] text-gray-300 hover:bg-[#222222]"
            }`}
          >
            Disconnected ({disconnectedCount})
          </button>
          <button
            onClick={() => setActiveFilter("Pending")}
            className={`px-4 py-2 rounded-md text-sm ${
              activeFilter === "Pending" ? "bg-blue-500 text-white" : "bg-[#111111] text-gray-300 hover:bg-[#222222]"
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by wallet address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-[#111111] rounded-full pl-10 pr-4 py-2 text-sm border border-blue-500/30 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>

          <button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Manage Master
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto rounded-xl border border-blue-500/30 bg-black bg-opacity-30 backdrop-blur-sm">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-blue-500/30 text-gray-400 text-sm">
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">
                <div className="flex items-center">
                  7D PnL
                  <ChevronDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-2 text-left">
                <div className="flex items-center">
                  30D PnL
                  <ChevronDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-2 text-left">
                <div className="flex items-center">
                  7D Win Rate
                  <ChevronDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-2 text-left">
                <div className="flex items-center">
                  7D TXs
                  <ChevronDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-2 text-left">
                <div className="flex items-center">
                  Last Time
                  <ChevronDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-2 text-left">
                <div className="flex items-center">
                  Type
                  <ChevronDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="border-b border-blue-500/10 hover:bg-blue-900/10 transition-colors">
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <span className="text-white">{item.address}</span>
                    <button
                      onClick={() => copyAddress(item.address)}
                      className="ml-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="text-green-500">+${item.pnl7d}K</div>
                  <div className="text-red-500">{item.pnlPercent7d}%</div>
                </td>
                <td className="px-4 py-2">
                  <div className="text-green-500">+${item.pnl30d}K</div>
                  <div className="text-red-500">{item.pnlPercent30d}%</div>
                </td>
                <td className="px-4 py-2">{item.winRate7d}%</td>
                <td className="px-4 py-2">
                  <div>{item.transactions7d}</div>
                  <div className="text-cyan-500">3/4</div>
                </td>
                <td className="px-4 py-2">{item.lastTime}</td>
                <td className="px-4 py-2">
                  {item.type === "VIP" ? (
                    <div className="flex items-center text-yellow-500">
                      <Crown className="h-4 w-4 mr-1" />
                      VIP
                    </div>
                  ) : (
                    <div className="text-cyan-500">NORMAL</div>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      item.status === "Connected"
                        ? "bg-green-500/20 text-green-400"
                        : item.status === "Not Connected"
                          ? "bg-red-500/20 text-red-400"
                          : item.status === "Disconnected"
                            ? "bg-orange-500/20 text-orange-400"
                            : item.status === "Paused"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-2">
                    {item.status === "Not Connected" && (
                      <button
                        onClick={() => handleConnect(item.id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs transition-colors"
                      >
                        Connect
                      </button>
                    )}
                    {item.status === "Connected" && (
                      <>
                        <button
                          onClick={() => handlePause(item.id)}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full text-xs transition-colors"
                        >
                          Pause
                        </button>
                        <button
                          onClick={() => handleDisconnect(item.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs transition-colors"
                        >
                          Disconnect
                        </button>
                      </>
                    )}
                    {(item.status === "Disconnected" || item.status === "Paused") && (
                      <button
                        onClick={() => handleReconnect(item.id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs transition-colors"
                      >
                        Reconnect
                      </button>
                    )}
                    {item.status === "Pending" && (
                      <button
                        onClick={() => handleCancel(item.id)}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
