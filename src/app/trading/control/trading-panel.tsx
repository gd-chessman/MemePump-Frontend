"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getMyGroups } from "@/services/api/MasterTradingService"
import { createTrading, getTokenAmount, getTradeAmount } from "@/services/api/TradingService"
import { useSearchParams } from "next/navigation"
import { useLang } from "@/lang/useLang"
import { getPriceSolona, getTokenInforByAddress } from "@/services/api/SolonaTokenService"
import notify from "@/app/components/notify"
import { TradingPanelProps, TradingMode } from "./types"
import { STYLE_TEXT_BASE } from "./constants/styles"
import { useLocalStorage } from "./hooks/useLocalStorage"
import { PercentageButtons } from "./components/PercentageButtons"
import { AmountButtons } from "./components/AmountButtons"
import { GroupSelect } from "./components/GroupSelect"
import { getInforWallet } from "@/services/api/TelegramWalletService"

export default function TradingPanel({
    defaultMode = "buy",
    currency,
    isConnected,
    selectedGroups,
    setSelectedGroups,
    selectedConnections,
    setSelectedConnections
}: TradingPanelProps) {
    const { t } = useLang()
    const searchParams = useSearchParams()
    const address = searchParams?.get("address")
    const queryClient = useQueryClient()

    const { data: groups } = useQuery({
        queryKey: ["groups"],
        queryFn: getMyGroups,
    })

    const { data: tradeAmount } = useQuery({
        queryKey: ["tradeAmount", address],
        queryFn: () => getTradeAmount(address),
    })

    const { data: walletInfor } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
    });

    const { data: solPrice } = useQuery({
        queryKey: ["sol-price"],
        queryFn: () => getPriceSolona(),
    })
    const { data: tokenInfor, refetch } = useQuery({
        queryKey: ["token-infor", address],
        queryFn: () => getTokenInforByAddress(address),
    });

    const { data: tokenAmount, refetch: refetchTokenAmount } = useQuery({
        queryKey: ["tokenAmount", address],
        queryFn: () => getTokenAmount(address),
    })

    const [mode, setMode] = useState<TradingMode>(defaultMode)
    const [amount, setAmount] = useState("0.00")
    const [percentage, setPercentage] = useState(0)
    const [amountUSD, setAmountUSD] = useState("0.00")
    const [isDirectAmountInput, setIsDirectAmountInput] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [windowHeight, setWindowHeight] = useState(800)

    // Use custom hook for localStorage
    const [percentageValues, setPercentageValues] = useLocalStorage<number[]>(
        'tradingPercentageValues',
        [25, 50, 75, 100]
    )
    const [amountValues, setAmountValues] = useLocalStorage<number[]>(
        'tradingAmountValues',
        [0.1, 0.5, 1, 2]
    )

    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editValue, setEditValue] = useState<string>("")
    const [editingAmountIndex, setEditingAmountIndex] = useState<number | null>(null)
    const [editAmountValue, setEditAmountValue] = useState<string>("")

    // Memoize exchange rate
    const exchangeRate = useMemo(() => solPrice?.priceUSD || 0, [solPrice?.priceUSD])

    useEffect(() => {
        setIsMounted(true)
        setWindowHeight(window.innerHeight)

        const handleResize = () => {
            setWindowHeight(window.innerHeight)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Use default height during SSR
    const height = isMounted ? windowHeight : 800

    // Memoize handlers
    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = e.target.value
        setAmount(newAmount)
        setIsDirectAmountInput(true)
        setPercentage(0)

        const numericAmount = Number.parseFloat(newAmount) || 0
        setAmountUSD((numericAmount * exchangeRate).toFixed(2))
    }, [exchangeRate])

    const handleSetAmount = useCallback((value: number) => {
        setAmount(value.toString())
        setIsDirectAmountInput(true)
        setPercentage(0)
        setAmountUSD((value * exchangeRate).toFixed(2))
    }, [exchangeRate])

    const handlePercentageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newPercentage = Number.parseInt(e.target.value)
        setPercentage(newPercentage)
        setIsDirectAmountInput(false)

        if (isConnected) {
            const balance = mode === "buy" ? tradeAmount?.sol_balance || 0 : tradeAmount?.token_balance || 0
            const newAmount = ((balance * newPercentage) / 100).toFixed(6)
            setAmount(newAmount)
        }
    }, [isConnected, mode, tradeAmount])

    const handleSetPercentage = useCallback((percent: number) => {
        setPercentage(percent)
        setIsDirectAmountInput(false)

        if (isConnected) {
            const balance = mode === "buy" ? tradeAmount?.sol_balance || 0 : tradeAmount?.token_balance || 0
            const newAmount = ((balance * percent) / 100).toFixed(6)
            setAmount(newAmount)
        }
    }, [isConnected, mode, tradeAmount])

    const handleEditClick = useCallback((index: number) => {
        setEditingIndex(index)
        setEditValue(percentageValues[index].toString())
    }, [percentageValues])

    const handleEditSave = useCallback((index: number) => {
        const newValue = Number(editValue)
        if (!isNaN(newValue) && newValue > 0 && newValue <= 100) {
            const newValues = [...percentageValues]
            newValues[index] = newValue
            newValues.sort((a, b) => a - b)
            setPercentageValues(newValues)
        }
        setEditingIndex(null)
    }, [editValue, percentageValues, setPercentageValues])

    const handleEditKeyPress = useCallback((e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            handleEditSave(index)
        } else if (e.key === 'Escape') {
            setEditingIndex(null)
        }
    }, [handleEditSave])

    const handleAmountEditClick = useCallback((index: number) => {
        setEditingAmountIndex(index)
        setEditAmountValue(amountValues[index].toString())
    }, [amountValues])

    const handleAmountEditSave = useCallback((index: number) => {
        const newValue = Number(editAmountValue)
        if (!isNaN(newValue) && newValue > 0) {
            const newValues = [...amountValues]
            newValues[index] = newValue
            newValues.sort((a, b) => a - b)
            setAmountValues(newValues)
        }
        setEditingAmountIndex(null)
    }, [editAmountValue, amountValues, setAmountValues])

    const handleAmountEditKeyPress = useCallback((e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            handleAmountEditSave(index)
        } else if (e.key === 'Escape') {
            setEditingAmountIndex(null)
        }
    }, [handleAmountEditSave])

    const handleSubmit = useCallback(async () => {
        try {
            const response = await createTrading({
                order_trade_type: mode,
                order_type: "market",
                order_token_name: tokenAmount?.token_address || tokenInfor.symbol,
                order_token_address: tokenAmount?.token_address || tokenInfor.address,
                order_price:
                    mode === "sell"
                        ? Number(amount) * (tokenAmount?.token_price || 0)
                        : Number(amount) * (solPrice?.priceUSD || 0),
                order_qlty: Number(amount),
                member_list: selectedConnections.map(e => Number(e)),
            })

            if (response && (response.status === 201 || response.status === 200 || response.message?.includes('successfully'))) {
                setAmount("0.00")
                setPercentage(0)
                setAmountUSD("0.00")
                setSelectedGroups([])
                setIsDirectAmountInput(false)

                queryClient.invalidateQueries({ queryKey: ["tradeAmount"] })
                queryClient.invalidateQueries({ queryKey: ["groups"] })
                refetchTokenAmount()

                notify({
                    message: response.message || t('trading.panel.success'),
                    type: 'success'
                })
            } else {
                const errorMessage = response?.message || 'Trading failed'
                throw new Error(errorMessage)
            }
        } catch (error) {
            setAmount("0.00")
            setPercentage(0)
            setAmountUSD("0.00")
            setIsDirectAmountInput(false)

            notify({
                message: error instanceof Error ? error.message : t('trading.panel.error'),
                type: 'error'
            })
        }
    }, [mode, amount, tokenAmount, solPrice, selectedConnections, setSelectedGroups, queryClient, refetchTokenAmount, t])

    // Reset amount and percentage when mode changes
    useEffect(() => {
        setAmount("0.00")
        setPercentage(0)
        setIsDirectAmountInput(false)
    }, [mode])

    // Update amount when balance changes
    useEffect(() => {
        if (!isDirectAmountInput && percentage > 0) {
            const balance = mode === "buy" ? tradeAmount?.sol_balance || 0 : tradeAmount?.token_balance || 0
            const newAmount = ((balance * percentage) / 100).toFixed(6)
            setAmount(newAmount)
        }
    }, [tradeAmount, mode, percentage, isDirectAmountInput])

    return (
        <div>
            <div className="rounded-lg flex flex-col 2xl:justify-between gap-3 h-full overflow-y-auto">
               {/* Amount Input */}
                <div className="relative mt-2">
                    <div className={`bg-gray-50 dark:bg-neutral-900 rounded-full border border-blue-200 dark:border-blue-500 px-3 py-2 flex justify-between items-center ${height > 700 ? 'py-2' : 'h-[30px]'}`}>
                        <input
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            className="bg-transparent w-full text-gray-900 dark:text-neutral-200 font-medium text-base focus:outline-none"
                        />
                        {!isDirectAmountInput && (
                            <span className={`${STYLE_TEXT_BASE} text-blue-600 dark:text-theme-primary-300`}>
                                {percentage.toFixed(2)}%
                            </span>
                        )}
                    </div>

                    {/* USD Value and Balance */}
                    <div className="flex justify-between text-sm mb-3 mt-2">
                        {mode === "buy" ? (
                            <div className={STYLE_TEXT_BASE}>~ ${amountUSD}</div>
                        ) : (
                            <div className={STYLE_TEXT_BASE}>&ensp;</div>
                        )}
                        <div className={STYLE_TEXT_BASE}>
                            {t('trading.panel.balance')}: {mode === "buy"
                                ? tradeAmount?.sol_balance.toFixed(6) + " " + currency.symbol
                                : tradeAmount?.token_balance.toFixed(6) + " " + tradeAmount?.token_address?.substring(0, 3)}
                        </div>
                    </div>

                    {/* Percentage Controls */}
                    {(!isDirectAmountInput || mode !== "buy") && (
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className={STYLE_TEXT_BASE}>{t('trading.panel.percentage')}</span>
                                <span className={`${STYLE_TEXT_BASE} text-blue-600 dark:text-theme-primary-300`}>
                                    {percentage.toFixed(2)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={percentage}
                                onChange={handlePercentageChange}
                                className="w-full"
                            />
                        </div>
                    )}
                </div>

                {/* Percentage Buttons */}
                <PercentageButtons
                    percentageValues={percentageValues}
                    percentage={percentage}
                    onSetPercentage={handleSetPercentage}
                    onEditClick={handleEditClick}
                    onEditSave={handleEditSave}
                    editingIndex={editingIndex}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onEditKeyPress={handleEditKeyPress}
                />

                {/* Quick Amount Buttons */}
                {mode === "buy" && (
                    <AmountButtons
                        amountValues={amountValues}
                        onSetAmount={handleSetAmount}
                        onEditClick={handleAmountEditClick}
                        onEditSave={handleAmountEditSave}
                        editingIndex={editingAmountIndex}
                        editValue={editAmountValue}
                        setEditValue={setEditAmountValue}
                        onEditKeyPress={handleAmountEditKeyPress}
                    />
                )}

                {/* Group Select */}
                {walletInfor?.role == "master" && <GroupSelect
                    groups={groups || []}
                    selectedGroups={selectedGroups}
                    setSelectedGroups={setSelectedGroups}
                />}


                {/* Action Button */}
                <div className="mt-3">
                    <button
                        onClick={handleSubmit}
                        className={`w-full py-2 rounded-full text-white font-semibold text-sm transition-colors ${mode === "buy"
                                ? "bg-green-500 hover:bg-green-600 dark:bg-theme-green-200 dark:hover:bg-theme-green-200/90"
                                : "bg-red-500 hover:bg-red-600 dark:bg-theme-red-100 dark:hover:bg-theme-red-100/90"
                            }`}
                    >
                        {mode === "buy" ? t('trading.panel.buy') : t('trading.panel.sell')}
                    </button>
                </div>
            </div>
        </div>
    )
}
