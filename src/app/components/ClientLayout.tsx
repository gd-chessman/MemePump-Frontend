"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import "@/libs/fontawesome";
import { LangProvider } from "@/lang/LangProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from 'next/dynamic';
import VideoBackground from "./VideoBackground";
import { useAuth } from "@/hooks/useAuth";

const Chat = dynamic(() => import('../chat'), {
  ssr: false
});

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated } = useAuth();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnMount: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <ThemeProvider>
          <Header />
          <VideoBackground />
          <main className="bg-white/80 dark:bg-[#000000a8]">
            {children}
          </main>
          {isAuthenticated && <Chat />}
        </ThemeProvider>
      </LangProvider>
    </QueryClientProvider>
  );
} 