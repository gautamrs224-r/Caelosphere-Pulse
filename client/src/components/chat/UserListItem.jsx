import Avatar from "../ui/Avatar.jsx";
import { formatListTime } from "../../lib/formatTime.js";
import { ImageIcon } from "lucide-react";

export default function UserListItem({ user, isActive, isOnline, onClick }) {
  const lastMessage = user.lastMessage;

  const renderPreview = () => {
    if (!lastMessage) return <span className="italic text-muted">Say hello 👋</span>;
    if (lastMessage.messageType === "image") {
      return (
        <span className="flex items-center gap-1">
          <ImageIcon className="w-3.5 h-3.5" /> Sent an image
        </span>
      );
    }
    return lastMessage.text;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors h-[72px] ${
        isActive
          ? "bg-elevated border-l-4 border-primary"
          : "hover:bg-elevated/50 border-l-4 border-transparent"
      }`}
    >
      <Avatar src={user.profilePic} name={user.name} size="md" showStatus isOnline={isOnline} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          {lastMessage && (
            <span className="text-xs text-muted shrink-0">
              {formatListTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-textSecondary truncate mt-0.5">{renderPreview()}</p>
      </div>
      {user.unreadCount > 0 && (
        <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shrink-0">
          {user.unreadCount}
        </span>
      )}
    </button>
  );
}
