'use client';

import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import logo from '@/assets/svgs/logo.svg';
import Link from 'next/link';
import { ChevronDown, LogOut, Search, Wallet2, Menu, X } from 'lucide-react';
import { useLang } from '@/lang/useLang';
import Display from '@/app/components/Display';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getInforWallet, getMyWallets, useWallet } from '@/services/api/TelegramWalletService';
import { Button } from '@/ui/button';
import { formatNumberWithSuffix3, truncateString } from '@/utils/format';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Badge } from '@/ui/badge';
import { CheckCircle } from 'lucide-react';
import ListWallet from './list-wallet';
import type { Wallet } from './list-wallet';
import notify from './notify'
import { NotifyProvider } from './notify'
import { useWallets } from '@/hooks/useWallets'
import SearchModal from './search-modal';

const Header = () => {
    const { t } = useLang();
    const router = useRouter();
    const pathname = usePathname();
    const { wallets } = useWallets();
    const { data: walletInfor, refetch } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
        refetchInterval: 30000,
        staleTime: 30000,
    });
    const { isAuthenticated, logout, updateToken } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleChangeWallet = async (wallet: Wallet) => {
        try {
            const res = await useWallet({ wallet_id: wallet.wallet_id });
            updateToken(res.token);
            await refetch();
            notify({ 
                message: 'Chuyển đổi ví thành công!', 
                type: 'success' 
            });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error changing wallet:', error);
            notify({ 
                message: 'Chuyển đổi ví thất bại!', 
                type: 'error' 
            });
        }
    };
    console.log("isAuthenticated", isAuthenticated)

    useEffect(() => {
        setMounted(true);
        return () => {
            setMounted(false);
        };
    }, []);

    useEffect(() => {
        if (walletInfor?.status === 403) {
            notify({ 
                message: 'Vui lòng hoàn thiện thông tin cá nhân!', 
                type: 'error' 
            });
            router.push("/complete-profile");
        }
        if (walletInfor?.status === 401) {
            logout();
        }
        if (walletInfor && walletInfor.status === 200 && !isWalletDialogOpen) {
            notify({ 
                message: 'Đăng nhập thành công!', 
                type: 'success' 
            });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }, [walletInfor, router, logout, isWalletDialogOpen]);
    console.log("walletInfor", walletInfor)
    const listSidebar = [
        {
            name: t('overview'),
            href: '/dashboard'
        },
        // {
        //     name: t('trade'),
        //     href: '/trading'
        // },
        {
            name: t('create coin'),
            href: '/create-coin'
        },
        {
            name: t('masterTrade'),
            href: '/master-trade'
        },
        {
            name: t('wallet'),
            href: '/wallet'
        },
    ]
    return (
        <>
            <NotifyProvider />
            <header className="sticky top-0 w-full z-20 bg-white dark:bg-black border-b dark:border-none border-gray-200 dark:border-gray-800">
                <div className='flex items-center justify-between px-4 md:px-6 lg:px-10 py-3 md:py-[14px]'>
                    <div className='flex items-center gap-4 lg:gap-15'>
                        <Link href="/"><img src={"/logo.png"} alt="logo" className="h-6 md:h-8" /></Link>
                        {/* Desktop Navigation */}
                        <nav className='hidden lg:flex items-center gap-10 xl:gap-15'>
                            {listSidebar.map((item, index) => (
                                <Link
                                    href={item.href}
                                    key={index}
                                    className={`hover:gradient-hover text-theme-neutral-800 dark:text-theme-neutral-300 capitalize transition-colors  ${pathname === item.href ? 'gradient-hover font-semibold' : ''}`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className='hidden lg:flex items-center gap-4 xl:gap-6'>
                        {isAuthenticated && walletInfor && (
                            <button className='linear-gradient-light dark:linear-gradient-connect text-sm text-black dark:text-neutral-100 font-medium px-3 md:px-4 py-[6px] rounded-full transition-colors whitespace-nowrap'>
                                {walletInfor.solana_balance} SOL &ensp; {'$' + formatNumberWithSuffix3(walletInfor.solana_balance_usd)}
                            </button>
                        )}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchModalOpen(e.target.value.length > 0);
                                }}
                                onFocus={() => {
                                    if (searchQuery.length > 0) {
                                        setIsSearchModalOpen(true);
                                    }
                                }}
                                placeholder={t('searchPlaceholder')}
                                className="rounded-full py-2 pl-10 pr-4 w-48 md:w-60 text-sm focus:outline-none bg-gray-100 dark:bg-black text-gray-900 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500 dark:focus:ring-[hsl(var(--ring))] max-h-[30px] border border-gray-200 dark:border-t-theme-primary-300 dark:border-l-theme-primary-300 dark:border-b-theme-secondary-400 dark:border-r-theme-secondary-400 placeholder:text-gray-500 dark:placeholder:text-neutral-400 placeholder:text-xs"
                            />
                            <Search className="absolute left-3 top-2 h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                            <SearchModal 
                                isOpen={isSearchModalOpen} 
                                onClose={() => {
                                    setIsSearchModalOpen(false);
                                }} 
                                searchQuery={searchQuery}
                            />
                        </div>

                        <Display />

                        {mounted ? (
                            <>
                                {!isAuthenticated && (
                                    <button
                                        onClick={() => window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL, "_blank")}
                                        className="linear-gradient-light dark:linear-gradient-connect text-black dark:text-neutral-100 font-medium px-4 md:px-6 py-[6px] rounded-full transition-colors whitespace-nowrap"
                                    >
                                        {t('connect')}
                                    </button>
                                )}
                                {isAuthenticated && walletInfor && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="linear-gradient-light dark:linear-gradient-connect text-black dark:text-neutral-100 font-medium pr-2 pl-3 md:pl-4 py-[6px] rounded-full flex items-center transition-colors">
                                                <Wallet2 className="h-4 w-4 mr-1" />
                                                <span className="text-sm hidden md:inline">{truncateString(walletInfor.solana_address, 12)}</span>
                                                <ChevronDown size={16} className="ml-1" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
                                            <DropdownMenuItem className="dropdown-item cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-200" onClick={() => setIsWalletDialogOpen(true)}>
                                                <Wallet2 className="mr-2 h-4 w-4" />
                                                <span>Select Wallet</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="dropdown-item cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={logout}>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Logout</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </>
                        ) : (
                            <button
                                className="bg-blue-500 hover:bg-blue-600 dark:linear-gradient-connect text-white dark:text-neutral-100 font-medium px-4 md:px-6 py-[6px] rounded-full transition-colors whitespace-nowrap"
                            >
                                Connecting...
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-black">
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between p-4 border-b dark:border-neutral-800">
                                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                                    <img src={"/logo.png"} alt="logo" className="h-6 md:h-8" />
                                </Link>
                                <button 
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            
                            {/* Mobile Navigation */}
                            <nav className="flex flex-col p-4 space-y-4">
                                {listSidebar.map((item, index) => (
                                    <Link
                                        href={item.href}
                                        key={index}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`hover:gradient-hover text-theme-neutral-800 dark:text-theme-neutral-300 capitalize transition-colors text-lg py-2 ${pathname === item.href ? 'gradient-hover font-semibold' : ''}`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>

                            {/* Mobile Actions */}
                            <div className="mt-auto p-4 space-y-4 border-t dark:border-neutral-800">
                                {isAuthenticated && walletInfor && (
                                    <div className="flex flex-col space-y-2">
                                        <button className='linear-gradient-light dark:linear-gradient-connect text-sm text-black dark:text-neutral-100 font-medium px-4 py-3 rounded-full transition-colors w-full'>
                                            {walletInfor.solana_balance} SOL &ensp; {'$' + formatNumberWithSuffix3(walletInfor.solana_balance_usd)}
                                        </button>
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setIsSearchModalOpen(e.target.value.length > 0);
                                                }}
                                                onFocus={() => {
                                                    if (searchQuery.length > 0) {
                                                        setIsSearchModalOpen(true);
                                                    }
                                                }}
                                                placeholder={t('searchPlaceholder')}
                                                className="w-full rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none bg-gray-100 dark:bg-black text-gray-900 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500 dark:focus:ring-[hsl(var(--ring))] border border-gray-200 dark:border-t-theme-primary-300 dark:border-l-theme-primary-300 dark:border-b-theme-secondary-400 dark:border-r-theme-secondary-400 placeholder:text-gray-500 dark:placeholder:text-neutral-400 placeholder:text-xs"
                                            />
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <Display />
                                    {mounted && (
                                        <>
                                            {!isAuthenticated ? (
                                                <button
                                                    onClick={() => {
                                                        window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL, "_blank");
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    className="linear-gradient-light dark:linear-gradient-connect text-black dark:text-neutral-100 font-medium px-6 py-3 rounded-full transition-colors"
                                                >
                                                    {t('connect')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    className="linear-gradient-light dark:linear-gradient-connect text-red-600 dark:text-red-400 font-medium px-6 py-3 rounded-full transition-colors"
                                                >
                                                    Logout
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
                        <ListWallet isOpen={isWalletDialogOpen} onClose={() => setIsWalletDialogOpen(false)} onSelectWallet={handleChangeWallet} selectedWalletId={walletInfor?.solana_address} />
                    </DialogContent>
                </Dialog>
            </header>
        </>
    )
}

export default Header
