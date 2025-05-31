'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { IChartApi } from 'lightweight-charts'
import { CandlestickSeries, HistogramSeries } from 'lightweight-charts'
import { io, Socket } from 'socket.io-client'
import { useSearchParams } from 'next/navigation'
import { useThemeToggle } from '@/hooks/use-theme-toggle'

type ChartWithSeries = IChartApi & {
  addSeries: (seriesType: any, options?: any) => any;
}

export const formatNumber = (value: number): string => {
  if (value < 0.01) {
    const str = value.toFixed(10);
    const match = str.match(/^0\.(0*)([1-9].*)$/);
    if (match) {
      const [, zeros, rest] = match;
      const subscriptMap: { [key: string]: string } = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
        '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
      };
      const subscriptNumber = zeros.length.toString().split('').map(d => subscriptMap[d]).join('');
      return `0.0${subscriptNumber}${rest}`;
    }
  }
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
  return value.toFixed(3);
}

export default function ChartMobile({ className }: { className?: string }) {
  const { theme } = useThemeToggle();
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ChartWithSeries | null>(null)
  const [timeFrame, setTimeFrame] = useState('1m')
  const [displayMode, setDisplayMode] = useState<'Price' | 'MCap'>(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('chartShowMarketCap')
      return storedValue === 'true' ? 'MCap' : 'Price'
    }
    return 'Price'
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [isApiFetched, setIsApiFetched] = useState(false)
  const totalSupplyRef = useRef<number | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const fetchInProgressRef = useRef(false)
  const searchParams = useSearchParams()
  const tokenAddress = searchParams?.get("address") || '' // Fallback to default if no address provided
  const MARKET_CAP_EVENT = 'marketCapUpdate'

  // Fetch chart data from API
  const fetchChartData = async () => {
    console.log('Fetching data for token:', tokenAddress, 'displayMode:', displayMode, 'timeFrame:', timeFrame)
    if (!tokenAddress) {
      console.log('No token address provided, skipping fetch')
      return
    }

    // Prevent duplicate API calls
    if (fetchInProgressRef.current) {
      console.log('Fetch already in progress, skipping')
      return
    }

    fetchInProgressRef.current = true

    const now = Math.floor(Date.now() / 1000)
    const from = now - 3600 * 24 // 24h gần nhất
    const marketCap = displayMode === 'MCap'
    const resolution = timeFrame
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/on-chain/chart/${tokenAddress}?market_cap=${marketCap ? 'marketcap' : 'price'}&type=${resolution}&time_from=${from}&time_to=${now}`
    console.log('Fetching from URL:', url)
    try {
      const authToken = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const response = await fetch(url, { headers })
      const data = await response.json()
      console.log('Received data:', data)
      const bars = data.data.oclhv.map((item: any) => ({
        time: item.time,
        open: displayMode === 'MCap' && totalSupplyRef.current ? item.open * totalSupplyRef.current : item.open,
        high: displayMode === 'MCap' && totalSupplyRef.current ? item.high * totalSupplyRef.current : item.high,
        low: displayMode === 'MCap' && totalSupplyRef.current ? item.low * totalSupplyRef.current : item.low,
        close: displayMode === 'MCap' && totalSupplyRef.current ? item.close * totalSupplyRef.current : item.close,
        volume: item.volume,
      }))

      // Dispatch market cap event for API data
      if (displayMode === 'MCap' && bars.length > 0) {
        const lastBar = bars[bars.length - 1];
        const marketCapEvent = new CustomEvent(MARKET_CAP_EVENT, {
          detail: {
            tokenAddress: tokenAddress,
            marketCap: lastBar.close,
            timestamp: lastBar.time,
            isInitial: true
          }
        });
        window.dispatchEvent(marketCapEvent);
      }

      setChartData(bars)
      setIsApiFetched(true)
    } catch (error) {
      console.error('Error fetching chart data:', error)
      setChartData([])
      setIsApiFetched(false)
    } finally {
      fetchInProgressRef.current = false
    }
  }

  // Reset total supply and API fetch status when switching modes
  useEffect(() => {
    console.log('Effect triggered with dependencies:', { timeFrame, displayMode, tokenAddress })
    totalSupplyRef.current = null;
    setIsApiFetched(false);
    fetchChartData();
  }, [timeFrame, displayMode, tokenAddress])

  // WebSocket for realtime updates
  useEffect(() => {
    if (!isApiFetched) return; // Only connect WebSocket after successful API fetch

    // Thêm delay 1 giây trước khi kết nối WebSocket
    const timeoutId = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/chart`, {
        path: '/socket.io',
        transports: ['websocket'],
      })
      socketRef.current = socket
      socket.on('connect', () => {
        socket.emit('subscribeToChart', {
          tokenAddress,
          timeframe: timeFrame,
        })
      })
      socket.on('chartUpdate', (data: { data: any }) => {
        setChartData(prev => {
          const newBar = {
            time: data.data.time,
            open: displayMode === 'MCap' && totalSupplyRef.current ? data.data.open * totalSupplyRef.current : data.data.open,
            high: displayMode === 'MCap' && totalSupplyRef.current ? data.data.high * totalSupplyRef.current : data.data.high,
            low: displayMode === 'MCap' && totalSupplyRef.current ? data.data.low * totalSupplyRef.current : data.data.low,
            close: displayMode === 'MCap' && totalSupplyRef.current ? data.data.close * totalSupplyRef.current : data.data.close,
            volume: data.data.volume,
          }
          
          // Tính tổng cung chỉ một lần duy nhất khi ở chế độ Market Cap
          if (displayMode === 'MCap' && totalSupplyRef.current === null && prev.length > 0) {
            const lastMarketCapBar = prev[prev.length - 1];
            const calculatedSupply = lastMarketCapBar.close / newBar.close;
            totalSupplyRef.current = calculatedSupply;
            console.log('TEST Tổng cung:', calculatedSupply);

            // Dispatch market cap event when initial calculation is done
            const marketCapEvent = new CustomEvent(MARKET_CAP_EVENT, {
              detail: {
                tokenAddress: tokenAddress,
                marketCap: newBar.close,
                timestamp: newBar.time,
                isInitial: true
              }
            });
            window.dispatchEvent(marketCapEvent);
            return prev;
          }

          // Dispatch market cap event for each update when in MCap mode
          if (displayMode === 'MCap') {
            const marketCapEvent = new CustomEvent(MARKET_CAP_EVENT, {
              detail: {
                tokenAddress: tokenAddress,
                marketCap: newBar.close,
                timestamp: newBar.time,
                isInitial: false
              }
            });
            window.dispatchEvent(marketCapEvent);
          }

          // Nếu đã có bar cùng time thì cập nhật, không thì thêm mới
          const last = prev[prev.length - 1]
          let newData;
          if (last && last.time === newBar.time) {
            newData = [...prev.slice(0, -1), newBar]
            console.log('TEST Cập nhật bar hiện tại:', newBar);
          } else {
            newData = [...prev, newBar]
            console.log('TEST Thêm bar mới:', newBar);
          }
          console.log('TEST Tổng số bar trong mảng:', newData.length);
          return newData;
        })
      })
    }, 1000); // Delay 1 giây

    return () => {
      clearTimeout(timeoutId);
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [tokenAddress, timeFrame, displayMode, isApiFetched])

  // Single useEffect for chart management
  useEffect(() => {
    if (!chartContainerRef.current) return

    let chartInstance: ChartWithSeries | null = null
    let candlestickSeries: any = null

    const initChart = async () => {
      // Clean up old chart if it exists
      if (chartRef.current) {
        try {
          chartRef.current.remove()
        } catch (e) {
          console.log('Chart already disposed')
        }
        chartRef.current = null
      }

      const { createChart, ColorType } = await import('lightweight-charts')

      chartInstance = createChart(chartContainerRef.current!, {
        width: chartContainerRef.current!.clientWidth,
        height: 400,
        layout: {
          background: { 
            type: ColorType.Solid, 
            color: theme === 'dark' ? '#1a1a1a' : '#ffffff' 
          },
          textColor: theme === 'dark' ? '#d9d9d9' : '#333',
        },
        grid: {
          vertLines: {
            color: theme === 'dark' ? '#232732' : '#e0e3eb',
            style: 0,
            visible: true,
          },
          horzLines: {
            color: theme === 'dark' ? '#232732' : '#e0e3eb',
            style: 0,
            visible: true,
          },
        },
      }) as unknown as ChartWithSeries

      // Create candlestick series
      candlestickSeries = chartInstance.addSeries(CandlestickSeries, {
        upColor: theme === 'dark' ? '#26a69a' : '#26a69a',
        downColor: theme === 'dark' ? '#ef5350' : '#ef5350',
        borderVisible: false,
        wickUpColor: theme === 'dark' ? '#26a69a' : '#26a69a',
        wickDownColor: theme === 'dark' ? '#ef5350' : '#ef5350',
        priceFormat: {
          type: 'custom',
          minMove: 0.000001,
          precision: 10,
          formatter: formatNumber,
        },
      })

      chartRef.current = chartInstance

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
        }
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }

    initChart()

    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.remove()
        } catch (e) {
          console.log('Chart already disposed')
        }
        chartRef.current = null
      }
    }
  }, [theme]) // Only recreate chart when theme changes

  // Separate useEffect for updating chart data
  useEffect(() => {
    if (!chartRef.current || !chartData.length) return

    // Hàm kiểm tra giá trị có hợp lệ không
    const isValidValue = (value: number) => {
      return !isNaN(value) && isFinite(value) && value >= -90071992547409.91 && value <= 90071992547409.91;
    }

    // Sắp xếp dữ liệu theo thời gian tăng dần
    const sortedData = [...chartData].sort((a, b) => a.time - b.time);

    // Lọc dữ liệu không hợp lệ và đảm bảo thời gian tăng dần
    const validChartData = sortedData.filter((item, index) => {
      // Kiểm tra giá trị hợp lệ
      const isValid = isValidValue(item.open) && 
                     isValidValue(item.high) && 
                     isValidValue(item.low) && 
                     isValidValue(item.close) &&
                     isValidValue(item.volume);

      // Kiểm tra thời gian tăng dần
      const isTimeValid = index === 0 || item.time > sortedData[index - 1].time;

      return isValid && isTimeValid;
    });

    const candlestickSeries = chartRef.current.addSeries(CandlestickSeries, {
      upColor: theme === 'dark' ? '#26a69a' : '#26a69a',
      downColor: theme === 'dark' ? '#ef5350' : '#ef5350',
      borderVisible: false,
      wickUpColor: theme === 'dark' ? '#26a69a' : '#26a69a',
      wickDownColor: theme === 'dark' ? '#ef5350' : '#ef5350',
      priceFormat: {
        type: 'custom',
        minMove: 0.000001,
        precision: 10,
        formatter: formatNumber,
      },
    })

    // Set the data
    candlestickSeries.setData(validChartData)

    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.removeSeries(candlestickSeries)
        } catch (e) {
          console.log('Series already disposed')
        }
      }
    }
  }, [chartData, theme])

  const timeFrames = ['1s', '5s', '15s', '1m', '5m', '1h', '4h', '1D', '1W', '1MN']

  return (
    <div className={`p-2 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'} ${className}`}>
      {/* Control bar */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {timeFrames.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeFrame(tf)}
            className={`px-1 py-0.5 rounded text-[10px] font-semibold border ${
              timeFrame === tf
                ? theme === 'dark'
                  ? 'bg-[#1a1a1a] text-white border-gray-500'
                  : 'bg-gray-200 text-gray-900 border-gray-400'
                : theme === 'dark'
                  ? 'bg-[#1a1a1a] text-gray-400 border-gray-700 hover:bg-gray-700'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {tf}
          </button>
        ))}
        <span className="mx-2">|</span>
        <button
          onClick={() => {
            const newMode = displayMode === 'Price' ? 'MCap' : 'Price'
            setDisplayMode(newMode)
            localStorage.setItem('chartShowMarketCap', (newMode === 'MCap').toString())
          }}
          className={`px-1 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
            theme === 'dark'
              ? 'bg-[#1a1a1a] text-white border-gray-700 hover:bg-gray-700'
              : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'
          }`}
        >
          {`${displayMode === 'Price' ? 'Price' : 'MCap'}`}
        </button>
      </div>
      <div className='h-[4px] dark:bg-[#1e1e1e] bg-theme-gray-100 my-1'></div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  )
}


