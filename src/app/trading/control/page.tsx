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

const Control = () => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const { data: walletInfor, refetch } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
    refetchInterval: 30000,
    staleTime: 30000,
});
  const [isConnected, setIsConnected] = useState(false)
  
  
  // Convert walletInfor to CryptoCurrency format
  const currencies: CryptoCurrency =  { 
    symbol: "SOL", 
    balance: walletInfor?.sol_balance || 0.0, 
    name: "Solana" 
  }
  
  console.log("currencies", currencies)
  const classLayout = "bg-neutral-1000 box-shadow-info rounded-3xl flex flex-col"
  return (
    <div className='flex flex-col gap-4 h-full'>
      <div className={classLayout + " p-3"}>
        <Suspense fallback={<div></div>}>
          <TradingPanel defaultMode={activeTab} currency={currencies} isConnected={isConnected} onConnect={() => setIsConnected(!isConnected)} />
        </Suspense>
      </div>
      <div className={classLayout}>
        <MasterTradeChat />
      </div>
    </div>
  )
}

export default Control

