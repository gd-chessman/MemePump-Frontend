'use client'
import React, { useState } from 'react'
import { ChevronRight, Copy, Link, Star } from 'lucide-react';
import token from '@/assets/svgs/token.svg'
import Image from 'next/image';

const textTitle = 'text-neutral-200 font-normal text-xs'

const Check = () => {
    const [activeTab, setActiveTab] = useState('1');
    console.log(activeTab)
    return (
        <div className='z-1'>
            {/* Tabs */}
            <div className="flex gap-6 mb-4">
                <button className={` rounded-md text-sm font-medium px-2 py-1 border-1 border-solid cursor-pointer ${activeTab === '1' ? 'bg-white' : 'border-transparent'}`} onClick={() => setActiveTab('1')}>
                    <span className={`${activeTab === '1' ? 'check' : ''}`}>All token markets</span>
                </button>
                <button className={`rounded-md text-neutral-100 text-sm font-medium px-2 py-1 border-1 border-solid cursor-pointer ${activeTab === '2' ? 'border-[#15DFFD] bg-[#0F0F0F]' : 'border-transparent'}`} onClick={() => setActiveTab('2')}>
                    <span className={`${activeTab === '2' ? 'check' : ''}`}>New & trending</span>
                </button>
                <button className={`rounded-md text-neutral-100 text-sm font-medium px-2 py-1 border-1 border-solid cursor-pointer ${activeTab === '3' ? 'border-[#15DFFD] bg-[#0F0F0F]' : 'border-transparent'}`} onClick={() => setActiveTab('3')}>
                    <span className={`${activeTab === '3' ? 'check' : ''}`}>Meme</span>
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto text-neutral-100 dark:bg-[#0F0F0FD9] rounded-lg z-2">
                <table className="w-full text-sm">
                    <thead>
                        <tr className=" text-gray-400">
                            <th className="text-left"></th>
                            <th className={`text-left ${textTitle}`}>Token</th>
                            <th className={`py-3 px-4 text-left ${textTitle}`}>Address</th>
                            <th className={`py-3 px-4 text-right ${textTitle}`}>Price</th>
                            <th className={`py-3 px-4 text-right ${textTitle}`}>
                                MC <ChevronRight className="inline h-4 w-4" />
                            </th>
                            <th className={`py-3 px-4 text-right ${textTitle}`}>
                                Liq <ChevronRight className="inline h-4 w-4" />
                            </th>
                            <th className={`py-3 px-4 text-right ${textTitle}`}>
                                Holder <ChevronRight className="inline h-4 w-4" />
                            </th>
                            <th className={`py-3 px-4 text-right ${textTitle}`}>
                                1h Vol <ChevronRight className="inline h-4 w-4" />
                            </th>
                            <th className={`py-3 px-4 text-right ${textTitle}`}>
                                1h% <ChevronRight className="inline h-4 w-4" />
                            </th>
                            <th className={`py-3 px-4 text-right ${textTitle}`}>
                                24h Vol <ChevronRight className="inline h-4 w-4" />
                            </th>
                            <th className={`py-3 px-4 text-right ${textTitle}`}>
                                24h% <ChevronRight className="inline h-4 w-4" />
                            </th>
                            <th className={`py-3 px-4 text-center ${textTitle}`}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array(15)
                            .fill(0)
                            .map((_, i) => (
                                <tr key={i} className="border-b border-gray-800 hover:bg-[#1e1e1e]/50">
                                    <td className="py-3 px-4">
                                        <button className="text-gray-400 hover:text-yellow-300">
                                            <Star className="h-4 w-4" />
                                        </button>
                                    </td>
                                    <td className="">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gray-300 rounded-full overflow-hidden">
                                                <Image src={token || '/placeholder.png'} width={24} height={24} alt="Token logo" />
                                            </div>
                                            <Link href="/trade/popcat" className="hover:text-[#63f9fe]">
                                                POPCAT
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-400 truncate w-24">9BBNF...bgpump</span>
                                            <button className="text-gray-400">
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right">$1.30</td>
                                    <td className="py-3 px-4 text-right">$1.30M</td>
                                    <td className="py-3 px-4 text-right">$18M</td>
                                    <td className="py-3 px-4 text-right">180.50K</td>
                                    <td className="py-3 px-4 text-right">$7.78M</td>
                                    <td className="py-3 px-4 text-right text-green-400">15.98%</td>
                                    <td className="py-3 px-4 text-right">$150.02M</td>
                                    <td className="py-3 px-4 text-right text-green-400">30.3%</td>
                                    <td className="py-3 px-4 text-center ">
                                        <span
                                            className="linear-gradient-connect px-4 py-1 rounded-md text-sm font-medium inline-block"
                                        >
                                            Trade
                                        </span>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Check