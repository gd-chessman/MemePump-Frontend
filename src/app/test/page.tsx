"use client";
import { useTranslate } from '@/hooks/useTranslate';
import React from 'react'

export default function TestPage() {
  const { translatedText, isLoading, error } = useTranslate('안녕하세요');
  
  return (
    <div>
     <div className="p-5 bg-stone-950 rounded-lg shadow-[0px_0px_4px_0px_rgba(232,232,232,0.50)] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-[5px] inline-flex justify-start items-end gap-1">
    <div className="w-96 inline-flex flex-col justify-start items-center gap-4">
        <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-indigo-500 text-lg font-semibold uppercase leading-relaxed">Connect</div>
            <div className="w-5 h-5 relative overflow-hidden">
                <div className="w-3 h-3 left-[4.17px] top-[4.16px] absolute bg-Colors-Neutral-200" />
            </div>
        </div>
        <div className="flex flex-col justify-start items-center gap-1.5">
            <div className="justify-start text-Colors-Neutral-100 text-lg font-medium uppercase leading-relaxed">Welcome to our platform</div>
            <div className="justify-start text-Colors-Neutral-100 text-sm font-normal leading-tight">Connect with us through multiple flexible login methods</div>
        </div>
        <div className="inline-flex justify-start items-center gap-20">
            <div data-property-1="Frame 427320434" className="w-12 inline-flex flex-col justify-start items-center gap-1">
                <div className="self-stretch h-12 relative">
                    <div className="w-12 h-12 left-0 top-0 absolute rounded-full" />
                    <div className="w-7 h-7 left-[10px] top-[10px] absolute overflow-hidden">
                        <div className="w-1.5 h-3.5 left-0 top-[8.10px] absolute bg-yellow-500" />
                        <div className="w-3.5 h-3.5 left-[15.33px] top-[12.20px] absolute bg-blue-500" />
                        <div className="w-6 h-3 left-[1.79px] top-[18.13px] absolute bg-green-600" />
                        <div className="w-6 h-3 left-[1.68px] top-0 absolute bg-red-500" />
                    </div>
                </div>
                <div className="self-stretch text-center justify-start text-white text-sm font-normal leading-tight">Google</div>
            </div>
            <div className="inline-flex flex-col justify-start items-center gap-1">
                <div className="self-stretch h-12 relative">
                    <div className="w-12 h-12 left-0 top-0 absolute rounded-full" />
                    <div className="w-7 h-7 left-[15px] top-[10px] absolute overflow-hidden">
                        <div className="w-7 h-6 left-0 top-[2.50px] absolute bg-sky-500" />
                    </div>
                </div>
                <div className="text-center justify-start text-white text-sm font-normal leading-tight">Telegram</div>
            </div>
            <div className="inline-flex flex-col justify-start items-center gap-1">
                <div className="self-stretch h-12 relative">
                    <div className="w-12 h-12 left-0 top-0 absolute rounded-full" />
                    <img className="w-7 h-7 left-[13px] top-[10px] absolute" src="https://placehold.co/30x30" />
                </div>
                <div className="text-center justify-start text-white text-sm font-normal leading-tight">Phantom</div>
            </div>
        </div>
    </div>
</div>
    </div>
  )
}
