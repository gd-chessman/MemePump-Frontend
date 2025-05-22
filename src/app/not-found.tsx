"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLang } from "@/lang";

export default function NotFound() {
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Only show theme-dependent content after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">{t("errors.notFound") || "Page not found"}</p>
      <a
        href="/"
        className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        {t("errors.goHome") || "Go back home"}
      </a>
    </div>
  );
} 