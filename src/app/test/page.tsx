"use client"
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Transaction {
  signature: string;
  timestamp: number;
  // ... other transaction fields
}

export default function TokenTransactions() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const address = searchParams?.get("address");
  const [tokenAddress, setTokenAddress] = useState(address || '');

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}/token-txs`, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setError(null);
      
      // Tự động subscribe nếu có address từ URL
      if (address) {
        socketInstance.emit('subscribe', { tokenAddress: address });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('WebSocket error:', error);
      setError(error.message);
    });

    // Transaction event handler
    socketInstance.on('transaction', (transaction: Transaction) => {
      console.log('Received transaction:', transaction); // Thêm log để debug
      setTransactions((prev) => [transaction, ...prev].slice(0, 50));
    });

    // Subscription confirmation handlers
    socketInstance.on('subscribed', (data) => {
      console.log('Subscribed to token:', data.tokenAddress);
    });

    socketInstance.on('unsubscribed', (data) => {
      console.log('Unsubscribed from token:', data.tokenAddress);
    });

    setSocket(socketInstance);

    // Cleanup on component unmount
    return () => {
      if (socketInstance) {
        // Unsubscribe trước khi disconnect
        if (tokenAddress) {
          socketInstance.emit('unsubscribe', { tokenAddress });
        }
        socketInstance.disconnect();
      }
    };
  }, [address]); // Thêm address vào dependency array

  // Effect để tự động subscribe khi tokenAddress thay đổi
  useEffect(() => {
    if (socket && isConnected && tokenAddress) {
      socket.emit('subscribe', { tokenAddress });
    }
  }, [socket, isConnected, tokenAddress]);

  const handleSubscribe = () => {
    if (!tokenAddress || !socket) return;
    console.log('Subscribing to:', tokenAddress); // Thêm log để debug
    socket.emit('subscribe', { tokenAddress });
  };

  const handleUnsubscribe = () => {
    if (!tokenAddress || !socket) return;
    console.log('Unsubscribing from:', tokenAddress); // Thêm log để debug
    socket.emit('unsubscribe', { tokenAddress });
  };

  console.log(transactions)

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Connection Status */}
      <div className="mb-4 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {error && (
          <div className="mt-2 text-red-500 text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {/* Token Address Input and Controls */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter token address"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubscribe}
            disabled={!isConnected || !tokenAddress}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Subscribe
          </button>
          <button
            onClick={handleUnsubscribe}
            disabled={!isConnected || !tokenAddress}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unsubscribe
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions yet. Subscribe to a token to see transactions.
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, index) => (
              <div
                key={index}
                className="p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
              >
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(tx, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}