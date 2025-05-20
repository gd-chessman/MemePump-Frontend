"use client"
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';


export default function TokenInfoTest() {
  const [socket, setSocket] = useState<any>(null);
  const [tokenInfo, setTokenInfo] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const tokenAddress = searchParams?.get("address");

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('http://localhost:8000/token-info', {
      path: '/socket.io',
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setError(null);
      
      // Auto subscribe if tokenAddress exists
      if (tokenAddress) {
        console.log('Auto subscribing to token:', tokenAddress);
        socketInstance.emit('subscribe', { tokenAddress });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socketInstance.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      setError(error.message);
    });

    socketInstance.on('tokenInfo', (data: any) => {
      console.log('Received token info:', data);
      setTokenInfo(data);
    });

    socketInstance.on('subscribed', (data: { tokenAddress: string }) => {
      console.log('Subscribed to token:', data.tokenAddress);
    });

    socketInstance.on('unsubscribed', (data: { tokenAddress: string }) => {
      console.log('Unsubscribed from token:', data.tokenAddress);
    });

    setSocket(socketInstance);

    // Cleanup on component unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleSubscribe = () => {
    if (!tokenAddress) {
      setError('Please enter a token address');
      return;
    }
    socket?.emit('subscribe', { tokenAddress });
  };

  const handleUnsubscribe = () => {
    if (!tokenAddress) {
      setError('Please enter a token address');
      return;
    }
    socket?.emit('unsubscribe', { tokenAddress });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Token Info WebSocket Test</h1>
      
      {/* Connection Status */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Token Address Display */}
      <div className="mb-6">
        <div className="w-full p-2 border rounded-lg mb-2">
          {tokenAddress || 'No token address provided'}
        </div>
        <div className="space-x-4">
          <button
            onClick={handleUnsubscribe}
            className="px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Unsubscribe
          </button>
        </div>
      </div>

      {/* Token Info Display */}
      {tokenInfo && (
        <div className="rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Token Information</h2>
          
          {/* Quick Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {tokenInfo && (
              <>
                <div className="p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Current Price</h3>
                  <p className="text-lg">${tokenInfo.price.usd}</p>
                </div>
                <div className="p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Market Cap</h3>
                  <p className="text-lg">${tokenInfo.marketCap.usd}</p>
                </div>

                <div className="p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Liquidity</h3>
                  <p className="text-lg">${tokenInfo.liquidity.usd}</p>
                </div>
              </>
            )}
          </div>

          {/* JSON Display */}
          <div className="mt-6">
            <h3 className="font-medium mb-2">Raw Data (JSON)</h3>
            <pre className="p-4 rounded-lg overflow-auto max-h-[100vh]">
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Last Updated: {new Date(tokenInfo.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}