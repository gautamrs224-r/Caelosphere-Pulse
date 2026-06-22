const SIZES = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-20 h-20",
};

const DOT_SIZES = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-4 h-4",
};

export default function Avatar({
  src,
  name = "",
  size = "md",
  showStatus = false,
  isOnline = false,
  className = "",
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`relative shrink-0 ${SIZES[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${SIZES[size]} rounded-full object-cover border border-border`}
        />
      ) : (
        <div
          className={`${SIZES[size]} rounded-full bg-elevated border border-border flex items-center justify-center text-textPrimary font-semibold`}
        >
          {initials || "?"}
        </div>
      )}
      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full border-2 border-card
            ${DOT_SIZES[size]}
            ${isOnline ? "bg-online" : "bg-offline"}
          `}
        />
      )}
    </div>
  );
}
