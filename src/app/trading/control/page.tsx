"use client"
import { useState, useEffect, Suspense } from 'react'
import TradingPanel from './trading-panel'
import MasterTradeChat from './master-trade'
import { useQuery } from '@tanstack/react-query'
import { getInforWallet } from '@/services/api/TelegramWalletService'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// Icons
const BuyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const SellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
)

const ChatIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const TradeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
)
const classLayout = "bg-neutral-1000 box-shadow-info rounded-2xl flex flex-col"
type TradingMode = 'buy' | 'sell'
type TabType = TradingMode | 'chat' | 'trade'

interface CryptoCurrency {
  symbol: string
  balance: number
  name: string
}

const Control = () => {
  const [activeTab, setActiveTab] = useState<TabType>('buy')
  const [isConnected, setIsConnected] = useState(false)
  const [currencies, setCurrencies] = useState<CryptoCurrency>({
    symbol: "SOL",
    balance: 0,
    name: "Solana"
  })
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedConnections, setSelectedConnections] = useState<string[]>([])
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const { data: walletInfor } = useQuery({
    queryKey: ['walletInfo'],
    queryFn: getInforWallet
  })

  useEffect(() => {
    if (walletInfor) {
      setCurrencies({
        symbol: "SOL",
        balance: walletInfor.sol_balance || 0.0,
        name: "Solana"
      })
      setIsConnected(!!walletInfor.solana_address)
    }
  }, [walletInfor])

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab)
    if (isMobile) {
      setIsPanelOpen(true)
    }
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'buy':
      case 'sell':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
            <TradingPanel 
              defaultMode={activeTab as TradingMode}
              currency={currencies}
              isConnected={isConnected}
              onConnect={() => setIsConnected(!isConnected)}
              selectedGroups={selectedGroups}
              setSelectedGroups={setSelectedGroups}
              selectedConnections={selectedConnections}
              setSelectedConnections={setSelectedConnections}
            />
          </Suspense>
        )
      case 'chat':
        return (
          <div className="h-[70vh] flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <MasterTradeChat
                  selectedGroups={selectedGroups}
                  setSelectedGroups={setSelectedGroups}
                  selectedConnections={selectedConnections}
                  setSelectedConnections={setSelectedConnections}
                />
              </Suspense>
            </div>
          </div>
        )
      case 'trade':
        return (
          <div className="h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Active Trades</h3>
                <div className="space-y-2">
                  {/* Placeholder for active trades */}
                  <div className="bg-neutral-800 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-500">SOL/USDT</span>
                      <span className="text-white">+2.5%</span>
                    </div>
                    <div className="text-sm text-neutral-400 mt-1">Entry: $98.50</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Trade History</h3>
                <div className="space-y-2">
                  {/* Placeholder for trade history */}
                  <div className="bg-neutral-800 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white">SOL/USDT</span>
                      <span className="text-red-500">-1.2%</span>
                    </div>
                    <div className="text-sm text-neutral-400 mt-1">Closed: $97.20</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (isMobile) {
    return (
      <>
        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-800 border-t border-neutral-700 z-50">
          <div className="flex justify-around items-center h-16">
            <button
              onClick={() => handleTabClick('buy')}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 ${
                activeTab === 'buy' ? 'text-green-500' : 'text-neutral-400'
              }`}
            >
              <BuyIcon />
              <span className="text-xs">Buy</span>
            </button>
            <button
              onClick={() => handleTabClick('sell')}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 ${
                activeTab === 'sell' ? 'text-red-500' : 'text-neutral-400'
              }`}
            >
              <SellIcon />
              <span className="text-xs">Sell</span>
            </button>
            <button
              onClick={() => handleTabClick('chat')}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 ${
                activeTab === 'chat' ? 'text-blue-500' : 'text-neutral-400'
              }`}
            >
              <ChatIcon />
              <span className="text-xs">Master & Chat</span>
            </button>
          </div>
        </div>

        {/* Slide-up Panel */}
        {isPanelOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={handleClosePanel}
            />
            {/* Panel */}
            <div className={`fixed bottom-0 left-0 right-0 bg-neutral-800 rounded-t-xl z-50 transform transition-transform duration-300 ${
              isPanelOpen ? 'translate-y-0' : 'translate-y-full'
            }`}>
              <div className="p-4">
                {/* Drag handle */}
                <div className="w-12 h-1 bg-neutral-600 rounded-full mx-auto mb-4" />
                
                {/* Panel Content */}
                {renderTabContent()}
              </div>
            </div>
          </>
        )}
      </>
    )
  }

  // Desktop view
  return (
    <div className='flex flex-col h-full gap-4'>
      <div className={classLayout + " p-3 flex-none"}>
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
          <TradingPanel 
            defaultMode={activeTab as TradingMode}
            currency={currencies} 
            isConnected={isConnected} 
            onConnect={() => setIsConnected(!isConnected)}
            selectedGroups={selectedGroups}
            setSelectedGroups={setSelectedGroups}
            selectedConnections={selectedConnections}
            setSelectedConnections={setSelectedConnections}
          />
        </Suspense>
      </div>
      <div className={classLayout + " flex-1 min-h-0"}>
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
          <MasterTradeChat 
            selectedGroups={selectedGroups}
            setSelectedGroups={setSelectedGroups}
            selectedConnections={selectedConnections}
            setSelectedConnections={setSelectedConnections}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default Control

