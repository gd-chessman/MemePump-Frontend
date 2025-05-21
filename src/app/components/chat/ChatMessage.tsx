import { langConfig } from "@/lang";

type Message = {
  id: string;
  sender: {
    name: string;
    avatar: string;
    isCurrentUser: boolean;
  };
  text: string;
  timestamp: Date;
  country: string;
};

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const currentLang = langConfig.listLangs.find(l => l.code === message.country);

  return (
    <div className={`flex ${message.sender.isCurrentUser ? "justify-end" : "items-start"}`}>
      {!message.sender.isCurrentUser && (
        <div className="flex gap-2 items-center">
          {/* <img
            src={message.sender.avatar || "/token.png"}
            alt={message.sender.name}
            width={20}
            height={20}
            className="rounded-full ring-2 ring-theme-primary-400/20 dark:ring-theme-primary-400/30"
          /> */}
          <div className="font-medium text-xs mb-1 text-theme-primary-500 dark:text-theme-primary-300 uppercase">
            {message.sender.name}
          </div>
          <img src={currentLang?.flag} alt={currentLang?.name} className="w-6 h-4 rounded" />
          <span className="text-xs text-gray-800 dark:text-white">{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 