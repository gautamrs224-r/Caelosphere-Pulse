import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo({ size = "md", to = "/", showText = true }) {
  const iconBox = size === "lg" ? "w-11 h-11" : size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const iconSize = size === "lg" ? "w-6 h-6" : size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const textSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";

  const content = (
    <div className="flex items-center gap-2.5">
      <div
        className={`${iconBox} rounded-xl bg-primary flex items-center justify-center shadow-glowSm shrink-0`}
      >
        <MessageCircle className={`${iconSize} text-white`} fill="white" />
      </div>
      {showText && (
        <span className={`${textSize} font-bold text-white tracking-tight`}>
          Caelosphere<span className="text-primary-bright">Pulse</span>
        </span>
      )}
    </div>
  );

  if (!to) return content;

  return (
    <Link to={to} className="inline-block">
      {content}
    </Link>
  );
}
