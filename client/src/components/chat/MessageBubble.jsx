import { useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import { formatMessageTime } from "../../lib/formatTime.js";

export default function MessageBubble({ message, isOwn }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`
          max-w-[75%] sm:max-w-[60%] rounded-bubble px-4 py-2.5
          ${isOwn ? "bg-primary text-white" : "bg-elevated text-white"}
        `}
      >
        {message.messageType === "image" && message.imageUrl && (
          <div className="mb-1.5 -mx-1 -mt-1">
            {!imageLoaded && !imageError && (
              <div className="w-56 h-40 rounded-xl bg-white/10 animate-pulse" />
            )}
            {imageError ? (
              <div className="w-56 h-32 rounded-xl bg-white/10 flex items-center justify-center text-xs text-white/60">
                Image failed to load
              </div>
            ) : (
              <img
                src={message.imageUrl}
                alt="Shared"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`rounded-xl max-w-full max-h-72 object-cover cursor-pointer ${
                  imageLoaded ? "block" : "hidden"
                }`}
                onClick={() => window.open(message.imageUrl, "_blank")}
              />
            )}
          </div>
        )}

        {message.text && (
          <p
            className={`whitespace-pre-wrap break-words ${
              message.messageType === "emoji" ? "text-3xl leading-snug" : "text-sm"
            }`}
          >
            {message.text}
          </p>
        )}

        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? "text-white/70 justify-end" : "text-muted"
          }`}
        >
          <span className="text-[10px]">{formatMessageTime(message.createdAt)}</span>
          {isOwn && (
            message.seen ? (
              <CheckCheck className="w-3 h-3" />
            ) : (
              <Check className="w-3 h-3" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
