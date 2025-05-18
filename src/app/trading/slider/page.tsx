"use client"
import React, { useEffect, useRef } from 'react'
import TokenTicker from '@/app/components/trading/token-ticker';

const tokenData = [
  { symbol: "POP", price: "$16.87", change: "12.08%" },
  { symbol: "BTC", price: "$43,521", change: "2.34%" },
  { symbol: "ETH", price: "$2,345", change: "-1.23%" },
  { symbol: "SOL", price: "$98.76", change: "5.67%" },
  { symbol: "BNB", price: "$312.45", change: "3.21%" },
  { symbol: "ADA", price: "$0.45", change: "1.23%" },
  { symbol: "DOT", price: "$6.78", change: "-0.89%" },
  { symbol: "XRP", price: "$0.52", change: "3.45%" },
  { symbol: "DOGE", price: "$0.12", change: "7.89%" },
  { symbol: "LINK", price: "$14.56", change: "-2.34%" },
  { symbol: "MATIC", price: "$0.89", change: "4.56%" },
  { symbol: "AVAX", price: "$32.45", change: "1.23%" },
  { symbol: "UNI", price: "$5.67", change: "-3.45%" },
  { symbol: "AAVE", price: "$87.65", change: "2.34%" },
  { symbol: "ATOM", price: "$9.87", change: "5.67%" },
];

const TokenSlider = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const tokensPerSlide = 10;
  const totalSlides = Math.ceil(tokenData.length / tokensPerSlide);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        ref={sliderRef}
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {Array.from({ length: totalSlides }).map((_, slideIndex) => (
          <div 
            key={slideIndex}
            className="flex-shrink-0"
          >
            <div className="flex gap-2">
              {tokenData
                .slice(slideIndex * tokensPerSlide, (slideIndex + 1) * tokensPerSlide)
                .map((token) => (
                  <div key={token.symbol} className="w-1/5">
                    <TokenTicker 
                      symbol={token.symbol} 
                      price={token.price} 
                      change={token.change} 
                      className="w-max"
                      isShow={false}
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default TokenSlider;