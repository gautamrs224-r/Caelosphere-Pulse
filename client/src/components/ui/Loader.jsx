import { MessageCircle } from "lucide-react";

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow animate-pulse">
        <MessageCircle className="w-7 h-7 text-white" fill="white" />
      </div>
      <p className="text-textSecondary text-sm">Loading ChatSphere...</p>
    </div>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div
      className={`w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
