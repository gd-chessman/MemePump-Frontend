import React, { useEffect, useRef, useState } from 'react';
import { MockDatafeed, formatNumber } from './datafeed';
import { useSearchParams } from 'next/navigation';
import { getTokenInforByAddress } from '@/services/api/SolonaTokenService';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/lang';
import { useThemeToggle } from '@/hooks/use-theme-toggle';

type ResolutionString = '1s' | '5s' | '15s' | '1' | '5' | '1h' | '4h' | '1D' | '1W' | '1MN';

const transformLang = (lang: string): string => {
  if (lang === 'kr') return 'ko';
  if (lang === 'jp') return 'ja';
  return lang;
};

interface TradingViewChartProps {
  symbol?: string;
  interval?: ResolutionString;
  containerId?: string;
  className?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = 'MOCK',
  interval: defaultInterval = '5s' as ResolutionString,
  containerId = 'tv_chart_container',
  className
}) => {
  const searchParams = useSearchParams();
  const address = searchParams?.get("address");
  const [interval, setInterval] = useState<ResolutionString>(() => {
    if (typeof window !== 'undefined') {
      const savedInterval = localStorage.getItem('chartInterval');
      return (savedInterval as ResolutionString) || defaultInterval;
    }
    return defaultInterval;
  });
  const [showMarketCap, setShowMarketCap] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('chartShowMarketCap');
      return savedState ? JSON.parse(savedState) : false;
    }
    return false;
  });
  const { data: tokenInfor, refetch } = useQuery({
    queryKey: ["token-infor", address],
    queryFn: () => getTokenInforByAddress(address),
  });
  const { lang } = useLang();
  const { theme } = useThemeToggle();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Load TradingView script
    const script = document.createElement('script');
    script.src = '/charting_library/charting_library.standalone.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleMarketCapToggle = () => {
    setShowMarketCap((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem('chartShowMarketCap', JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || !tokenInfor?.symbol) return;

    const widget = new window.TradingView.widget({
      symbol: tokenInfor?.symbol,
      // @ts-expect-error: Suppress type error because MockDatafeed is compatible at runtime
      datafeed: new MockDatafeed(tokenInfor?.symbol, address || '', interval, showMarketCap),
      // @ts-expect-error: Suppress type error because MockDatafeed is compatible at runtime
      interval: interval,
      container: containerId,
      library_path: '/charting_library/',
      // @ts-expect-error: Suppress type error because MockDatafeed is compatible at runtime
      locale: transformLang(lang),
      disabled_features: ['use_localstorage_for_settings', 'header_symbol_search'],
      // @ts-expect-error: Suppress type error because MockDatafeed is compatible at runtime
      enabled_features: ['study_templates', 'timeframes_toolbar', 'seconds_resolution', 'minutes_resolution'],
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user',
      fullscreen: false,
      autosize: true,
      studies_overrides: {},
      // @ts-expect-error: Suppress type error because MockDatafeed is compatible at runtime
      theme: theme === 'dark' ? 'Dark' : 'Light',
      // @ts-expect-error: Suppress type error because MockDatafeed is compatible at runtime
      timezone: 'UTC',
      intervals: [
        { text: "1s", resolution: "1s", description: "1 Second" },
        { text: "5s", resolution: "5s", description: "5 Seconds" },
        { text: "15s", resolution: "15s", description: "15 Seconds" },
        { text: "1m", resolution: "1m", description: "1 Minute" },
        { text: "5m", resolution: "5m", description: "5 Minutes" },
        { text: "1h", resolution: "1h", description: "1 Hour" },
        { text: "4h", resolution: "4h", description: "4 Hours" },
        { text: "1D", resolution: "1D", description: "1 Day" },
        { text: "1W", resolution: "1W", description: "1 Week" },
        { text: "1M", resolution: "1M", description: "1 Month" }
      ],
      overrides: {
        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
        "mainSeriesProperties.candleStyle.drawWick": true,
        "mainSeriesProperties.candleStyle.drawBorder": true,
        "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
      },
      custom_formatters: {
        // @ts-expect-error: Suppress type error because MockDatafeed is compatible at runtime
        priceFormatterFactory: (symbolInfo: any, minTick: number) => ({
          format: (price: number, signPositive: boolean) => formatNumber(price)
        })
      }
    });

    widgetRef.current = widget;

    widget.headerReady().then(() => {
      const button = widget.createButton();
    
      button.innerHTML = `
        <span style="color: ${showMarketCap ? (theme === 'dark' ? '#FFFFFF' : '#000000') : (theme === 'dark' ? '#42A5F5' : '#1976D2')};">Price</span> / 
        <span style="color: ${showMarketCap ? (theme === 'dark' ? '#42A5F5' : '#1976D2') : (theme === 'dark' ? '#FFFFFF' : '#000000')};">MCap</span>
      `;
    
      button.setAttribute('title', 'Toggle Price / MCap');
      button.style.padding = '4px 8px';
      button.style.fontSize = '13px';
      button.style.borderRadius = '4px';
      button.style.cursor = 'pointer';
      button.style.marginLeft = '8px';
    
      button.addEventListener('click', handleMarketCapToggle);

      // Subscribe to interval changes
      // @ts-expect-error: Suppress type error because MockDatafeed is compatible at runtime
      widget.chart().onIntervalChanged().subscribe(null, (newInterval: ResolutionString) => {
        setInterval(newInterval);
        localStorage.setItem('chartInterval', newInterval);
      });
    });

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
      }
    };
  }, [isScriptLoaded, containerId, lang, theme, showMarketCap, tokenInfor]);

  return (
    <div 
      ref={containerRef}
      id={containerId}
      className={`w-full ${className}`}
    />
  );
};

export default TradingViewChart; 