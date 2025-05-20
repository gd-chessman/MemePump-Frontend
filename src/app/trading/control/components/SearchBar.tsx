import React from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
    searchQuery: string
    onSearchChange: (value: string) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
    searchQuery,
    onSearchChange,
}) => {
    return (
        <div className="px-4 pb-2">
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-3 w-3 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Master trade"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full py-2 pl-10 max-h-6 text-xs pr-4 bg-[#1a1a1a] rounded-full focus:outline-none border-1 border-t-theme-primary-300 border-l-theme-primary-300 border-b-theme-secondary-400 border-r-theme-secondary-400 text-neutral-200 font-normal"
                />
            </div>
        </div>
    )
} 