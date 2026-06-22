import ChatListPanel from "../components/chat/ChatListPanel.jsx";
import ChatWindow from "../components/chat/ChatWindow.jsx";
import { useChat } from "../context/ChatContext.jsx";

export default function ChatsPage() {
  const { activeChat, openChat, closeChat } = useChat();

  // Derive mobile view from activeChat instead of tracking separate state —
  // this way navigating here from another page (e.g. Users) with an already
  // -open chat correctly shows the chat window, not the list.
  const showListOnMobile = !activeChat;

  return (
    <div className="flex h-full">
      <ChatListPanel
        onSelectUser={openChat}
        activeUserId={activeChat?._id}
        className={`w-full md:w-[340px] border-r border-border shrink-0 ${
          showListOnMobile ? "flex" : "hidden md:flex"
        }`}
      />
      <div className={`flex-1 ${showListOnMobile ? "hidden md:flex" : "flex"}`}>
        <ChatWindow onBack={closeChat} />
      </div>
    </div>
  );
}
