import { useQuery } from '@tanstack/react-query';
import { getMyWallets } from '@/services/api/TelegramWalletService';
import type { Wallet } from '@/app/components/list-wallet';

export function useWallets() {
  const { data: wallets, isLoading, error } = useQuery<Wallet[]>({
    queryKey: ['my-wallets'],
    queryFn: getMyWallets,
    staleTime: 30000, // Keep data fresh for 30 seconds
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  return {
    wallets: wallets || [],
    isLoading,
    error,
  };
} 