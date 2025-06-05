"use client"

import { getHolders, getOrderHistories, getOrderMyHistories } from "@/services/api/OnChainService"
import { getInforWallet } from "@/services/api/TelegramWalletService"
import { formatNumberWithSuffix, truncateString } from "@/utils/format"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useState, Suspense, useEffect, useMemo } from "react"
import { io as socketIO } from "socket.io-client"
import { useLang } from "@/lang/useLang"
import { getTokenInforByAddress } from "@/services/api/SolonaTokenService"

type Transaction = {
  time: string
  type: "BUY" | "SELL"
  price: string
  amount: string
  total: string
  source: string
  hash: string
  status: "COMPLETED" | "PENDING" | "FAILED"
  address: string
}

export default function TransactionHistory() {
  return (
    <Suspense fallback={<div></div>}>
      <TransactionHistoryContent />
    </Suspense>
  )
}

function TransactionHistoryContent() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<"all" | "my" | "holder">("all")
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realTimeTransactions, setRealTimeTransactions] = useState<any[]>([]);
  const [realTimeTransactionsMy, setRealTimeTransactionsMy] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const address = searchParams?.get("address");

  const { data: tokenInfor } = useQuery({
    queryKey: ["token-infor", address],
    queryFn: () => getTokenInforByAddress(address),
  });
  const { data: orderHistories, isLoading: isLoadingOrderHistories, refetch: refetchOrderHistories } = useQuery(
    {
      queryKey: ["orderHistories", address],
      queryFn: () =>
        getOrderHistories({
          address: address || "",
          offset: 0,
          limit: 100,
          sort_by: "block_unix_time",
          sort_type: "desc",
          tx_type: "swap",
        }),
      enabled: !!address,
    }
  );
  const { data: walletInfor, refetch } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
  });

  const { data: holders, refetch: refetchHolders } = useQuery({
    queryKey: ["holders", address],
    queryFn: () => getHolders(address || ""),
    enabled: !!address,
  });

  const { data: orderMyHistories, refetch: refetchOrderMyHistories } = useQuery({
    queryKey: ["orderMyHistories", address],
    queryFn: () => getOrderMyHistories(String(address), String(walletInfor?.solana_address)),
    enabled: !!walletInfor,
  });

  // WebSocket connection setup
  useEffect(() => {
    if (typeof window === 'undefined' || !address) return;

    const socketInstance = socketIO(`${process.env.NEXT_PUBLIC_API_URL}/token-txs`, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError(null);
      socketInstance.emit('subscribe', { tokenAddress: address });
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      setError(error.message);
    });

    socketInstance.on('transaction', (transaction: any) => {
      if (transaction?.wallet === walletInfor?.solana_address) {
        setRealTimeTransactionsMy((prev) => [transaction, ...prev].slice(0, 50));
      }
      setRealTimeTransactions((prev) => [transaction, ...prev].slice(0, 50));
    });


    socketInstance.on('subscribed', (data) => {
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.emit('unsubscribe', { tokenAddress: address });
        socketInstance.disconnect();
      }
    };
  }, [address]);

  // Add effect to handle address changes
  useEffect(() => {
    // Reset realtime transactions when address changes
    setRealTimeTransactions([]);

    // Refetch both queries when address changes
    if (address) {
      refetchOrderHistories();
      if (walletInfor?.solana_address) {
        refetchOrderMyHistories();
      }
    }
  }, [address, walletInfor?.solana_address, refetchOrderHistories, refetchOrderMyHistories]);

  // Add state to store combined my transactions
  const [combinedMyTransactions, setCombinedMyTransactions] = useState<any[]>([]);
  // Effect to handle updating my transactions when orderHistories changes
  useEffect(() => {
    if (!orderHistories || !walletInfor?.solana_address) return;

    // Filter new transactions for my wallet
    const newMyTransactions = orderHistories.filter((item: any) => {
      // Log each item's wallet for debugging
      return item.wallet === walletInfor.solana_address;
    });

    // Combine with existing orderMyHistories and remove duplicates
    const existingTransactions = orderMyHistories || [];

    // Sort both arrays by time before combining to ensure proper order
    const sortByTime = (a: any, b: any) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA; // Descending order (newest first)
    };

    const sortedExisting = [...existingTransactions].sort(sortByTime);
    const sortedNew = [...newMyTransactions].sort(sortByTime);

    // Combine sorted arrays
    const allTransactions = [...sortedNew, ...sortedExisting];
    console.log("allTransactions", allTransactions);
    // Remove duplicates based on transaction hash (tx)
    const uniqueTransactions = allTransactions.reduce((acc: any[], current: any) => {
      const exists = acc.find(item => item.tx === current.tx);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Final sort to ensure proper time order
    const finalSortedTransactions = uniqueTransactions.sort(sortByTime);

    setCombinedMyTransactions(finalSortedTransactions);
  }, [orderHistories, orderMyHistories, walletInfor?.solana_address]);


  // Get the first transaction price
  const lastTransactionPrice = orderHistories && orderHistories.length > 0
    ? orderHistories[0]?.token?.from?.price?.usd
    : undefined;

  // Dispatch event when lastTransactionPrice changes
  useEffect(() => {
    if (typeof window !== 'undefined' && lastTransactionPrice !== undefined) {
      const event = new CustomEvent('lastTransactionPriceUpdate', {
        detail: {
          price: lastTransactionPrice,
          tokenAddress: address
        }
      });
      window.dispatchEvent(event);
    }
  }, [lastTransactionPrice, address]);

  // Combine historical and real-time transactions with proper sorting and deduplication
  const allTransactions = useMemo(() => {
    const combined = [
      ...(realTimeTransactions || []),
      ...(orderHistories || [])
    ];

    // Remove duplicates based on transaction hash (tx)
    const uniqueTransactions = combined.reduce((acc: any[], current: any) => {
      const exists = acc.find(item => item.tx === current.tx);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Sort by time in descending order
    return uniqueTransactions.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA;
    });
  }, [realTimeTransactions, orderHistories]);

  const allTransactionsMy = useMemo(() => {
    const combined = [
      ...(realTimeTransactionsMy || []),
      ...(orderMyHistories || [])
    ];

    // Remove duplicates based on transaction hash (tx)
    const uniqueTransactions = combined.reduce((acc: any[], current: any) => {
      const exists = acc.find(item => item.tx === current.tx);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Sort by time in descending order
    return uniqueTransactions.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA;
    });
  }, [realTimeTransactionsMy, orderMyHistories]);

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '0.0';
    return price?.toFixed(6);
  };

  const renderTransactionCard = (order: any, index: number) => {
    const { t } = useLang();
    return (
      <div key={index} className={`p-3 border-b border-theme-neutral-800/40 dark:border-neutral-800/50 hover:bg-gray-50 dark:hover:bg-neutral-800/30 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-[#1A1A1A]' : 'bg-white dark:bg-[#0F0F0F]'}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded ${order.type === "buy" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
              {order.type === "buy" ? t("transactionHistory.buy") : t("transactionHistory.sell")}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-neutral-400">
              {new Date(order.time).toLocaleString()}
            </span>
          </div>
          <span className={`text-xs font-medium ${order.type === "buy" ? "text-green-400 dark:text-green-300" : "text-pink-500 dark:text-pink-400"}`}>
            ${formatPrice(order.priceUsd)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500 dark:text-neutral-400">{t("transactionHistory.amount")}:</span>
            <span className="ml-1 text-gray-700 dark:text-neutral-200">{formatNumberWithSuffix(order.amount)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-neutral-400">{t("transactionHistory.total")}:</span>
            <span className={`ml-1 ${order.type === "buy" ? "text-green-400 dark:text-green-300" : "text-pink-500 dark:text-pink-400"}`}>${(order.priceUsd * order.amount).toFixed(6)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-neutral-400">{t("transactionHistory.source")}:</span>
            <span className="ml-1 text-gray-700 dark:text-neutral-200">{order.program}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-neutral-400">{t("transactionHistory.status")}:</span>
            <span className="ml-1 text-green-500 dark:text-green-400">{t("transactionHistory.completed")}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs">
          <div className="flex items-center text-gray-500 dark:text-neutral-400">
            <span className="mr-1">{t("transactionHistory.transactionHash")}:</span>
            <span className="text-gray-700 text-[10px] dark:text-neutral-200 truncate max-w-[120px]">{order.tx}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-neutral-400">
            <span className="mr-1">{t("transactionHistory.address")}:</span>
            <span className="text-[#FFB300] dark:text-[#FFB300]">{truncateString(order.wallet, 9)}</span>
            <button className="ml-1 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAllTransactionsTable = () => {
    const { t } = useLang();
    return (
      <>
        {/* Desktop view */}
        <div className="hidden md:block">
          <table className="w-full text-sm table-fixed">
            <thead className="sticky top-0 z-10 bg-white dark:bg-[#0F0F0F]">
              <tr className="border-b border-gray-200 dark:border-neutral-800">
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[15%]">{t("transactionHistory.time")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[8%]">{t("transactionHistory.type")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[10%]">{t("transactionHistory.price")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[8%]">{t("transactionHistory.amount")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[10%]">{t("transactionHistory.total")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[8%]">{t("transactionHistory.source")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[15%]">{t("transactionHistory.transactionHash")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[10%]">{t("transactionHistory.status")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[16%]">{t("transactionHistory.address")}</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions?.map((order: any, index: number) => (
                <tr key={index} className={`hover:bg-gray-100 dark:hover:bg-neutral-800/30 border-b border-gray-100 dark:border-neutral-800/50 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-[#1A1A1A]' : 'bg-white dark:bg-[#0F0F0F]'}`}>
                  <td className="px-4 py-2 truncate text-gray-600 dark:text-neutral-300">
                    {new Date(order.time).toLocaleString()}
                  </td>
                  <td className={`px-4 text-xs py-2 font-medium truncate ${order.type === "buy" ? "text-green-600 dark:text-green-500 uppercase" : "text-red-600 dark:text-red-500 uppercase"}`}>
                    {order.type === "buy" ? t("transactionHistory.buy") : t("transactionHistory.sell")}
                  </td>
                  <td className={`px-4 text-xs py-2 font-medium truncate ${order.type === "buy" ? "text-green-400 dark:text-green-300" : "text-pink-500 dark:text-pink-400"}`}>
                    ${formatPrice(order.priceUsd)}
                  </td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">
                    {formatNumberWithSuffix(order.amount)}
                  </td>
                  <td className={`px-4 text-xs py-2 font-medium truncate ${order.type === "buy" ? "text-green-400 dark:text-green-300" : "text-pink-500 dark:text-pink-400"}`}>
                    ${(order.priceUsd * order.amount).toFixed(6)}
                  </td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">
                    {order.program}
                  </td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">
                    {order.tx}
                  </td>
                  <td className="px-4 text-green-500 dark:text-green-400 text-xs py-2 font-medium truncate">
                    {t("transactionHistory.completed")}
                  </td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium flex items-center truncate">
                    <span className="text-[#FFB300] dark:text-[#FFB300]">{truncateString(order.wallet, 9)}</span>
                    <button className="ml-1 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          {allTransactions?.map((order: any, index: number) => renderTransactionCard(order, index))}
        </div>
      </>
    );
  };

  const renderMyTransactionsTable = () => {
    const { t } = useLang();
    return (
      <>
        {/* Desktop view */}
        <div className="hidden md:block">
          <table className="w-full text-sm table-fixed">
            <thead className="sticky top-0 z-10 bg-white dark:bg-[#0F0F0F]">
              <tr className="border-b border-gray-200 dark:border-neutral-800">
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[15%]">{t("transactionHistory.time")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[8%]">{t("transactionHistory.type")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[10%]">{t("transactionHistory.price")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[8%]">{t("transactionHistory.amount")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[10%]">{t("transactionHistory.total")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[8%]">{t("transactionHistory.source")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[15%]">{t("transactionHistory.transactionHash")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[10%]">{t("transactionHistory.status")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[16%]">{t("transactionHistory.address")}</th>
              </tr>
            </thead>
            <tbody>
              {allTransactionsMy?.map((order: any, index: number) => (
                <tr key={index} className={`hover:bg-gray-100 dark:hover:bg-neutral-800/30 border-b border-gray-100 dark:border-neutral-800/50 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-[#1A1A1A]' : 'bg-white dark:bg-[#0F0F0F]'}`}>
                  <td className="px-4 py-2 truncate text-gray-600 dark:text-neutral-300">
                    {new Date(order.time).toLocaleString()}
                  </td>
                  <td className={`px-4 text-xs py-2 font-medium truncate ${order.type === "buy" ? "text-green-600 dark:text-green-500 uppercase" : "text-red-600 dark:text-red-500 uppercase"}`}>
                    {order.type === "buy" ? t("transactionHistory.buy") : t("transactionHistory.sell")}
                  </td>
                  <td className={`px-4 text-xs py-2 font-medium truncate ${order.type === "buy" ? "text-green-400 dark:text-green-300" : "text-pink-500 dark:text-pink-400"}`}>
                    ${formatPrice(order.priceUsd)}
                  </td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">
                    {formatNumberWithSuffix(order.amount)}
                  </td>
                  <td className={`px-4 text-xs py-2 font-medium truncate ${order.type === "buy" ? "text-green-400 dark:text-green-300" : "text-pink-500 dark:text-pink-400"}`}>
                    ${(order.priceUsd * order.amount).toFixed(6)}
                  </td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">
                    {order.program}
                  </td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">
                    {order.tx}
                  </td>
                  <td className="px-4 text-green-500 dark:text-green-400 text-xs py-2 font-medium truncate">
                    {t("transactionHistory.completed")}
                  </td>
                  <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium flex items-center truncate">
                    <span className="text-[#FFB300] dark:text-[#FFB300]">{truncateString(order.wallet, 9)}</span>
                    <button className="ml-1 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          {allTransactionsMy?.map((order: any, index: number) => renderTransactionCard(order, index))}
        </div>
      </>
    );
  };

  const renderHoldersTable = () => {
    const { t } = useLang();
    const marketCap = tokenInfor?.marketCap || 0;

    return (
      <>
        {/* Desktop view */}
        <div className="hidden md:block">
          <table className="w-full text-sm table-fixed">
            <thead className="sticky top-0 z-10 bg-white dark:bg-[#0F0F0F]">
              <tr className="border-b border-gray-200 dark:border-neutral-800">
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[20%]">{t("transactionHistory.address")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[12%]">{t("transactionHistory.amount")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[12%]">{t("transactionHistory.quoteValue")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[12%]">{t("transactionHistory.usdValue")}</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-200 font-medium w-[12%]">{t("transactionHistory.ownerPercentage")}</th>
              </tr>
            </thead>
            <tbody>
              {holders?.accounts.map((holder: any, index: number) => {
                return (
                  <tr key={index} className={`hover:bg-gray-100 dark:hover:bg-neutral-800/30 border-b border-gray-100 dark:border-neutral-800/50 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-[#1A1A1A]' : 'bg-white dark:bg-[#0F0F0F]'}`}>
                    <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium flex items-center truncate">
                      <span className="text-[#FFB300] dark:text-[#FFB300]">{truncateString(holder.wallet, 9)}</span>
                      <button className="ml-1 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">
                      {formatNumberWithSuffix(holder.amount)}
                    </td>
                    <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">
                      {formatNumberWithSuffix(holder.value.quote)} SOL
                    </td>
                    <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">
                      ${formatNumberWithSuffix(holder.value.usd)}
                    </td>
                    <td className="px-4 text-gray-600 dark:text-neutral-300 text-xs py-2 font-medium truncate">
                      {holder.percentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          {holders?.accounts.map((holder: any, index: number) => {
            const ownerPercentage = marketCap > 0 ? (holder.value.usd / marketCap) * 100 : 0;
            return (
              <div key={index} className={`p-3 border-b border-theme-neutral-800/40 dark:border-neutral-800/50 hover:bg-gray-50 dark:hover:bg-neutral-800/30 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-[#1A1A1A]' : 'bg-white dark:bg-[#0F0F0F]'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                      {truncateString(holder.wallet, 9)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                   
                    <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                      {t("transactionHistory.ownerPercentage")}: {ownerPercentage.toFixed(4)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-neutral-400">{t("transactionHistory.amount")}:</span>
                    <span className="ml-1 text-gray-700 dark:text-neutral-200">{formatNumberWithSuffix(holder.amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-neutral-400">{t("transactionHistory.quoteValue")}:</span>
                    <span className="ml-1 text-gray-700 dark:text-neutral-200">${formatNumberWithSuffix(holder.value.quote)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-neutral-400">{t("transactionHistory.usdValue")}:</span>
                    <span className="ml-1 text-gray-700 dark:text-neutral-200">${formatNumberWithSuffix(holder.value.usd)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="shadow-inset dark:bg-theme-neutral-1000 rounded-xl p-2 sm:p-3 lg:overflow-hidden bg-white dark:bg-neutral-1000 flex flex-col h-full w-full">
      <div className="flex border-gray-200 dark:border-neutral-800 h-[30px] bg-gray-100  rounded-full dark:bg-[#333]">
        <button
          className={`flex-1 rounded-full text-xs sm:text-sm cursor-pointer font-medium uppercase text-center ${activeTab === "all" ? "bg-blue-500 text-white dark:linear-gradient-connect" : "text-gray-500 dark:text-neutral-400"}`}
          onClick={() => setActiveTab("all")}
        >
          {t("transactionHistory.allTransactions")}
        </button>
        <button
          className={`flex-1 rounded-full cursor-pointer text-xs sm:text-sm font-medium uppercase text-center ${activeTab === "my" ? "bg-blue-500 text-white dark:linear-gradient-connect" : "text-gray-500 dark:text-neutral-400"}`}
          onClick={() => setActiveTab("my")}
        >
          {t("transactionHistory.myTransactions")}
        </button>
        <button
          className={`flex-1 rounded-full cursor-pointer text-xs sm:text-sm font-medium uppercase text-center ${activeTab === "holder" ? "bg-blue-500 text-white dark:linear-gradient-connect" : "text-gray-500 dark:text-neutral-400"}`}
          onClick={() => setActiveTab("holder")}
        >
          {t("transactionHistory.holders")}
        </button>
      </div>

      <div className="mt-2 sm:mt-3 bg-gray-50 dark:bg-[#0F0F0F] rounded-xl relative flex-1 flex flex-col min-h-0">
        <div className="flex-1 lg:overflow-auto">
          {activeTab === "all" ? renderAllTransactionsTable() : 
           activeTab === "my" ? renderMyTransactionsTable() : 
           renderHoldersTable()}
        </div>
      </div>
    </div>
  )
}
