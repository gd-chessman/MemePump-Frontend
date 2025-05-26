'use client'
import React from 'react'
import { ArrowDownLeft, ArrowDownToLine, ArrowUpFromLine, ArrowUpRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getInforWallet } from '@/services/api/TelegramWalletService'
import { formatNumberWithSuffix3 } from '@/utils/format'
import { useRouter } from 'next/navigation'

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='bg-gradient-to-t from-theme-blue-100 to-theme-blue-200 p-[1px] relative w-full rounded-xl transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg'>
            <div className='w-full h-full rounded-xl bg-gradient-to-r from-theme-primary-500 to-theme-secondary-400'>
                <div className='dark:bg-[#00000054] p-6 rounded-xl w-full h-full flex flex-col items-center justify-center gap-3'>
                    {children}
                </div>
            </div>
        </div>
    )
}

const Title = ({ name }: { name: string }) => {
    return (
        <div className='flex items-center gap-2'>
            <img src={"/ethereum.png"} alt="ethereum" className='w-[16px] h-[16px] ' />
            <span className='text-neutral-100 text-[16px] font-semibold capitalize'>{name}</span>
            <img src={"/ethereum.png"} alt="ethereum" className='w-[16px] h-[16px]' />
        </div>
    )
}

const OverView = () => {
    const router = useRouter()
    const { data: walletInfor, refetch } = useQuery({
        queryKey: ["wallet-infor"],
        queryFn: getInforWallet,
    });
    console.log("walletInfor", walletInfor)
    return (
        <div className='flex flex-col gap-2'>
            <div className='relative clip-text uppercase text-sm font-semibold flex items-center gap-2'>
                <span className='gradient-hover'>Favorite </span>
                <img src={"/star.png"} alt="star" width={12} />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 z-10'>
                <Layout>
                    <img src="/solana-logo.png" alt="solana" className='w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-full' />
                    <div className='flex gap-2'>
                        <Title name="Launch your own token" />
                    </div>
                    <span className='text-neutral-100 font-normal capitalize text-xs mb-1 text-center px-2 md:px-0'>Customize name, symbol, tax, and supply in just a few simple steps</span>
                    <button 
                        onClick={() => router.push('/create-coin')} 
                        className='group relative bg-gradient-to-t from-theme-primary-500 to-theme-secondary-400 py-2 px-4 md:px-5 rounded-full text-xs transition-all duration-500 hover:from-theme-blue-100 hover:to-theme-blue-200 hover:scale-105 hover:shadow-lg hover:shadow-theme-primary-500/30 active:scale-95 w-full md:w-auto'
                    >
                        <span className='relative z-10'>Create Now</span>
                        <div className='absolute inset-0 rounded-full bg-gradient-to-r from-theme-primary-300 to-theme-secondary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm'></div>
                    </button>
                </Layout>

                <Layout>
                    <div className='flex flex-col items-center gap-2 w-full'>
                        <img src="/wallet-logo.png" alt="wallet-logo" className='w-[48px] md:w-[56px] h-auto bg-transparent' />
                        <Title name="UNIVERSAL ACCOUNT" />

                        {/* Balance */}
                        <div className='flex flex-col md:flex-row justify-evenly w-full mt-2 gap-4 md:gap-0'>
                            <div className="text-center">
                                <div className="text-white text-xl md:text-2xl font-bold mb-2">{walletInfor?.solana_balance} SOL</div>
                                <div className="text-cyan-400 text-xs md:text-sm">
                                    ${formatNumberWithSuffix3(walletInfor?.solana_balance_usd)} (0.00%) <span className='text-neutral-100'>24H</span>
                                </div>
                            </div>
                            <div className="flex justify-center space-x-4 gap-3">
                                <div className="flex flex-col justify-start items-center gap-1">
                                    <div className="w-7 h-7 md:w-8 md:h-8 gradient-overlay border border-neutral-200 rounded-full flex justify-center items-center top-[8px] ">
                                        <ArrowDownToLine className="w-3 h-3 md:w-4 md:h-4" />
                                    </div>
                                    <div className="text-center text-Colors-Neutral-100 text-[10px] font-semibold">
                                        Receive
                                    </div>
                                </div>
                                <div className="flex flex-col justify-start items-center gap-1">
                                    <div className="w-7 h-7 md:w-8 md:h-8 gradient-overlay border border-neutral-200 rounded-full flex justify-center items-center top-[8px]">
                                        <ArrowUpFromLine className="w-3 h-3 md:w-4 md:h-4" />
                                    </div>
                                    <div className="text-center text-Colors-Neutral-100 text-[10px] font-semibold">
                                        Send
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>

                <Layout>
                    <div className='flex flex-col items-center gap-3 w-full'>
                        <img src="/earth-logo.png" alt="earth-logo" className='w-[48px] md:w-[56px] h-auto bg-transparent rounded-full' />
                        <Title name="Master trade" />
                        <span className='text-neutral-100 text-xs font-normal mb-1 text-center px-2 md:px-0'>Copy trades from top traders with just one click</span>
                        <button 
                            onClick={() => router.push('/master-trade')} 
                            className='group relative bg-gradient-to-t from-theme-primary-500 to-theme-secondary-400 py-2 px-4 md:px-5 rounded-full text-xs transition-all duration-500 hover:from-theme-blue-100 hover:to-theme-blue-200 hover:scale-105 hover:shadow-lg hover:shadow-theme-primary-500/30 active:scale-95 w-full md:w-auto'
                        >
                            <span className='relative z-10'>Explore</span>
                            <div className='absolute inset-0 rounded-full bg-gradient-to-r from-theme-primary-300 to-theme-secondary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm'></div>
                        </button>
                    </div>
                </Layout>
            </div>
        </div>
    )
}

export default OverView;
