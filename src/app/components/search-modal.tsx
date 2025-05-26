"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { X, Search, TrendingUp, TrendingDown } from "lucide-react"
import Image from "next/image"
import { SolonaTokenService } from "@/services/api"
import { getOrderMyHistories, getSearchTokenInfor } from "@/services/api/OnChainService"
import { useQuery } from "@tanstack/react-query"
import { formatNumberWithSuffix3 } from "@/utils/format"

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
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [sortField, setSortField] = useState<SortField>("marketCap")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isLoading, setIsLoading] = useState(false)

  // Add debounced search input with shorter delay
  const debouncedSearchInput = useDebounce(searchInput, 300)

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

  // Debug logs
  useEffect(() => {
    console.log("Search Input:", searchInput)
    console.log("Debounced Input:", debouncedSearchInput)
    console.log("Is Open:", isOpen)
    console.log("Query Enabled:", isOpen && debouncedSearchInput.length > 0)
  }, [searchInput, debouncedSearchInput, isOpen])

  // Update loading state
  useEffect(() => {
    setIsLoading(isQueryLoading)
  }, [isQueryLoading])

  // Transform tokens directly in useMemo
  const filteredAndSortedTokens = useMemo(() => {
    if (!listToken || !Array.isArray(listToken)) return []

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
      <div className="relative w-full max-w-2xl max-h-[80vh]">
        {/* Gradient border wrapper */}
        <div className="p-[2px] rounded-2xl bg-gradient-to-r from-[#5558FF] to-[#00C0FF] animate-fadeIn">
          <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-[18px] font-bold linear-200-bg">SEARCH</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors hover:rotate-90 transform duration-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-6 pb-4">
              <div className="p-[1px] rounded-full bg-gradient-to-b from-[#83E] to-[#112D60]">
                <div className="relative bg-[#111111] rounded-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      console.log("Input changed:", e.target.value) // Debug log
                      setSearchInput(e.target.value)
                    }}
                    placeholder="Search tokens..."
                    className="w-full bg-transparent py-1 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none"
                  />
                  {isLoading && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Table Header */}
            <div className="px-6 pb-2">
              <div className="grid grid-cols-12 gap-6 text-xs text-gray-400 font-medium">
                <div className="col-span-2 min-w-[150px] text-left">Token</div>
                <div
                  className="col-span-2 min-w-[90px] cursor-pointer hover:text-white flex items-center justify-end"
                  onClick={() => handleSort("marketCap")}
                >
                  MC
                  {sortField === "marketCap" && <span className="ml-1">{sortDirection === "desc" ? "↓" : "↑"}</span>}
                </div>
                <div
                  className="col-span-1 min-w-[60px] cursor-pointer hover:text-white flex items-center justify-end"
                  onClick={() => handleSort("volume1h")}
                >
                  1h Vol
                  {sortField === "volume1h" && <span className="ml-1">{sortDirection === "desc" ? "↓" : "↑"}</span>}
                </div>
                <div
                  className="col-span-1 min-w-[80px] cursor-pointer hover:text-white flex items-center justify-end"
                  onClick={() => handleSort("volume24h")}
                >
                  24h Vol
                  {sortField === "volume24h" && <span className="ml-1">{sortDirection === "desc" ? "↓" : "↑"}</span>}
                </div>
                <div
                  className="col-span-4 min-w-[100px] cursor-pointer hover:text-white flex items-center justify-end"
                  onClick={() => handleSort("price")}
                >
                  Price
                  {sortField === "price" && <span className="ml-1">{sortDirection === "desc" ? "↓" : "↑"}</span>}
                </div>
                <div
                  className="col-span-2 min-w-[80px] cursor-pointer hover:text-white flex items-center justify-end"
                  onClick={() => handleSort("holders")}
                >
                  Holders
                  {sortField === "holders" && <span className="ml-1">{sortDirection === "desc" ? "↓" : "↑"}</span>}
                </div>
              </div>
            </div>

            {/* Token List */}
            <div className="px-6 pb-6 max-h-[calc(80vh-200px)] overflow-y-auto">
              <div className="space-y-2">
                {filteredAndSortedTokens.map((token) => (
                  <div
                    key={token.address}
                    onClick={() => onSelectToken?.(token)}
                    className="grid grid-cols-12 gap-6 items-center py-3 px-3 rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer group"
                  >
                    {/* Token Info */}
                    <div className="col-span-2 min-w-[150px] flex items-center space-x-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={token.image || "/placeholder.svg?height=32&width=32&query=token"}
                          alt={token.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        {token.verified && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                        {token.isNew && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-medium text-sm">
                          {truncateTokenName(token.name)}
                        </div>
                        <div className="text-gray-400 text-xs truncate">{token.symbol}</div>
                      </div>
                    </div>

                    {/* Market Cap */}
                    <div className="col-span-2 min-w-[90px] text-white text-sm text-right">
                      {truncateNumber(token.marketCapUsd)}
                    </div>

                    {/* 1h Volume */}
                    <div className="col-span-1 min-w-[60px] text-white text-sm text-right">
                      {truncateNumber(token.volume_1h)}
                    </div>

                    {/* 24h Volume */}
                    <div className="col-span-1 min-w-[80px] text-white text-sm text-right">
                      {truncateNumber(token.volume_24h)}
                    </div>

                    {/* Price */}
                    <div className="col-span-4 min-w-[120px] text-white text-sm text-right">
                      ${formatNumberWithSuffix3(token.priceUsd)}
                    </div>

                    {/* Holders */}
                    <div className="col-span-2 min-w-[80px] text-white text-sm text-right">
                      {truncateNumber(token.holders)}
                    </div>
                  </div>
                ))}
              </div>

              {filteredAndSortedTokens.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tokens found matching your search criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
