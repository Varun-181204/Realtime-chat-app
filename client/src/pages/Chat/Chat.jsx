import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

import UserSidebar from "../../components/chat/UserSidebar";
import ChatHeader from "../../components/chat/ChatHeader";
import MessageList from "../../components/chat/MessageList";
import ChatInput from "../../components/chat/ChatInput";

import {
  getMessages,
  sendMessage,
  markMessagesAsSeen,
} from "../../services/chatService";

function Chat() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSendMessage = async (formData) => {
    if (!selectedUser) return;
    if (!socket) return;

    try {
      const response = await sendMessage(formData);

      console.log("========== SEND RESPONSE ==========");
      console.log("Response:", response);
      console.log("Response success:", response.success);
      console.log("Response data:", response.data);

      const newMessage = response.data;

      if (!newMessage) {
        console.error("ERROR: newMessage is null or undefined");
        return;
      }

      console.log("========== NEW MESSAGE ==========");
      console.log(newMessage);

      // Add message to sender's chat immediately
      setMessages((prev) => [...prev, newMessage]);

      // Send message through Socket.IO
      socket.emit("send_message", newMessage);

      console.log("Message emitted through socket");
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
    }
  };

  // ==========================================
  // REGISTER USER WITH SOCKET
  // ==========================================

  useEffect(() => {
    if (!socket) return;
    if (!user) return;
    if (!user.id) return;

    console.log("Registering user:", user.id);

    socket.emit("user_connected", String(user.id));

    socket.on("online_users", (users) => {
      console.log("Online users:", users);
      setOnlineUsers(users);
    });

    return () => {
      socket.off("online_users");
    };
  }, [socket, user]);

  // ==========================================
  // LOAD MESSAGES WHEN USER IS SELECTED
  // ==========================================

  useEffect(() => {
    if (!selectedUser) return;
    if (!socket) return;
    if (!user) return;

    const loadMessages = async () => {
      try {
        console.log(
          "Loading messages with:",
          selectedUser._id
        );

        const data = await getMessages(selectedUser._id);

        console.log("Messages response:", data);

        setMessages(data.data || []);

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
  // SOCKET MESSAGE LISTENERS
  // ==========================================

  useEffect(() => {
    if (!socket) return;

    // RECEIVE MESSAGE
    const handleReceiveMessage = (message) => {
      console.log("========== RECEIVED MESSAGE ==========");
      console.log(message);

      if (!message) {
        console.error("Received message is null");
        return;
      }

      setMessages((prev) => [...prev, message]);
    };

    // MESSAGES SEEN
    const handleMessagesSeen = () => {
      console.log("Messages marked as seen");

      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          seen: true,
        }))
      );
    };

    // TYPING
    const handleTyping = () => {
      setIsTyping(true);
    };

    // STOP TYPING
    const handleStopTyping = () => {
      setIsTyping(false);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_seen", handleMessagesSeen);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_seen", handleMessagesSeen);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [socket]);

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="flex h-screen bg-slate-950">

      {/* LEFT SIDEBAR */}
      <UserSidebar
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      {/* CHAT AREA */}
      <div className="flex flex-1 flex-col">

        {/* CHAT HEADER */}
        <ChatHeader
          user={selectedUser}
          isTyping={isTyping}
        />

        {/* MESSAGE LIST */}
        <MessageList
          messages={messages}
          currentUser={user}
        />

        {/* CHAT INPUT */}
        <ChatInput
          onSend={handleSendMessage}
          selectedUser={selectedUser}
        />

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-800 p-4 text-white">

          <div>
            Logged in as{" "}
            <strong>{user?.fullName}</strong>

            {" | "}

            Online Users: {onlineUsers.length}
          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-5 py-2 hover:bg-red-700"
          >
            Logout
          </button>

        </div>

      </div>
    </div>
  );
}

export default Chat;