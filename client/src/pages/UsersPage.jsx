import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Avatar from "../components/ui/Avatar.jsx";
import { useChat } from "../context/ChatContext.jsx";
import { formatLastSeen } from "../lib/formatTime.js";

export default function UsersPage() {
  const { users, isUsersLoading, isUserOnline, openChat } = useChat();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    return users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  const handleSelect = (user) => {
    openChat(user);
    navigate("/chats");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 sm:px-8 py-6 border-b border-border">
        <h1 className="text-xl font-bold text-white">All Users</h1>
        <p className="text-sm text-textSecondary mt-1">
          Browse everyone on ChatSphere and start a conversation
        </p>

        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-elevated border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5">
        {isUsersLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-textSecondary py-12">No users found</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((user) => {
              const online = isUserOnline(user._id);
              return (
                <button
                  key={user._id}
                  onClick={() => handleSelect(user)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-card hover:bg-elevated border border-border transition-colors text-left"
                >
                  <Avatar
                    src={user.profilePic}
                    name={user.name}
                    size="lg"
                    showStatus
                    isOnline={online}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-textSecondary truncate">
                      {online ? (
                        <span className="text-online">Online</span>
                      ) : (
                        formatLastSeen(user.lastSeen)
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
