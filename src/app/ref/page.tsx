"use client"

import { useState, useEffect, useRef } from "react"
import {
  Copy,
  ChevronUp,
  ChevronDown,
  User,
  Check,
  ExternalLink,
  Link2,
  Gift,
  X,
  AlertCircle,
  Calendar,
  DollarSign,
  Activity,
} from "lucide-react"

// Sample data for referred users with level information
const referredUsers = [
  {
    id: "user1",
    name: "Alex Johnson",
    joinDate: "2023-05-12",
    earnings: 125.75,
    status: "active",
    level: 1,
  },
  {
    id: "user2",
    name: "Sarah Williams",
    joinDate: "2023-06-23",
    earnings: 87.3,
    status: "active",
    level: 1,
  },
  {
    id: "user3",
    name: "Michael Brown",
    joinDate: "2023-07-05",
    earnings: 42.15,
    status: "inactive",
    level: 2,
  },
  {
    id: "user4",
    name: "Emma Davis",
    joinDate: "2023-08-17",
    earnings: 63.9,
    status: "active",
    level: 2,
  },
  {
    id: "user5",
    name: "James Wilson",
    joinDate: "2023-09-03",
    earnings: 31.45,
    status: "active",
    level: 3,
  },
  {
    id: "user6",
    name: "Olivia Martinez",
    joinDate: "2023-09-15",
    earnings: 18.2,
    status: "inactive",
    level: 3,
  },
  {
    id: "user7",
    name: "William Taylor",
    joinDate: "2023-10-07",
    earnings: 9.75,
    status: "active",
    level: 4,
  },
  {
    id: "user8",
    name: "Sophia Anderson",
    joinDate: "2023-10-22",
    earnings: 5.3,
    status: "active",
    level: 5,
  },
  {
    id: "user9",
    name: "Benjamin Thomas",
    joinDate: "2023-11-05",
    earnings: 12.8,
    status: "active",
    level: 1,
  },
  {
    id: "user10",
    name: "Isabella Garcia",
    joinDate: "2023-11-18",
    earnings: 7.45,
    status: "inactive",
    level: 2,
  },
  {
    id: "user11",
    name: "Lucas Rodriguez",
    joinDate: "2023-12-01",
    earnings: 22.6,
    status: "active",
    level: 3,
  },
  {
    id: "user12",
    name: "Mia Lee",
    joinDate: "2023-12-14",
    earnings: 15.9,
    status: "active",
    level: 4,
  },
]

