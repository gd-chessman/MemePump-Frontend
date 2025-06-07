"use client"

import { useState, useEffect } from "react"
import { Copy, X, ChevronUp, ChevronDown } from "lucide-react"
import { truncateString } from "@/utils/format"
import { MasterTradingService } from "@/services/api"
import { useLang } from "@/lang"

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
  const { t } = useLang()
  const [copyAmount, setCopyAmount] = useState("0,01")
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
      const value = parseFloat(copyAmount.replace(',', '.'));
      if (value < 0.01) {
        return;
      }
      setIsLoading(true)
      const data = {
        master_wallet_address: masterAddress,
        option_limit: "price",
        price_limit: copyAmount === "0" ? "0,01" : copyAmount.replace(',', '.'),
      };
      await MasterTradingService.connectMaster(data);
      setCopyAmount("0,01");
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
    const newValue = (currentValue + 0.01).toFixed(2).replace('.', ',');
    setCopyAmount(newValue);
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(copyAmount.replace(',', '.'));
    if (currentValue > 0.01) {
      const newValue = (currentValue - 0.01).toFixed(2).replace('.', ',');
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-[#1a1a1a] rounded-xl border-2 border-cyan-500 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center py-4 px-6 pb-4">
          <h2 className="text-[18px] font-semibold text-cyan-400 mt-2">{t('connectMasterModal.title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-neutral-100 dark:hover:text-neutral-100 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Master Address */}
          <div>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-3">
                <span className="text-black dark:text-neutral-100 font-medium text-sm">{truncateString(inforWallet.solana_address, 12)}</span>
                <button
                  onClick={handleCopyAddress}
                  className="text-gray-400 hover:text-neutral-100 transition-colors"
                  title={copiedAddress ? t('connectMasterModal.copyAddress.copied') : t('connectMasterModal.copyAddress.copy')}
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
            <label className="block text-black dark:text-neutral-100 font-normal text-sm mb-3">{t('connectMasterModal.maximumCopyAmount')}</label>
            <div className="relative flex items-center">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                className="w-full bg-gray-100 dark:bg-[#111111] border-2 border-theme-primary-300 rounded-lg px-4 py-2 text-black dark:text-neutral-100 text-left focus:outline-none focus:ring-0"
                value={copyAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[.,]/g, ',');
                  if (value === '' || /^[0-9]*[,]?[0-9]*$/.test(value)) {
                    setCopyAmount(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '.') {
                    e.preventDefault();
                  }
                }}
                min="0"
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
                  disabled={parseFloat(copyAmount.replace(',', '.')) <= 0.01}
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
              {t('connectMasterModal.buttons.cancel')}
            </button>
            <button
              onClick={handleConnect}
              disabled={isLoading || copyAmount == "" || parseFloat(copyAmount.replace(',', '.')) < 0.01}
              className="lg:max-w-auto max-w-[120px] group relative bg-gradient-to-t from-theme-primary-500 to-theme-secondary-400 py-1.5 md:py-2 px-3 md:px-4 lg:px-5 rounded-full text-[11px] md:text-xs transition-all duration-500 hover:from-theme-blue-100 hover:to-theme-blue-200 hover:scale-105 hover:shadow-lg hover:shadow-theme-primary-500/30 active:scale-95 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 text-white">{isLoading ? t('connectMasterModal.buttons.connecting') : t('connectMasterModal.buttons.connect')}</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-theme-primary-300 to-theme-secondary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
