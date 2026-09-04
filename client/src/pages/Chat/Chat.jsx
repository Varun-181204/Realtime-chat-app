import { useEffect, useState, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useTheme } from "../../context/ThemeContext";

import UserSidebar from "../../components/chat/UserSidebar";
import ChatHeader from "../../components/chat/ChatHeader";
import MessageList from "../../components/chat/MessageList";
import ChatInput from "../../components/chat/ChatInput";
import ChatPlaceholder from "../../components/chat/ChatPlaceholder";
import ContactInfoDrawer from "../../components/chat/ContactInfoDrawer";

import {
  getMessages,
  sendMessage,
  markMessagesAsSeen,
  deleteMessage,
  editMessage,
  getUnreadCounts,
  getRecentConversations,
  toggleReaction,
} from "../../services/chatService";

import { playSendSound, playReceiveSound } from "../../utils/sound";

function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { soundEnabled } = useTheme();

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [recentConversations, setRecentConversations] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSeenMap, setLastSeenMap] = useState({});
  const [typingMap, setTypingMap] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState(null);

  // ==========================================
  // REQUEST NOTIFICATION PERMISSION
  // ==========================================

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(console.error);
      }
    }
  }, []);

  // ==========================================
  // INITIAL DATA (UNREAD COUNTS & RECENT CHATS)
  // ==========================================

  useEffect(() => {
    if (!user) return;

    const loadInitialData = async () => {
      try {
        const [unreadRes, recentRes] = await Promise.all([
          getUnreadCounts(),
          getRecentConversations(),
        ]);

        if (unreadRes?.success && unreadRes?.data) {
          setUnreadCounts(unreadRes.data);
        }
        if (recentRes?.success && recentRes?.data) {
          setRecentConversations(recentRes.data);
        }
      } catch (error) {
        console.error("LOAD INITIAL DATA ERROR:", error);
      }
    };

    loadInitialData();
  }, [user]);

  // ==========================================
  // REGISTER USER WITH SOCKET
  // ==========================================

  useEffect(() => {
    if (!socket || !user?.id) return;

    socket.emit("user_connected", String(user.id));

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    const handleUserLastSeen = ({ userId, lastSeen }) => {
      if (userId && lastSeen) {
        setLastSeenMap((prev) => ({
          ...prev,
          [String(userId)]: lastSeen,
        }));
      }
    };

    socket.on("online_users", handleOnlineUsers);
    socket.on("user_last_seen", handleUserLastSeen);

    return () => {
      socket.off("online_users", handleOnlineUsers);
      socket.off("user_last_seen", handleUserLastSeen);
    };
  }, [socket, user]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSendMessage = async (formData) => {
    if (!selectedUser || !socket) return;

    try {
      const response = await sendMessage(formData);
      const newMessage = response.data;

      if (!newMessage) return;

      // Add to sender's view immediately
      setMessages((prev) => [...prev, newMessage]);
      setReplyingTo(null);

      // Update recent preview for selected contact
      setRecentConversations((prev) => ({
        ...prev,
        [selectedUser._id]: {
          message: newMessage.message,
          image: !!newMessage.image,
          file: !!newMessage.file,
          createdAt: newMessage.createdAt,
          sender: newMessage.sender,
        },
      }));

      // Play subtle send sound if enabled
      if (soundEnabledRef.current) {
        playSendSound();
      }

      // Emit to receiver through socket
      socket.emit("send_message", newMessage);
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
    }
  };

  // ==========================================
  // DELETE MESSAGE
  // ==========================================

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await deleteMessage(messageId);
      if (!response.success) return;

      setMessages((prev) =>
        prev.filter((msg) => String(msg._id) !== String(messageId))
      );

      if (socket && selectedUser) {
        socket.emit("message_deleted", {
          messageId,
          receiver: selectedUser._id,
        });
      }
    } catch (error) {
      console.error("DELETE MESSAGE ERROR:", error);
    }
  };

  // ==========================================
  // EDIT MESSAGE
  // ==========================================

  const handleEditMessage = async (messageId, newText) => {
    try {
      const response = await editMessage(messageId, newText);
      if (!response.success) return;

      const updatedMessage = response.data;

      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(messageId) ? updatedMessage : msg
        )
      );

      if (selectedUser) {
        setRecentConversations((prev) => ({
          ...prev,
          [selectedUser._id]: {
            ...prev[selectedUser._id],
            message: updatedMessage.message,
          },
        }));
      }

      if (socket && selectedUser) {
        socket.emit("message_edited", {
          messageId,
          receiver: selectedUser._id,
          message: updatedMessage.message,
        });
      }
    } catch (error) {
      console.error("EDIT MESSAGE ERROR:", error);
    }
  };

  // ==========================================
  // EMOJI REACTION
  // ==========================================

  const handleReactMessage = async (messageId, emoji) => {
    try {
      const response = await toggleReaction(messageId, emoji);
      if (!response?.success) return;

      const { reactions } = response.data;

      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(messageId)
            ? { ...msg, reactions }
            : msg
        )
      );

      if (socket && selectedUser) {
        socket.emit("message_reaction", {
          messageId,
          receiver: selectedUser._id,
          reactions,
        });
      }
    } catch (error) {
      console.error("REACT ERROR:", error);
    }
  };

  // ==========================================
  // LOAD MESSAGES WHEN USER IS SELECTED
  // ==========================================

  useEffect(() => {
    if (!selectedUser || !socket || !user) return;

    const loadMessages = async () => {
      try {
        const data = await getMessages(selectedUser._id);
        setMessages(data.data || []);
        setReplyingTo(null);
        setSearchQuery("");

        // Mark received messages as seen
        await markMessagesAsSeen(selectedUser._id);

        socket.emit("messages_seen", {
          sender: selectedUser._id,
          receiver: user.id,
        });
      } catch (error) {
        console.error("LOAD MESSAGES ERROR:", error);
      }
    };

    loadMessages();
  }, [selectedUser, socket, user]);

  // ==========================================
  // SOCKET EVENT LISTENERS
  // ==========================================

  useEffect(() => {
    if (!socket || !user) return;

    // Receive message
    const handleReceiveMessage = (message) => {
      if (!message) return;

      const otherId =
        String(message.sender) === String(user.id)
          ? String(message.receiver)
          : String(message.sender);

      // Update recent conversation snippet
      setRecentConversations((prev) => ({
        ...prev,
        [otherId]: {
          message: message.message,
          image: !!message.image,
          file: !!message.file,
          createdAt: message.createdAt,
          sender: message.sender,
        },
      }));

      // Desktop Push Notification when user is away/minimized
      if (
        typeof document !== "undefined" &&
        document.hidden &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          const title = selectedUser && String(selectedUser._id) === String(message.sender)
            ? selectedUser.fullName
            : "RealTime Chat";
          const body = message.image
            ? "📷 Sent a photo"
            : message.file
            ? `📄 ${message.fileName || "Sent a file"}`
            : message.message;

          const notif = new Notification(title, {
            body,
            icon: "/vite.svg",
          });
          notif.onclick = () => {
            window.focus();
          };
        } catch {
          // ignore notification errors
        }
      }

      // If active conversation matches sender
      if (selectedUser && String(message.sender) === String(selectedUser._id)) {
        setMessages((prev) => [...prev, message]);
        if (soundEnabledRef.current) playReceiveSound();

        markMessagesAsSeen(selectedUser._id);
        socket.emit("messages_seen", {
          sender: selectedUser._id,
          receiver: user.id,
        });
        return;
      }

      // Message from another contact
      if (soundEnabledRef.current) playReceiveSound();
      setUnreadCounts((prev) => ({
        ...prev,
        [otherId]: (prev[otherId] || 0) + 1,
      }));
    };

    // Message deleted
    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.filter((msg) => String(msg._id) !== String(messageId))
      );
    };

    // Message edited
    const handleMessageEdited = ({ messageId, message }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(messageId)
            ? { ...msg, message: message }
            : msg
        )
      );
    };

    // Message reaction
    const handleMessageReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(messageId)
            ? { ...msg, reactions }
            : msg
        )
      );
    };

    // Messages marked seen
    const handleMessagesSeen = ({ receiver }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (
            String(msg.sender) === String(user.id) &&
            String(msg.receiver) === String(receiver)
          ) {
            return { ...msg, seen: true };
          }
          return msg;
        })
      );
    };

    const handleTyping = (data) => {
      const senderId = data?.sender || data;
      if (senderId) {
        setTypingMap((prev) => ({ ...prev, [String(senderId)]: true }));
        if (selectedUser && String(selectedUser._id) === String(senderId)) {
          setIsTyping(true);
        }
      }
    };

    const handleStopTyping = (data) => {
      const senderId = data?.sender || data;
      if (senderId) {
        setTypingMap((prev) => ({ ...prev, [String(senderId)]: false }));
        if (selectedUser && String(selectedUser._id) === String(senderId)) {
          setIsTyping(false);
        }
      }
    };

    // Register events
    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_seen", handleMessagesSeen);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_reaction", handleMessageReaction);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_seen", handleMessagesSeen);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_reaction", handleMessageReaction);
    };
  }, [socket, selectedUser, user]);

  // Select user
  const handleSelectUser = (selected) => {
    setSelectedUser(selected);
    setReplyingTo(null);
    setSearchQuery("");
    setIsDrawerOpen(false);

    if (selected?._id) {
      setUnreadCounts((prev) => ({
        ...prev,
        [selected._id]: 0,
      }));
    }
  };

  // Search match count
  const searchMatchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const query = searchQuery.toLowerCase();
    return messages.filter(
      (m) => m.message && m.message.toLowerCase().includes(query)
    ).length;
  }, [messages, searchQuery]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Left Sidebar */}
      <UserSidebar
        selectedUser={selectedUser}
        setSelectedUser={handleSelectUser}
        onlineUsers={onlineUsers}
        unreadCounts={unreadCounts}
        recentConversations={recentConversations}
        typingMap={typingMap}
      />

      {/* Main Chat Area or Placeholder */}
      <div className="flex flex-1 flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200 relative">
        {selectedUser ? (
          <>
            <ChatHeader
              user={selectedUser}
              isTyping={isTyping}
              onlineUsers={onlineUsers}
              onClose={() => setSelectedUser(null)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              matchCount={searchMatchCount}
              lastSeen={lastSeenMap[String(selectedUser._id)] || selectedUser.lastSeen}
              onOpenDrawer={() => setIsDrawerOpen(true)}
            />

            <MessageList
              messages={messages}
              currentUser={user}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditMessage}
              onReactMessage={handleReactMessage}
              onReplyMessage={(msg) => setReplyingTo(msg)}
              searchQuery={searchQuery}
              onImageClick={(src) => setSelectedLightboxImage(src)}
            />

            <ChatInput
              onSend={handleSendMessage}
              selectedUser={selectedUser}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />

            {/* Contact Details & Media Drawer */}
            <ContactInfoDrawer
              contact={selectedUser}
              messages={messages}
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              onImageClick={(src) => setSelectedLightboxImage(src)}
            />
          </>
        ) : (
          <ChatPlaceholder />
        )}
      </div>

      {/* Global Image Lightbox (from Chat or Drawer) */}
      {selectedLightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedLightboxImage(null)}
            className="absolute top-5 right-5 rounded-full bg-slate-800/80 p-2.5 text-white hover:bg-slate-700 transition"
            title="Close image"
          >
            <X size={22} />
          </button>
          <img
            src={selectedLightboxImage}
            alt="Fullscreen photo"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default Chat;