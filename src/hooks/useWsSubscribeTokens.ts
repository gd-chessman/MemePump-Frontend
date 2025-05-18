import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { io, Socket } from 'socket.io-client';
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Token {
  id: number;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoUrl: string;
  coingeckoId: string | null;
  tradingviewSymbol: string | null;
  isVerified: boolean;
  marketCap: number;
  liquidity: any;
  program: string;
}

interface SubscribeParams {
  page?: number;
  limit?: number;
  verified?: boolean;
  random?: boolean;
}

// Cache for preloaded images
const imageCache = new Map<string, HTMLImageElement>();

// Function to preload an image
const preloadImage = (url: string, shouldCache: boolean = false): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (imageCache.has(url)) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (shouldCache) {
        imageCache.set(url, img);
      }
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Function to preload multiple images
const preloadImages = async (tokens: Token[], shouldCache: boolean = false) => {
  const preloadPromises = tokens.map((token, index) => 
    token.logoUrl ? preloadImage(token.logoUrl, shouldCache && index === 0) : Promise.resolve()
  );
  await Promise.all(preloadPromises);
};

export function useWsSubscribeTokens(params?: SubscribeParams) {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const mountedRef = useRef(true);
  const pathname = usePathname();
  const isTradingPage = pathname?.startsWith('/trading');
  const isDashboardPage = pathname?.startsWith('/dashboard');
  const tokenStackRef = useRef<Token[]>([]);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const MAX_STACK_SIZE = 50;
  const DISPLAY_INTERVAL = 2000;
  const TOKENS_PER_UPDATE = 1;

  const { data: tokens = [], isLoading } = useQuery<Token[]>({
    queryKey: ['wsTokens', params],
    queryFn: async () => {
      return [];
    },
    initialData: [],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const convertToken = (token: any): Token => {
    const logoUrl = token.slt_logo_url || token.logoUrl;
    const optimizedLogoUrl = logoUrl ? 
      (logoUrl.startsWith('http') ? logoUrl : `https://${logoUrl}`) : 
      '/placeholder.png';

    return {
      id: token.slt_id,
      name: token.slt_name || token.name,
      symbol: token.slt_symbol || token.symbol,
      address: token.slt_address || token.address,
      decimals: token.slt_decimals || token.decimals,
      logoUrl: optimizedLogoUrl,
      liquidity: token.slt_initial_liquidity || token.liquidity,
      coingeckoId: null,
      tradingviewSymbol: null,
      isVerified: token.slt_is_verified || token.isVerified,
      marketCap: token.slt_market_cap || token.marketCap,
      program: token.slt_program || token.slt_program,
    };
  };

  const updateTokens = () => {
    if (!mountedRef.current || tokenStackRef.current.length === 0) return;

    const newTokens = tokenStackRef.current.slice(0, TOKENS_PER_UPDATE);
    tokenStackRef.current = tokenStackRef.current.slice(TOKENS_PER_UPDATE);
    
    if (newTokens.length > 0) {
      queryClient.setQueryData(['wsTokens', params], (oldData: Token[] = []) => {
        const updatedTokens = [...newTokens, ...oldData].slice(0, params?.limit || 24);
        return updatedTokens;
      });

      setTimeout(() => {
        preloadImages(newTokens, true).catch(console.error);
      }, 0);
    }
  };

  const connect = () => {
    if (!mountedRef.current) return;

    try {
      const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/token`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      newSocket.on('connect', () => {
        console.log("✅ Connected to Socket.IO server - useWsSubscribeTokens");
        setIsConnected(true);
        setError(null);
        tokenStackRef.current = [];
        newSocket.emit('subscribeTokens', params || {});
      });

      newSocket.on('disconnect', (reason) => {
        console.log("❌ Disconnected from Socket.IO server:", reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error("Socket.IO connection error:", error);
        if (mountedRef.current) {
          setError("Socket.IO connection error");
        }
      });

      newSocket.on('tokenUpdate', (data) => {
        if (mountedRef.current) {
          try {
            const rawTokens = data.data?.tokens || [];
            const convertedTokens = rawTokens.map(convertToken);

            if (isInitialLoadRef.current) {
              const initialTokens = convertedTokens.slice(0, params?.limit || 24);
              queryClient.setQueryData(['wsTokens', params], initialTokens);
              tokenStackRef.current = convertedTokens.slice(params?.limit || 24);
              isInitialLoadRef.current = false;
              console.log('Initial load:', convertedTokens.length, 'tokens');

              setTimeout(() => {
                preloadImages(initialTokens, false).catch(console.error);
              }, 0);
            } else {
              const existingAddresses = new Set(tokenStackRef.current.map(token => token.address));
              const uniqueNewTokens = convertedTokens.filter((token: Token) => !existingAddresses.has(token.address));
              
              tokenStackRef.current = [...tokenStackRef.current, ...uniqueNewTokens]
                .slice(-MAX_STACK_SIZE);

              setTimeout(() => {
                preloadImages(uniqueNewTokens, true).catch(console.error);
              }, 0);
            }
          } catch (error) {
            console.error("Error processing token data:", error);
          }
        }
      });

      newSocket.on('ping', () => {
        newSocket.emit('pong');
      });

      setSocket(newSocket);
    } catch (error) {
      console.error("Error creating Socket.IO connection:", error);
      if (mountedRef.current) {
        setError("Failed to create Socket.IO connection");
      }
    }
  };

  useEffect(() => {
    if (isTradingPage || isDashboardPage) {
      isInitialLoadRef.current = true;
      tokenStackRef.current = [];
      connect();
    } else {
      if (socket) {
        socket.emit('unSubscribeTokens');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isTradingPage, isDashboardPage]);

  useEffect(() => {
    mountedRef.current = true;
    
    updateIntervalRef.current = setInterval(updateTokens, DISPLAY_INTERVAL);
    
    return () => {
      mountedRef.current = false;
      if (socket) {
        socket.emit('unSubscribeTokens');
        socket.disconnect();
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  const sendMessage = (message: object) => {
    if (socket && socket.connected) {
      socket.emit('message', message);
    } else {
      console.warn("Cannot send message - Socket.IO is not connected");
    }
  };

  return { socket, tokens, sendMessage, error, isConnected, isLoading };
}