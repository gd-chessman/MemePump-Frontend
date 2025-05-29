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
  const [windowHeight, setWindowHeight] = useState(800);
  const [chartHeight, setChartHeight] = useState(51);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkScreenSize = () => {
    // Check if screen width is less than 768px (typical mobile breakpoint)
    return window.innerWidth < 768;
  };

  useEffect(() => {
    setIsMounted(true);
    setWindowHeight(window.innerHeight);
    setIsMobile(checkScreenSize());
    
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setIsMobile(checkScreenSize());
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
  return (
    <div className={`h-[93vh] flex flex-col gap-4 container-trading py-4 relative z-10 ${
      isMobile ? 'px-2' : 'px-[40px]'
    }`}>
      {!isMobile && <Interface />}
      <div className={`flex-1 flex ${
        isMobile ? 'flex-col' : 'flex-row'
      } gap-4 w-full relative z-10 lg:overflow-hidden`}>
        {/* Left Column */}
        <div className={`flex ${
          isMobile ? 'flex-row w-full lg:h-[200px]' : 'flex-col w-1/6 '
        } gap-4 lg:overflow-hidden`}>
          <TokenInfo />
          {!isMobile && <ListToken />}
        </div>

        {/* Center Column */}
        <div ref={containerRef} className={`flex flex-col ${
          isMobile ? 'w-full h-[calc(100%-200px)]' : 'flex-1'
        } overflow-hidden relative`}>
          <div 
            style={{ height: isMobile ? '350px' : `${chartHeight}%` }} 
            className='dark:bg-theme-neutral-1000 shadow-inset bg-white rounded-xl p-2 md:p-4 overflow-auto lg:min-h-[20rem] transition-all duration-100 relative'
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
            className='h-1 m-1 md:m-2 bg-theme-neutral-800 cursor-row-resize hover:bg-neutral-600 transition-colors relative z-50'
            onMouseDown={handleDragStart}
            style={{ touchAction: 'none' }}
          />
          
          <div 
            style={{ height: !isMobile ? `${100 - chartHeight}%` : 'auto' }} 
            className='transition-all duration-100 overflow-hidden rounded-xl flex'
          >
            <div className='flex flex-1 w-full'>
              <TransactionHistory />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={`${
          isMobile ? 'w-full h-[200px]' : 'w-1/6 h-full overflow-hidden'
        } `}>
          <div className='h-full overflow-auto'>
            <Control/>
          </div>
        </div>
      </div>
      {/* <Slider /> */}
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
