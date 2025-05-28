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
                <div className='dark:bg-[#00000054] p-6 rounded-xl w-full h-full flex flex-col items-center justify-center gap-1 xl:gap-3'>
                    {children}
                </div>
            </div>
        </div>
    )
}

const Title = ({ name }: { name: string }) => {
    return (
        <div className='flex items-center gap-1 md:gap-2'>
            <img src={"/ethereum.png"} alt="ethereum" className='w-[14px] h-[14px] md:w-[16px] md:h-[16px]' />
            <span className='text-neutral-100 text-[13px] md:text-[14px] lg:text-[16px] font-semibold capitalize'>{name}</span>
            <img src={"/ethereum.png"} alt="ethereum" className='w-[14px] h-[14px] md:w-[16px] md:h-[16px]' />
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
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 z-10'>
                <Layout>
                    <img src="/solana-logo.png" alt="solana" className='w-[40px] h-[40px] md:w-[48px] md:h-[48px] lg:w-[56px] lg:h-[56px] rounded-full' />
                    <div className='flex gap-1 md:gap-2'>
                        <Title name="Launch your own token" />
                    </div>
                    <span className='text-neutral-100 font-normal capitalize text-[11px] md:text-xs mb-1 text-center px-1 md:px-2 lg:px-0'>Customize name, symbol, tax, and supply in just a few simple steps</span>
                    <button 
                        onClick={() => router.push('/create-coin')} 
                        className='lg:max-w-auto max-w-[120px] group relative bg-gradient-to-t from-theme-primary-500 to-theme-secondary-400 py-1.5 md:py-2 px-3 md:px-4 lg:px-5 rounded-full text-[11px] md:text-xs transition-all duration-500 hover:from-theme-blue-100 hover:to-theme-blue-200 hover:scale-105 hover:shadow-lg hover:shadow-theme-primary-500/30 active:scale-95 w-full md:w-auto'
                    >
                        <span className='relative z-10'>Create Now</span>
                        <div className='absolute inset-0 rounded-full bg-gradient-to-r from-theme-primary-300 to-theme-secondary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm'></div>
                    </button>
                </Layout>

                <Layout>
                    <div className='flex flex-col items-center gap-1.5 md:gap-2 w-full'>
                        <img src="/wallet-logo.png" alt="wallet-logo" className='w-[40px] md:w-[48px] lg:w-[75px] h-auto bg-transparent' />
                        <Title name="UNIVERSAL ACCOUNT" />

                        {/* Balance */}
                        <div className='flex flex-col md:flex-row justify-evenly w-full mt-1 md:mt-2 gap-3 md:gap-0'>
                            <div className="text-center">
                                <div className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-1 md:mb-2">{walletInfor?.solana_balance} SOL</div>
                                <div className="text-cyan-400 text-[11px] md:text-xs lg:text-sm">
                                    ${formatNumberWithSuffix3(walletInfor?.solana_balance_usd)} (0.00%) <span className='text-neutral-100'>24H</span>
                                </div>
                            </div>
                            <div className="flex justify-center space-x-3 md:space-x-4 gap-2 md:gap-3">
                                <button onClick={() => router.push('/universal-account')} className="flex flex-col justify-start items-center gap-0.5 md:gap-1">
                                    <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 gradient-overlay border border-neutral-200 rounded-full flex justify-center items-center group  transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-theme-primary-500/30 active:scale-95">
                                        <ArrowDownToLine className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4" />
                                    </div>
                                    <div className="text-center text-Colors-Neutral-100 text-[9px] md:text-[10px] font-semibold">
                                        Receive
                                    </div>
                                </button>
                                <button onClick={() => router.push('/universal-account')} className="flex flex-col justify-start items-center gap-0.5 md:gap-1">
                                    <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 gradient-overlay border border-neutral-200 rounded-full flex justify-center items-center transition-all hover:scale-105">
                                        <ArrowUpFromLine className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4" />
                                    </div>
                                    <div className="text-center text-Colors-Neutral-100 text-[9px] md:text-[10px] font-semibold">
                                        Send
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </Layout>

                <Layout>
                    <div className='flex flex-col items-center gap-2 md:gap-3 w-full'>
                        <img src="/earth-logo.png" alt="earth-logo" className='w-[40px] md:w-[48px] lg:w-[56px] h-auto bg-transparent rounded-full' />
                        <Title name="Master trade" />
                        <span className='text-neutral-100 text-[11px] md:text-xs font-normal mb-1 text-center px-1 md:px-2 lg:px-0'>Copy trades from top traders with just one click</span>
                        <button 
                            onClick={() => router.push('/master-trade')} 
                            className='lg:max-w-auto max-w-[120px] group relative bg-gradient-to-t from-theme-primary-500 to-theme-secondary-400 py-1.5 md:py-2 px-3 md:px-4 lg:px-5 rounded-full text-[11px] md:text-xs transition-all duration-500 hover:from-theme-blue-100 hover:to-theme-blue-200 hover:scale-105 hover:shadow-lg hover:shadow-theme-primary-500/30 active:scale-95 w-full md:w-auto'
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
