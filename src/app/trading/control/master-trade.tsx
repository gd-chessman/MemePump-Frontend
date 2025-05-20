"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getMyConnects } from "@/services/api/MasterTradingService"
import ChatTrading from "./chat"
import { MasterTradeChatProps } from "./types"
import { SearchBar } from "./components/SearchBar"
import { ConnectionList } from "./components/ConnectionList"

export default function MasterTradeChat({ 
    selectedGroups, 
    setSelectedGroups, 
    selectedConnections, 
    setSelectedConnections 
}: MasterTradeChatProps) {
    const [activeTab, setActiveTab] = useState<"trade" | "chat">("trade")
    const [searchQuery, setSearchQuery] = useState("")
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

    const { data: myConnects = [] } = useQuery({
        queryKey: ["myConnects"],
        queryFn: getMyConnects,
        refetchOnWindowFocus: false
    })

    // Memoize filtered connections based on search query
    const filteredConnections = useMemo(() => {
        if (!searchQuery) return myConnects
        const query = searchQuery.toLowerCase()
        return myConnects.filter((connect: any) => 
            connect.name.toLowerCase().includes(query) ||
            connect.ticker.toLowerCase().includes(query) ||
            connect.member_address.toLowerCase().includes(query)
        )
    }, [myConnects, searchQuery])

    useEffect(() => {
        // Update selected connections based on selected groups
        const newSelectedConnections = myConnects
            .filter((connect: any) => 
                connect.joined_groups.some((group: any) => 
                    selectedGroups.includes(group.group_id.toString())
                )
            ).map((connect: any) => connect.member_id.toString())
        setSelectedConnections(newSelectedConnections)
    }, [selectedGroups, myConnects, setSelectedConnections])

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
        <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex-none flex h-[30px] bg-neutral-1000 my-3 mx-3 rounded-xl relative">
                <button
                    className={`flex-1 rounded-xl text-sm cursor-pointer font-medium uppercase text-center ${
                        activeTab === "trade" ? "linear-gradient-connect" : "text-neutral-400"
                    }`}
                    onClick={() => setActiveTab("trade")}
                >
                    TRADE
                </button>
                <button
                    className={`flex-1 rounded-xl cursor-pointer text-sm font-medium uppercase text-center ${
                        activeTab === "chat" ? "linear-gradient-connect" : "text-neutral-400"
                    }`}
                    onClick={() => setActiveTab("chat")}
                >
                    CHAT
                </button>
                <div className="absolute right-1 top-0">
                    <div className="bg-blue-500 text-white text-xs rounded-full px-1 py-1">+10</div>
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
