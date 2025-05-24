"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Copy, Check, Send, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useWsChatMessage } from "@/hooks/useWsChatMessage"
import { getInforWallet } from "@/services/api/TelegramWalletService"
import { useQuery } from "@tanstack/react-query"
import { getGroupHistories } from "@/services/api/ChatService"
import { useLang } from "@/lang/useLang"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUsersGear } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation"
import ChatMessage from "@/app/components/chat/ChatMessage"
import { getMyConnects, getMyGroups } from "@/services/api/MasterTradingService"
import { ChatService, MasterTradingService } from "@/services/api"
import { GroupSelect } from "@/app/trading/control/components/GroupSelect"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog"
import { Button } from "@/ui/button"
import MasterMessage from "@/app/components/chat/MasterMessage"
import { useMasterChatStore } from "@/store/masterChatStore"
import type { MasterMessage as StoreMasterMessage } from "@/store/masterChatStore"

// Định nghĩa các kiểu dữ liệu
type TabType = "Connected" | "Paused" | "Pending" | "Block"
const data = [{
  ch_content: "alo ae",
  ch_id: "1745422427753-44",
  ch_is_master: true,
  ch_lang: "vi",
  ch_status: "send",
  ch_wallet_address: "s4uJWXe7C3QeKsUBoMTvNDRGtrk5LJYJK1Az7jyfvdy",
  chat_id: "23",
  chat_type: "public",
  country: "vi",
  createdAt: "2025-04-23T15:33:47.755Z",
  nick_name: "khanh382",
  _id: "6809085b48386b72708da4ea"
}]
interface TradeItem {
  connection_id: number;
  member_id: number;
  member_address: string;
  status: "connect" | "pending" | "pause" | "block";
  option_limit: string;
  price_limit: string;
  ratio_limit: number;
  joined_groups: {
    group_id: number;
    group_name: string;
  }[];
}

interface Group {
  mg_id: number
  mg_name: string
  mg_status: string
  mg_fixed_price: string
  mg_fixed_ratio: number
  mg_master_wallet: number
  mg_option: string
  created_at: string
}

type Connection = {
  connection_id: number;
  member_id: number;
  member_address: string;
  status: "connect" | "pending" | "pause" | "block";
  option_limit: string;
  price_limit: string;
  ratio_limit: number;
  joined_groups: {
    group_id: number;
    group_name: string;
  }[];
};

// Add type definition for wsMessage
type WsMessage = {
  _id?: string;
  ch_chat_id: number;
  ch_content: string;
  ch_status: string;
  createdAt: string;
  ch_wallet_address: string;
  nick_name?: string;
  country?: string;
  ch_lang?: string;
};

const textHeaderTable = "text-xs font-normal text-neutral-200"
const textBodyTable = "text-xs font-normal text-neutral-100"

