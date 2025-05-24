"use client"

import { useState, useEffect } from "react"
import { Copy, X, ChevronUp, ChevronDown } from "lucide-react"
import { truncateString } from "@/utils/format"
import { MasterTradingService } from "@/services/api"

interface ConnectToMasterModalProps {
  onClose: () => void
  masterAddress: string
  inforWallet: any
  isMember?: boolean
  onConnect: (amount: string) => void
  refetchMasterTraders: () => void
}

export default function ConnectToMasterModal({
  onClose,
  masterAddress,
  isMember = true,
  inforWallet,
  onConnect,
  refetchMasterTraders,
}: ConnectToMasterModalProps) {
  const [copyAmount, setCopyAmount] = useState("0,1")
  const [showDropdown, setShowDropdown] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const copyAmountOptions = ["0,1", "0,5", "1", "2", "5", "10", "20", "50"]

  // Handle copy address
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(masterAddress)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  // Handle connect
  const handleConnect = async () => {
    try {
      setIsLoading(true)
      const data = {
        master_wallet_address: masterAddress,
        option_limit: "price",
        price_limit: copyAmount.replace(',', '.'),
      };
      await MasterTradingService.connectMaster(data);
      setCopyAmount("0,1");
      await refetchMasterTraders();
      onConnect(copyAmount);
      onClose();
    } catch (error) {
      console.error('Error connecting to master:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleIncrement = () => {
    const currentValue = parseFloat(copyAmount.replace(',', '.'));
    const newValue = (currentValue + 0.1).toFixed(1).replace('.', ',');
    setCopyAmount(newValue);
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(copyAmount.replace(',', '.'));
    if (currentValue > 0.1) {
      const newValue = (currentValue - 0.1).toFixed(1).replace('.', ',');
      setCopyAmount(newValue);
    }
  };

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && masterAddress.length > 0) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [masterAddress, onClose])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (masterAddress.length > 0) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [masterAddress])

  if (masterAddress.length === 0) return null
  console.log("inforWallet", inforWallet)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#1a1a1a] rounded-xl border-2 border-cyan-500 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center py-4 px-6 pb-4">
          <h2 className="text-[18px] font-semibold text-cyan-400 mt-2">CONNECT TO MASTER</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-neutral-100 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Master Address */}
          <div>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-3">
                <span className="text-neutral-100 font-medium text-sm">{truncateString(inforWallet.solana_address, 12)}</span>
                <button
                  onClick={handleCopyAddress}
                  className="text-gray-400 hover:text-neutral-100 transition-colors"
                  title={copiedAddress ? "Copied!" : "Copy address"}
                >
                  <Copy className={`h-4 w-4 ${copiedAddress ? "text-green-500" : ""}`} />
                </button>
              </div>
              {inforWallet?.role && (
                <span className="px-3 py-[2px] bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/50">
                  {inforWallet.role}
                </span>
              )}
            </div>
          </div>

          {/* Maximum Copy Amount */}
          <div>
            <label className="block text-neutral-100 font-normal text-sm mb-3">Maximum Copy Amount (SOL)</label>
            <div className="relative flex items-center">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                className="w-full bg-[#111111] border-2 border-theme-primary-300 rounded-lg px-4 py-2 text-neutral-100 text-left focus:outline-none focus:ring-0"
                value={copyAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[.,]/g, ',');
                  if (value === '' || /^[0-9]*[,]?[0-9]*$/.test(value)) {
                    const numValue = parseFloat(value.replace(',', '.'));
                    if (value === '' || numValue >= 0.1) {
                      setCopyAmount(value);
                    } else {
                      setCopyAmount('0,1');
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '.') {
                    e.preventDefault();
                  }
                }}
                min="0,1"
              />
              <div className="absolute right-2 flex flex-col gap-1">
                <button
                  onClick={handleIncrement}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  type="button"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDecrement}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  disabled={parseFloat(copyAmount.replace(',', '.')) <= 0.1}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex pt-2 justify-center gap-6 w-full">
            <button
              onClick={onClose}
              className="py-1 px-4 border-2 border-cyan-500 text-cyan-400 rounded-full hover:bg-cyan-500/10 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="create-coin-bg hover:linear-200-bg hover-bg-delay dark:text-neutral-100 font-medium px-4 py-[6px] rounded-full transition-all duration-500 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed flex gap-2 text-sm"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