export default function ReferralPage() {
  const [isTreeVisible, setIsTreeVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [totalEarnings] = useState(15.5) // Simulated earnings - can be changed to test
  const [activeTab, setActiveTab] = useState("users") // 'layers', 'users'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedLevel, setSelectedLevel] = useState("all")

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText("https://mevx.io/@")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWithdraw = () => {
    if (totalEarnings >= 20) {
      // Process withdrawal
      alert("Withdrawal request submitted successfully!")
      setShowWithdrawModal(false)
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Filter users based on selected level
  const filteredUsers =
    selectedLevel === "all"
      ? referredUsers
      : referredUsers.filter((user) => user.level === Number.parseInt(selectedLevel.replace("level", "")))

  // Draw connections between nodes
  const drawConnections = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#3b82f6" // blue-500
    ctx.lineWidth = 1.5

    // Level 1 to 2 vertical line
    ctx.beginPath()
    ctx.moveTo(width / 2, 40)
    ctx.lineTo(width / 2, 65)
    ctx.stroke()

    // Level 2 horizontal line
    ctx.beginPath()
    ctx.moveTo(width / 4, 65)
    ctx.lineTo((width / 4) * 3, 65)
    ctx.stroke()

    // Level 2 to 3 vertical lines
    ctx.beginPath()
    ctx.moveTo(width / 4, 65)
    ctx.lineTo(width / 4, 90)
    ctx.moveTo((width / 4) * 3, 65)
    ctx.lineTo((width / 4) * 3, 90)
    ctx.stroke()

    // Level 3 horizontal lines
    ctx.beginPath()
    ctx.moveTo(width / 8, 90)
    ctx.lineTo((width / 8) * 3, 90)
    ctx.moveTo(width / 8, 90)
    ctx.lineTo((width / 8) * 7, 90)
    ctx.stroke()

    // Level 3 to 4 vertical lines
    for (let i = 0; i < 4; i++) {
      const x = (width / 8) * (1 + 2 * i)
      ctx.beginPath()
      ctx.moveTo(x, 90)
      ctx.lineTo(x, 115)
      ctx.stroke()
    }

    // Level 4 horizontal lines
    for (let i = 0; i < 4; i++) {
      const startX = (width / 16) * (1 + 4 * i)
      const endX = (width / 16) * (3 + 4 * i)
      ctx.beginPath()
      ctx.moveTo(startX, 115)
      ctx.lineTo(endX, 115)
      ctx.stroke()
    }

    // Level 4 to 5 vertical lines
    for (let i = 0; i < 8; i++) {
      const x = (width / 16) * (1 + 2 * i)
      ctx.beginPath()
      ctx.moveTo(x, 115)
      ctx.lineTo(x, 140)
      ctx.stroke()
    }

    // Level 5 horizontal lines
    for (let i = 0; i < 8; i++) {
      const startX = (width / 32) * (1 + 4 * i)
      const endX = (width / 32) * (3 + 4 * i)
      ctx.beginPath()
      ctx.moveTo(startX, 140)
      ctx.lineTo(endX, 140)
      ctx.stroke()
    }
  }

  useEffect(() => {
    if (!isTreeVisible) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const container = canvas.parentElement
    if (!container) return

    canvas.width = container.clientWidth
    canvas.height = 180

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connections
    drawConnections(ctx, canvas.width, canvas.height)

    // Handle window resize
    const handleResize = () => {
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = 180
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawConnections(ctx, canvas.width, canvas.height)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isTreeVisible])

  // Create a user node component
  const UserNode = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-5 h-5",
      lg: "w-7 h-7",
    }
    const iconSizes = {
      sm: 6,
      md: 8,
      lg: 12,
    }

    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-400 dark:to-blue-600 rounded-full flex items-center justify-center shadow-md border border-blue-300/30 dark:border-blue-300/30 hover:scale-110 transition-transform duration-300`}
      >
        <User size={iconSizes[size]} className="text-white" />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4f46e5 #1f2937;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #1f2937, #111827);
          border-radius: 10px;
          margin: 4px 0;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #4f46e5);
          border-radius: 10px;
          border: 1px solid #374151;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #6366f1);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(to bottom, #8b5cf6, #7c3aed);
        }
        
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #1f2937;
        }
      `}</style>

      <div className="max-w-4xl mx-auto p-3">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 dark:from-purple-600 dark:via-purple-700 dark:to-indigo-700 p-3 rounded-md shadow-lg border border-purple-400/30 dark:border-purple-500/20 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              REFERRAL TRACKING
            </h1>
            <div className="w-10 h-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"></div>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md p-3 border border-gray-300/50 dark:border-gray-700/50 shadow-md mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <ExternalLink size={14} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400">YOUR REFERRAL LINK</h2>
          </div>

          <div className="flex items-center bg-gray-100/80 dark:bg-gray-900/80 rounded-md p-2 border border-gray-300/50 dark:border-gray-700/50 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300 mb-3">
            <span className="flex-1 text-gray-900 dark:text-white font-mono text-xs">https://mevx.io/@</span>
            <button
              onClick={copyToClipboard}
              className="ml-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-2 py-1 rounded-md transition-all duration-300 flex items-center gap-1 shadow-md hover:shadow-lg text-xs"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-md p-2 border border-blue-300/30 dark:border-blue-700/30">
            <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-1 text-xs">EARLY ACCESS REFERRAL</h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs">
              Friends you refer get early access to MevX and you earn commissions from their trading fees.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-green-100/60 dark:bg-green-900/40 backdrop-blur-sm rounded-md p-3 border border-green-300/50 dark:border-green-700/50 shadow-md">
            <h3 className="text-green-600 dark:text-green-400 font-semibold mb-1 text-xs">Total Referrals</h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{referredUsers.length}</p>
          </div>
          <div className="bg-blue-100/60 dark:bg-blue-900/40 backdrop-blur-sm rounded-md p-3 border border-blue-300/50 dark:border-blue-700/50 shadow-md">
            <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-1 text-xs">Total Earnings</h3>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-gray-900 dark:text-white">${totalEarnings.toFixed(2)}</p>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-2 py-1 rounded-md transition-all duration-300 flex items-center gap-1 shadow-md hover:shadow-lg text-xs font-medium"
              >
                <Gift size={12} />
                <span className="hidden sm:inline">Withdraw</span>
              </button>
            </div>
          </div>
          <div className="bg-purple-100/60 dark:bg-purple-900/40 backdrop-blur-sm rounded-md p-3 border border-purple-300/50 dark:border-purple-700/50 shadow-md">
            <h3 className="text-purple-600 dark:text-purple-400 font-semibold mb-1 text-xs">Active Referrals</h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {referredUsers.filter((user) => user.status === "active").length}
            </p>
          </div>
        </div>

        {/* MLM Tree Structure */}
        <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-md p-3 border border-gray-300/50 dark:border-gray-700/50 shadow-md mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-blue-600 dark:text-blue-400">REFERRAL STRUCTURE</h2>
            <button
              onClick={() => setIsTreeVisible(!isTreeVisible)}
              className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white px-2 py-1 rounded-md transition-all duration-300 shadow-md hover:shadow-lg font-medium text-xs"
            >
              {isTreeVisible ? (
                <>
                  Hide <ChevronUp size={12} />
                </>
              ) : (
                <>
                  Show <ChevronDown size={12} />
                </>
              )}
            </button>
          </div>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isTreeVisible ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="relative">
              {/* Canvas for connections */}
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />

              {/* Level indicators */}
              <div className="absolute left-0 top-6 flex flex-col gap-[25px] z-10">
                <div className="text-green-600 dark:text-green-400 font-mono font-bold text-xs">#1</div>
                <div className="text-green-600 dark:text-green-400 font-mono font-bold text-xs">#2</div>
                <div className="text-green-600 dark:text-green-400 font-mono font-bold text-xs">#3</div>
                <div className="text-green-600 dark:text-green-400 font-mono font-bold text-xs">#4</div>
                <div className="text-green-600 dark:text-green-400 font-mono font-bold text-xs">#5</div>
              </div>

              {/* Percentage indicators */}
              <div className="absolute right-0 top-6 flex flex-col gap-[25px] z-10">
                <div className="text-green-600 dark:text-green-400 font-bold text-sm">25%</div>
                <div className="text-green-600 dark:text-green-400 font-bold text-sm">3.5%</div>
                <div className="text-green-600 dark:text-green-400 font-bold text-sm">3%</div>
                <div className="text-green-600 dark:text-green-400 font-bold text-sm">2%</div>
                <div className="text-green-600 dark:text-green-400 font-bold text-sm">1%</div>
              </div>

              {/* Level 1 - YOU */}
              <div className="flex justify-center mb-4 relative z-10 pt-2">
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-0.5 rounded-full mb-1 font-semibold shadow-md text-xs">
                    YOU
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-300 mb-1 text-center">
                    Receive 25% of Friend 1's Fees
                  </div>
                  <UserNode size="lg" />
                </div>
              </div>

              {/* Level 2 */}
              <div className="flex justify-between mb-4 px-10 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="text-[10px] text-blue-600 dark:text-blue-300 mb-1 text-center">
                    Receive 3.5% of Friend 2's Fees
                  </div>
                  <UserNode size="md" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-[10px] text-blue-600 dark:text-blue-300 mb-1 text-center">
                    Receive 3.5% of Friend 2's Fees
                  </div>
                  <UserNode size="md" />
                </div>
              </div>

              {/* Level 3 */}
              <div className="flex justify-between mb-4 px-4 relative z-10">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-[10px] text-blue-600 dark:text-blue-300 mb-1 text-center">
                      3% of Friend 3's
                    </div>
                    <UserNode size="md" />
                  </div>
                ))}
              </div>

              {/* Level 4 */}
              <div className="flex justify-between mb-4 px-2 relative z-10">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-[10px] text-blue-600 dark:text-blue-300 mb-1 text-center">
                      2% of Friend 4's
                    </div>
                    <UserNode size="sm" />
                  </div>
                ))}
              </div>

              {/* Level 5 */}
              <div className="flex justify-between relative z-10 pb-2">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-[10px] text-blue-600 dark:text-blue-300 mb-1">1%</div>
                    <UserNode size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* YOUR REFERRALS Section */}
        <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-md p-3 border border-gray-300/50 dark:border-gray-700/50 shadow-md">
          <div className="flex items-center gap-1.5 mb-3">
            <Link2 size={14} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-blue-600 dark:text-blue-400">YOUR REFERRALS</h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-300 dark:border-gray-700 mb-3">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              REFERRED USERS
            </button>
            <button
              onClick={() => setActiveTab("layers")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "layers"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              5 LAYERS REFERRAL
            </button>
          </div>

          {/* 5 LAYERS REFERRAL Tab Content */}
          {activeTab === "layers" && (
            <div className="mb-4">
              <div className="bg-gray-900 dark:bg-gray-800 rounded-md p-3 border border-gray-700">
                {/* Table Headers */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div></div>
                  <div className="text-center">
                    <div className="bg-gray-800 dark:bg-gray-700 rounded-md px-2 py-1">
                      <span className="text-blue-400 font-medium text-[10px]">REFERRAL COUNT</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-800 dark:bg-gray-700 rounded-md px-2 py-1">
                      <span className="text-blue-400 font-medium text-[10px]">CLAIMABLE VOLUME</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-800 dark:bg-gray-700 rounded-md px-2 py-1">
                      <span className="text-blue-400 font-medium text-[10px]">LIFETIME VOLUME</span>
                    </div>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((layer) => (
                    <div key={layer} className="grid grid-cols-4 gap-2 items-center">
                      <div>
                        <div className="bg-blue-600 dark:bg-blue-500 text-white px-2 py-1 rounded-md text-[10px] font-medium text-center">
                          LAYER {layer}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-gray-800 dark:bg-gray-700 rounded-md px-2 py-1 border border-gray-600">
                          <span className="text-white font-bold text-sm">
                            {referredUsers.filter((user) => user.level === layer).length}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-gray-800 dark:bg-gray-700 rounded-md px-2 py-1 border border-gray-600">
                          <span className="text-green-400 font-bold text-sm">
                            $
                            {referredUsers
                              .filter((user) => user.level === layer)
                              .reduce((sum, user) => sum + user.earnings, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-gray-800 dark:bg-gray-700 rounded-md px-2 py-1 border border-gray-600">
                          <span className="text-green-400 font-bold text-sm">
                            $
                            {(
                              referredUsers
                                .filter((user) => user.level === layer)
                                .reduce((sum, user) => sum + user.earnings, 0) * 1.5
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REFERRED USERS Tab Content */}
          {activeTab === "users" && (
            <div>
              {/* Level Filter Tabs */}
              <div className="flex flex-wrap gap-1 mb-3 p-2 bg-gray-800/30 dark:bg-gray-900/30 rounded-md border border-gray-600/30">
                <button
                  onClick={() => setSelectedLevel("all")}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedLevel === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                  }`}
                >
                  All
                </button>
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(`level${level}`)}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                      selectedLevel === `level${level}`
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                    }`}
                  >
                    Level {level}
                  </button>
                ))}
              </div>

              <div className="bg-gray-900 dark:bg-gray-800 rounded-md border border-gray-700 overflow-hidden">
                {/* Table Headers - Fixed */}
                <div className="grid grid-cols-6 gap-2 p-3 text-[10px] font-medium text-blue-400 bg-gray-900 dark:bg-gray-800 border-b border-gray-700">
                  <div className="px-2 py-1">USER</div>
                  <div className="px-2 py-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar size={10} />
                      JOIN DATE
                    </div>
                  </div>
                  <div className="px-2 py-1 text-center">LEVEL</div>
                  <div className="px-2 py-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign size={10} />
                      EARNINGS
                    </div>
                  </div>
                  <div className="px-2 py-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Activity size={10} />
                      STATUS
                    </div>
                  </div>
                  <div className="px-2 py-1 text-center">ACTIONS</div>
                </div>

                {/* Table Rows - Scrollable */}
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div className="p-3 pt-0">
                    <div className="space-y-2">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            className="grid grid-cols-6 gap-2 items-center bg-gray-800/50 rounded-md p-2 hover:bg-gray-800/70 transition-colors duration-200"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                <User size={12} className="text-white" />
                              </div>
                              <div>
                                <p className="text-white text-xs font-medium">{user.name}</p>
                                <p className="text-gray-400 text-[10px]">ID: {user.id}</p>
                              </div>
                            </div>
                            <div className="text-center text-xs text-gray-300">{formatDate(user.joinDate)}</div>
                            <div className="text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                Level {user.level}
                              </span>
                            </div>
                            <div className="text-center text-xs font-bold text-green-400">
                              ${user.earnings.toFixed(2)}
                            </div>
                            <div className="text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  user.status === "active"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {user.status === "active" ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span>
                                )}
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-center">
                              <button className="text-blue-400 hover:text-blue-300 text-xs transition-colors">
                                Details
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-400 text-sm">No referred users found at this level</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-300 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="text-green-500" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Withdraw Rewards</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-4 border border-blue-300/30 dark:border-blue-700/30 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalEarnings.toFixed(2)}</p>
                </div>
              </div>

              {totalEarnings < 20 ? (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-red-500" size={16} />
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Minimum Withdrawal Required</p>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    You need at least $20.00 to withdraw rewards. Current balance: ${totalEarnings.toFixed(2)}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    Required: ${(20 - totalEarnings).toFixed(2)} more
                  </p>
                </div>
              ) : (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="text-green-500" size={16} />
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">Ready to Withdraw</p>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Your balance meets the minimum withdrawal requirement of $20.00
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={totalEarnings < 20}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
                  totalEarnings >= 20
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                <Gift size={16} />
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
