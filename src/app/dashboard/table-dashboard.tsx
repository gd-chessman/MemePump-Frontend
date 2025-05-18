"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { useLang } from "@/lang";
import { useRouter } from "next/navigation";
import { Search, Loader2, Copy, Star, BarChart4 } from "lucide-react";
import { Input } from "@/ui/input";
import { useState, useEffect } from "react";
import { useWsSubscribeTokens } from "@/hooks/useWsSubscribeTokens";
import { SolonaTokenService } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";
import { truncateString } from "@/utils/format";
import { ToastNotification } from "@/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { TableTokenList } from "@/app/components/trading/TableTokenList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import LogWarring from "@/ui/log-warring";
import { getMyWishlist } from "@/services/api/SolonaTokenService";
import { useQuery } from "@tanstack/react-query";
import { getTopCoins } from "@/services/api/OnChainService";

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
  const [sortBy, setSortBy] = useState("volume_1h_usd");
  const [sortType, setSortType] = useState("desc");
  const { data: topCoins, isLoading: isLoadingTopCoins } = useQuery({
    queryKey: ["topCoins", sortBy, sortType],
    queryFn: () => getTopCoins({ sort_by: sortBy, sort_type: sortType, offset: 3, limit: 50 }),
    refetchInterval: 10000,
  });
  const [tokens, setTokens] = useState<
    {
      id: number;
      name: string;
      symbol: string;
      address: string;
      decimals: number;
      logoUrl: string;
      coingeckoId: string | null;
      tradingviewSymbol: string | null;
      isVerified: boolean;
      marketCap: number;
      isFavorite?: boolean;
      liquidity: any;
      holder: number;
    }[]
  >([]);
  const { data: myWishlist, refetch: refetchMyWishlist } = useQuery({
    queryKey: ["myWishlist"],
    queryFn: getMyWishlist,
    refetchOnMount: true,
  });
  const [searchResults, setSearchResults] = useState<
    {
      id: number;
      name: string;
      symbol: string;
      address: string;
      decimals: number;
      logoUrl: string;
      coingeckoId: string | null;
      tradingviewSymbol: string | null;
      isVerified: boolean;
      marketCap: number;
      isFavorite?: boolean;
      liquidity: any;
      holder: number;
    }[]
  >([]);

  // Update tokens when topCoins data changes
  useEffect(() => {
    if (topCoins && topCoins.length > 0) {
      setTokens(topCoins);
    }
  }, [topCoins]);

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

  // Use search results if available, otherwise use topCoins data
  const displayTokens = debouncedSearchQuery.trim() ? searchResults : tokens;

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

  const handleStarClick = async (token: any) => {
    try {
      const data = {
        token_address: token.address,
        status: token.status ? "off" : "on",
      };
      const response = await SolonaTokenService.toggleWishlist(data);
      if (response) {
        setToastMessage(t("trading.wishlistUpdated"));
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
        // Refresh wishlist using refetch
        refetchMyWishlist();
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      setToastMessage(t("trading.wishlistError"));
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortType(sortType === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortType("desc");
    }
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
          {/* <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="all">{t("trading.tabs.topCoins")}</TabsTrigger>
            <TabsTrigger value="favorites">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                {t("trading.tabs.favorites")}
                <span className="ml-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                  {myWishlist?.total || 0}
                </span>
              </div>
            </TabsTrigger>
          </TabsList> */}
           <div className="flex gap-6 mb-4">
                <button className={` rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeTab === '1' ? ' bg-[#0F0F0F]' : 'border-transparent'}`} onClick={() => setActiveTab('1')}>
                    <span className={`${activeTab === '1' ? 'gradient-hover ' : ''}`}>All token markets</span>
                </button>
                <button className={`rounded-sm text-neutral-400 text-sm font-medium px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeTab === '2' ? ' bg-[#0F0F0F]' : 'border-transparent'}`} onClick={() => setActiveTab('2')}>
                    <span className={`${activeTab === '2' ? 'gradient-hover' : ''}`}>New & trending</span>
                </button>
                <button className={`rounded-sm text-neutral-400 text-sm font-medium px-2 py-1 border-1 z-10 border-solid border-theme-primary-300  cursor-pointer ${activeTab === '3' ? ' bg-[#0F0F0F]' : 'border-transparent'}`} onClick={() => setActiveTab('3')}>
                    <span className={`${activeTab === '3' ? 'gradient-hover' : ''}`}>Meme</span>
                </button>
            </div>

          <TabsContent value="1">
            {displayTokens && (
              <CardContent className="w-full ">
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
              </CardContent>
            )}
          </TabsContent>

      
        </Tabs>
        {debouncedSearchQuery.trim() &&
          totalPages > 1 &&
          activeTab === "all" && (
            <div className="flex justify-center mt-6 pb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  «
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>

                {currentPage > 2 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80"
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
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {currentPage < totalPages - 2 && (
                  <span className="px-2">...</span>
                )}
                {currentPage < totalPages - 1 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80"
                  >
                    {totalPages}
                  </button>
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
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
