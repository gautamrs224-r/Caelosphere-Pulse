import { useState, useRef, useEffect } from "react";
import { Paperclip, Smile, Send, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useChat } from "../../context/ChatContext.jsx";
import toast from "react-hot-toast";

const MAX_IMAGE_MB = 8;

export default function MessageInput() {
  const { sendTextMessage, sendImageMessage, emitTyping, emitStopTyping } = useChat();
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef(null);
  const pickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
    emitTyping();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 1500);
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_IMAGE_MB}MB`);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (isSending) return;
    if (!text.trim() && !imageFile) return;

    setIsSending(true);
    emitStopTyping();

    try {
      if (imageFile) {
        await sendImageMessage(imageFile, text.trim());
        clearImage();
      } else {
        // Detect emoji-only messages (no letters/numbers) to style them larger
        const isEmojiOnly = /^(\p{Emoji}|\s)+$/u.test(text.trim());
        await sendTextMessage(text.trim(), isEmojiOnly ? "emoji" : "text");
      }
      setText("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card">
      {imagePreview && (
        <div className="px-4 pt-3 flex items-center gap-3">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-16 h-16 rounded-lg object-cover border border-border"
            />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-error flex items-center justify-center"
              aria-label="Remove image"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
          <span className="text-xs text-textSecondary">Add a caption (optional)</span>
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-3 relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-primary-bright hover:text-primary-hover transition-colors shrink-0"
          aria-label="Attach image"
        >
          <Paperclip className="w-4.5 h-4.5" />
        </button>

        <input
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-elevated rounded-full px-4 py-2.5 text-sm text-white placeholder:text-muted border border-border focus:border-primary focus:outline-none"
        />

        <div ref={pickerRef} className="relative shrink-0">
          <button
            onClick={() => setShowEmojiPicker((s) => !s)}
            className="text-textSecondary hover:text-white transition-colors"
            aria-label="Open emoji picker"
          >
            <Smile className="w-4.5 h-4.5" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-3 z-20">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                lazyLoadEmojis
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={isSending || (!text.trim() && !imageFile)}
          className="w-9 h-9 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
