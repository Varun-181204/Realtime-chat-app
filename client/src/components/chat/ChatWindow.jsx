import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";

function ChatWindow({ currentUser, selectedUser }) {
  const { socket } = useSocket();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      sender: currentUser.id,
      receiver: selectedUser.id,
      message,
      createdAt: new Date(),
    };

    socket.emit("send_message", newMessage);

    setMessages((prev) => [...prev, newMessage]);

    setMessage("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex ${
              msg.sender === currentUser.id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div className="max-w-sm rounded-lg bg-blue-600 px-4 py-2">
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t border-slate-700 p-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg bg-slate-800 p-3 text-white"
        />

        <button
          onClick={handleSend}
          className="rounded-lg bg-blue-600 px-6 py-3"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;