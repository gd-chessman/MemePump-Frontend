import { langConfig } from "@/lang";
import { type Message } from "@/store/widgetChatStore";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const currentLang = langConfig.listLangs.find(l => l.code === message.country);
  console.log("message", message)
  return (
    <div className={`flex `}>
      {!message.sender.isCurrentUser && (
        <div className="flex gap-2 items-center justify-center mb-1">
          {/* <img
            src={message.sender.avatar || "/token.png"}
            alt={message.sender.name}
            width={20}
            height={20}
            className="rounded-full ring-2 ring-theme-primary-400/20 dark:ring-theme-primary-400/30"
          /> */}
          {currentLang?.flag ? <img src={currentLang?.flag} alt={currentLang?.name} className="w-[15px] h-[15px] rounded-full object-cover" /> : <img src="https://flagcdn.com/w40/gb.png" alt="token" className="w-[15px] h-[15px] rounded-full object-cover" />}
          
          <div className="font-medium text-xs  text-theme-primary-500 dark:text-theme-primary-300">
            {message.sender.name} :
          </div>
          <span className="text-xs text-gray-800 dark:text-white">{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 
