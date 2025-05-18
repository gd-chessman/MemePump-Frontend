import { useLang } from '@/lang/useLang';
import { getPriceSolona } from '@/services/api/SolonaTokenService';
import { formatNumberWithSuffix, truncateString } from '@/utils/format';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react'

export default function CardFlash({ tokens }: { tokens: any[] }) {
  const { data: solPrice } = useQuery({
    queryKey: ["sol-price"],
    queryFn: () => getPriceSolona(),
  });
  const router = useRouter();
  const { t } = useLang();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:w-[40rem] mr-auto">
    {tokens.slice(0, 2).map((token, index) => (
      <div 
        key={index} 
        className="border p-1.5 rounded-lg text-xs border-[#d8e8f7] flash-animation bg-[#d8e8f7] text-black cursor-pointer hover:bg-[#c8d8e7] transition-colors"
        onClick={() => router.push(`/trading?address=${token.address}`)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {token.logoUrl && (
              <img src={token.logoUrl} alt={token.symbol} className="w-6 h-6 rounded" />
            )}
            <div>
              <h3 className="font-semibold text-xs max-w-[10rem] truncate text-black">{token.name}</h3>
              <p className="text-black text-[10px]">{token.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-black">{truncateString(token.address, 20)}</p>
            <p className="text-[10px] text-black">{t("trading.marketCap")}: ${formatNumberWithSuffix(token.marketCap * solPrice?.priceUSD)}</p>
          </div>
        </div>
      </div>
    ))}
    <style jsx>{`
      @keyframes flash {
        0% {
          box-shadow: 0 0 0 0 rgba(216, 232, 247, 0.4);
        }
        50% {
          box-shadow: 0 0 10px 5px rgba(216, 232, 247, 0.8);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(216, 232, 247, 0.4);
        }
      }
      .flash-animation {
        animation: flash 1s infinite;
      }
    `}</style>
  </div>
  )
}
