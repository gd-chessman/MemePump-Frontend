"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Copy, Check, Send } from "lucide-react"
import Image from "next/image"
import { useWsChatMessage } from "@/hooks/useWsChatMessage"
import { getInforWallet } from "@/services/api/TelegramWalletService"
import { useQuery } from "@tanstack/react-query"
import { getGroupHistories } from "@/services/api/ChatService"
import { useLang } from "@/lang/useLang"

// Định nghĩa các kiểu dữ liệu
type TabType = "Connected" | "Paused" | "Pending" | "Block"
type GroupStatus = "ON" | "OFF"
type TradeStatus = "Pending" | "Connected" | "Paused" | "Blocked"

interface TradeItem {
  id: string
  address: string
  group: number
  status: TradeStatus
}

interface Group {
  id: string
  name: string
  status: GroupStatus
}

interface ChatMessage {
  id: string
  username: string
  avatar: string
  message: string
  timestamp: Date
  isCurrentUser: boolean
}

const textHeaderTable = "text-xs font-normal text-neutral-200"
const textBodyTable = "text-xs font-normal text-neutral-100"
const styleTextRow = "px-4 py-2 rounded-md text-xs"

export default function MasterTradeInterface() {
  // State cho các tab và bộ lọc
  const [activeTab, setActiveTab] = useState<TabType>("Connected")
  const [activeGroupTab, setActiveGroupTab] = useState<"On" | "Off" | "Delete">("On")
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [groupSearchQuery, setGroupSearchQuery] = useState("")
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newMessage, setNewMessage] = useState("")

  // State cho dữ liệu
  const [tradeItems, setTradeItems] = useState<TradeItem[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const { t, lang } = useLang();

  const { data: chatGroupHistories, refetch: refetchChatGroupHistories } =
    useQuery({
      queryKey: ["chatGroupHistories", selectedGroup, lang],
      queryFn: () => getGroupHistories(selectedGroup || "" , lang),
      enabled: !!selectedGroup,
    });

  const { message: wsMessage } = useWsChatMessage({
    chatType: "group",
    groupId: selectedGroup,
  });

  // Thêm ref để scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Tạo dữ liệu mẫu khi component được mount
  useEffect(() => {
    // Tạo dữ liệu mẫu cho các nhóm
    const sampleGroups: Group[] = [
      { id: "group-1", name: "Test 1", status: "ON" },
      { id: "group-2", name: "Test 2", status: "ON" },
      { id: "group-3", name: "Test 3", status: "ON" },
      { id: "group-4", name: "Test 4", status: "OFF" },
      { id: "group-5", name: "Test 5", status: "OFF" },
    ]

    // Tạo dữ liệu mẫu cho các giao dịch
    const sampleTradeItems: TradeItem[] = Array(15)
      .fill(null)
      .map((_, index) => {
        let status: TradeStatus
        if (index < 3) {
          status = "Connected"
        } else if (index < 5) {
          status = "Paused"
        } else if (index < 12) {
          status = "Pending"
        } else {
          status = "Blocked"
        }

        return {
          id: `trade-${index}`,
          address: `T034...mnop`,
          group: 2,
          status,
        }
      })

    // Tạo dữ liệu mẫu cho tin nhắn chat
    const sampleChatMessages: ChatMessage[] = [
      {
        id: "msg-1",
        username: "POPCAT",
        avatar: "/tabby-cat-sunbeam.png",
        message: "Hi. This is a dog",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isCurrentUser: false,
      },
      {
        id: "msg-2",
        username: "POPCAT",
        avatar: "/tabby-cat-sunbeam.png",
        message: "Hi. This is a dog",
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        isCurrentUser: false,
      },
      {
        id: "msg-3",
        username: "POPCAT",
        avatar: "/tabby-cat-sunbeam.png",
        message: "Hi. This is a dog",
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        isCurrentUser: false,
      },
      {
        id: "msg-4",
        username: "CATFACE",
        avatar: "/cat-face.png",
        message: "Hello. This is a cat.",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isCurrentUser: false,
      },
      {
        id: "msg-5",
        username: "POPCAT",
        avatar: "/tabby-cat-sunbeam.png",
        message: "Anyone is up for illustrations. I think This is Hi. This is a dog!!!",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        isCurrentUser: false,
      },
      {
        id: "msg-6",
        username: "POPCAT",
        avatar: "/tabby-cat-sunbeam.png",
        message: "😊",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isCurrentUser: false,
      },
      {
        id: "msg-7",
        username: "ME",
        avatar: "/abstract-geometric-shapes.png",
        message: "Hi.",
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
        isCurrentUser: true,
      },
      {
        id: "msg-8",
        username: "YOU",
        avatar: "/diverse-group.png",
        message: "Hello there!",
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
        isCurrentUser: false,
      },
      {
        id: "msg-9",
        username: "ME",
        avatar: "/abstract-geometric-shapes.png",
        message: "How's it going?",
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
        isCurrentUser: true,
      },
      {
        id: "msg-10",
        username: "YOU",
        avatar: "/diverse-group.png",
        message: "Pretty good, thanks for asking.",
        timestamp: new Date(Date.now() - 1000 * 60 * 1),
        isCurrentUser: false,
      },
    ]

    setGroups(sampleGroups)
    setTradeItems(sampleTradeItems)
    setChatMessages(sampleChatMessages)
  }, [])

  // Thêm useEffect để xử lý chatGroupHistories và wsMessage
  useEffect(() => {
    if (chatGroupHistories?.data) {
      const messages = chatGroupHistories.data.map((msg: any) => ({
        id: msg.ch_chat_id.toString(),
        username: msg.ch_wallet_address,
        avatar: "/placeholder.svg",
        message: msg.ch_content,
        timestamp: new Date(msg.createdAt),
        isCurrentUser: false, // TODO: Compare with current user's wallet
      }));
      setChatMessages(messages);
    }
  }, [chatGroupHistories]);

  useEffect(() => {
    if (wsMessage) {
      const newMessage = {
        id: wsMessage.ch_chat_id.toString(),
        username: wsMessage.ch_wallet_address,
        avatar: "/placeholder.svg",
        message: wsMessage.ch_content,
        timestamp: new Date(wsMessage.createdAt),
        isCurrentUser: false, // TODO: Compare with current user's wallet
      };
      setChatMessages(prev => [...prev, newMessage]);
    }
  }, [wsMessage]);

  // Lọc các mục giao dịch dựa trên tab đang hoạt động và truy vấn tìm kiếm
  const filteredTradeItems = tradeItems.filter((item) => {
    // Lọc theo tab
    if (item.status !== activeTab) return false

    // Lọc theo tìm kiếm
    if (searchQuery && !item.address.toLowerCase().includes(searchQuery.toLowerCase())) return false

    return true
  })

  // Lọc các nhóm dựa trên tab đang hoạt động và truy vấn tìm kiếm
  const filteredGroups = groups.filter((group) => {
    // Lọc theo tab
    if (activeGroupTab === "On" && group.status !== "ON") return false
    if (activeGroupTab === "Off" && group.status !== "OFF") return false
    // Giả sử "Delete" hiển thị tất cả các nhóm

    // Lọc theo tìm kiếm
    if (groupSearchQuery && !group.name.toLowerCase().includes(groupSearchQuery.toLowerCase())) return false

    return true
  })

  // Lọc các nhóm cho dropdown
  const filteredGroupsForDropdown = groups.filter((group) => {
    if (!groupSearchQuery) return true
    return group.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
  })

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

  // Xử lý tạo nhóm mới
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return

    const newGroup: Group = {
      id: `group-${groups.length + 1}`,
      name: newGroupName,
      status: "ON",
    }

    setGroups([...groups, newGroup])
    setNewGroupName("")
  }

  // Xử lý thay đổi trạng thái nhóm
  const handleToggleGroupStatus = (id: string) => {
    setGroups(
      groups.map((group) => {
        if (group.id === id) {
          return {
            ...group,
            status: group.status === "ON" ? "OFF" : "ON",
          }
        }
        return group
      }),
    )
  }

  // Xử lý xóa nhóm
  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter((group) => group.id !== id))
  }

  // Xử lý gửi tin nhắn
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGroup) return;

    // TODO: Implement websocket send message
    // const messageToSend = {
    //   ch_content: newMessage,
    //   ch_wallet_address: currentUserWallet, // Get from user context
    //   ch_status: "active",
    // };

    setNewMessage("");
  }

  // Xử lý chặn giao dịch
  const handleBlockTrade = (id: string) => {
    setTradeItems(
      tradeItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: "Blocked",
          }
        }
        return item
      }),
    )
  }

  // Đếm số lượng mục theo trạng thái
  const connectedCount = tradeItems.filter((item) => item.status === "Connected").length
  const pausedCount = tradeItems.filter((item) => item.status === "Paused").length
  const pendingCount = tradeItems.filter((item) => item.status === "Pending").length
  const blockedCount = tradeItems.filter((item) => item.status === "Blocked").length

  // Đếm số lượng nhóm theo trạng thái
  const onGroupsCount = groups.filter((group) => group.status === "ON").length
  const offGroupsCount = groups.filter((group) => group.status === "OFF").length

  const ethereumIcon = (width: number, height: number) => {
    return (
      <img src={"/ethereum.png"} alt="ethereum-icon" width={width} height={height} />
    );
  };

  return (
    <div className="container-body px-[40px] flex gap-6 pt-[30px] relative mx-auto z-10">
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
              <span className={`${activeGroupTab === 'Delete' ? 'gradient-hover ' : ''}`}>Delete (1)</span>
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border-1 z-10 border-solid border-y-[#15DFFD] border-x-[#720881] bg-theme-black-1/2 bg-opacity-30 backdrop-blur-sm">
            <table className="w-full bg-black  text-neutral-100">
              <thead>
                <tr className="border-b border-blue-500/30 text-gray-400 text-sm">
                  <th className={`text-center ${textHeaderTable}`}>Group</th>
                  <th className={`px-4 py-2`}>
                    <div className={`px ${textHeaderTable}`}>
                      Status
                    </div>
                  </th>
                  <th className={`px-4 py-2`}>
                    <div className={`px ${textHeaderTable}`}>
                      Action</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="border-b border-blue-500/10 hover:bg-blue-900/10 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">

                        <span className={`${textBodyTable}`}>{group.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`${textBodyTable}`}>{group.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleToggleGroupStatus(group.id)}
                          className={`px-4 py-1 rounded-full text-xs ${group.status === "ON"
                            ? "text-theme-yellow-200 border border-theme-yellow-200 hover:text-neutral-100 hover:bg-theme-yellow-200"
                            : "text-theme-green-200 border border-theme-green-200 hover:text-neutral-100 hover:bg-theme-green-200"
                            }`}
                        >
                          {group.status === "ON" ? "Off" : "On"}
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className={`px-3 py-1 rounded-full text-xs ${group.status === "ON"
                            ? "text-theme-red-200 border border-theme-red-200 hover:text-neutral-100 hover:bg-theme-red-200"
                            : "text-theme-red-200 border border-theme-red-200 hover:text-neutral-100 hover:bg-theme-red-200"
                            }`}
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
        </div>
      </div>

      {/* Phần bảng giao dịch */}
      <div className="flex-1">
        <div>
          <div className="flex gap-6 mb-4 ">
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
              <button
                onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                className="flex items-center gap-2 px-4 py-1 bg-black bg-opacity-60 rounded-full text-neutral-100 border border-blue-500/30"
              >
                <span className="text-xs">Choose group</span>
                <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative">
              {showGroupDropdown && (
                <div className="absolute top-8 right-0 mt-2 w-64 bg-theme-neutral-1000 bg-opacity-90 border border-blue-500/30 rounded-lg shadow-lg z-10">
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
                          key={group.id}
                          onClick={() => {
                            setSelectedGroup(group.id)
                            setShowGroupDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-neutral-100 hover:bg-blue-900/30 rounded-md text-xs"
                        >
                          Group {group.name}
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

                  <th className={`px-4 py-3 text-left ${textHeaderTable}`}>Address</th>
                  <th className={`px-4 py-3 text-center ${textHeaderTable}`}>Group</th>
                  <th className={`px-4 py-3 text-center ${textHeaderTable}`}>Status</th>
                  <th className={`px-4 py-3 text-center ${textHeaderTable}`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTradeItems.map((item) => (
                  <tr key={item.id} className="border-b border-blue-500/10 hover:bg-blue-900/10 transition-colors">

                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className={`${textBodyTable}`}>{item.address}</span>
                        <button
                          onClick={() => handleCopyAddress(item.address)}
                          className="ml-2 text-gray-400 hover:text-neutral-100 transition-colors"
                        >
                          {copiedAddress === item.address ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`${textBodyTable}`}>{item.group}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`${textBodyTable}`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleBlockTrade(item.id)}
                        className="px-3 py-1 text-theme-red-200 border border-theme-red-200 hover:text-neutral-100 hover:bg-theme-red-200 rounded-full text-xs"
                      >
                        Block
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Phần chat */}
      <div className="">
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden shadow-lg flex flex-col h-[600px]">
          <div className="p-4 border-b border-blue-500/30">
            <h2 className="text-center text-lg font-bold text-neutral-100 flex items-center justify-center gap-2">
              <img src="/ethereum.png" alt="ethereum-icon" width={16} height={16} />
              MASTER CHATROOM
              <img src="/ethereum.png" alt="ethereum-icon" width={16} height={16} />
            </h2>

            <div className="mt-4">
              <div className="relative">
                <select 
                  className="w-full bg-black bg-opacity-60 border border-blue-500/30 rounded-lg p-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={selectedGroup || ""}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="">Select groups...</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {chatMessages.map((message) => (
              <div key={message.id} className={`flex ${message.isCurrentUser ? "justify-end" : "items-start"} gap-2`}>
                {!message.isCurrentUser && (
                  <div className="flex-shrink-0">
                    <div className="relative w-8 h-8">
                      <Image
                        src={message.avatar || "/placeholder.svg"}
                        alt={message.username}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isCurrentUser
                      ? "bg-theme-primary-400 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  {!message.isCurrentUser && (
                    <div className="font-medium text-xs text-gray-500 dark:text-gray-400 mb-1">{message.username}</div>
                  )}
                  <p className="text-sm">{message.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-900">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary-400/50"
                disabled={!selectedGroup}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !selectedGroup}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !newMessage.trim() || !selectedGroup
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-theme-primary-400 hover:bg-theme-primary-500 text-white"
                }`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
