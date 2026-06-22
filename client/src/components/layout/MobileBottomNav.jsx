import { NavLink } from "react-router-dom";
import { MessageCircle, Users, Settings } from "lucide-react";

const NAV_ITEMS = [
  { to: "/chats", label: "Chats", icon: MessageCircle },
  { to: "/users", label: "Users", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function MobileBottomNav() {
  return (
    <nav
      data-themed="sidebar"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-border flex items-center justify-around py-2.5 z-30"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive ? "text-primary-bright" : "text-textSecondary"
            }`
          }
        >
          <Icon className="w-5 h-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
