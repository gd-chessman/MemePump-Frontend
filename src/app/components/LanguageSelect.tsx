"use client"

import { Button } from "@/app/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { useLang } from "@/lang/useLang"
import { langConfig } from "@/lang";
import { ChevronDown } from "lucide-react"

export function LangToggle({ className, showArrow = false }: { className?: string, showArrow?: boolean }) {
  const { lang, setLang, t } = useLang();
  const currentLang = langConfig.listLangs.find(l => l.code === lang);
  return (
    <DropdownMenu >
      <DropdownMenuTrigger className={className} asChild>
        <Button variant="ghost" size="icon" className="w-full dark:bg-neutral-900 bg-gray-100 dark:text-theme-neutral-100 text-theme-neutral-800 px-2 flex justify-start gap-2">
          {currentLang && <img src={currentLang.flag} alt={t(currentLang.translationKey)} className="w-7 h-5" />}
          <span>{currentLang && t(currentLang.translationKey)}</span>
          {showArrow && <ChevronDown className="h-6 w-6 ml-auto" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`${showArrow ? 'bg-[#e0fcff] dark:!bg-[#2b1858] border-t border-neutral-200 dark:border-neutral-700 rounded-xl box-shadow-none rounded-t-none' : ''}`}>
        <div className="flex flex-col pr-2 gap-1 overflow-x-hidden">
          {langConfig.listLangs.map((language) => (
            <DropdownMenuItem key={language.id} onClick={() => setLang(language.code)} className="flex dark:text-theme-neutral-100 text-theme-neutral-800 items-center gap-2 lg:ml-0 ml-5 cursor-pointer hover:bg-theme-neutral-100 dark:hover:bg-theme-neutral-900" style={{ width: showArrow ? '100vw' : '180px', marginRight: '-10px' }}>
              <img src={language.flag} alt={t(language.translationKey)} className="w-7 h-5 rounded" />
              <span>{t(language.translationKey)}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
