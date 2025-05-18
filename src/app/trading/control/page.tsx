'use client'
import React, { useState, Suspense } from 'react'
import TradingPanel from './trading-panel'

interface CryptoCurrency {
    symbol: string
    balance: number
    name: string
  }

const Control = () => {
    const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
    const [isConnected, setIsConnected] = useState(false)

  const currencies: CryptoCurrency[] = [
    { symbol: "SOL", balance: 0.0, name: "Solana" },
    { symbol: "PUMP", balance: 0.0, name: "PumpCoin" },
  ]
    return (
        <div className='bg-neutral-1000 box-shadow-info rounded-3xl p-3 flex flex-col '>
            <Suspense fallback={<div></div>}>
                <TradingPanel defaultMode={activeTab} currency={currencies[0]} isConnected={isConnected} onConnect={() => setIsConnected(!isConnected)} />
            </Suspense>
        </div>
    )
}

export default Control

