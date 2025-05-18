import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export type Timeframe = '1s' | '5s' | '30s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

interface ChartData {
  tokenAddress: string;
  price: number;
  timeframe: Timeframe;
  timestamp: number;
}

interface UseWsChartOptions {
  tokenAddress: string;
  timeframe?: Timeframe;
  onError?: (error: any) => void;
}

interface UseWsChartReturn {
  data: ChartData | null;
  isConnected: boolean;
  error: Error | null;
}

export const useWsChart = ({ tokenAddress, timeframe = '5m', onError }: UseWsChartOptions): UseWsChartReturn => {
  const [data, setData] = useState<ChartData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentSubscription = useRef({ tokenAddress, timeframe });

  // Handle websocket connection
  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/chart`, {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      // Subscribe with current values when connected
      socket.emit('subscribeToChart', currentSubscription.current);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('chartUpdate', (chartData: ChartData) => {
      setData(chartData);
    });

    socket.on('error', (err: any) => {
      setError(err);
      onError?.(err);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array - only run once

  // Handle subscription updates
  useEffect(() => {
    currentSubscription.current = { tokenAddress, timeframe };
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribeToChart', { tokenAddress, timeframe });
    }
  }, [tokenAddress, timeframe]);

  return {
    data,
    isConnected,
    error,
  };
};
