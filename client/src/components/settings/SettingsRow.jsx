import { ChevronRight } from "lucide-react";

export default function SettingsRow({ icon: Icon, label, onClick, danger = false, rightElement }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-elevated ${
        danger ? "text-error" : "text-white"
      }`}
    >
      {Icon && <Icon className="w-4.5 h-4.5 shrink-0" />}
      <span className="flex-1 text-sm font-medium">{label}</span>
      {rightElement || <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
    </button>
  );
}
