import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "../components/chat/ChatMessage";
import { getChatAllHistories } from "@/services/api/ChatService";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/lang";
import { ChatService } from "@/services/api";
import { useWsChatMessage } from "@/hooks/useWsChatMessage";
import { useWidgetChatStore } from "@/store/widgetChatStore";
import { Smile } from "lucide-react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

type Message = {
  id: string;
  sender: {
    name: string;
    isCurrentUser: boolean;
  };
  text: string;
  timestamp: Date;
  country: string;
};

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
};

type WsMessage = {
  _id: string;
  ch_chat_id: number;
  ch_content: string;
  ch_status: string;
  createdAt: string;
  ch_wallet_address: string;
  nick_name?: string;
  ch_lang?: string;
  country?: string;
};

const chatLogo = "/chat-logo.png"; // Đặt đúng đường dẫn ảnh logo

const ChatWidget = () => {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [containerPosition, setContainerPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [boxPosition, setBoxPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { messages, setMessages, addMessage } = useWidgetChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Function to determine box position based on logo position
  const updateBoxPosition = (x: number, y: number) => {
    const logoSize = 60; // Logo width/height
    const boxWidth = 320; // Box width (w-80 = 20rem = 320px)
    const boxHeight = window.innerHeight * 0.4; // Box height (h-[40vh])
    const edgeThreshold = 100; // Distance from edge to trigger position change

    // Calculate distances to edges
    const distanceToRight = window.innerWidth - (x + logoSize);
    const distanceToLeft = x;
    const distanceToBottom = window.innerHeight - (y + logoSize);
    const distanceToTop = y;

    // Determine the best position for the box
    if (distanceToRight < edgeThreshold && distanceToBottom > boxHeight) {
      setBoxPosition('left');
    } else if (distanceToLeft < edgeThreshold && distanceToBottom > boxHeight) {
      setBoxPosition('right');
    } else if (distanceToBottom < edgeThreshold) {
      setBoxPosition('top');
    } else {
      setBoxPosition('bottom');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the logo image itself
    if (e.target === containerRef.current?.querySelector('.chat-logo img')) {
      e.preventDefault();
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        dragOffset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        dragStartPos.current = {
          x: e.clientX,
          y: e.clientY
        };
        setIsDragging(true);
        document.body.style.userSelect = "none";
      }
    }
  };

  const handleMouseMove = (e: MouseEvent): void => {
    if (!isDragging || !containerRef.current) return;

    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    // Calculate boundaries
    const maxX = window.innerWidth - containerRef.current.offsetWidth;
    const maxY = window.innerHeight - containerRef.current.offsetHeight;

    // Update position with boundaries
    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));

    setContainerPosition({
      x: boundedX,
      y: boundedY
    });

    // Update box position based on new logo position
    updateBoxPosition(boundedX, boundedY);
  };

  const handleMouseUp = (e: MouseEvent): void => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = "";
    } else if (e.target === containerRef.current?.querySelector('.chat-logo')) {
      // Only toggle if it wasn't a drag and clicked on the logo container
      setOpen(!open);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start dragging if touching the logo image itself
    if (e.target === containerRef.current?.querySelector('.chat-logo img')) {
      e.preventDefault();
      if (containerRef.current) {
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        dragOffset.current = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
        dragStartPos.current = {
          x: touch.clientX,
          y: touch.clientY
        };
        setIsDragging(true);
      }
    }
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.current.x;
    const newY = touch.clientY - dragOffset.current.y;

    // Calculate boundaries
    const maxX = window.innerWidth - containerRef.current.offsetWidth;
    const maxY = window.innerHeight - containerRef.current.offsetHeight;

    // Update position with boundaries
    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));

    setContainerPosition({
      x: boundedX,
      y: boundedY
    });

    // Update box position based on new logo position
    updateBoxPosition(boundedX, boundedY);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isDragging) {
      setIsDragging(false);
    } else if (e.target === containerRef.current?.querySelector('.chat-logo')) {
      // Only toggle if it wasn't a drag and tapped on the logo container
      setOpen(!open);
    }
  };

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Add touch event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Update container position effect
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Update box position when window is resized
  React.useEffect(() => {
    const handleResize = () => {
      updateBoxPosition(containerPosition.x, containerPosition.y);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerPosition]);

  const { data: chatAllHistories, refetch: refetchChatAllHistories } = useQuery({
    queryKey: ["chatAllHistories", lang],
    queryFn: () => getChatAllHistories(lang),
  });

  const { message: wsMessage } = useWsChatMessage({
    chatType: 'all'
  });

  // Convert chatAllHistories data to Message format
  useEffect(() => {
    if (chatAllHistories?.data) {
      const convertedMessages: Message[] = chatAllHistories.data.map((chat: ChatHistoryItem) => ({
        id: chat._id,
        sender: {
          name: chat.nick_name || "Anonymous",
          isCurrentUser: chat.ch_wallet_address === "YOUR_WALLET_ADDRESS", // TODO: Replace with actual wallet address
        },
        text: chat.ch_content,
        timestamp: new Date(chat.createdAt),
        country: chat.country || "en"
      }));
      setMessages(convertedMessages);
    }
  }, [chatAllHistories, setMessages]);

  // Handle new websocket messages
  useEffect(() => {
    if (wsMessage) {
      const wsMsg = wsMessage as WsMessage;
      const newMessage: Message = {
        id: wsMsg._id,
        sender: {
          name: wsMsg.nick_name || "Anonymous",
          isCurrentUser: wsMsg.ch_wallet_address === "YOUR_WALLET_ADDRESS", // TODO: Replace with actual wallet address
        },
        text: wsMsg.ch_content,
        timestamp: new Date(wsMsg.createdAt),
        country: wsMsg.country || "en"
      };
      addMessage(newMessage);
    }
  }, [wsMessage, addMessage, lang]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await ChatService.sendAllMessage(inputMessage, lang);
      refetchChatAllHistories(); // Refetch chat history after sending
      setInputMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const getBoxPositionClasses = () => {
    switch (boxPosition) {
      case 'left':
        return 'absolute right-full top-0 mr-2';
      case 'right':
        return 'absolute left-full top-0 ml-2';
      case 'top':
        return 'absolute bottom-full right-0 mb-2';
      case 'bottom':
        return 'absolute top-full right-0 mt-2';
      default:
        return 'absolute bottom-full right-0 mb-2';
    }
  };

  const onEmojiSelect = (emoji: any) => {
    setInputMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-50"
      style={{
        left: containerPosition.x,
        top: containerPosition.y,
        userSelect: "none",
        touchAction: "none"
      }}
    >
      <div className="relative">
        {/* Chat Logo */}
        <div
          className="chat-logo cursor-pointer"
          onClick={(e) => {
            // Prevent click if it was a drag
            if (!isDragging) {
              setOpen(!open);
            }
          }}
        >
          <img
            src={chatLogo}
            alt="Chat Logo"
            className="w-[40px] h-[40px] lg:w-[60px] lg:h-[60px]"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </div>

        {/* Chat Box */}
        {open && (
          <div
            className={`${getBoxPositionClasses()} w-[calc(100vw-100px)] shadow-lg rounded-lg  lg:w-96 h-[40vh] flex flex-col border border-gray-200 dark:border-t-theme-primary-300 dark:border-l-theme-primary-300 dark:border-b-theme-secondary-400 dark:border-r-theme-secondary-400`}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <div
              className="flex items-center justify-center gap-2 p-2 cursor-move bg-gray-50 dark:bg-neutral-900 rounded-t-lg select-none"
              onMouseDown={handleMouseDown}
            >
              <img src={"/ethereum.png"} alt="ethereum-icon" width={15} height={15} />
              <span className="dark:text-white font-bold">{t("masterTrade.manage.chat.communityChatroom")}</span>
              <img src={"/ethereum.png"} alt="ethereum-icon" width={15} height={15} />
            </div>
            <div className="flex-1 overflow-y-auto p-3 pb-1 lg:mx-4 dark:mx-0 rounded-xl lg:bg-gray-300 bg-white  dark:bg-neutral-900">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-2 rounded-b-md bg-gray-50 dark:bg-neutral-900 ">
              <div className="flex gap-2 rounded-xl">
                <div className="relative items-center w-full">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && inputMessage.trim()) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={t("masterTrade.manage.chat.type_a_message")}
                    className="w-full bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-full px-4 py-2 pr-10 
                                         focus:outline-none focus:ring-2 focus:ring-theme-primary-400/50 
                                         placeholder-gray-400 dark:placeholder-gray-500 text-xs
                                         border border-gray-200 dark:border-neutral-700 h-[30px]
                                         shadow-sm hover:border-theme-primary-400/30 transition-colors placeholder:text-xs"
                  />
                  <div className="absolute right-3 top-[18px] -translate-y-1/2 flex items-center gap-2">
                    <div ref={emojiPickerRef} className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-gray-400 hover:text-theme-primary-500 dark:text-gray-400 
                                         dark:hover:text-theme-primary-300 transition-colors"
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-2 z-50">
                          <Picker
                            data={data}
                            onEmojiSelect={onEmojiSelect}
                            theme="dark"
                            previewPosition="none"
                            skinTonePosition="none"
                            set="native"
                            locale="en"
                            maxFrequentRows={4}
                            navPosition="none"
                            searchPosition="none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className={`px-2 lg:px-4 py-1 min-w-[60px] rounded-lg text-xs font-medium transition-colors
                    ${inputMessage.trim()
                      ? 'bg-theme-primary-400 hover:bg-theme-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                >
                  {t("masterTrade.manage.chat.send")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;


