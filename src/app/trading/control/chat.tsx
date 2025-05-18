"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Smile, Send, Image as ImageIcon, X } from "lucide-react"
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import Image from "next/image"
import token from "@/assets/svgs/token.svg"

type Message = {
  id: string
  sender: {
    name: string
    avatar: string
    isCurrentUser: boolean
  }
  text: string
  timestamp: Date
}

const ChatTrading = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [windowHeight, setWindowHeight] = useState(800); // Default height
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: {
        name: "POPCAT",
        avatar: "/token.png",
        isCurrentUser: false,
      },
      text: "Anyone is up for illustrations. I think there are less relatable images according to our brand.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      sender: {
        name: "POPCAT",
        avatar: "/token.png",
        isCurrentUser: false,
      },
      text: "Anyone is up for illustrations. I think there are less relatable images according to our brand.",
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
    },
    {
      id: "3",
      sender: {
        name: "You",
        avatar: "/user-avatar.png",
        isCurrentUser: true,
      },
      text: "Yes, It will decrease the loading",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const iconPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true);
    setWindowHeight(window.innerHeight);
    
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use default height during SSR
  const height = isMounted ? windowHeight : 800;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Close pickers when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return

    const message: Message = {
      id: Date.now().toString(),
      sender: {
        name: "You",
        avatar: "/user-avatar.png",
        isCurrentUser: true,
      },
      text: newMessage,
      timestamp: new Date(),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const onIconClick = (icon: string) => {
    setNewMessage(prev => prev + icon)
    setShowIconPicker(false)
  }
  
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-theme-neutral-1000">
      <div className={`${height > 700 ? 'flex-1' : 'h-[300px]'} overflow-y-auto p-2 space-y-4`}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender.isCurrentUser ? "justify-end" : "items-start"}`}>
            {!message.sender.isCurrentUser && (
              <div className="flex-shrink-0 mr-3">
                <img
                  src={message.sender.avatar || "/token.png"}
                  alt={message.sender.name}
                  width={36}
                  height={36}
                  className="rounded-full ring-2 ring-theme-primary-400/20 dark:ring-theme-primary-400/30"
                />
              </div>
            )}
            <div>
              {!message.sender.isCurrentUser && (
                <div className="font-medium text-xs mb-1 text-theme-primary-500 dark:text-theme-primary-300">
                  {message.sender.name}
                </div>
              )}
              <div
                className={`max-w-[90%] rounded-lg p-2 ${message.sender.isCurrentUser
                    ? "bg-theme-primary-400 text-white shadow-sm dark:bg-theme-primary-400/90"
                    : "bg-white dark:bg-neutral-800 text-gray-800 dark:text-white border border-gray-200 dark:border-theme-primary-400/30 shadow-sm"
                  }`}
              >
                <p className="text-xs text-gray-800 dark:text-white">{message.text}</p>
              </div>
            </div>

          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-1 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-theme-neutral-1000 shadow-sm">
        <div className="relative">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-50">
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                  width={320}
                  height={400}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-full px-4 py-2 pr-10 
                                         focus:outline-none focus:ring-2 focus:ring-theme-primary-400/50 
                                         placeholder-gray-400 dark:placeholder-gray-500
                                         border border-gray-200 dark:border-neutral-700 h-[30px]
                                         shadow-sm hover:border-theme-primary-400/30 transition-colors placeholder:text-xs"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker)
                    setShowIconPicker(false)
                  }}
                  className="text-gray-400 hover:text-theme-primary-500 dark:text-gray-400 
                                             dark:hover:text-theme-primary-300 transition-colors"
                >
                  <Smile className="h-4 w-4" />
                </button>
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`rounded-full p-1 transition-colors
                                     ${newMessage.trim()
                  ? 'bg-theme-primary-400 hover:bg-theme-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-neutral-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatTrading