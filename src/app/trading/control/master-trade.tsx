"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getMyConnects } from "@/services/api/MasterTradingService"
import ChatTrading from "./chat"
import { MasterTradeChatProps } from "./types"
import { SearchBar } from "./components/SearchBar"
import { ConnectionList } from "./components/ConnectionList"
import { getInforWallet } from "@/services/api/TelegramWalletService"

export default function MasterTradeChat({
    selectedGroups,
    setSelectedGroups,
    selectedConnections,
    setSelectedConnections
}: MasterTradeChatProps) {
    const [activeTab, setActiveTab] = useState<"trade" | "chat">("chat")
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const { data: myConnects = [], isLoading: isLoadingConnects } = useQuery({
        queryKey: ["myConnects"],
        queryFn: getMyConnects,
        refetchOnWindowFocus: false
    })
    const { data: walletInfor, isLoading: isLoadingWallet } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
    });

    const isLoading = isLoadingConnects || isLoadingWallet;

    // Filter connections based on search query
    const filteredConnections = useMemo(() => {
        if (!searchQuery.trim()) return myConnects

        const query = searchQuery.toLowerCase().trim()
        return myConnects.filter((connect: any) => {
            const memberName = connect.member_name?.toLowerCase() || ""
            const memberAddress = connect.member_address?.toLowerCase() || ""
            return memberName.includes(query) || memberAddress.includes(query)
        })
    }, [myConnects, searchQuery])

    useEffect(() => {
        // Update selected connections based on selected groups
        const newSelectedConnections = myConnects
            .filter((connect: any) =>
                connect.joined_groups.some((group: any) =>
                    selectedGroups.includes(group.group_id.toString())
                )
            ).map((connect: any) => connect.member_id.toString())
        setSelectedConnections([...selectedConnections, ...newSelectedConnections])
    }, [selectedGroups, myConnects, setSelectedConnections])

    useEffect(() => {
        if (walletInfor?.role !== "master") {
            setActiveTab("chat")
        }
    }, [walletInfor])

    const handleCopyAddress = useCallback((address: string) => {
        navigator.clipboard.writeText(address)
        setCopiedAddress(address)
        setTimeout(() => setCopiedAddress(null), 2000)
    }, [])

    const handleSelectItem = useCallback((id: string) => {
        if (selectedConnections.includes(id)) {
            setSelectedConnections(selectedConnections.filter(item => item !== id))
            // Remove groups associated with this connection
            const connection = myConnects.find((connect: any) => connect.connection_id.toString() === id)
            if (connection) {
                const groupIds = connection.joined_groups.map((group: any) => group.group_id.toString())
                setSelectedGroups(selectedGroups.filter(groupId => !groupIds.includes(groupId)))
            }
        } else {
            setSelectedConnections([...selectedConnections, id])
        }
    }, [selectedConnections, myConnects, setSelectedConnections, setSelectedGroups, selectedGroups])
    
    return (
        <div className="h-full flex flex-col relative">
            {/* {isLoading && (
                <div className="absolute inset-0 bg-neutral-1000/50 backdrop-blur-xl z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-theme-primary-400"></div>
                </div>
            )} */}
            {/* Tabs */}
            <div className="flex-none flex h-[30px] bg-neutral-1000 my-3 mx-3 rounded-xl relative">
                {walletInfor?.role === "master" && (
                    <button
                        className={`flex-1 rounded-xl text-sm cursor-pointer font-medium uppercase text-center ${activeTab === "trade" ? "linear-gradient-connect" : "text-neutral-400"
                            }`}
                        onClick={() => setActiveTab("trade")}
                    >
                        TRADE
                    </button>
                )}
                <button
                    className={`flex-1 rounded-xl cursor-pointer text-sm font-medium uppercase text-center ${activeTab === "chat" ? "linear-gradient-connect" : "text-neutral-400"
                        }`}
                    onClick={() => setActiveTab("chat")}
                >
                    CHAT
                </button>
                <div className="absolute right-1 top-0">
                    <div className="bg-theme-primary-400 text-neutral-100 text-[10px] rounded-full p-[2px]">+10</div>
                </div>
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
