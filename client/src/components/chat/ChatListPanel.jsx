import { useState, useMemo } from "react";
import { Search, SquarePen } from "lucide-react";
import { Link } from "react-router-dom";
import UserListItem from "./UserListItem.jsx";
import { useChat } from "../../context/ChatContext.jsx";

export default function ChatListPanel({ onSelectUser, activeUserId, className = "" }) {
  const { users, isUsersLoading, isUserOnline } = useChat();
  const [search, setSearch] = useState("");

  const conversations = useMemo(() => users.filter((u) => u.lastMessage), [users]);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    return conversations.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  return (
    <div className={`flex flex-col h-full bg-card ${className}`}>
      <div className="flex items-center justify-between px-5 py-5">
        <h2 className="text-lg font-bold text-white">All Chats</h2>
        <Link
          to="/users"
          className="text-textSecondary hover:text-white transition-colors"
          aria-label="Start new chat"
        >
          <SquarePen className="w-4.5 h-4.5" />
        </Link>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-elevated border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isUsersLoading ? (
          <div className="px-5 py-8 text-center text-sm text-muted">Loading chats...</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted">
            {conversations.length === 0
              ? "No conversations yet. Start one from Users."
              : "No matching chats"}
          </div>
        ) : (
          filtered.map((u) => (
            <UserListItem
              key={u._id}
              user={u}
              isActive={activeUserId === u._id}
              isOnline={isUserOnline(u._id)}
              onClick={() => onSelectUser(u)}
            />
          ))
        )}
      </div>

      <div className="p-4 border-t border-border">
        <Link
          to="/users"
          className="flex items-center justify-center gap-2 text-sm font-medium text-primary-bright hover:underline"
        >
          View all users →
        </Link>
      </div>
    </div>
  );
}
