"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getMyConnects } from "@/services/api/MasterTradingService"
import ChatTrading from "./chat"
import { MasterTradeChatProps } from "./types"
import { SearchBar } from "./components/SearchBar"
import { ConnectionList } from "./components/ConnectionList"
import { getInforWallet } from "@/services/api/TelegramWalletService"
import { useTradingChatStore } from "@/store/tradingChatStore"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lang"
import { useTradingState } from './hooks/useTradingState'

type TabType = "chat" | "trade";

export default function MasterTradeChat() {
    const searchParams = useSearchParams();
    const tokenAddress = searchParams?.get("address");
    const { token } = useAuth();
    const { lang } = useLang();
    const { 
        activeTab, 
        setActiveTab, 
        unreadCount, 
        messages,
        setTokenAddress,
        initializeWebSocket,
        disconnectWebSocket
    } = useTradingChatStore();

    const {
        selectedGroups,
        setSelectedGroups,
        selectedConnections,
        setSelectedConnections,
        refreshTradingData
    } = useTradingState()

    const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [mounted, setMounted] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Get translations
    const t = useLang().t;

    // Handle initial mount
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Initialize websocket when token address changes
    useEffect(() => {
        if (!mounted) return;
        
        if (tokenAddress && token) {
            setTokenAddress(tokenAddress);
            initializeWebSocket(token, lang);
        }
        return () => {
            disconnectWebSocket();
        };
    }, [tokenAddress, token, lang, setTokenAddress, initializeWebSocket, disconnectWebSocket, mounted]);

    const { data: myConnects = [], isLoading: isLoadingConnects, refetch: refetchMyConnects } = useQuery({
        queryKey: ["myConnects"],
        queryFn: getMyConnects,
        refetchOnWindowFocus: false
    })
    console.log("myConnects", myConnects)
    const { data: walletInfor, isLoading: isLoadingWallet } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
    });

    // Filter connections based on search query and selected groups
    const filteredConnections = useMemo(() => {
        let filtered = myConnects || []

        // First filter by selected groups if any groups are selected
        if (selectedGroups.length > 0) {
            filtered = filtered.filter((connect: any) =>
                connect.joined_groups.some((group: any) =>
                    selectedGroups.includes(group.group_id.toString())
                )
            )
        }

        // Then apply search filter if there's a search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim()
            filtered = filtered.filter((connect: any) => {
                const memberName = connect.member_name?.toLowerCase() || ""
                const memberAddress = connect.member_address?.toLowerCase() || ""
                return memberName.includes(query) || memberAddress.includes(query)
            })
        }

        return filtered
    }, [myConnects, selectedGroups, searchQuery])

    // Update selected connections when groups change
    useEffect(() => {
        if (!mounted || !initialized || !myConnects) return

        // If no groups are selected, keep current selections
        if (selectedGroups.length === 0) return

        // Get all connections that belong to selected groups
        const newSelectedConnections = myConnects
            .filter((connect: any) =>
                connect.joined_groups.some((group: any) =>
                    selectedGroups.includes(group.group_id.toString())
                )
            )
            .map((connect: any) => connect.member_id.toString())

        // Update selected connections if there are changes
        if (JSON.stringify(newSelectedConnections) !== JSON.stringify(selectedConnections)) {
            setSelectedConnections(newSelectedConnections)
        }
    }, [selectedGroups, myConnects, mounted, initialized])

    // Initialize connections after mount
    useEffect(() => {
        if (!mounted || initialized || !myConnects) return

        // If there are selected groups, initialize with their connections
        if (selectedGroups.length > 0) {
            const initialConnections = myConnects
                .filter((connect: any) =>
                    connect.joined_groups.some((group: any) =>
                        selectedGroups.includes(group.group_id.toString())
                    )
                )
                .map((connect: any) => connect.member_id.toString())

            setSelectedConnections(initialConnections)
        }
        setInitialized(true)
    }, [mounted, myConnects, selectedGroups, initialized])

    useEffect(() => {
        if (walletInfor?.role === "master") {
            setActiveTab("trade")
        } else {
            setActiveTab("chat")
        }
    }, [walletInfor, setActiveTab])

    const handleCopyAddress = useCallback((address: string) => {
        navigator.clipboard.writeText(address)
        setCopiedAddress(address)
        setTimeout(() => setCopiedAddress(null), 2000)
    }, [])

    const handleSelectItem = useCallback((id: string) => {
        setSelectedConnections(prev => {
            if (prev.includes(id)) {
                // If deselecting, also remove associated groups
                const connection = myConnects?.find((connect: any) => connect.member_id.toString() === id)
                if (connection) {
                    const groupIds = connection.joined_groups.map((group: any) => group.group_id.toString())
                    setSelectedGroups(prevGroups => prevGroups.filter(groupId => !groupIds.includes(groupId)))
                }
                return prev.filter(item => item !== id)
            } else {
                // If selecting, add to selected connections
                return [...prev, id]
            }
        })
    }, [myConnects])

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };
    return (
        <div className="h-full flex flex-col relative">
            {/* {isLoading && (
                <div className="absolute inset-0 bg-neutral-1000/50 backdrop-blur-xl z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-theme-primary-400"></div>
                    <span className="ml-2">{t("masterTrade.loading")}</span>
                </div>
            )} */}
            {/* Tabs */}
            <div className="flex-none flex h-[30px] bg-gray-300 my-3 mx-3 rounded-full relative dark:bg-theme-neutral-800">
                {walletInfor?.role === "master" && (
                    <button
                        className={`flex-1 rounded-xl text-sm cursor-pointer font-medium uppercase text-center ${activeTab === "trade" ? "linear-gradient-connect" : "text-neutral-400"
                            }`}
                        onClick={() => handleTabChange("trade")}
                        data-active-tab={activeTab}
                    >
                        {t("masterTrade.tabs.member")}
                    </button>
                )}
                <button
                    className={`flex-1 rounded-xl cursor-pointer text-sm font-medium uppercase text-center ${activeTab === "chat" ? "linear-gradient-connect" : "text-neutral-400"
                        }`}
                    onClick={() => handleTabChange("chat")}
                    data-active-tab={activeTab}
                >
                    {t("masterTrade.tabs.chat")}
                    {unreadCount > 0 && activeTab !== "chat" && (
                        <div className="absolute right-1 top-0">
                            <div className="bg-theme-primary-400 text-neutral-100 text-[10px] rounded-full p-[2px]">{unreadCount}</div>
                        </div>
                    )}
                </button>
            </div>

            {activeTab === "trade" ? (
                <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex-none">
                        <SearchBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ConnectionList
                            connections={filteredConnections}
                            selectedConnections={selectedConnections}
                            onSelectConnection={handleSelectItem}
                            copiedAddress={copiedAddress}
                            onCopyAddress={handleCopyAddress}
                            isLoading={isLoadingConnects}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex-1 min-h-0 overflow-hidden">
                    <ChatTrading />
                </div>
            )}
        </div>
    )
}