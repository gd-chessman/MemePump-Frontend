"use client"
import TokenTicker from '@/app/components/trading/token-ticker'
import { getTokenInforByAddress } from '@/services/api/SolonaTokenService';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useLang } from '@/lang/useLang';

interface TokenInfo {
  address: string;
  symbol: string;
  price: string;
  name: string;
  logoUrl: string;
  marketCap: string;
  volume24h: number;
}

// Helper function to safely calculate percentage change
const calculateChange = (volume24h: number, marketCap: string): string => {
  try {
    const marketCapNum = parseFloat(marketCap);
    if (isNaN(marketCapNum) || marketCapNum === 0 || isNaN(volume24h)) {
      return "0.00";
    }
    const change = (volume24h / marketCapNum) * 100;
    return isNaN(change) ? "0.00" : change.toFixed(2);
  } catch (error) {
    return "0.00";
  }
};

// Helper function to safely format price
const formatPrice = (price: string): string => {
  try {
    const priceNum = parseFloat(price);
    return isNaN(priceNum) ? "0.0000" : priceNum.toFixed(4);
  } catch (error) {
    return "0.0000";
  }
};

const Interface = () => {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const address = searchParams?.get("address");
  const [recentTokens, setRecentTokens] = useState<TokenInfo[]>([]);

  const { data: tokenInfor, isLoading } = useQuery<TokenInfo>({
    queryKey: ["token-infor", address],
    queryFn: () => getTokenInforByAddress(address),
  });
  console.log("tokenInfor", tokenInfor)

  // Update recent tokens when tokenInfor changes
  useEffect(() => {
    if (tokenInfor) {
      const newToken: TokenInfo = {
        address: tokenInfor.address,
        symbol: tokenInfor.symbol,
        price: tokenInfor.price,
        name: tokenInfor.name,
        logoUrl: tokenInfor.logoUrl,
        marketCap: tokenInfor.marketCap,
        volume24h: tokenInfor.volume24h || 0 // Ensure volume24h is never undefined
      };
      
      // Get existing tokens from localStorage
      const storedTokens = localStorage.getItem('recentTokens');
      let tokens: TokenInfo[] = storedTokens ? JSON.parse(storedTokens) : [];
      
      // Remove if token already exists
      tokens = tokens.filter(t => t.address !== newToken.address);
      
      // Add new token to the beginning
      tokens.unshift(newToken);
      
      // Keep only last 3 tokens
      tokens = tokens.slice(0, 3);
      
      // Save to localStorage and state
      localStorage.setItem('recentTokens', JSON.stringify(tokens));
      setRecentTokens(tokens);
    }
  }, [tokenInfor]);

  // Load recent tokens on component mount
  useEffect(() => {
    const storedTokens = localStorage.getItem('recentTokens');
    if (storedTokens) {
      setRecentTokens(JSON.parse(storedTokens));
    }
  }, []);

  const handleTokenClick = (token: TokenInfo) => {
    // Open token details in new tab
    window.open(`/trading?address=${token.address}`, '_blank');
  };

  if (isLoading) {
    return <div>{t('trading.interface.loading')}</div>;
  }

  return (
    <div className="px-0 flex flex-col gap-2">
      {recentTokens.length > 0 ? (
        <>
          <div className="flex gap-2">
            {recentTokens.map((token, index) => (
              <div 
                key={token.address}
                onClick={() => handleTokenClick(token)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                title={t('trading.interface.openInNewTab')}
              >
                <TokenTicker 
                  symbol={token.symbol}
                  price={`$${formatPrice(token.price)}`}
                  change={`${calculateChange(token.volume24h, token.marketCap)}%`}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-500">{t('trading.interface.noTokens')}</div>
      )}
    </div>
  )
}

export default Interface