"use client"

import { Button } from "@/app/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { useLang } from "@/lang/useLang"
import { langConfig } from "@/lang";
import { ChevronDown } from "lucide-react"

export function LangToggle({className, showArrow = false}: {className?: string, showArrow?: boolean}) {
  const { lang, setLang, t } = useLang();
  const currentLang = langConfig.listLangs.find(l => l.code === lang);
  return (
    <DropdownMenu >
      <DropdownMenuTrigger className={className} asChild>
        <Button variant="ghost" size="icon" className="w-full dark:bg-neutral-900 dark:text-theme-neutral-100 px-2 flex justify-start gap-2">
          {currentLang && <img src={currentLang.flag} alt={t(currentLang.translationKey)} className="w-6 h-5 rounded" />}
          <span>{currentLang && t(currentLang.translationKey)}</span>
          {showArrow && <ChevronDown className="h-6 w-6 ml-auto" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`${showArrow ? '!bg-transparent border-none box-shadow-none' : ''}`}>
        {langConfig.listLangs.map((language) => (
          <DropdownMenuItem key={language.id} onClick={() => setLang(language.code)} className="flex items-center gap-2 ml-5" style={{ width: showArrow ? '100vw' : '180px', marginRight: '-10px' }}>
            <img src={language.flag} alt={t(language.translationKey)} className="w-6 h-5 rounded" />
            <span>{t(language.translationKey)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
