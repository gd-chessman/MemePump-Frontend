"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"
import { Smile, Send, Image as ImageIcon, X } from "lucide-react"
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import { langConfig } from "@/lang";
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import {
  getTokenHistories,
  readTokenMessage,
} from "@/services/api/ChatService";
import { useLang } from "@/lang";
import { ChatService } from "@/services/api"
import ChatMessage from "@/app/components/chat/ChatMessage"

type Message = {
  id: string
  sender: {
    name: string
    avatar: string
    isCurrentUser: boolean
  }
  text: string
  timestamp: Date
  country: string
}

type ChatHistoryItem = {
  _id: string;
  ch_id: string;
  chat_id: string;
  ch_wallet_address: string;
  ch_content: string;
  chat_type: string;
  ch_status: string;
  ch_is_master: boolean;
  ch_lang: string;
  country: string;
  nick_name: string;
  createdAt: string;
}

// Create a client component for the main content
const ChatTradingContent = () => {
  const { t, lang } = useLang();
  const [isMounted, setIsMounted] = useState(false);
  const [windowHeight, setWindowHeight] = useState(800); // Defaul
  // t height
  const searchParams = useSearchParams();
  const tokenAddress = searchParams?.get("address");
  const { data: chatTokenHistories, refetch: refetchChatTokenHistories } =
    useQuery({
      queryKey: ["chatTokenHistories", tokenAddress, lang],
      queryFn: () => getTokenHistories(tokenAddress || "", lang),
      refetchOnMount: true,
      enabled: !!tokenAddress,
    });
  const { data: tokenMessageData, refetch: refetchTokenMessage } = useQuery({
    queryKey: ["readTokenMessage", tokenAddress],
    queryFn: () => readTokenMessage(tokenAddress || ""),
    enabled: !!tokenAddress,
    refetchOnMount: true,
  });

  // Convert chatTokenHistories data to Message format
  useEffect(() => {
    if (chatTokenHistories?.data) {
      const convertedMessages: Message[] = chatTokenHistories.data.map((chat: ChatHistoryItem) => ({
        id: chat._id,
        sender: {
          name: chat.nick_name || "Anonymous",
          avatar: "/token.png",
          isCurrentUser: chat.ch_wallet_address === "YOUR_WALLET_ADDRESS", // TODO: Replace with actual wallet address
        },
        text: chat.ch_content,
        timestamp: new Date(chat.createdAt),
        country: chat.ch_lang
      }));
      setMessages(convertedMessages);
    }
  }, [chatTokenHistories]);
  console.log("chatTokenHistories", chatTokenHistories)

  const [messages, setMessages] = useState<Message[]>([]);
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

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const onIconClick = (icon: string) => {
    setNewMessage(prev => prev + icon)
    setShowIconPicker(false)
  }
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await ChatService.sendTokenMessage(
        newMessage,
        tokenAddress || "",
        lang
      );
      refetchChatTokenHistories(); // Refetch chat history after sending
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-theme-neutral-1000">
      <div className={`${height > 700 ? 'flex-1' : 'h-[300px]'} overflow-y-auto p-4 space-y-4`}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
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

// Main component with Suspense
const ChatTrading = () => {
  return (
    <Suspense fallback={<div></div>}>
      <ChatTradingContent />
    </Suspense>
  );
}

export default ChatTrading