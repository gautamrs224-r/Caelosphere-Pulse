import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axiosInstance from "../lib/axios.js";
import { useSocket } from "./SocketContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import toast from "react-hot-toast";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { socket, onlineUsers } = useSocket();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [typingUserId, setTypingUserId] = useState(null);

  const activeChatIdRef = useRef(null);
  activeChatIdRef.current = activeChat?._id;

  const fetchUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const { data } = await axiosInstance.get("/users");
      setUsers(data.users);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) fetchUsers();
  }, [currentUser, fetchUsers]);

  const openChat = useCallback(async (chatUser) => {
    setActiveChat(chatUser);
    setMessages([]);
    setIsMessagesLoading(true);
    try {
      const { data } = await axiosInstance.get(`/messages/${chatUser._id}`);
      setMessages(data.messages);
      // Clear unread badge locally
      setUsers((prev) =>
        prev.map((u) => (u._id === chatUser._id ? { ...u, unreadCount: 0 } : u))
      );
    } catch (err) {
      toast.error("Failed to load conversation");
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  const sendTextMessage = useCallback(
    async (text, messageType = "text") => {
      if (!activeChat || !text.trim()) return;
      try {
        const { data } = await axiosInstance.post(`/messages/${activeChat._id}`, {
          text,
          messageType,
        });
        setMessages((prev) => [...prev, data.message]);
        bumpUserToTop(activeChat._id, data.message);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to send message");
      }
    },
    [activeChat]
  );

  const sendImageMessage = useCallback(
    async (file, caption = "") => {
      if (!activeChat || !file) return;
      const formData = new FormData();
      formData.append("image", file);
      if (caption) formData.append("caption", caption);

      try {
        const { data } = await axiosInstance.post(
          `/messages/${activeChat._id}/image`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setMessages((prev) => [...prev, data.message]);
        bumpUserToTop(activeChat._id, data.message);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to send image");
      }
    },
    [activeChat]
  );

  const bumpUserToTop = (userId, message) => {
    setUsers((prev) => {
      const target = prev.find((u) => u._id === userId);
      if (!target) return prev;
      const rest = prev.filter((u) => u._id !== userId);
      return [{ ...target, lastMessage: message }, ...rest];
    });
  };

  // Real-time: incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.senderId === activeChatIdRef.current) {
        setMessages((prev) => [...prev, message]);
        // mark seen immediately since the chat is open
        axiosInstance.put(`/messages/${message.senderId}/seen`).catch(() => {});
      } else {
        // Bump unread count for that conversation in the sidebar
        setUsers((prev) =>
          prev.map((u) =>
            u._id === message.senderId
              ? {
                  ...u,
                  lastMessage: message,
                  unreadCount: (u.unreadCount || 0) + 1,
                }
              : u
          )
        );
        toast(`New message from someone`, { icon: "💬" });
      }

      bumpUserToTop(message.senderId, message);
    };

    const handleTyping = ({ senderId }) => {
      if (senderId === activeChatIdRef.current) setTypingUserId(senderId);
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === activeChatIdRef.current) setTypingUserId(null);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket]);

  const emitTyping = useCallback(() => {
    if (socket && activeChat) {
      socket.emit("typing", { receiverId: activeChat._id });
    }
  }, [socket, activeChat]);

  const emitStopTyping = useCallback(() => {
    if (socket && activeChat) {
      socket.emit("stopTyping", { receiverId: activeChat._id });
    }
  }, [socket, activeChat]);

  const isUserOnline = useCallback(
    (userId) => onlineUsers.includes(userId),
    [onlineUsers]
  );

  return (
    <ChatContext.Provider
      value={{
        users,
        isUsersLoading,
        activeChat,
        messages,
        isMessagesLoading,
        typingUserId,
        openChat,
        sendTextMessage,
        sendImageMessage,
        emitTyping,
        emitStopTyping,
        isUserOnline,
        refreshUsers: fetchUsers,
        closeChat: () => setActiveChat(null),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};
