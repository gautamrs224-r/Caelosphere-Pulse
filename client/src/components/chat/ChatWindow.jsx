import { useEffect, useRef } from "react";
import { Phone, Video, MoreVertical, ArrowLeft, MessageCircleOff } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import MessageBubble from "./MessageBubble.jsx";
import MessageInput from "./MessageInput.jsx";
import { useChat } from "../../context/ChatContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatDateDivider, formatLastSeen } from "../../lib/formatTime.js";

export default function ChatWindow({ onBack }) {
  const { activeChat, messages, isMessagesLoading, typingUserId, isUserOnline } = useChat();
  const { user: currentUser } = useAuth();
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUserId]);

  if (!activeChat) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center gap-3 text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center">
          <MessageCircleOff className="w-7 h-7 text-muted" />
        </div>
        <h3 className="text-white font-semibold">No conversation selected</h3>
        <p className="text-sm text-textSecondary max-w-xs">
          Pick someone from your chats or browse all users to start a new conversation.
        </p>
      </div>
    );
  }

  const online = isUserOnline(activeChat._id);
  const isTyping = typingUserId === activeChat._id;

  // Group consecutive messages by date for date dividers
  const groupedByDate = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (dateKey !== lastDate) {
      groupedByDate.push({ type: "divider", date: msg.createdAt, key: `d-${msg._id}` });
      lastDate = dateKey;
    }
    groupedByDate.push({ type: "message", message: msg, key: msg._id });
  });

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border h-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="md:hidden text-textSecondary shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar
            src={activeChat.profilePic}
            name={activeChat.name}
            size="md"
            showStatus
            isOnline={online}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{activeChat.name}</p>
            <p className="text-xs text-textSecondary truncate">
              {isTyping ? (
                <span className="text-typing">typing...</span>
              ) : online ? (
                <span className="text-online">Online</span>
              ) : (
                formatLastSeen(activeChat.lastSeen)
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-5 text-textSecondary shrink-0">
          <button aria-label="Call" className="hover:text-white transition-colors">
            <Phone className="w-4.5 h-4.5" />
          </button>
          <button aria-label="Video call" className="hover:text-white transition-colors">
            <Video className="w-4.5 h-4.5" />
          </button>
          <button aria-label="More options" className="hover:text-white transition-colors">
            <MoreVertical className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3">
        {isMessagesLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-12 rounded-bubble bg-elevated/60 animate-pulse ${
                  i % 2 === 0 ? "w-2/3 ml-auto" : "w-1/2"
                }`}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-12">
            <Avatar src={activeChat.profilePic} name={activeChat.name} size="xl" />
            <p className="text-white font-semibold mt-2">{activeChat.name}</p>
            <p className="text-sm text-textSecondary">
              Say hello and start the conversation 👋
            </p>
          </div>
        ) : (
          groupedByDate.map((item) =>
            item.type === "divider" ? (
              <p key={item.key} className="text-center text-xs text-muted py-2">
                {formatDateDivider(item.date)}
              </p>
            ) : (
              <MessageBubble
                key={item.key}
                message={item.message}
                isOwn={item.message.senderId === currentUser._id}
              />
            )
          )
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-elevated rounded-bubble px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-typing animate-pulse-dot"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      <MessageInput />
    </div>
  );
}
