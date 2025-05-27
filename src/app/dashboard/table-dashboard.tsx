"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { useLang } from "@/lang";
import { useRouter } from "next/navigation";
import { Search, Loader2, Copy, Star, BarChart4, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { SolonaTokenService } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";
import { truncateString } from "@/utils/format";
import { ToastNotification } from "@/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { TableTokenList } from "@/app/components/trading/TableTokenList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { getMyWishlist } from "@/services/api/SolonaTokenService";
import { useQuery } from "@tanstack/react-query";
import { getNewCoins, getTopCoins } from "@/services/api/OnChainService";
import { formatNumberWithSuffix3 } from "@/utils/format";

interface Token {
  id: number;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logo_uri: string;
  coingeckoId: string | null;
  tradingviewSymbol: string | null;
  isVerified: boolean;
  marketCap: number;
  isFavorite?: boolean;
  liquidity: any;
  holder: number;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
}

export default function Trading() {
  const router = useRouter();
  const { t } = useLang();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isSearching, setIsSearching] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("1");
  const [sortBy, setSortBy] = useState("market_cap");
  const [sortType, setSortType] = useState("desc");
  
  const { data: topCoins, isLoading: isLoadingTopCoins } = useQuery({
    queryKey: ["topCoins"],
    queryFn: () => getTopCoins({ offset: 3, limit: 50 }),
    refetchInterval: 10000,
  });

  const { data: newCoins, isLoading: isLoadingNewCoins } = useQuery({
    queryKey: ["newCoins"],
    queryFn: () => getNewCoins({ offset: 3, limit: 50 }),
    refetchInterval: 10000,
  });

  const [tokens, setTokens] = useState<Token[]>([]);
  const { data: myWishlist, refetch: refetchMyWishlist } = useQuery({
    queryKey: ["myWishlist"],
    queryFn: getMyWishlist,
    refetchOnMount: true,
  });
  const [searchResults, setSearchResults] = useState<Token[]>([]);

  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  // Update tokens when topCoins or newCoins data changes
  useEffect(() => {
    if (activeTab === '1' && topCoins && topCoins.length > 0) {
      const transformedTokens = topCoins.map((token: any) => ({
        ...token,
        logoUrl: token.logo_url || token.logo_uri || "/token-placeholder.png"
      }));
      setTokens(transformedTokens);
    } else if (activeTab === '2' && newCoins && newCoins.length > 0) {
      const transformedTokens = newCoins.map((token: any) => ({
        ...token,
        logoUrl: token.logo_url || token.logo_uri || "/token-placeholder.png"
      }));
      setTokens(transformedTokens);
    }
  }, [topCoins, newCoins, activeTab]);

  // Effect to handle search when debounced value changes
  useEffect(() => {
    const searchData = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        setCurrentPage(1);
        setTotalPages(1);
        return;
      }
      setIsSearching(true);
      try {
        const res = await SolonaTokenService.getSearchTokenInfor(
          debouncedSearchQuery,
          currentPage,
          18
        );
        setActiveTab("all");
        setSearchResults(res.tokens || []);
        setTotalPages(Math.ceil(res.total / 18));
      } catch (error) {
        console.error("Error searching tokens:", error);
        setSearchResults([]);
        setTotalPages(1);
      } finally {
        setIsSearching(false);
      }
    };

    searchData();
  }, [debouncedSearchQuery, currentPage]);

  // Use search results if available, otherwise use tokens data
  const displayTokens = debouncedSearchQuery.trim() ? searchResults : tokens;
  console.log("displayTokens", displayTokens)
  const handleCopyAddress = (address: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setToastMessage("Đã sao chép địa chỉ ví vào clipboard");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortType(sortType === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortType("desc");
    }
  };

  const toggleRow = (address: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [address]: !prev[address]
    }));
  };

  console.log("activeTab", activeTab)
  return (
    <div className="z-1">
      {showToast && (
        <ToastNotification
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
      <Card className="mb-6 border-none shadow-none bg-transparent">
       
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-wrap gap-4 mb-4">
            <button 
              className={`rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer transition-all ${activeTab === '1' ? 'bg-[#0F0F0F]' : 'border-transparent hover:bg-[#0F0F0F]/50'}`} 
              onClick={() => setActiveTab('1')}
            >
              <span className={`${activeTab === '1' ? 'gradient-hover' : ''}`}>Trending</span>
            </button>
            <button 
              className={`rounded-sm text-neutral-400 text-sm font-medium px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer transition-all ${activeTab === '2' ? 'bg-[#0F0F0F]' : 'border-transparent hover:bg-[#0F0F0F]/50'}`} 
              onClick={() => setActiveTab('2')}
            >
              <span className={`${activeTab === '2' ? 'gradient-hover' : ''}`}>New</span>
            </button>
          </div>

          <TabsContent value="1">
            {displayTokens && (
              <CardContent className="w-full p-0">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <TableTokenList
                    tokens={displayTokens}
                    onCopyAddress={handleCopyAddress}
                    onStarClick={(token) => {
                      const data = {
                        token_address: token.address,
                        status: myWishlist?.tokens?.some((t: { address: string }) => t.address === token.address) ? "off" : "on",
                      };
                      SolonaTokenService.toggleWishlist(data).then(() => {
                        refetchMyWishlist();
                        setToastMessage("Thêm vào danh sách token yêu thích thành công");
                        setShowToast(true);
                        setTimeout(() => {
                          setShowToast(false);
                        }, 3000);
                      }).catch(() => {
                        setToastMessage("Thêm vào danh sách token yêu thích thất bại");
                        setShowToast(true);
                        setTimeout(() => {
                          setShowToast(false);
                        }, 3000);
                      });
                    }}
                    isFavoritesTab={false}
                    isLoading={isLoadingTopCoins}
                    sortBy={sortBy}
                    sortType={sortType}
                    onSort={handleSort}
                    enableSort={!debouncedSearchQuery.trim()}
                  />
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {displayTokens.map((token) => {
                    return (
                    <div 
                      key={token.address}
                      className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={token.logo_uri || "/placeholder.png"} 
                            alt={token.symbol} 
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-sm">{token.symbol}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[10ch] truncate">{token.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/trading?address=${token.address}`)}
                            className="linear-gradient-light dark:linear-gradient-connect text-black dark:text-neutral-100 font-medium px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap"
                          >
                            Trade
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyAddress(token.address, e);
                            }}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => toggleRow(token.address)}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                          >
                            {expandedRows[token.address] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex gap-2 items-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
                          <div className="font-medium text-sm">${formatNumberWithSuffix3(token.price || 0)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400">24h Change</div>
                          <div className={`font-medium text-sm ${(token.priceChange24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {(token.priceChange24h ?? 0) >= 0 ? '+' : ''}{token.priceChange24h ?? 0}%
                          </div>
                        </div>
                      </div>

                      {expandedRows[token.address] && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-800">
                          <div className="grid grid-cols-2 gap-4 gap-y-2">
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Market Cap</div>
                              <div className="font-medium text-sm">${formatNumberWithSuffix3(token.marketCap || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Volume 24h</div>
                              <div className="font-medium text-sm">${formatNumberWithSuffix3(token.volume24h || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Holders</div>
                              <div className="font-medium text-sm">{formatNumberWithSuffix3(token.holder || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Address</div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-sm">{truncateString(token.address, 6)}</span>
                                <button
                                  onClick={(e) => handleCopyAddress(token.address, e)}
                                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                  })}
                </div>
              </CardContent>
            )}
          </TabsContent>

          <TabsContent value="2">
            {displayTokens && (
              <CardContent className="w-full p-0 md:p-6">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <TableTokenList
                    tokens={displayTokens}
                    onCopyAddress={handleCopyAddress}
                    onStarClick={(token) => {
                      const data = {
                        token_address: token.address,
                        status: myWishlist?.tokens?.some((t: { address: string }) => t.address === token.address) ? "off" : "on",
                      };
                      SolonaTokenService.toggleWishlist(data).then(() => {
                        refetchMyWishlist();
                        setToastMessage("Thêm vào danh sách token yêu thích thành công");
                        setShowToast(true);
                        setTimeout(() => {
                          setShowToast(false);
                        }, 3000);
                      }).catch(() => {
                        setToastMessage("Thêm vào danh sách token yêu thích thất bại");
                        setShowToast(true);
                        setTimeout(() => {
                          setShowToast(false);
                        }, 3000);
                      });
                    }}
                    isFavoritesTab={false}
                    isLoading={isLoadingNewCoins}
                    sortBy={sortBy}
                    sortType={sortType}
                    onSort={handleSort}
                    enableSort={!debouncedSearchQuery.trim()}
                  />
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {displayTokens.map((token) => (
                    <div 
                      key={token.address}
                      className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={token.logo_uri || "/token-placeholder.png"} 
                            alt={token.symbol} 
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-sm">{token.symbol}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[10ch] truncate">{token.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/trading?address=${token.address}`)}
                            className="linear-gradient-light dark:linear-gradient-connect text-black dark:text-neutral-100 font-medium px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap"
                          >
                            Trade
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyAddress(token.address, e);
                            }}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => toggleRow(token.address)}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                          >
                            {expandedRows[token.address] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex gap-2 items-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
                          <div className="font-medium text-sm">${formatNumberWithSuffix3(token.price || 0)}</div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">24h Change</div>
                          <div className={`font-medium text-sm ${(token.priceChange24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {(token.priceChange24h ?? 0) >= 0 ? '+' : ''}{token.priceChange24h ?? 0}%
                          </div>
                        </div>
                      </div>

                      {expandedRows[token.address] && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-800">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Market Cap</div>
                              <div className="font-medium text-sm">${formatNumberWithSuffix3(token.marketCap || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Volume 24h</div>
                              <div className="font-medium text-sm">${formatNumberWithSuffix3(token.volume24h || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Holders</div>
                              <div className="font-medium text-sm">{formatNumberWithSuffix3(token.holder || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Address</div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-sm">{truncateString(token.address, 6)}</span>
                                <button
                                  onClick={(e) => handleCopyAddress(token.address, e)}
                                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </TabsContent>

      
        </Tabs>
        {debouncedSearchQuery.trim() &&
          totalPages > 1 &&
          activeTab === "all" && (
            <div className="flex justify-center mt-6 pb-6">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-2 md:px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  «
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 md:px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  ‹
                </button>

                {/* Show fewer page numbers on mobile */}
                <div className="hidden md:flex items-center gap-2">
                  {currentPage > 2 && (
                    <button
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 text-sm"
                    >
                      1
                    </button>
                  )}
                  {currentPage > 3 && <span className="px-2">...</span>}

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return page;
                  }).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                  {currentPage < totalPages - 1 && (
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 text-sm"
                    >
                      {totalPages}
                    </button>
                  )}
                </div>

                {/* Mobile pagination - show current page and total */}
                <div className="md:hidden flex items-center gap-2">
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 md:px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  ›
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 md:px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  »
                </button>
              </div>
            </div>
          )}
      </Card>
    </div>
  );
}
