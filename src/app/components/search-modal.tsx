"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { X, Search, TrendingUp, TrendingDown } from "lucide-react"
import { getOrderMyHistories, getSearchTokenInfor } from "@/services/api/OnChainService"
import { useQuery } from "@tanstack/react-query"
import { formatNumberWithSuffix3 } from "@/utils/format"
import { useRouter } from "next/navigation"
import { useLang } from "@/lang/useLang"

interface TokenData {
  address: string
  name: string
  symbol: string
  image: string
  marketCapUsd: number
  liquidityUsd: number
  volume_1h: number
  volume_24h: number
  priceUsd: number
  totalTransactions: number
  holders: number
  verified: boolean
  category: FilterTab
  isNew?: boolean
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectToken?: (token: TokenData) => void
  searchQuery?: string
}

type FilterTab = "all" | "trending" | "meme"
type SortField = "marketCap" | "liquidity" | "volume1h" | "volume24h" | "price" | "holders"
type SortDirection = "asc" | "desc"

// Add useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default function SearchModal({ isOpen, onClose, onSelectToken, searchQuery = "" }: SearchModalProps) {
  const { t } = useLang()
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [sortField, setSortField] = useState<SortField>("marketCap")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();

  // Add debounced search input with consistent delay
  const debouncedSearchInput = useDebounce(searchInput, 1000)

  // Add paste handler
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent default paste behavior
    const pastedText = e.clipboardData.getData('text').trim();
    setSearchInput(pastedText);
  };

  // Update search input when searchQuery prop changes
  useEffect(() => {
    if (searchQuery !== searchInput) {
      setSearchInput(searchQuery)
    }
  }, [searchQuery])

  // Use React Query for data fetching with updated conditions
  const { data: listToken, isLoading: isQueryLoading } = useQuery({
    queryKey: ["searchTokens", debouncedSearchInput],
    queryFn: () => getSearchTokenInfor(debouncedSearchInput),
    enabled: isOpen && debouncedSearchInput.length > 0, // Remove minimum length requirement
    staleTime: 10000, // Reduce stale time to 10 seconds
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  })

  // Update loading state
  useEffect(() => {
    setIsLoading(isQueryLoading)
  }, [isQueryLoading])

  // Transform tokens directly in useMemo
  const filteredAndSortedTokens = useMemo(() => {
    // Return empty array if still loading or no data
    if (isQueryLoading || !listToken || !Array.isArray(listToken)) return []
    
    // Transform tokens
    const transformedTokens = listToken.map((token: any) => ({
      address: token.mint as string,
      name: token.name as string,
      symbol: token.symbol as string,
      image: token.image as string,
      marketCapUsd: token.marketCapUsd as number,
      liquidityUsd: token.liquidityUsd as number,
      volume_1h: token.volume_1h as number,
      volume_24h: token.volume_24h as number,
      priceUsd: token.priceUsd as number,
      totalTransactions: token.totalTransactions as number,
      holders: token.holders as number,
      verified: token.verified as boolean,
      category: "all" as FilterTab,
      isNew: token.createdAt ? Date.now() - token.createdAt < 24 * 60 * 60 * 1000 : false // New if created within 24h
    }))
 
    let filtered = transformedTokens

    // Filter by search query
    if (debouncedSearchInput) {
      filtered = filtered.filter(
        (token) =>
          token.name.toLowerCase().includes(debouncedSearchInput.toLowerCase()) ||
          token.symbol.toLowerCase().includes(debouncedSearchInput.toLowerCase()) ||
          token.address.toLowerCase().includes(debouncedSearchInput.toLowerCase())
      )
    }

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((token) => {
        if (activeTab === "trending") {
          return token.totalTransactions > 1000 || token.volume_24h > 100000 // Trending if high volume or transactions
        }
        if (activeTab === "meme") {
          return token.name.toLowerCase().includes("meme") || 
                 token.symbol.toLowerCase().includes("meme") ||
                 token.name.toLowerCase().includes("pepe") ||
                 token.symbol.toLowerCase().includes("pepe")
        }
        return true
      })
    }

    // Sort tokens
    filtered.sort((a, b) => {
      let aValue: number
      let bValue: number

      // Map sortField to actual token data fields
      switch (sortField) {
        case "marketCap":
          aValue = a.marketCapUsd
          bValue = b.marketCapUsd
          break
        case "liquidity":
          aValue = a.liquidityUsd
          bValue = b.liquidityUsd
          break
        case "volume1h":
          aValue = a.volume_1h
          bValue = b.volume_1h
          break
        case "volume24h":
          aValue = a.volume_24h
          bValue = b.volume_24h
          break
        case "price":
          aValue = a.priceUsd
          bValue = b.priceUsd
          break
        case "holders":
          aValue = a.holders
          bValue = b.holders
          break
        default:
          aValue = a.marketCapUsd
          bValue = b.marketCapUsd
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [debouncedSearchInput, activeTab, sortField, sortDirection, listToken])
  console.log("filteredAndSortedTokens", filteredAndSortedTokens)
  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Format numbers with null check
  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return "$0.00"
    
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`
    } else {
      return `$${num.toFixed(2)}`
    }
  }

  const formatVolume = (num: number | undefined | null) => {
    if (num === undefined || num === null) return "0"
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    } else {
      return num.toString()
    }
  }

  // Add helper function after the formatNumber function
  const truncateTokenName = (name: string, maxLength: number = 10) => {
    if (name.length <= maxLength) return name
    return name.slice(0, maxLength) + "..."
  }

  // Add helper function after truncateTokenName
  const truncateNumber = (num: number | undefined | null, maxLength: number = 6) => {
    if (num === undefined || num === null) return "0"
    
    const formatted = num >= 1000000 
      ? `${(num / 1000000).toFixed(1)}M`
      : num >= 1000 
        ? `${(num / 1000).toFixed(0)}K`
        : num.toString()
        
    if (formatted.length <= maxLength) return formatted
    return formatted.slice(0, maxLength) + "..."
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[80vh] mx-4 sm:mx-auto">
        {/* Gradient border wrapper */}
        <div className="p-[1px] sm:p-[2px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#5558FF] to-[#00C0FF] animate-fadeIn">
          <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 pb-2 sm:pb-4">
              <h2 className="text-[16px] sm:text-[18px] font-bold linear-200-bg">{t('searchModal.title')}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors hover:rotate-90 transform duration-300"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 sm:px-6 pb-3 sm:pb-4">
              <div className="p-[1px] rounded-full bg-gradient-to-b from-[#83E] to-[#112D60]">
                <div className="relative bg-[#111111] rounded-full">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value)
                    }}
                    onPaste={handlePaste}
                    placeholder={t('searchModal.placeholder')}
                    className="w-full bg-transparent py-1.5 sm:py-1 pl-10 sm:pl-12 pr-4 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none"
                  />
                  {isLoading && (
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Header - Hide some columns on mobile */}
            <div className="px-4 sm:px-6 pb-2">
              <div className="grid grid-cols-12 gap-2 sm:gap-6 text-[10px] sm:text-xs text-gray-400 font-medium border-b border-gray-800 pb-2 px-4">
                <div className="col-span-3 lg:col-span-2 min-w-[100px] sm:min-w-[150px] text-left">{t('searchModal.columns.token')}</div>
                <div
                  className="hidden sm:flex col-span-2 min-w-[90px] cursor-pointer hover:text-white items-center justify-end"
                  onClick={() => handleSort("marketCap")}
                >
                  <span className="flex items-center">
                    {t('searchModal.columns.marketCap')}
                    {sortField === "marketCap" && (
                      <span className="ml-1 text-[#5558FF]">{sortDirection === "desc" ? "↓" : "↑"}</span>
                    )}
                  </span>
                </div>
                <div
                  className="hidden sm:flex col-span-2 min-w-[60px] cursor-pointer hover:text-white items-center justify-end"
                  onClick={() => handleSort("volume1h")}
                >
                  <span className="flex items-center">
                    {t('searchModal.columns.volume1h')}
                    {sortField === "volume1h" && (
                      <span className="ml-1 text-[#5558FF]">{sortDirection === "desc" ? "↓" : "↑"}</span>
                    )}
                  </span>
                </div>
                <div
                  className="col-span-5 lg:col-span-2 min-w-[60px] sm:min-w-[80px] cursor-pointer hover:text-white flex items-center justify-end"
                  onClick={() => handleSort("volume24h")}
                >
                  <span className="flex items-center">
                    {t('searchModal.columns.volume24h')}
                    {sortField === "volume24h" && (
                      <span className="ml-1 text-[#5558FF]">{sortDirection === "desc" ? "↓" : "↑"}</span>
                    )}
                  </span>
                </div>
                <div
                  className="col-span-5 lg:col-span-2 mr-2 min-w-[80px] sm:min-w-[100px] cursor-pointer hover:text-white flex items-center justify-end"
                  onClick={() => handleSort("price")}
                >
                  <span className="flex items-center">
                    {t('searchModal.columns.price')}
                    {sortField === "price" && (
                      <span className="ml-1 text-[#5558FF]">{sortDirection === "desc" ? "↓" : "↑"}</span>
                    )}
                  </span>
                </div>
                <div
                  className="col-span-2 min-w-[60px] sm:min-w-[80px] cursor-pointer lg:mr-3 hidden sm:flex hover:text-white items-center justify-end"
                  onClick={() => handleSort("holders")}
                >
                  <span className="flex items-center">
                    {t('searchModal.columns.holders')}
                    {sortField === "holders" && (
                      <span className="ml-1 text-[#5558FF]">{sortDirection === "desc" ? "↓" : "↑"}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Token List */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 max-h-[calc(80vh-180px)] sm:max-h-[calc(80vh-200px)] overflow-y-auto">
              <div className="space-y-1 sm:space-y-2">
                {filteredAndSortedTokens.map((token) => (
                  <div
                    key={token.address}
                    onClick={() => router.push(`/trading?address=${token.address}`)}
                    className="grid grid-cols-12 gap-2 sm:gap-6 items-center py-2.5 sm:py-3 px-2 sm:px-3 rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer group border border-transparent hover:border-gray-800"
                  >
                    {/* Token Info */}
                    <div className="col-span-3 lg:col-span-2 min-w-[100px] sm:min-w-[150px] flex items-center space-x-2 sm:space-x-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                          <img
                            src={token.image || "/placeholder.svg?height=32&width=32&query=token"}
                            alt={""}
                            width={28}
                            height={28}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {token.verified && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full border border-[#1a1a1a]"></div>
                        )}
                        {token.isNew && (
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border border-[#1a1a1a]"></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <div className="text-white font-medium text-xs sm:text-sm truncate">
                            {truncateTokenName(token.name, 8)}
                          </div>
                        </div>
                        <div className="text-gray-400 text-[10px] sm:text-xs truncate">{token.symbol}</div>
                      </div>
                    </div>

                    {/* Market Cap - Hidden on mobile */}
                    <div className="hidden sm:flex col-span-2 min-w-[90px] text-white text-sm text-right items-center justify-end">
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-[10px]">Market Cap</span>
                        <span>{truncateNumber(token.marketCapUsd, 10)}</span>
                      </div>
                    </div>

                    {/* 1h Volume - Hidden on mobile */}
                    <div className="hidden sm:flex col-span-2 min-w-[60px] text-white text-sm text-right items-center justify-end">
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-[10px]">1h Vol</span>
                        <span>{truncateNumber(token.volume_1h, 10)}</span>
                      </div>
                    </div>

                    {/* 24h Volume */}
                    <div className="col-span-5 lg:col-span-2 min-w-[60px] sm:min-w-[80px] text-white text-xs sm:text-sm text-right items-center justify-end">
                      <div className="flex flex-col items-end">
                        
                        <span className="font-medium">{truncateNumber(token.volume_24h)}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-5 lg:col-span-2 min-w-[80px] sm:min-w-[120px] text-white text-xs sm:text-sm text-right items-center justify-end">
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-[10px]">Price</span>
                        <span className="font-medium text-[#5558FF]">${formatNumberWithSuffix3(token.priceUsd)}</span>
                      </div>
                    </div>

                    {/* Holders */}
                    <div className="hidden sm:flex col-span-2 min-w-[60px] sm:min-w-[80px] text-white text-xs sm:text-sm text-right items-center justify-end">
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-[10px]">Holders</span>
                        <span className="font-medium">{truncateNumber(token.holders)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAndSortedTokens.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-400">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <Search className="h-6 w-6 sm:h-8 sm:w-8 opacity-50" />
                  </div>
                  <p className="text-sm sm:text-base">{t('searchModal.noResults')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
