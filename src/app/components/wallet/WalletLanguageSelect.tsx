"use client"

import { Button } from "@/app/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { useLang } from "@/lang/useLang"
import { langConfig } from "@/lang";
import { ChevronDown } from "lucide-react"

interface WalletLanguageSelectProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function WalletLanguageSelect({ value, onChange, className }: WalletLanguageSelectProps) {
    const { t } = useLang();
    const currentLang = langConfig.listLangs.find(l => l.code.toLowerCase() === value.toLowerCase());

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`w-full dark:bg-neutral-900 dark:text-theme-neutral-100 text-theme-neutral-800 px-2 flex justify-start gap-2 ${className}`}>
                    {currentLang && <img src={currentLang.flag} alt={t(currentLang.translationKey)} className="w-4 h-3 rounded" />}
                    <span className="text-xs">{currentLang && t(currentLang.translationKey)}</span>
                    <ChevronDown className="h-4 w-4 ml-auto" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
                <div className="flex flex-col pr-2">
                    {langConfig.listLangs.map((language) => (
                        <DropdownMenuItem 
                            key={language.id} 
                            onClick={() => onChange(language.code.toLowerCase())} 
                            className="flex dark:text-theme-neutral-100 text-theme-neutral-800 items-center gap-2 cursor-pointer hover:bg-theme-neutral-100 dark:hover:bg-theme-neutral-900"
                        >
                            <img src={language.flag} alt={t(language.translationKey)} className="w-4 h-3 rounded" />
                            <span className="text-xs">{t(language.translationKey)}</span>
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
} 