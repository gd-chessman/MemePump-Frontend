import { useEffect, useState, useRef } from "react";
import { io, Socket } from 'socket.io-client';

export function useWsTokenTransaction(tokenAddress: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const mountedRef = useRef(true);
  const prevTokenAddressRef = useRef<string | null>(null);

  const connect = () => {
    if (!mountedRef.current) return;

    try {
      const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/token-txs`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      newSocket.on('connect', () => {
        console.log("✅ Connected to Socket.IO server - useWsTokenTransaction");
        setIsConnected(true);
        setError(null);
        
        // Subscribe to token transactions when connected
        if (tokenAddress) {
          newSocket.emit('subscribe', {
            tokenAddress: tokenAddress
          });
        }
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

      newSocket.on('transaction', (data) => {
        if (mountedRef.current && data?.tokenAddress === tokenAddress) {
          try {
            // Update transaction state with new transaction
            setTransaction(data);
          } catch (error) {
            console.error("Error processing transaction data:", error);
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

  // Effect to handle component mount/unmount and tokenAddress changes
  useEffect(() => {
    mountedRef.current = true;
    
    // Reset transaction state when tokenAddress changes
    if (prevTokenAddressRef.current !== tokenAddress) {
      setTransaction(null);
      prevTokenAddressRef.current = tokenAddress;
    }
    
    // Disconnect existing socket if it exists
    if (socket) {
      socket.emit('unsubscribe', {
        data: {
          tokenAddress: tokenAddress
        }
      });
      socket.disconnect();
    }
    
    // Connect with new tokenAddress
    connect();

    return () => {
      mountedRef.current = false;
      if (socket) {
        socket.emit('unsubscribe', {
          data: {
            tokenAddress: tokenAddress
          }
        });
        socket.disconnect();
      }
    };
  }, [tokenAddress]);

  const sendMessage = (message: object) => {
    if (socket && socket.connected) {
      socket.emit('message', message);
    } else {
      console.warn("Cannot send message - Socket.IO is not connected");
    }
  };

  return { socket, transaction, sendMessage, error, isConnected };
}
