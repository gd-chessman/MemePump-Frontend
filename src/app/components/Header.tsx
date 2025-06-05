'use client';

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link';
import { ChevronDown, LogOut, Search, Wallet2, Menu, X, LayoutDashboard, Coins, LineChart, Wallet as WalletIcon, Moon, Sun, EyeOff, ShieldCheck, FileCheck, LinkIcon } from 'lucide-react';
import { useLang } from '@/lang/useLang';
import Display from '@/app/components/Display';
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
import { formatNumberWithSuffix3, truncateString } from '@/utils/format';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import ListWallet from './list-wallet';
import type { Wallet } from './list-wallet';
import notify from './notify'
import { NotifyProvider } from './notify'
import SearchModal from './search-modal';
import MobileWalletSelector from './mobile-wallet-selector';
import { useWallets } from '@/hooks/useWallets';
import { LangToggle } from './LanguageSelect';
import { useTheme } from 'next-themes';
import PumpFun from './pump-fun';
import ModalSignin from './ModalSignin';


const Header = () => {
    const { t, lang } = useLang();
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, logout, updateToken } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [isDark, setIsDark] = useState(theme);
    useEffect(() => {
        setIsDark(theme);
    }, [theme]);

    // Add wallets query
    const { wallets: myWallets } = useWallets();

    const { data: walletInfor, refetch } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
        refetchInterval: 30000,
        staleTime: 30000,
        enabled: isAuthenticated,
    });

    const handleChangeWallet = async (wallet: Wallet) => {
        try {
            const res = await useWallet({ wallet_id: wallet.wallet_id });
            updateToken(res.token);
            await refetch();
            notify({
                message: t('header.notifications.switchWalletSuccess'),
                type: 'success'
            });
            // Reload the page after successful wallet switch
            window.location.reload();
        } catch (error) {
            console.error('Error changing wallet:', error);
            notify({
                message: t('header.notifications.switchWalletFailed'),
                type: 'error'
            });
        }
    };

    useEffect(() => {
        setMounted(true);
        return () => {
            setMounted(false);
        };
    }, []);

    useEffect(() => {
        if (walletInfor?.status === 403) {
            notify({
                message: t('header.notifications.completeProfile'),
                type: 'error'
            });
            router.push("/complete-profile");
        }
        if (walletInfor?.status === 401) {
            logout();
        }
        if (walletInfor && walletInfor.status === 200) {
            if (!isWalletDialogOpen) {
                notify({
                    message: t('header.notifications.loginSuccess'),
                    type: 'success'
                });
            }
        }
    }, [walletInfor, router, logout, isWalletDialogOpen]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // 1024px is the lg breakpoint
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const handleSelectWallet = useCallback(() => {
        if (isMobile) {
            // For mobile, we'll use the dropdown in MobileWalletSelector
            return;
        }
        // For desktop, open the dialog
        setIsWalletDialogOpen(true);
    }, [isMobile]);

    useEffect(() => {
        if (!isSearchModalOpen) {
            setSearchQuery("");
        }
    }, [isSearchModalOpen]);

    const listSidebar = [
        {
            name: t('over view'),
            href: '/dashboard',
            icon: LayoutDashboard,
            logoPump: false,
        },
        {
            name: t('create coin'),
            href: '/create-coin',
            icon: Coins,
            logoPump: true,
            dropdown: [
                {
                    name: 'PumpFun',
                    href: '/create-coin/pumpfun',
                },
                {
                    name: 'MemePump',
                    href: '/create-coin/memepump',
                },
            ]
        },
        {
            name: t('overview.masterTrade.title'),
            href: '/master-trade',
            icon: LineChart,
            logoPump: false,
        },
        {
            name: t("wallet manager"),
            href: '/wallet',
            icon: WalletIcon,
            logoPump: false,
        },
    ]
    return (
        <>
            <NotifyProvider />
            <header className="sticky top-0 w-full z-20 bg-white dark:bg-black border-b dark:border-none border-gray-200 dark:border-gray-800">
                <div className='flex items-center justify-between px-4 md:px-6 lg:px-10 py-3 md:py-[14px]'>
                    <div className='flex gap-4'>
                        <div className='flex items-center gap-4 lg:gap-15'>
                            <Link href="/"><img src={"/logo.png"} alt="logo" className="h-6 md:h-8" /></Link>
                            {/* Desktop Navigation */}
                            <nav className='hidden lg:flex items-center gap-10 xl:gap-15'>
                                {listSidebar.map((item, index) => (
                                    item.dropdown ? (
                                        <div key={index} className="relative group">
                                            <button className={`hover:gradient-hover text-theme-neutral-800 dark:text-theme-neutral-300 capitalize transition-colors flex items-center gap-2 ${pathname.startsWith(item.href) ? 'gradient-hover font-semibold' : ''}`}>
                                                {item.name}
                                                <ChevronDown size={16} className="ml-1" />
                                            </button>
                                            <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                                {item.dropdown.map((subItem, subIndex) => (
                                                    <Link
                                                        key={subIndex}
                                                        href={subItem.href}
                                                        className="px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center gap-2"
                                                    >
                                                        {subItem.name === 'MemePump' && <img src="/logo.png" alt="MemePump" className="h-4 w-4" />}
                                                        {subItem.name === 'PumpFun' && <PumpFun />}
                                                        {subItem.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            key={index}
                                            className={`hover:gradient-hover text-theme-neutral-800 dark:text-theme-neutral-300 capitalize transition-colors flex items-center gap-2 ${pathname === item.href ? 'gradient-hover font-semibold' : ''}`}
                                        >
                                            {item.name}
                                        </Link>
                                    )
                                ))}
                            </nav>
                        </div>

                        {/* Mobile Search */}
                        <div className="lg:hidden relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                }}
                                onFocus={() => {
                                    setIsSearchModalOpen(true);
                                }}
                                placeholder={t('header.search.placeholder')}
                                className="rounded-full py-1 pl-8 pr-3 w-32 text-xs focus:outline-none bg-gray-100 dark:bg-black text-gray-900 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500 dark:focus:ring-[hsl(var(--ring))] border border-gray-200 dark:border-t-theme-primary-300 dark:border-l-theme-primary-300 dark:border-b-theme-secondary-400 dark:border-r-theme-secondary-400 placeholder:text-gray-500 dark:placeholder:text-neutral-400"
                            />
                            <Search className="absolute left-2 top-1.5 h-3 w-3 text-gray-500 dark:text-muted-foreground" />
                        </div>
                    </div>
                    <SearchModal
                        isOpen={isSearchModalOpen}
                        onClose={() => {
                            setIsSearchModalOpen(false);
                        }}
                        searchQuery={searchQuery}
                    />

                    {/* Mobile Wallet Info */}
                    <div className="lg:hidden flex items-center gap-2">
                        {mounted && (
                            <>
                                {!isAuthenticated ? (
                                    <button
                                        onClick={() => setIsSigninModalOpen(true)}
                                        className="linear-gradient-light dark:linear-gradient-connect text-black dark:text-neutral-100 font-medium px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap"
                                    >
                                        {t('connect')}
                                    </button>
                                ) : walletInfor && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="bg-gradient-to-t dark:bg-gradient-to-t dark:from-theme-primary-500 dark:to-theme-secondary-400 text-sm linear-gradient-blue text-theme-neutral-100 dark:text-neutral-100 font-medium px-3 md:px-4 py-[6px] rounded-full transition-colors whitespace-nowrap flex items-center">
                                                <Wallet2 className="h-3 w-3 mr-1" />
                                                <span>{truncateString(walletInfor.solana_address, 12)}</span>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
                                            <div className="p-2">
                                                <MobileWalletSelector
                                                    selectedWalletId={walletInfor.solana_address}
                                                    onSelectWallet={(wallet) => {
                                                        handleChangeWallet(wallet);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    currentWalletAddress={walletInfor.solana_address}
                                                />
                                            </div>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/tos/${lang}`} className="dropdown-item lg:pl-3 lg:pb-[10px] cursor-pointer text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
                                                    <span>{t('header.wallet.tos')}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/privacypolicy/${lang}`} className="dropdown-item lg:pl-3 lg:pb-[10px] cursor-pointer text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
                                                    <span>{t('header.wallet.privacypolicy')}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/ref`} className="dropdown-item lg:pl-3 lg:pb-[10px] cursor-pointer text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
                                                    <span>{t('header.wallet.ref')}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="dropdown-item lg:pl-3 lg:pb-[10px] cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={logout}>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>{t('header.wallet.logout')}</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </>
                        )}
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
                            <button className='bg-gradient-to-t dark:bg-gradient-to-t dark:from-theme-primary-500 dark:to-theme-secondary-400 text-sm linear-gradient-blue text-theme-neutral-100 dark:text-neutral-100 font-medium px-3 md:px-4 py-[6px] rounded-full transition-colors whitespace-nowrap'>
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
                        </div>

                        <Display />

                        {mounted ? (
                            <>
                                {!isAuthenticated ? (
                                    <button
                                        onClick={() => {
                                            setIsSigninModalOpen(true);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="bg-gradient-to-t dark:bg-gradient-to-t dark:from-theme-primary-500 dark:to-theme-secondary-400 text-sm linear-gradient-blue text-theme-neutral-100 dark:text-neutral-100 font-medium px-3 md:px-4 py-[6px] rounded-full transition-colors whitespace-nowrap flex items-center gap-1"
                                    >
                                        {t('connect')}
                                    </button>
                                ) : walletInfor && walletInfor.solana_address ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="bg-gradient-to-t dark:bg-gradient-to-t dark:from-theme-primary-500 dark:to-theme-secondary-400 text-sm linear-gradient-blue text-theme-neutral-100 dark:text-neutral-100 font-medium px-3 md:px-4 py-[6px] rounded-full transition-colors whitespace-nowrap flex items-center gap-1">
                                                <Wallet2 className="h-4 w-4 mr-1" />
                                                <span className="text-sm hidden md:inline">{truncateString(walletInfor.solana_address, 12)}</span>
                                                <ChevronDown size={16} className="ml-1" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
                                            <DropdownMenuItem
                                                className="dropdown-item cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-200"
                                                onClick={handleSelectWallet}
                                            >
                                                <Wallet2 className="mr-2 h-4 w-4" />
                                                <span>{t('header.wallet.selectWallet')}</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/tos/${lang}`} className="dropdown-item cursor-pointer text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
                                                    <FileCheck className="mr-2 h-4 w-4" />
                                                    <span>{t('header.wallet.tos')}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/privacypolicy/${lang}`} className="dropdown-item cursor-pointer text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    <span>{t('header.wallet.privacypolicy')}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/ref`} className="dropdown-item cursor-pointer text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
                                                    <LinkIcon className="mr-2 h-4 w-4" />
                                                    <span>{t('header.wallet.ref')}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="dropdown-item cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={logout}>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>{t('header.wallet.logout')}</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <button
                                        className="bg-blue-500 hover:bg-blue-600 dark:linear-gradient-connect text-white dark:text-neutral-100 font-medium px-4 md:px-6 py-[6px] rounded-full transition-colors whitespace-nowrap"
                                    >
                                        {t('header.wallet.loading')}
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                className="bg-blue-500 hover:bg-blue-600 dark:linear-gradient-connect text-white dark:text-neutral-100 font-medium px-4 md:px-6 py-[6px] rounded-full transition-colors whitespace-nowrap"
                            >
                                {t('header.wallet.connecting')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-black">
                        <div className=" h-full bg-gradient-to-r dark:from-theme-primary-500 dark:to-theme-secondary-400 backdrop-blur-md bg-theme-blue-300">
                            <div className='dark:bg-theme-black-1/2 flex flex-col h-full'>
                                <div className="flex items-center justify-between p-4 ">
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
                                    {listSidebar.map((item, index) => {
                                        const Icon = item.icon;
                                        return item.dropdown ? (
                                            <div key={index} className="space-y-2">
                                                <div className={`hover:gradient-hover dark:text-theme-neutral-100 text-theme-neutral-800 md:dark:text-theme-neutral-300 capitalize transition-colors text-lg py-2 flex items-center gap-3 ${pathname.startsWith(item.href) ? 'gradient-hover font-semibold' : ''}`}>
                                                    <Icon className="h-5 w-5" />
                                                    {item.name}
                                                </div>
                                                <div className="pl-8 space-y-2">
                                                    {item.dropdown.map((subItem, subIndex) => (
                                                        <Link
                                                            href={subItem.href}
                                                            key={subIndex}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="hover:gradient-hover dark:text-theme-neutral-100 text-theme-neutral-800 md:dark:text-theme-neutral-300 capitalize transition-colors text-base py-1 flex items-center gap-2"
                                                        >
                                                            {subItem.name === 'MemePump' && <img src="/logo.png" alt="MemePump" className="h-4 w-4" />}
                                                            {subItem.name === 'PumpFun' && <PumpFun />}
                                                            {subItem.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                key={index}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`hover:gradient-hover dark:text-theme-neutral-100 text-theme-neutral-800 md:dark:text-theme-neutral-300 capitalize transition-colors text-lg py-2 flex items-center gap-3 ${pathname === item.href ? 'gradient-hover font-semibold' : ''}`}
                                            >
                                                <Icon className="h-5 w-5" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}

                                    {/* Additional Mobile Links */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-neutral-800">
                                        <Link
                                            href={`/tos/${lang}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="hover:gradient-hover dark:text-theme-neutral-100 text-theme-neutral-800 md:dark:text-theme-neutral-300 capitalize transition-colors text-base py-2 flex items-center gap-3"
                                        >
                                            <FileCheck className="h-5 w-5" />
                                            {t('header.wallet.tos')}
                                        </Link>
                                        <Link
                                            href={`/privacypolicy/${lang}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="hover:gradient-hover dark:text-theme-neutral-100 text-theme-neutral-800 md:dark:text-theme-neutral-300 capitalize transition-colors text-base py-2 flex items-center gap-3"
                                        >
                                            <ShieldCheck className="h-5 w-5" />
                                            {t('header.wallet.privacypolicy')}
                                        </Link>
                                        <Link
                                            href="/ref"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="hover:gradient-hover dark:text-theme-neutral-100 text-theme-neutral-800 md:dark:text-theme-neutral-300 capitalize transition-colors text-base py-2 flex items-center gap-3"
                                        >
                                            <LinkIcon className="h-5 w-5" />
                                            {t('header.wallet.ref')}
                                        </Link>
                                    </div>
                                </nav>
                                <LangToggle className='!bg-transparent border-none !pl-5' showArrow={true} />
                               

                                {/* Mobile Actions */}
                                <div className="mt-auto p-4 space-y-4">
                                <div className='flex items-center justify-evenly gap-4 mt-1'>
                                    <Moon 
                                        className="cursor-pointer transition-colors " 
                                        onClick={() => isDark === "light" && setTheme("dark")} 
                                        style={isDark === "dark" ? { color: "#fff" } : { color: "#6b7280" }}
                                    />
                                    <Sun 
                                        className="cursor-pointer transition-colors" 
                                        onClick={() => isDark === "dark" && setTheme("light")} 
                                        style={isDark === "light" ? { color: "#f59e0b" } : { color: "#6b7280" }}
                                    />
                                </div>
                                    {isAuthenticated && walletInfor && (
                                        <div className="flex flex-col space-y-2">
                                            <button className='bg-gradient-to-t dark:bg-gradient-to-t dark:from-theme-primary-500 dark:to-theme-secondary-400 text-sm linear-gradient-blue text-theme-neutral-100 dark:text-neutral-100 font-medium px-3 md:px-4 py-[6px] rounded-full transition-colors whitespace-nowrap'>
                                                {walletInfor.solana_balance} SOL &ensp; {'$' + formatNumberWithSuffix3(walletInfor.solana_balance_usd)}
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <Display />
                                        {mounted && (
                                            <>
                                                {!isAuthenticated ? (
                                                    <button
                                                        onClick={() => {
                                                            setIsSigninModalOpen(true);
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
                                                            refetch();
                                                        }}
                                                        className="bg-gradient-to-t dark:bg-gradient-to-t dark:from-theme-primary-500 dark:to-theme-secondary-400 text-sm linear-gradient-blue text-theme-neutral-100 dark:text-neutral-100 font-medium px-3 md:px-4 py-[6px] rounded-full transition-colors whitespace-nowrap"
                                                    >
                                                        {t('header.wallet.logout')}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Desktop Dialog */}
                <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-white p-0 border-none dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
                        <ListWallet
                            isOpen={isWalletDialogOpen}
                            onClose={() => setIsWalletDialogOpen(false)}
                            onSelectWallet={handleChangeWallet}
                            selectedWalletId={walletInfor?.solana_address || null}
                        />
                    </DialogContent>
                </Dialog>
            </header>
            <ModalSignin isOpen={isSigninModalOpen} onClose={() => setIsSigninModalOpen(false)} />
        </>
    )
}

export default Header
