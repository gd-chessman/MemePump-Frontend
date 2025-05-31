"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { useLang } from "@/lang";
import { useRouter } from "next/navigation";
import { Search, Loader2, Copy, Star, BarChart4, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { SolonaTokenService } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";
import { truncateString } from "@/utils/format";
import notify from "@/app/components/notify";
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
  logoUrl?: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("1");
  const [sortBy, setSortBy] = useState("volume_24h_usd");
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
    } else if (activeTab === '3' && myWishlist?.tokens && myWishlist.tokens.length > 0) {
      const transformedTokens = myWishlist.tokens.map((token: any) => ({
        ...token,
        logoUrl: token.logoUrl,
        isFavorite: true
      }));
      setTokens(transformedTokens);
    }
  }, [topCoins, newCoins, myWishlist, activeTab]);

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
  const handleCopyAddress = (address: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    notify({ message: t('tableDashboard.toast.addressCopied'), type: 'success' });
  };
  const handleStarClick = (token: Token) => {
    const data = {
      token_address: token.address,
      status: myWishlist?.tokens?.some((t: { address: string }) => t.address === token.address) ? "off" : "on",
    };
    SolonaTokenService.toggleWishlist(data).then(() => {
      refetchMyWishlist();
      notify({ message: t("tableDashboard.toast.addWishlistSuccess"), type: 'success' });
    }).catch(() => {
      notify({ message: t("tableDashboard.toast.addWishlistFailed"), type: 'error' });
    });
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

  return (
    <div className="z-20">
      <Card className="mb-6 border-none shadow-none bg-transparent">
       
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-wrap gap-4 mb-4">
            <button 
              className={`rounded-sm text-sm font-medium  px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer transition-all ${activeTab === '1' ? 'dark:bg-theme-black-100 bg-theme-blue-100 text-neutral-100' : 'border-transparent hover:dark:bg-theme-black-100/50'}`} 
              onClick={() => setActiveTab('1')}
            >
              <span className={`${activeTab === '1' ? 'dark:gradient-hover' : ''}`}>{t('tableDashboard.tabs.trending')}</span>
            </button>
            <button
              className={`rounded-sm  text-sm font-medium px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer transition-all ${activeTab === '2' ? 'dark:bg-theme-black-100 bg-theme-blue-100 text-neutral-100' : 'border-transparent hover:dark:bg-theme-black-100/50'}`} 
              onClick={() => setActiveTab('2')}
            >
              <span className={`${activeTab === '2' ? 'dark:gradient-hover' : ''}`}>{t('tableDashboard.tabs.new')}</span>
            </button>
            <button
              className={`rounded-sm  text-sm font-medium px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer transition-all ${activeTab === '3' ? 'dark:bg-theme-black-100 bg-theme-blue-100 text-neutral-100' : 'border-transparent hover:dark:bg-theme-black-100/50'}`} 
              onClick={() => setActiveTab('3')}
            >
              <span className={`${activeTab === '3' ? 'dark:gradient-hover' : ''}`}>{t('tableDashboard.tabs.favorite')}</span>
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
                    onStarClick={handleStarClick}
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
                      className="bg-white dark:bg-neutral-900  rounded-lg p-4 border border-gray-200 dark:border-neutral-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={token.logoUrl || token.logo_uri || "/token-placeholder.png"} 
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
                            className="bg-gradient-to-t dark:bg-gradient-to-t dark:from-theme-primary-500 dark:to-theme-secondary-400 text-sm linear-gradient-blue text-theme-neutral-100 dark:text-neutral-100 font-medium px-3 md:px-4 py-[6px] rounded-full transition-colors whitespace-nowrap"
                          >
                            {t('trading.trade')}
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
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.price')}</div>
                          <div className="font-medium text-sm">${formatNumberWithSuffix3(token.price || 0)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.24hChange')}</div>
                          <div className={`font-medium text-sm ${(token.priceChange24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {(token.priceChange24h ?? 0) >= 0 ? '+' : ''}{token.priceChange24h ?? 0}%
                          </div>
                        </div>
                      </div>

                      {expandedRows[token.address] && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-800">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.marketCap')}</div>
                              <div className="font-medium text-sm">${formatNumberWithSuffix3(token.marketCap || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.holders')}</div>
                              <div className="font-medium text-sm">{formatNumberWithSuffix3(token.holder || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.address')}</div>
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
              <CardContent className="w-full">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <TableTokenList
                    tokens={displayTokens}
                    onCopyAddress={handleCopyAddress}
                    onStarClick={handleStarClick}
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
                            src={token.logoUrl || token.logo_uri || "/token-placeholder.png"} 
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
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.price')}</div>
                          <div className="font-medium text-sm">${formatNumberWithSuffix3(token.price || 0)}</div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.24hChange')}</div>
                          <div className={`font-medium text-sm ${(token.priceChange24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {(token.priceChange24h ?? 0) >= 0 ? '+' : ''}{token.priceChange24h ?? 0}%
                          </div>
                        </div>
                      </div>

                      {expandedRows[token.address] && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-800">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.marketCap')}</div>
                              <div className="font-medium text-sm">${formatNumberWithSuffix3(token.marketCap || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.holders')}</div>
                              <div className="font-medium text-sm">{formatNumberWithSuffix3(token.holder || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.address')}</div>
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

          <TabsContent value="3">
            {displayTokens && (
              <CardContent className="w-full p-0">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <TableTokenList
                    tokens={displayTokens}
                    onCopyAddress={handleCopyAddress}
                    onStarClick={handleStarClick}
                    isFavoritesTab={true}
                    isLoading={false}
                    sortBy={sortBy}
                    sortType={sortType}
                    onSort={handleSort}
                    enableSort={!debouncedSearchQuery.trim()}
                  />
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {displayTokens.map((token) => {
                    console.log("token", token.logoUrl)
                    return(
                    <div 
                      key={token.address}
                      className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={token.logoUrl || token.logo_uri || "/token-placeholder.png"} 
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
                            className="bg-gradient-to-t dark:bg-gradient-to-t dark:from-theme-primary-500 dark:to-theme-secondary-400 text-sm linear-gradient-blue text-theme-neutral-100 dark:text-neutral-100 font-medium px-3 md:px-4 py-[6px] rounded-full transition-colors whitespace-nowrap"
                          >
                            {t('trading.trade')}
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
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.price')}</div>
                          <div className="font-medium text-sm">${formatNumberWithSuffix3(token.price || 0)}</div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.24hChange')}</div>
                          <div className={`font-medium text-sm ${(token.priceChange24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {(token.priceChange24h ?? 0) >= 0 ? '+' : ''}{token.priceChange24h ?? 0}%
                          </div>
                        </div>
                      </div>

                      {expandedRows[token.address] && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-800">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.marketCap')}</div>
                              <div className="font-medium text-sm">${formatNumberWithSuffix3(token.marketCap || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.holders')}</div>
                              <div className="font-medium text-sm">{formatNumberWithSuffix3(token.holder || 0)}</div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{t('tableDashboard.mobile.address')}</div>
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
                  {t('tableDashboard.pagination.first')}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 md:px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {t('tableDashboard.pagination.previous')}
                </button>

                {/* Mobile pagination */}
                <div className="md:hidden flex items-center gap-2">
                  <span className="text-sm">
                    {t('tableDashboard.pagination.page')} {currentPage} {t('tableDashboard.pagination.of')} {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 md:px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {t('tableDashboard.pagination.next')}
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 md:px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {t('tableDashboard.pagination.last')}
                </button>
              </div>
            </div>
          )}
      </Card>
    </div>
  );
}
