"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Language = {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "vi", name: "Viet Nam", flag: "🇻🇳" },
  { code: "ja", name: "Japan", flag: "🇯🇵" },
]

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const selectLanguage = (language: Language) => {
    setSelectedLanguage(language)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full max-w-md font-medium">
      {/* Dropdown trigger button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full px-4 py-3 bg-[#353535] text-white rounded-lg"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{selectedLanguage.flag}</span>
          <span>{selectedLanguage.name}</span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-1 bg-[#353535] rounded-lg overflow-hidden shadow-lg"
            role="listbox"
          >
            {languages.map((language, index) => (
              <motion.li
                key={language.code}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => selectLanguage(language)}
                className={`flex items-center gap-2 px-4 py-3 cursor-pointer ${
                  selectedLanguage.code === language.code
                    ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white"
                    : "text-white hover:bg-[#444444]"
                }`}
                role="option"
                aria-selected={selectedLanguage.code === language.code}
              >
                <span className="text-2xl">{language.flag}</span>
                <span>{language.name}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
