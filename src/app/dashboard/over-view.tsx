'use client'
import React from 'react'
import Image from 'next/image'
import star from '@/assets/svgs/star.svg'
import token from '@/assets/svgs/token.svg'
import dolaLogo from '@/assets/svgs/dolar-logo.svg'
import hourTradingVolume from '@/assets/svgs/hour-trading-volume.svg'
import monthTradingVolume from '@/assets/svgs/month-trading-volume.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from 'next-themes'

const OverView = () => {
    const { theme } = useTheme()
    const dataFavorite = [
        {
            name: 'PopCat',
            price: '$1.1234',
            fluctuation: '+12%'
        },
        {
            name: 'PopCat',
            price: '$1.1234',
            fluctuation: '+12%'
        },
        {
            name: 'PopCat',
            price: '$1.1234',
            fluctuation: '+12%'
        }
    ]
    const dataMarket = {
        name: 'Universe account',
        price: '$1.1234',
        priceChange: '0',
        fluctuation: '(0.00%)'
    }
    return (
        <div className='flex flex-col gap-2'>
            <div className='relative clip-text uppercase text-sm font-semibold flex items-center gap-2'>
                <span className='gradient-hover'>Favorite </span>
                <img src={"/star.png"} alt="star" width={12}/>
            </div>
            <div className='flex gap-6 z-10'>
                <div className='w-full rounded-lg border-1 border-theme-primary-300 dark:border-transparent dark:bg-[#0F0F0FD9] z-1'>

                    {dataFavorite.map((item, index) => (
                        <div key={index} className={`w-full flex px-6 justify-between max-h-[45px] py-[6px]  ${index !== dataFavorite.length - 1 ? 'border-b-1 border-theme-primary-300 dark:border-theme-neutral-800' : ''}`}>
                            <div className='flex items-center gap-[14px]'>
                                <img src={"/token.png"} alt="logo" />
                                <span className='uppercase text-xs font-medium'>PopCat</span>
                            </div>
                            <div className='flex items-center gap-3'>
                                <div className="flex flex-col font-normal">
                                    <span className='text-xs font-semibold'>$1.1234</span>
                                    <span className='fluctuation text-green-200 text-[10px] leading-[15px]'>+12%</span>
                                </div>
                                <div className='flex items-center justify-center'>
                                    <FontAwesomeIcon icon={faChevronRight} width={12} height={12} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`w-full rounded-lg  pl-[50px] pr-[40px] flex justify-between items-center ${theme !== 'dark' ? 'linear-gradient-light' : 'box-gradient'}`}>
                    <div className='flex flex-col justify-center gap-[10px]'>
                        <h3 className='text-neutral-100 text-base font-semibold flex items-center gap-2'>{dataMarket.name} &ensp; <FontAwesomeIcon icon={faChevronRight} width={12} height={12} /></h3>
                        <div className='flex items-center gap-[41px]'>
                            <span className='text-white text-sm text-[22px] font-bold leading-[33px]'>{dataMarket.price}</span>
                            <div className='text-[#15DFFD] text-base font-medium flex items-center gap-[6px]'>${dataMarket.priceChange} {dataMarket.fluctuation}<span className='text-white'>24H</span></div>
                        </div>
                        <div className='flex items-center gap-[48px]'>
                            <span className='text-white text-sm font-medium'>Receive &nbsp; {dataMarket.price}</span>
                            <span className='text-white text-sm font-medium'>Send &nbsp; ${dataMarket.priceChange}</span>
                        </div>
                    </div>
                    <img src={"/dolaLogo.png"} alt='dola-logo' className='xl:mr-12 w-[60px] h-[60px]'/>

                </div>
                <div className='w-full rounded-lg box-gradient flex justify-between items-center px-[60px] z-1'>
                    <div className='flex flex-col items-center gap-2'>
                        <img src={"/hourTradingVolume.png"} alt='hour-trading-volume' />
                        <span className='text-neutral-100 text-sm font-semibold capitalize'>Total 24h trading volume</span>
                        <span className='text-neutral-100 text-[22px] font-bold leading-[33px]'>$1.30M</span>
                    </div>
                    <div className='flex flex-col items-center gap-2'>
                        <img src={"/monthTradingVolume.png"} alt='hour-trading-volume' />
                        <span className='text-neutral-100 text-sm font-semibold capitalize'>Total 30d trading volume</span>
                        <span className='text-neutral-100 text-[22px] font-bold leading-[33px]'>$1.30M</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OverView;