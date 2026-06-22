import { useState } from "react";
import ChatListPanel from "../components/chat/ChatListPanel.jsx";
import ChatWindow from "../components/chat/ChatWindow.jsx";
import { useChat } from "../context/ChatContext.jsx";

export default function ChatsPage() {
  const { activeChat, openChat, closeChat } = useChat();
  const [showListOnMobile, setShowListOnMobile] = useState(true);

  const handleSelectUser = (user) => {
    openChat(user);
    setShowListOnMobile(false);
  };

  const handleBack = () => {
    closeChat();
    setShowListOnMobile(true);
  };

  return (
    <div className="flex h-full">
      <ChatListPanel
        onSelectUser={handleSelectUser}
        activeUserId={activeChat?._id}
        className={`w-full md:w-[340px] border-r border-border shrink-0 ${
          showListOnMobile ? "flex" : "hidden md:flex"
        }`}
      />
      <div className={`flex-1 ${showListOnMobile ? "hidden md:flex" : "flex"}`}>
        <ChatWindow onBack={handleBack} />
      </div>
    </div>
  );
}
