import { useQuery } from '@tanstack/react-query';
import { getMyWallets } from '@/services/api/TelegramWalletService';
import type { Wallet } from '@/app/components/list-wallet';

export function useWallets() {
  const { data: wallets, isLoading, error, refetch } = useQuery<Wallet[]>({
    queryKey: ['my-wallets'],
    queryFn: getMyWallets,
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    wallets,
    isLoading,
    error,
    refetch
  };
} 