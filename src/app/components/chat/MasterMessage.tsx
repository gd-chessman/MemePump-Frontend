import { langConfig } from "@/lang";

export interface Message {
  ch_content: string;
  ch_id: string;
  ch_is_master: boolean;
  ch_lang: string;
  ch_status: string;
  ch_wallet_address: string;
  chat_id: string;
  chat_type: string;
  country: string;
  createdAt: string;
  nick_name: string;
  _id: string;
}

interface ChatMessageProps {
  message: Message;
}

// Example data structure
const data: Message = {
    ch_content: "ád",
    ch_id: "1747998444860-577",
    ch_is_master: true,
    ch_lang: "vi",
    ch_status: "send",
    ch_wallet_address: "s4uJWXe7C3QeKsUBoMTvNDRGtrk5LJYJK1Az7jyfvdy",
    chat_id: "24",
    chat_type: "public",
    country: "vi",
    createdAt: "2025-05-23T11:07:24.861Z",
    nick_name: "khanh382",
    _id: "683056ec5aa0d0c1efdec9e3"
}

const MasterMessage = ({ message }: ChatMessageProps) => {
  const currentLang = langConfig.listLangs.find(l => l.code === message.country);
  return (
    <div className={`flex `}>
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
            {message?.nick_name} :
          </div>
          <span className="text-xs text-gray-800 dark:text-white">{message.ch_content}</span>
        </div>
    </div>
  );
};

export default MasterMessage; 