export default function MasterTradeInterface() {
  const router = useRouter()
  // State cho các tab và bộ lọc
  const [activeTab, setActiveTab] = useState<TabType>("Connected")
  const [activeGroupTab, setActiveGroupTab] = useState<"On" | "Off" | "Delete">("On")
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [groupSearchQuery, setGroupSearchQuery] = useState("")
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // State cho dữ liệu
  const [tradeItems, setTradeItems] = useState<TradeItem[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [chatMessages, setChatMessages] = useState<StoreMasterMessage[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const { t, lang } = useLang();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [selectedChatGroup, setSelectedChatGroup] = useState<string>("");

  const { data: myConnects = [], refetch: refetchMyConnects } = useQuery<Connection[]>({
    queryKey: ["my-connects-manage"],
    queryFn: getMyConnects,
  });

  const { data: myGroups = [] , refetch: refetchMyGroups} = useQuery<Group[]>({
    queryKey: ["my-groups-manage"],
    queryFn: async () => {
      const response = await getMyGroups();
      console.log("API Response:", response);
      if (Array.isArray(response)) {
        return response;
      }
      return response.data || [];
    },
  });
  console.log("selectedChatGroup", selectedChatGroup)

  const { data: chatGroupHistories, refetch: refetchChatGroupHistories } =
    useQuery({
      queryKey: ["chatGroupHistories", selectedChatGroup, lang],
      queryFn: () => getGroupHistories(selectedChatGroup, lang),
      enabled: !!selectedChatGroup,
    });
  
  const { message: wsMessage } = useWsChatMessage({
    chatType: "group",
    groupId: selectedGroup,
  }) as { message: WsMessage | null };

  // Thêm ref để scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const { messages, setMessages, addMessage, clearMessages } = useMasterChatStore();
  console.log("messages", messages)
  
  // Clear messages when changing chat group
  useEffect(() => {
    if (selectedChatGroup) {
      clearMessages();
    }
  }, [selectedChatGroup, clearMessages]);

  // Convert chatGroupHistories data to Message format
  useEffect(() => {
    if (chatGroupHistories?.data && selectedChatGroup) {
      const convertedMessages: StoreMasterMessage[] = chatGroupHistories.data
        .filter((msg: any) => msg && msg.ch_content) // Filter out invalid messages
        .map((chat: any) => ({
          id: chat._id || String(chat.ch_chat_id),
          sender: {
            name: chat.nick_name || chat.ch_wallet_address || "Anonymous",
            isCurrentUser: false,
          },
          text: chat.ch_content,
          timestamp: new Date(chat.createdAt || Date.now()),
          country: chat.country || lang
        }));
      console.log("Setting messages from history:", convertedMessages);
      setMessages(convertedMessages);
    }
  }, [chatGroupHistories, setMessages, lang, selectedChatGroup]);

  // Handle new websocket messages
  useEffect(() => {
    if (wsMessage && selectedChatGroup) {
      console.log("New websocket message:", wsMessage);
      const newMessage: StoreMasterMessage = {
        id: wsMessage._id || String(wsMessage.ch_chat_id),
        sender: {
          name: wsMessage.nick_name || wsMessage.ch_wallet_address || "Anonymous",
          isCurrentUser: false,
        },
        text: wsMessage.ch_content,
        timestamp: new Date(wsMessage.createdAt || Date.now()),
        country: wsMessage.country || lang
      };
      console.log("Adding new message to store:", newMessage);
      addMessage(newMessage);
    }
  }, [wsMessage, addMessage, lang, selectedChatGroup]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatGroup) return;
    
    try {
      // Add message to store immediately for optimistic update
      const optimisticMessage: StoreMasterMessage = {
        id: Date.now().toString(), // Temporary ID
        sender: {
          name: "You", // This will be replaced by actual data from server
          isCurrentUser: true,
        },
        text: newMessage,
        timestamp: new Date(),
        country: lang
      };
      addMessage(optimisticMessage);
      
      // Send message to server
      await ChatService.sendGroupMessage(newMessage, selectedChatGroup, lang);
      setNewMessage("");
      
      // The actual message will be received via websocket and replace the optimistic one
    } catch (error) {
      console.error("Failed to send message:", error);
      // TODO: Remove optimistic message on error
    }
  };

  // Xử lý bật/tắt nhóm
  const handleToggleGroup = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ON" ? "on" : "off";
      await MasterTradingService.changeStatusGroup(id, newStatus);
      await refetchMyGroups();
    } catch (error) {
    }
  };

  // Xử lý xóa nhóm
  const handleDeleteGroup = async (id: number) => {
    try {
      console.log(`Deleting group ${id}`);
      await MasterTradingService.changeStatusGroup(id, "delete");
      await refetchMyGroups();
    } catch (error) {
    }
  };

  // Xử lý khôi phục nhóm
  const handleRestoreGroup = async (id: number) => {
    try {
      console.log(`Restoring group ${id}`);
      await MasterTradingService.changeStatusGroup(id, "OFF");
      await refetchMyGroups();
    } catch (error) {
    }
  };

  const handleCreateGroup = async () => {
    if (newGroupName.trim()) {
      try {
        await MasterTradingService.masterCreateGroup({ mg_name: newGroupName });
        setNewGroupName("");
        setToastMessage(t("masterTrade.manage.createNewGroup.success"));
        setShowToast(true);
        refetchMyGroups();
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        setToastMessage(t("masterTrade.manage.createNewGroup.error"));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group.mg_id.toString());
    setSelectedGroupName(group.mg_name);
    setShowGroupDropdown(false);
    setIsJoinDialogOpen(true);
  };

  const handleJoin = async () => {
    if (!selectedGroup || selectedItems.length === 0) return;

    try {
      // Lấy tất cả member_ids từ các kết nối đã chọn
      const memberIds = selectedItems.map(connId => {
        const selectedConnection = myConnects.find(
          conn => conn.connection_id.toString() === connId
        );
        return selectedConnection?.member_id;
      }).filter((id): id is number => id !== undefined);

      if (memberIds.length > 0) {
        await MasterTradingService.masterSetGroup({
          mg_id: parseInt(selectedGroup),
          member_ids: memberIds
        });

        // Hiển thị thông báo thành công
        setToastMessage(t("masterTrade.manage.connectionManagement.joinSuccess"));
        setShowToast(true);

        // Reset states và refresh dữ liệu
        setSelectedItems([]);
        setSelectedGroup(null);
        setSelectedGroupName("");
        setIsJoinDialogOpen(false);
        
        // Refresh dữ liệu
        await Promise.all([refetchMyGroups(), refetchMyConnects()]);
        
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error("Error joining group:", error);
      setToastMessage(t("masterTrade.manage.connectionManagement.joinError"));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleToggleConnection = async (id: number, action: string) => {
    try {
      let status = "";
      let successMessage = "";

      switch (action) {
        case "connect":
          status = "connect";
          successMessage = t("masterTrade.manage.connectionManagement.connectSuccess");
          break;
        case "block":
          status = "block";
          successMessage = t("masterTrade.manage.connectionManagement.blockSuccess");
          break;
        case "pause":
          status = "pause";
          successMessage = t("masterTrade.manage.connectionManagement.pauseSuccess");
          break;
        case "unblock":
          status = "connect";
          successMessage = t("masterTrade.manage.connectionManagement.unblockSuccess");
          break;
        default:
          throw new Error("Invalid action");
      }

      await MasterTradingService.masterSetConnect({ 
        mc_id: id, 
        status: status 
      });

      // Hiển thị thông báo thành công
      setToastMessage(successMessage);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Refresh dữ liệu
      await refetchMyConnects();
    } catch (error) {
      console.error("Error toggling connection:", error);
      // Hiển thị thông báo lỗi
      setToastMessage(t("masterTrade.manage.connectionManagement.error"));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Xóa phần tạo dữ liệu mẫu cho trade items
  useEffect(() => {
    setTradeItems([]) // Không cần dữ liệu mẫu nữa
  }, [])

  // Cập nhật logic lọc dựa trên trạng thái thực tế
  const filteredTradeItems = myConnects.filter((item) => {
    // Lọc theo tab
    if (activeTab === "Connected" && item.status !== "connect") return false;
    if (activeTab === "Paused" && item.status !== "pause") return false;
    if (activeTab === "Pending" && item.status !== "pending") return false;
    if (activeTab === "Block" && item.status !== "block") return false;

    // Lọc theo tìm kiếm
    if (searchQuery && !item.member_address.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    return true;
  });

  // Lọc các nhóm cho dropdown
  const filteredGroupsForDropdown = myGroups.filter((group) => {
    // Chỉ lấy các nhóm có status là "ON"
    if (group.mg_status?.toUpperCase() !== "ON") return false;
    
    // Lọc theo tìm kiếm nếu có
    if (groupSearchQuery) {
      return group.mg_name.toLowerCase().includes(groupSearchQuery.toLowerCase());
    }
    
    return true;
  });

  // Xử lý sao chép địa chỉ
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  // Xử lý chọn mục
  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Cập nhật số lượng theo trạng thái thực tế
  const connectedCount = myConnects.filter((item) => item.status === "connect").length;
  const pausedCount = myConnects.filter((item) => item.status === "pause").length;
  const pendingCount = myConnects.filter((item) => item.status === "pending").length;
  const blockedCount = myConnects.filter((item) => item.status === "block").length;

  // Đếm số lượng nhóm theo trạng thái
  const onGroupsCount = myGroups.filter(g => g.mg_status?.toUpperCase() === "ON").length;
  const offGroupsCount = myGroups.filter(g => g.mg_status?.toUpperCase() === "OFF").length;
  const deleteGroupsCount = myGroups.filter(g => g.mg_status?.toUpperCase() === "DELETE").length;

  const ethereumIcon = (width: number, height: number) => {
    return (
      <img src={"/ethereum.png"} alt="ethereum-icon" width={width} height={height} />
    );
  };

  // Add useEffect to set default selected group when groups are loaded
  useEffect(() => {
    if (filteredGroupsForDropdown.length > 0 && !selectedChatGroup) {
      setSelectedChatGroup(filteredGroupsForDropdown[0].mg_id.toString());
    }
  }, [filteredGroupsForDropdown, selectedChatGroup]);

  // Transform groups data for select
  const groupOptions = filteredGroupsForDropdown.map(group => ({
    value: group.mg_id.toString(),
    label: group.mg_name
  }));

  return (
    <div className="container-body h-[92vh] px-[40px] flex gap-6 pt-[30px] relative mx-auto z-10">
      {/* Phần tạo nhóm */}
      <div className="">
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl border border-blue-500/30 p-[30px] shadow-lg">
          <h2 className="text-center text-lg font-bold text-neutral-100 mb-6 flex items-center justify-center gap-2">
            {ethereumIcon(16, 16)}
            CREATE GROUP
            {ethereumIcon(16, 16)}
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="group-name" className="block text-sm font-medium text-neutral-100 mb-1">
                Group Name
              </label>
              <input
                type="text"
                id="group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                className="rounded-full py-2 px-4 w-64 text-sm focus:outline-none bg-gray-100 dark:bg-black text-gray-900 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500 dark:focus:ring-[hsl(var(--ring))] max-h-[30px] border border-gray-200 dark:border-t-theme-primary-300 dark:border-l-theme-primary-300 dark:border-b-theme-secondary-400 dark:border-r-theme-secondary-400 placeholder:text-gray-500 dark:placeholder:text-neutral-400 placeholder:text-xs"
              />
            </div>

            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className={`w-full max-w-[400px] create-coin-bg  hover-bg-delay dark:text-neutral-100 font-medium px-4 py-[6px] rounded-full transition-all duration-500 ease-in-out disabled:opacity-80 disabled:cursor-not-allowed mx-auto gap-2 text-xs flex items-center justify-center ${newGroupName.trim() ? 'hover:linear-200-bg' : ''}`}
            >
              CREATE
            </button>
          </div>
        </div>

        {/* Bảng nhóm */}
        <div className="mt-6 flex-1 bg-opacity-30 backdrop-blur-sm rounded-sm overflow-hidden ">
          <div className="flex gap-6 mb-4 ">
            <button
              onClick={() => setActiveGroupTab("On")}
              className={` rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeGroupTab === "On" ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
            >
              <span className={`${activeGroupTab === 'On' ? 'gradient-hover ' : ''}`}>On ({onGroupsCount})</span>
            </button>
            <button
              onClick={() => setActiveGroupTab("Off")}
              className={` rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeGroupTab === "Off" ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
            >
              <span className={`${activeGroupTab === 'Off' ? 'gradient-hover ' : ''}`}>Off ({offGroupsCount})</span>
            </button>
            <button
              onClick={() => setActiveGroupTab("Delete")}
              className={`rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeGroupTab === "Delete"
                ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
            >
              <span className={`${activeGroupTab === 'Delete' ? 'gradient-hover ' : ''}`}>Delete ({deleteGroupsCount})</span>
            </button>
          </div>

          {/* Bảng cho tab On */}
          {activeGroupTab === "On" && (
            <div className="overflow-x-auto rounded-xl border-1 z-10 border-solid border-y-[#15DFFD] border-x-[#720881] bg-theme-black-1/2 bg-opacity-30 backdrop-blur-sm">
              <table className="w-full bg-black text-neutral-100">
                <thead>
                  <tr className="border-b border-blue-500/30 text-gray-400 text-sm">
                    <th className={`text-center ${textHeaderTable}`}>Group</th>
                    <th className={`px-4 py-2`}>
                      <div className={`px ${textHeaderTable}`}>Status</div>
                    </th>
                    <th className={`px-4 py-2`}>
                      <div className={`px ${textHeaderTable}`}>Action</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {myGroups.filter(group => group.mg_status?.toUpperCase() === "ON").map((group) => (
                    <tr key={group.mg_id} className="border-b border-blue-500/10 hover:bg-blue-900/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className={`${textBodyTable}`}>{group.mg_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`${textBodyTable}`}>{group.mg_status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleToggleGroup(group.mg_id, group.mg_status)}
                            className="px-4 py-1 rounded-full text-xs text-theme-yellow-200 border border-theme-yellow-200 hover:text-neutral-100 hover:bg-theme-yellow-200"
                          >
                            Off
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.mg_id)}
                            className="px-3 py-1 rounded-full text-xs text-theme-red-200 border border-theme-red-200 hover:text-neutral-100 hover:bg-theme-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bảng cho tab Off */}
          {activeGroupTab === "Off" && (
            <div className="overflow-x-auto rounded-xl border-1 z-10 border-solid border-y-[#15DFFD] border-x-[#720881] bg-theme-black-1/2 bg-opacity-30 backdrop-blur-sm">
              <table className="w-full bg-black text-neutral-100">
                <thead>
                  <tr className="border-b border-blue-500/30 text-gray-400 text-sm">
                    <th className={`text-center ${textHeaderTable}`}>Group</th>
                    <th className={`px-4 py-2`}>
                      <div className={`px ${textHeaderTable}`}>Status</div>
                    </th>
                    <th className={`px-4 py-2`}>
                      <div className={`px ${textHeaderTable}`}>Action</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {myGroups.filter(group => group.mg_status?.toUpperCase() === "OFF").map((group) => (
                    <tr key={group.mg_id} className="border-b border-blue-500/10 hover:bg-blue-900/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className={`${textBodyTable}`}>{group.mg_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`${textBodyTable}`}>{group.mg_status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleToggleGroup(group.mg_id, group.mg_status)}
                            className="px-4 py-1 rounded-full text-xs text-theme-green-200 border border-theme-green-200 hover:text-neutral-100 hover:bg-theme-green-200"
                          >
                            On
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.mg_id)}
                            className="px-3 py-1 rounded-full text-xs text-theme-red-200 border border-theme-red-200 hover:text-neutral-100 hover:bg-theme-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bảng cho tab Delete */}
          {activeGroupTab === "Delete" && (
            <div className="overflow-x-auto rounded-xl border-1 z-10 border-solid border-y-[#15DFFD] border-x-[#720881] bg-theme-black-1/2 bg-opacity-30 backdrop-blur-sm">
              <table className="w-full bg-black text-neutral-100">
                <thead>
                  <tr className="border-b border-blue-500/30 text-gray-400 text-sm">
                    <th className={`text-center ${textHeaderTable}`}>Group</th>
                    <th className={`px-4 py-2`}>
                      <div className={`px ${textHeaderTable}`}>Status</div>
                    </th>
                    <th className={`px-4 py-2`}>
                      <div className={`px ${textHeaderTable}`}>Action</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {myGroups.filter(group => group.mg_status?.toUpperCase() === "DELETE").map((group) => (
                    <tr key={group.mg_id} className="border-b border-blue-500/10 hover:bg-blue-900/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className={`${textBodyTable}`}>{group.mg_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`${textBodyTable}`}>{group.mg_status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Phần bảng giao dịch */}
      <div className="flex-1 z-10 flex flex-col gap-6">
          <div className="flex gap-6  ">
            <button
              onClick={() => setActiveTab("Connected")}
              className={`h-min rounded-sm text-sm font-medium text-neutral-400  px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeTab === "Connected" ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
            >
              <span className={`${activeTab === 'Connected' ? 'gradient-hover ' : ''}`}>Connected ({connectedCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("Paused")}
              className={`h-min rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeTab === "Paused" ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
            >
              <span className={`${activeTab === 'Paused' ? 'gradient-hover ' : ''}`}>Paused ({pausedCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("Pending")}
              className={`h-min rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeTab === "Pending" ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
            >
              <span className={`${activeTab === 'Pending' ? 'gradient-hover ' : ''}`}>Pending ({pendingCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("Block")}
              className={`h-min rounded-sm text-sm font-medium text-neutral-400 px-2 py-1 border-1 z-10 border-solid border-theme-primary-300 cursor-pointer ${activeTab === "Pending" ? ' bg-[#0F0F0F]' : 'border-transparent'}`}
            >
              <span className={`${activeTab === 'Block' ? 'gradient-hover ' : ''}`}>Block ({blockedCount})</span>
            </button>
            <div className="flex-1 flex items-center justify-end">
              {selectedItems.length > 0 && (
                <button
                  onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                  className="flex items-center gap-2 px-4 py-1 bg-black bg-opacity-60 rounded-full text-neutral-100 border border-blue-500/30"
                >
                  <span className="text-xs">Choose group</span>
                  <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
            <div className="relative">
              {showGroupDropdown && (
                <div className="absolute top-10 right-0 mt-2 w-64 bg-theme-neutral-1000 bg-opacity-90 border border-blue-500/30 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search group..."
                        value={groupSearchQuery}
                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                        className="rounded-full py-2 pl-10 pr-4 w-full text-sm focus:outline-none bg-gray-100 dark:bg-black text-gray-900 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500 dark:focus:ring-[hsl(var(--ring))] max-h-[30px] border border-gray-200 dark:border-t-theme-primary-300 dark:border-l-theme-primary-300 dark:border-b-theme-secondary-400 dark:border-r-theme-secondary-400 placeholder:text-gray-500 dark:placeholder:text-neutral-400 placeholder:text-xs"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                      {filteredGroupsForDropdown.map((group) => (
                        <button
                          key={group.mg_id}
                          onClick={() => handleGroupSelect(group)}
                          className="w-full text-left px-4 py-2 text-neutral-100 hover:bg-blue-900/30 rounded-md text-xs"
                        >
                          {group.mg_name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border-1 z-10 border-solid border-y-[#15DFFD] border-x-[#720881] bg-theme-black-1/2 bg-opacity-30 backdrop-blur-sm">
            <table className="w-full text-neutral-100">
              <thead>
                <tr className="border-b border-blue-500/30 text-gray-400 text-sm">
                  <th className={`px-4 py-3 text-center ${textHeaderTable}`}>
                    {activeTab === "Connected" && (
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredTradeItems.filter(item => item.status === "connect").length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(filteredTradeItems.filter(item => item.status === "connect").map(item => item.connection_id.toString()));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                  </th>
                  <th className={`px-4 py-3 text-left ${textHeaderTable}`}>Address</th>
                  <th className={`px-4 py-3 text-center ${textHeaderTable}`}>Group</th>
                  <th className={`px-4 py-3 text-center ${textHeaderTable}`}>Status</th>
                  <th className={`px-4 py-3 text-center ${textHeaderTable}`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTradeItems.map((item) => (
                  <tr key={item.connection_id} className="border-b border-blue-500/10 hover:bg-blue-900/10 transition-colors">
                    <td className="px-4 py-3 text-center">
                      {item.status === "connect" && (
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.connection_id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.connection_id.toString()]);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== item.connection_id.toString()));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className={`${textBodyTable}`}>{item.member_address}</span>
                        <button
                          onClick={() => handleCopyAddress(item.member_address)}
                          className="ml-2 text-gray-400 hover:text-neutral-100 transition-colors"
                        >
                          {copiedAddress === item.member_address ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`${textBodyTable}`}>
                        {item.joined_groups.length > 0 
                          ? item.joined_groups.map(g => g.group_name).join(", ")
                          : "Không có nhóm"
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`${textBodyTable} capitalize`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {item.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleToggleConnection(item.connection_id, "connect")}
                              className="px-3 py-1 text-theme-green-200 border border-theme-green-200 hover:text-neutral-100 hover:bg-theme-green-200 rounded-full text-xs"
                            >
                              Connect
                            </button>
                            <button
                              onClick={() => handleToggleConnection(item.connection_id, "block")}
                              className="px-3 py-1 text-theme-red-200 border border-theme-red-200 hover:text-neutral-100 hover:bg-theme-red-200 rounded-full text-xs"
                            >
                              Block
                            </button>
                          </>
                        )}
                        {item.status === "connect" && (
                          <>
                           
                            <button
                              onClick={() => handleToggleConnection(item.connection_id, "block")}
                              className="px-3 py-1 text-theme-red-200 border border-theme-red-200 hover:text-neutral-100 hover:bg-theme-red-200 rounded-full text-xs"
                            >
                              Block
                            </button>
                          </>
                        )}
                        {item.status === "block" && (
                          <button
                            onClick={() => handleToggleConnection(item.connection_id, "pause")}
                            className="px-3 py-1 text-theme-green-200 border border-theme-green-200 hover:text-neutral-100 hover:bg-theme-green-200 rounded-full text-xs"
                          >
                            Unblock
                          </button>
                        )}
                        {item.status === "pause" && (
                         
                          <>
                             <button
                            onClick={() => handleToggleConnection(item.connection_id, "block")}
                            className="px-3 py-1 text-theme-red-200 border border-theme-red-200 hover:text-neutral-100 hover:bg-theme-red-200 rounded-full text-xs"
                          >
                            Block
                          </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      {/* Phần chat */}
      <div className="z-10 w-1/4 flex flex-col gap-6 justify-end items-end ">
        <button className="w-fit create-coin-bg hover:linear-200-bg hover-bg-delay dark:text-neutral-100 font-medium px-4 py-[6px] rounded-full transition-all duration-500 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed flex gap-2 text-xs items-center justify-center " onClick={() => router.push("/master-trade")}>
          <FontAwesomeIcon icon={faUsersGear} className="w-4 h-4" />
          Connect with other Master
        </button>
        <div className="bg-black bg-opacity-30 backdrop-blur-sm w-full rounded-xl border border-y-[#15DFFD] border-x-[#720881] overflow-hidden shadow-lg flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-cyan-500/30">
            <h2 className="text-center text-[16px] font-semibold text-neutral-100 mb-4 flex items-center justify-center">
              <span className="text-cyan-400 mr-2">✦</span>
              MASTER CHATROOM
              <span className="text-cyan-400 ml-2">✦</span>
            </h2>

            <div className="relative flex items-center justify-center">
              <Select
                
                value={selectedChatGroup}
                onValueChange={(value) => setSelectedChatGroup(value)}
              >
                <SelectTrigger className="w-[200px] pl-4 h-[30px] bg-black/60 border-theme-primary-300/30 hover:border-theme-primary-300/50 text-neutral-100 text-sm rounded-full">
                  <SelectValue placeholder="Select a group..." />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-theme-primary-300/30">
                  {groupOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-neutral-100 hover:bg-theme-primary-300/20 focus:bg-theme-primary-300/10 cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg) => (
              <MasterMessage 
                key={msg.id} 
                message={{
                  ch_id: msg.id,
                  ch_content: msg.text,
                  ch_wallet_address: msg.sender.name,
                  ch_is_master: msg.sender.isCurrentUser,
                  ch_lang: msg.country,
                  createdAt: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : new Date(msg.timestamp).toISOString(),
                  chat_id: msg.id,
                  chat_type: "group",
                  ch_status: "send",
                  country: msg.country,
                  nick_name: msg.sender.name,
                  _id: msg.id
                }} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 ">
            <div className="flex items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="w-full py-1 px-3 bg-[#111111] rounded-full text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 pr-10 placeholder:text-xs placeholder:text-neutral-100 text-sm"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-1.5 rounded-full ${
                      !newMessage.trim()
                        ? "bg-gray-700 text-gray-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    }`}
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog xác nhận join group */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="bg-theme-neutral-1000 border border-blue-500/30 w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-neutral-100 text-center text-sm">
              Xác nhận kết nối {selectedItems.length} ví đã chọn vào nhóm "{selectedGroupName}"
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="">
            <div className="flex w-full gap-6 justify-center">
            <Button
              variant="outline"
              onClick={() => setIsJoinDialogOpen(false)}
              className="px-3 py-1 text-neutral-100 border border-blue-500/30 hover:bg-blue-500/10 h-[30px]"
            >
              Hủy
            </Button>
            <Button
              onClick={handleJoin}
              className="px-3 py-1 bg-blue-500 text-neutral-100 hover:bg-blue-600 h-[30px]"
            >
              Xác nhận
            </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
