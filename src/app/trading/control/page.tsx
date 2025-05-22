'use client'
import React, { useState, Suspense } from 'react'
import TradingPanel from './trading-panel'
import MasterTradeChat from './master-trade'
import { useQuery } from '@tanstack/react-query'
import { getInforWallet } from '@/services/api/TelegramWalletService'

interface CryptoCurrency {
  symbol: string
  balance: number
  name: string
}

const ControlContent = () => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);

  const { data: walletInfor, refetch } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
    refetchInterval: 30000,
    staleTime: 30000,
  });

  const [isConnected, setIsConnected] = useState(false)
  
  const currencies: CryptoCurrency =  { 
    symbol: "SOL", 
    balance: walletInfor?.sol_balance || 0.0, 
    name: "Solana" 
  }
  
  const classLayout = "bg-neutral-1000 box-shadow-info rounded-2xl flex flex-col"
  return (
    <div className='flex flex-col h-full gap-4'>
      <div className={classLayout + " p-3 flex-none"}>
        <TradingPanel 
          defaultMode={activeTab} 
          currency={currencies} 
          isConnected={isConnected} 
          onConnect={() => setIsConnected(!isConnected)}
          selectedGroups={selectedGroups}
          setSelectedGroups={setSelectedGroups}
          selectedConnections={selectedConnections}
          setSelectedConnections={setSelectedConnections}
        />
      </div>
      <div className={classLayout + " flex-1 min-h-0"}>
        <MasterTradeChat 
          selectedGroups={selectedGroups}
          setSelectedGroups={setSelectedGroups}
          selectedConnections={selectedConnections}
          setSelectedConnections={setSelectedConnections}
        />
      </div>
    </div>
  )
}

const Control = () => {
  return (
    <Suspense fallback={<div className="h-full w-full bg-neutral-1000 rounded-2xl"></div>}>
      <ControlContent />
    </Suspense>
  )
}

export default Control

