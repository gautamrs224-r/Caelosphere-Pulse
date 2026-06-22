export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatListTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = diffMs / 60000;
  const diffHours = diffMs / 3600000;
  const diffDays = diffMs / 86400000;

  if (diffMins < 1) return "Now";
  if (diffMins < 60) return `${Math.floor(diffMins)}m`;
  if (diffHours < 24) return `${Math.floor(diffHours)}h`;
  if (diffDays < 2) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatLastSeen(date) {
  if (!date) return "Offline";
  const diffMs = new Date() - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatDateDivider(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}
