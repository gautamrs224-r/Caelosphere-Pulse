import { NavLink, useNavigate } from "react-router-dom";
import { MessageCircle, Users, Settings, LogOut, MoreVertical } from "lucide-react";
import { useState } from "react";
import Logo from "../ui/Logo.jsx";
import Avatar from "../ui/Avatar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/chats", label: "Chats", icon: MessageCircle },
  { to: "/users", label: "Users", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      data-themed="sidebar"
      className="hidden md:flex md:flex-col w-[280px] bg-sidebar border-r border-border h-full shrink-0"
    >
      <div className="px-6 py-6">
        <Logo size="md" to="/chats" />
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-elevated text-white border-l-4 border-primary"
                  : "text-textSecondary hover:text-white hover:bg-elevated/60"
              }`
            }
          >
            <Icon className="w-4.5 h-4.5" />
            {label}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-textSecondary hover:text-error hover:bg-error/10 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          Logout
        </button>
      </nav>

      <div className="px-4 py-4 border-t border-border relative">
        <button
          onClick={() => setShowMenu((s) => !s)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-elevated/60 transition-colors"
        >
          <Avatar src={user?.profilePic} name={user?.name} size="md" showStatus isOnline />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-online">Online</p>
          </div>
          <MoreVertical className="w-4 h-4 text-textSecondary" />
        </button>

        {showMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-fade-in">
            <button
              onClick={() => {
                setShowMenu(false);
                navigate("/settings");
              }}
              className="w-full text-left px-4 py-3 text-sm text-textSecondary hover:bg-elevated hover:text-white transition-colors"
            >
              View Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
