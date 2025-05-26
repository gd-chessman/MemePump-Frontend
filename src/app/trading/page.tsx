"use client"
import Interface from './inter-face/page'
import TokenInfo from './token-info'
import ListToken from './list-token/page'
import TransactionHistory from './transaction-history/page'
import Control from './control/page'
import Slider from './slider/page'
import { useState, useEffect, Suspense, useRef } from 'react'
import TradingViewChart from '@/app/components/tradingview-chart/TradingViewChart'

const TradingPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [windowHeight, setWindowHeight] = useState(800); // Default height
  const [chartHeight, setChartHeight] = useState(51); // Changed default to 50%
  const [isDragging, setIsDragging] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkScreenSize = () => {
    // Get screen dimensions in pixels
    const width = window.screen.width;
    const height = window.screen.height;
    
    // Get pixel density (DPI)
    const dpi = window.devicePixelRatio;
    
    // Calculate physical size in inches
    // Using Pythagorean theorem to get diagonal size
    const diagonalPixels = Math.sqrt(width * width + height * height);
    const diagonalInches = diagonalPixels / (dpi * 96); // 96 is the standard DPI
    
    // Check if screen is approximately 14.2 inches (with some tolerance)
    return Math.abs(diagonalInches - 14.2) < 0.5;
  };

  useEffect(() => {
    setIsMounted(true);
    setWindowHeight(window.innerHeight);
    setIsSmallScreen(checkScreenSize());
    
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setIsSmallScreen(checkScreenSize());
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
      
      // Limit the height between 30% and 50%
      setChartHeight(Math.min(Math.max(newHeight, 51), 90));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = () => {
    setIsDragging(true);
    document.body.style.cursor = 'row-resize';
  };

  // Use default height during SSR
  const height = isMounted ? windowHeight : 800;

  console.log("height", height)
  return (
    <div className={`h-[92vh] flex flex-col gap-4 container-trading py-4 relative z-10 ${isSmallScreen ? 'px-[10px]' : 'px-[40px]'}`}>
      <Interface />
      <div className='flex-1 flex gap-4 w-full relative z-10 overflow-hidden'>
        {/* Left Column */}
        <div className={`flex flex-col gap-4 overflow-hidden ${isSmallScreen ? 'w-1/5' : 'w-1/6'}`}>
          <TokenInfo />
          <ListToken />
        </div>

        {/* Center Column */}
        <div ref={containerRef} className='flex flex-col flex-1 overflow-hidden relative'>
          <div 
            style={{ height: `${chartHeight}%` }} 
            className='bg-neutral-800 rounded-xl p-4 overflow-auto min-h-[20rem] transition-all duration-100 relative'
          >
            <TradingViewChart className='h-full' />
            {isDragging && (
              <div 
                className='absolute inset-0 bg-transparent z-50 cursor-row-resize'
                style={{ touchAction: 'none' }}
              />
            )}
          </div>
          
          <div 
            className='h-1 m-2 bg-neutral-700 cursor-row-resize hover:bg-neutral-600 transition-colors relative z-50'
            onMouseDown={handleDragStart}
            style={{ touchAction: 'none' }}
          />
          
          <div 
            style={{ height: `${100 - chartHeight}%` }} 
            className='transition-all duration-100 overflow-hidden flex'
          >
            <div className='flex flex-1'>
              <TransactionHistory />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={`${isSmallScreen ? 'w-1/5' : 'w-1/6'} h-full overflow-hidden`}>
          <div className='h-full overflow-auto'>
            <Control/>
          </div>
        </div>
      </div>
      <Slider />
    </div>
  )
}

export default function TradingPageWrapper() {
  return (
    <Suspense fallback={<div></div>}>
      <TradingPage />
    </Suspense>
  )
}
