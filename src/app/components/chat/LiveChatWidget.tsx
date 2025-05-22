import React, { useState, useRef } from "react";
import ChatMessage from "./ChatMessage";

const fakeMessages = [
  {
    id: "1",
    sender: {
      name: "Alice",
      avatar: "",
      isCurrentUser: false,
    },
    text: "Hello! How can I help you?",
    timestamp: new Date(),
    country: "en",
  },
  {
    id: "2",
    sender: {
      name: "You",
      avatar: "",
      isCurrentUser: true,
    },
    text: "Hi! I have a question.",
    timestamp: new Date(),
    country: "en",
  },
];

const chatLogo = "/chat-logo.png"; // Đặt đúng đường dẫn ảnh logo

const LiveChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 40, y: 40 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = "";
  };

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <div>
      {!open && (
        <img
          src={chatLogo}
          alt="Chat Logo"
          className="fixed z-50 cursor-pointer"
          style={{ bottom: 40, right: 40, width: 60, height: 60 }}
          onClick={() => setOpen(true)}
        />
      )}
      {open && (
        <div
          className="fixed z-50 bg-white shadow-lg rounded-lg w-80 h-96 flex flex-col"
          style={{ left: position.x, top: position.y }}
        >
          <div
            className="flex items-center gap-2 p-2 cursor-move bg-gradient-to-r from-fuchsia-500 to-violet-700 rounded-t-lg select-none"
            onMouseDown={handleMouseDown}
          >
            <img src={chatLogo} alt="Chat Logo" className="w-7 h-7" />
            <span className="text-white font-bold">Live Chat</span>
            <button
              className="ml-auto text-white text-xl font-bold px-2 hover:text-red-400"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900">
            {fakeMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChatWidget; 
