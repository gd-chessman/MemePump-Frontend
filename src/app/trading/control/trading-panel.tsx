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

    const { data: tradeAmount, refetch: refetchTradeAmount } = useQuery({
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
    const [amountError, setAmountError] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)

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

    // Add isButtonDisabled state
    const isButtonDisabled = useMemo(() => {
        const numericAmount = Number(amount)
        return amountError !== "" || numericAmount <= 0 || !isConnected
    }, [amount, amountError, isConnected])

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

    const validateAmount = useCallback((value: number): boolean => {
        const balance = mode === "buy" ? tradeAmount?.sol_balance || 0 : tradeAmount?.token_balance || 0
        if (value > balance) {
            setAmountError(t('trading.panel.insufficient_balance'))
            return false
        }
        if (value <= 0) {
            setAmountError(t('trading.panel.invalid_amount'))
            return false
        }
        setAmountError("")
        return true
    }, [mode, tradeAmount, t])

    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = e.target.value
        setAmount(newAmount)
        setIsDirectAmountInput(true)
        setPercentage(0)

        const numericAmount = Number.parseFloat(newAmount) || 0
        validateAmount(numericAmount)
        setAmountUSD((numericAmount * exchangeRate).toFixed(2))
    }, [exchangeRate, validateAmount])

    const handleSetAmount = useCallback((value: number) => {
        setAmount(value.toString())
        setIsDirectAmountInput(true)
        setPercentage(0)
        validateAmount(value)
        setAmountUSD((value * exchangeRate).toFixed(2))
    }, [exchangeRate, validateAmount])

    const handlePercentageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newPercentage = Number.parseInt(e.target.value)
        console.log("newPercentage", newPercentage)
        setPercentage(newPercentage)
        setIsDirectAmountInput(false)
        console.log("isConnected", isConnected)
        const balance = mode === "buy" ? tradeAmount?.sol_balance || 0 : tradeAmount?.token_balance || 0
        const newAmount = ((balance * newPercentage) / 100).toFixed(6)
        setAmount(newAmount)
        // Calculate amountUSD using the newAmount we just calculated
        if (mode === "buy") {
            const numericAmount = Number(newAmount)
            console.log("numericAmount", numericAmount)
            setAmountUSD((numericAmount * exchangeRate).toFixed(2))
        }
    }, [isConnected, mode, tradeAmount, exchangeRate])

    const handleSetPercentage = useCallback((percent: number) => {
        setPercentage(percent)
        setIsDirectAmountInput(false)

        if (isConnected) {
            const balance = mode === "buy" ? tradeAmount?.sol_balance || 0 : tradeAmount?.token_balance || 0
            const newAmount = ((balance * percent) / 100).toFixed(6)
            setAmount(newAmount)
            // Calculate amountUSD using the newAmount we just calculated
            if (mode === "buy") {
                const numericAmount = Number(newAmount)
                setAmountUSD((numericAmount * exchangeRate).toFixed(2))
            }
        }
    }, [isConnected, mode, tradeAmount, exchangeRate])

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
        const numericAmount = Number(amount)
        if (!validateAmount(numericAmount)) {
            notify({
                message: amountError,
                type: 'error'
            })
            return
        }

        setIsLoading(true)
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

                queryClient.invalidateQueries({ queryKey: ["groups"] })
                refetchTokenAmount()
                refetchTradeAmount()

                notify({
                    message: t('trading.panel.success'),
                    type: 'success'
                })
            } else {
                notify({
                    message: t('trading.panel.error'),
                    type: 'error'
                })
            }
        } catch (error) {
            setAmount("0.00")
            setPercentage(0)
            setAmountUSD("0.00")
            setIsDirectAmountInput(false)

            notify({
                message: t('trading.panel.error'),
                type: 'error'
            })
        } finally {
            setIsLoading(false)
        }
    }, [mode, amount, tokenAmount, solPrice, selectedConnections, setSelectedGroups, queryClient, refetchTokenAmount, t, validateAmount, amountError, tokenInfor, refetchTradeAmount])

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
        <div className="h-full flex flex-col">
            {/* Mode Tabs */}
            <div className="flex group bg-gray-100 dark:bg-theme-neutral-1000 rounded-xl h-[30px] mb-1">
                <button
                    className={`flex-1 rounded-3xl text-sm cursor-pointer uppercase text-center ${mode === "buy" ? "border-green-500 text-green-600 dark:text-theme-green-200 border-1 bg-green-50 dark:bg-theme-green-100 font-semibold" : "text-gray-500 dark:text-neutral-400"}`}
                    onClick={() => setMode("buy")}
                >
                    {t('trading.panel.buy')}
                </button>
                <button
                    className={`flex-1 rounded-3xl cursor-pointer text-sm uppercase text-center ${mode === "sell" ? "border-red-500 text-red-600 dark:text-theme-red-100 border-1 bg-red-50 dark:bg-theme-red-300 font-semibold" : "text-gray-500 dark:text-neutral-400"}`}
                    onClick={() => setMode("sell")}
                >
                    {t('trading.panel.sell')}
                </button>
            </div>

            <div className="rounded-lg flex flex-col 2xl:justify-between gap-2 lg:gap-3 h-full overflow-y-auto">
                {/* Amount Input */}
                <div className="relative mt-2">
                    <div className={`bg-gray-50 dark:bg-neutral-900 rounded-full border ${amountError ? 'border-red-500' : 'border-blue-200 dark:border-blue-500'} px-3 py-2 flex justify-between items-center ${height > 700 ? 'py-2' : 'h-[30px]'}`}>
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
                    {amountError && (
                        <div className="text-red-500 text-sm mt-2">
                            {amountError}
                        </div>
                    )}

                    {/* USD Value and Balance */}
                    <div className="flex flex-wrap justify-between text-sm mt-2">
                        {mode === "buy" ? (
                            <div className={STYLE_TEXT_BASE}>~ ${amountUSD}</div>
                        ) : (
                            <div className={STYLE_TEXT_BASE}>&ensp;</div>
                        )}
                        <div className={STYLE_TEXT_BASE}>
                            {t('trading.panel.balance')}: {mode === "buy"
                                ? tradeAmount?.sol_balance.toFixed(6) + "  " + currency.symbol
                                : tradeAmount?.token_balance.toFixed(6) + " " + tokenInfor?.symbol}
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
                        disabled={isButtonDisabled || isLoading}
                        className={`w-full py-2 rounded-full text-white font-semibold text-sm transition-colors relative ${isButtonDisabled || isLoading
                            ? "bg-gray-400 cursor-not-allowed dark:bg-gray-600"
                            : mode === "buy"
                                ? "bg-green-500 hover:bg-green-600 dark:bg-theme-green-200 dark:hover:bg-theme-green-200/90"
                                : "bg-red-500 hover:bg-red-600 dark:bg-theme-red-100 dark:hover:bg-theme-red-100/90"
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                {t('trading.panel.processing')}
                            </div>
                        ) : (
                            mode === "buy" ? t('trading.panel.buy') : t('trading.panel.sell')
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
