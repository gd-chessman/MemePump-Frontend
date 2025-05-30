'use client'
import { getInforWallet } from '@/services/api/TelegramWalletService';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'
import DepositWallet from './deposit';
import WithdrawWallet from './withdraw';
import { Toaster } from 'react-hot-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';
import { ExternalLink, Copy } from 'lucide-react';
import { getTransactionHistory } from '@/services/api/HistoryTransactionWallet';
import { toast } from '@/hooks/use-toast';
import { truncateString } from '@/utils/format';
import { useLang } from '@/lang';

type Transaction = {
    id: number
    wallet_id: number
    wallet_address_from: string
    wallet_address_to: string
    type: "deposit" | "withdraw"
    amount: string
    status: "completed" | "pending" | "failed"
    transaction_hash: string
    error_message: string | null
    created_at: string
    updated_at: string
}

const universal_accountPage = () => {
    const { t } = useLang();
    const { data: walletInfor, isLoading, isError, error } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
    });


    const [tab, setTab] = useState<("deposit" | "withdraw")>("deposit");

    const { data: transactions } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => getTransactionHistory(),
    });

    // Filter transactions based on current tab
    const filteredTransactions = transactions?.filter((tx: Transaction) => {
        const isMatch = tab === "deposit" ? tx.type === "deposit" : tx.type === "withdraw";
        return isMatch;
    }) || [];

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <div className="lg:container-glow px-[12px] sm:px-[16px] lg:px-[40px] flex flex-col pt-[12px] sm:pt-[16px] lg:pt-[30px] relative mx-auto z-10 pb-6 lg:pb-0">
            <div className='container flex flex-col gap-4 sm:gap-6'>
                <Toaster position="top-right" />
                {walletInfor?.solana_address && (
                    <div className="flex items-center justify-center flex-col gap-3 sm:gap-4 lg:gap-6">
                        <div className="flex w-full border-gray-200 dark:border-neutral-800 max-w-[280px] sm:max-w-[320px] h-[36px] sm:h-[40px] bg-gray-100 dark:bg-theme-neutral-1000 rounded-full">
                            <button
                                className={`flex-1 rounded-full text-sm sm:text-base cursor-pointer font-medium uppercase text-center ${tab === "deposit" ? "bg-blue-500 text-white dark:linear-gradient-connect" : "text-gray-500 dark:text-neutral-400"}`}
                                onClick={() => setTab("deposit")}
                            >
                                {t('universal_account.deposit')}
                            </button>
                            <button
                                className={`flex-1 rounded-full cursor-pointer text-sm sm:text-base font-medium uppercase text-center ${tab === "withdraw" ? "bg-blue-500 text-white dark:linear-gradient-connect" : "text-gray-500 dark:text-neutral-400"}`}
                                onClick={() => setTab("withdraw")}
                            >
                                {t('universal_account.withdraw')}
                            </button>
                        </div>

                        <div className="flex-1 container">
                            {tab === "deposit" && (
                                <DepositWallet walletAddress={walletInfor.solana_address} />
                            )}
                            {tab === "withdraw" && (
                                <WithdrawWallet walletInfor={walletInfor} />
                            )}
                        </div>
                    </div>

                )}
            </div>

            <div className='container px-0 lg:mt-6 sm:mt-8'>
                <div className="flex items-center gap-2 mb-3 sm:mb-4 mt-4 lg:mt-0">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-cyan-400 rounded-full"></div>
                    <h3 className="font-bold dark:text-white text-black text-sm sm:text-base uppercase">{t(`universal_account.${tab}`)} {t('universal_account.history')}</h3>
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-cyan-400 rounded-full"></div>
                </div>

                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-3">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx: Transaction) => (
                            <div key={tx.id} className="bg-white dark:bg-theme-neutral-1000/50 rounded-xl border border-theme-purple-200 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] dark:text-gray-400 text-black">{t('universal_account.time')}</span>
                                    <span className="text-[11px] dark:text-gray-300 text-black">{formatDate(tx.created_at)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] dark:text-gray-400 text-black">{t('universal_account.type')}</span>
                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${tx.type === "deposit"
                                            ? "bg-blue-500/20 text-blue-400"
                                            : "bg-purple-500/20 text-purple-400"
                                        }`}>
                                        {tx.type.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] dark:text-gray-400 text-black">{t('universal_account.status')}</span>
                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${tx.status === "completed"
                                            ? "bg-green-500/20 text-green-400"
                                            : tx.status === "pending"
                                                ? "bg-yellow-500/20 text-yellow-400"
                                                : "bg-red-500/20 text-red-400"
                                        }`}>
                                        {tx.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] dark:text-gray-400 text-black">{t('universal_account.amount')}</span>
                                    <span className="text-[11px] dark:text-gray-300 text-black">{tx.amount} SOL</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] dark:text-gray-400 text-black">{t('universal_account.transactionId')}</span>
                                    {tx.transaction_hash && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-[11px] dark:text-gray-300 text-black">{truncateString(tx.transaction_hash, 8)}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(tx.transaction_hash);
                                                    toast({
                                                        title: "Copied!",
                                                        description: "Transaction hash copied to clipboard",
                                                    });
                                                }}
                                                className="text-gray-400 hover:text-gray-200"
                                            >
                                                <Copy className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-2 border-t border-theme-purple-200/20">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] dark:text-gray-400 text-black">{t('universal_account.from')}</span>
                                        <span className="text-[11px] dark:text-gray-300 text-black">{truncateString(tx.wallet_address_from, 8)}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[10px] dark:text-gray-400 text-black">{t('universal_account.to')}</span>
                                        <span className="text-[11px] dark:text-gray-300 text-black">{truncateString(tx.wallet_address_to, 8)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-gray-400 text-xs border border-theme-purple-200 rounded-xl p-2">
                            {t('universal_account.no_transactions', { type: t(`universal_account.${tab}`) })}
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto rounded-xl border-1 z-10 border-solid border-y-theme-primary-100 border-x-theme-purple-200 bg-theme-neutral-1000/50">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="border-b border-theme-purple-200 hover:bg-transparent">
                                <TableHead className="py-2 px-6 text-xs font-medium dark:text-gray-400 text-black">{t('universal_account.time')}</TableHead>
                                <TableHead className="py-2 px-4 text-xs font-medium dark:text-gray-400 text-black">{t('universal_account.type')}</TableHead>
                                <TableHead className="py-2 px-3 text-xs font-medium dark:text-gray-400 text-black">{t('universal_account.status')}</TableHead>
                                <TableHead className="py-2 px-6 text-xs font-medium dark:text-gray-400 text-black text-right">{t('universal_account.amount')}</TableHead>
                                <TableHead className="py-2 px-6 text-xs font-medium dark:text-gray-400 text-black">{t('universal_account.from_address')}</TableHead>
                                <TableHead className="py-2 px-6 text-xs font-medium dark:text-gray-400 text-black">{t('universal_account.to_address')}</TableHead>
                                <TableHead className="py-2 px-6 text-xs font-medium dark:text-gray-400 text-black">{t('universal_account.transaction_id')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx: Transaction) => (
                                    <TableRow key={tx.id} className="text-xs dark:hover:bg-theme-neutral-900/50 cursor-pointer hover:bg-theme-green-300 transition-colors">
                                        <TableCell className="py-2 px-6 dark:text-gray-300 text-black whitespace-nowrap">
                                            {formatDate(tx.created_at)}
                                        </TableCell>
                                        <TableCell className="py-2 px-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${tx.type === "deposit"
                                                    ? "bg-blue-500/20 text-blue-400"
                                                    : "bg-purple-500/20 text-purple-400"
                                                }`}>
                                                {tx.type.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-2 px-3">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${tx.status === "completed"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : tx.status === "pending"
                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                        : "bg-red-500/20 text-red-400"
                                                }`}>
                                                {tx.status.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-2 px-6 text-right dark:text-gray-300 text-black whitespace-nowrap">
                                            {tx.amount} SOL
                                        </TableCell>
                                        <TableCell className="py-2 px-6 dark:text-gray-300 text-black">
                                            {truncateString(tx.wallet_address_from, 12)}
                                        </TableCell>
                                        <TableCell className="py-2 px-6 dark:text-gray-300 text-black">
                                            {truncateString(tx.wallet_address_to, 12)}
                                        </TableCell>
                                        <TableCell className="py-2 px-6 dark:text-gray-300 text-black">
                                            {tx.transaction_hash && (
                                                <div className="flex items-center gap-2">
                                                    {truncateString(tx.transaction_hash, 12)}
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(tx.transaction_hash);
                                                            toast({
                                                                title: "Copied!",
                                                                description: "Transaction hash copied to clipboard",
                                                            });
                                                        }}
                                                        className="text-gray-400 hover:text-gray-200"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-gray-400">
                                        {t('universal_account.no_transactions', { type: t(`universal_account.${tab}`) })}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

        </div>
    )
}

export default universal_accountPage