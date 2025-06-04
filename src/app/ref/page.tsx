"use client"

import { useState, useEffect, useRef } from "react"
import { Copy, ChevronUp, ChevronDown, User, Check, ExternalLink } from "lucide-react"

export default function ReferralPage() {
  const [isTreeVisible, setIsTreeVisible] = useState(true)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText("https://mevx.io/@")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Draw connections between nodes
  const drawConnections = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#3b82f6" // blue-500
    ctx.lineWidth = 2

    // Level 1 to 2 vertical line
    ctx.beginPath()
    ctx.moveTo(width / 2, 60)
    ctx.lineTo(width / 2, 100)
    ctx.stroke()

    // Level 2 horizontal line
    ctx.beginPath()
    ctx.moveTo(width / 4, 100)
    ctx.lineTo((width / 4) * 3, 100)
    ctx.stroke()

    // Level 2 to 3 vertical lines
    ctx.beginPath()
    ctx.moveTo(width / 4, 100)
    ctx.lineTo(width / 4, 140)
    ctx.moveTo((width / 4) * 3, 100)
    ctx.lineTo((width / 4) * 3, 140)
    ctx.stroke()

    // Level 3 horizontal lines
    ctx.beginPath()
    ctx.moveTo(width / 8, 140)
    ctx.lineTo((width / 8) * 3, 140)
    ctx.moveTo((width / 8) * 5, 140)
    ctx.lineTo((width / 8) * 7, 140)
    ctx.stroke()

    // Level 3 to 4 vertical lines
    for (let i = 0; i < 4; i++) {
      const x = (width / 8) * (1 + 2 * i)
      ctx.beginPath()
      ctx.moveTo(x, 140)
      ctx.lineTo(x, 180)
      ctx.stroke()
    }

    // Level 4 horizontal lines
    for (let i = 0; i < 4; i++) {
      const startX = (width / 16) * (1 + 4 * i)
      const endX = (width / 16) * (3 + 4 * i)
      ctx.beginPath()
      ctx.moveTo(startX, 180)
      ctx.lineTo(endX, 180)
      ctx.stroke()
    }

    // Level 4 to 5 vertical lines
    for (let i = 0; i < 8; i++) {
      const x = (width / 16) * (1 + 2 * i)
      ctx.beginPath()
      ctx.moveTo(x, 180)
      ctx.lineTo(x, 220)
      ctx.stroke()
    }

    // Level 5 horizontal lines
    for (let i = 0; i < 8; i++) {
      const startX = (width / 32) * (1 + 4 * i)
      const endX = (width / 32) * (3 + 4 * i)
      ctx.beginPath()
      ctx.moveTo(startX, 220)
      ctx.lineTo(endX, 220)
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
    canvas.height = 280

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connections
    drawConnections(ctx, canvas.width, canvas.height)

    // Handle window resize
    const handleResize = () => {
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = 280
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
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    }
    const iconSizes = {
      sm: 14,
      md: 18,
      lg: 22,
    }

    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-400 dark:to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-300/30 dark:border-blue-300/30 hover:scale-110 transition-transform duration-300`}
      >
        <User size={iconSizes[size]} className="text-white" />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 dark:from-purple-600 dark:via-purple-700 dark:to-indigo-700 p-6 rounded-xl shadow-2xl border border-purple-400/30 dark:border-purple-500/20 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              REFERRAL TRACKING
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"></div>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50 dark:border-gray-700/50 shadow-xl mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink size={20} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">YOUR REFERRAL LINK</h2>
          </div>

          <div className="flex items-center bg-gray-100/80 dark:bg-gray-900/80 rounded-lg p-4 border border-gray-300/50 dark:border-gray-700/50 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300 mb-6">
            <span className="flex-1 text-gray-900 dark:text-white font-mono text-sm md:text-base">
              https://mevx.io/@
            </span>
            <button
              onClick={copyToClipboard}
              className="ml-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-4 border border-blue-300/30 dark:border-blue-700/30">
            <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-2">EARLY ACCESS REFERRAL</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Friends you refer get early access to MevX and you earn commissions from their trading fees.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-100/60 dark:bg-green-900/40 backdrop-blur-sm rounded-xl p-6 border border-green-300/50 dark:border-green-700/50 shadow-xl">
            <h3 className="text-green-600 dark:text-green-400 font-semibold mb-2">Total Referrals</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
          </div>
          <div className="bg-blue-100/60 dark:bg-blue-900/40 backdrop-blur-sm rounded-xl p-6 border border-blue-300/50 dark:border-blue-700/50 shadow-xl">
            <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">$0.00</p>
          </div>
          <div className="bg-purple-100/60 dark:bg-purple-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-300/50 dark:border-purple-700/50 shadow-xl">
            <h3 className="text-purple-600 dark:text-purple-400 font-semibold mb-2">Active Referrals</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
          </div>
        </div>

        {/* MLM Tree Structure */}
        <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">REFERRAL STRUCTURE</h2>
            <button
              onClick={() => setIsTreeVisible(!isTreeVisible)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              {isTreeVisible ? (
                <>
                  Hide <ChevronUp size={18} />
                </>
              ) : (
                <>
                  Show <ChevronDown size={18} />
                </>
              )}
            </button>
          </div>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isTreeVisible ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="relative">
              {/* Canvas for connections */}
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />

              {/* Level indicators */}
              <div className="absolute left-0 top-10 flex flex-col gap-[40px] z-10">
                <div className="text-green-600 dark:text-green-400 font-mono font-bold text-lg">#1</div>
                <div className="text-green-600 dark:text-green-400 font-mono font-bold text-lg">#2</div>
                <div className="text-green-600 dark:text-green-400 font-mono font-bold text-lg">#3</div>
                <div className="text-green-600 dark:text-green-400 font-mono font-bold text-lg">#4</div>
                <div className="text-green-600 dark:text-green-400 font-mono font-bold text-lg">#5</div>
              </div>

              {/* Percentage indicators */}
              <div className="absolute right-0 top-10 flex flex-col gap-[40px] z-10">
                <div className="text-green-600 dark:text-green-400 font-bold text-xl">25%</div>
                <div className="text-green-600 dark:text-green-400 font-bold text-xl">3.5%</div>
                <div className="text-green-600 dark:text-green-400 font-bold text-xl">3%</div>
                <div className="text-green-600 dark:text-green-400 font-bold text-xl">2%</div>
                <div className="text-green-600 dark:text-green-400 font-bold text-xl">1%</div>
              </div>

              {/* Level 1 - YOU */}
              <div className="flex justify-center mb-10 relative z-10 pt-4">
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full mb-2 font-semibold shadow-lg">
                    YOU
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300 mb-2 text-center">
                    Receive 25% of Friend 1's Fees
                  </div>
                  <UserNode size="lg" />
                </div>
              </div>

              {/* Level 2 */}
              <div className="flex justify-between mb-10 px-16 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="text-xs text-blue-600 dark:text-blue-300 mb-2 text-center">
                    Receive 3.5% of Friend 2's Fees
                  </div>
                  <UserNode size="md" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xs text-blue-600 dark:text-blue-300 mb-2 text-center">
                    Receive 3.5% of Friend 2's Fees
                  </div>
                  <UserNode size="md" />
                </div>
              </div>

              {/* Level 3 */}
              <div className="flex justify-between mb-10 px-8 relative z-10">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-xs text-blue-600 dark:text-blue-300 mb-2 text-center">3% of Friend 3's</div>
                    <UserNode size="md" />
                  </div>
                ))}
              </div>

              {/* Level 4 */}
              <div className="flex justify-between mb-10 px-4 relative z-10">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-xs text-blue-600 dark:text-blue-300 mb-2 text-center">2% of Friend 4's</div>
                    <UserNode size="sm" />
                  </div>
                ))}
              </div>

              {/* Level 5 */}
              <div className="flex justify-between relative z-10 pb-4">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-xs text-blue-600 dark:text-blue-300 mb-2">1%</div>
                    <UserNode size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
