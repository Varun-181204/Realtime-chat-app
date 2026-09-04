import User from "../models/User.js";

const onlineUsers = new Map();

const socketHandler = (io) => {
  const emitToUser = (userId, event, data) => {
    const sockets = onlineUsers.get(String(userId));
    if (sockets && sockets.size > 0) {
      sockets.forEach((socketId) => {
        io.to(socketId).emit(event, data);
      });
      return true;
    }
    return false;
  };

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("user_connected", (userId) => {
      console.log("Received from frontend:", userId);

      if (!userId) {
        console.log("No user id received");
        return;
      }

      socket.userId = String(userId);
      User.findByIdAndUpdate(userId, { isOnline: true }).catch(console.error);

      const idStr = String(userId);
      socket.userId = idStr;

      if (!onlineUsers.has(idStr)) {
        onlineUsers.set(idStr, new Set());
      }
      onlineUsers.get(idStr).add(socket.id);

      console.log("Online Users count:", onlineUsers.size);

      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("send_message", (messageData) => {
      console.log("========== SOCKET MESSAGE ==========");
      console.log("Message Received:", messageData);

      if (!messageData) {
        console.log("ERROR: messageData is null or undefined");
        return;
      }

      if (!messageData.receiver) {
        console.log("ERROR: receiver is missing");
        return;
      }

      const sent = emitToUser(messageData.receiver, "receive_message", messageData);

      if (sent) {
        console.log("Message sent to receiver");
      } else {
        console.log("Receiver is offline");
      }
    });

    socket.on("message_deleted", ({ messageId, receiver }) => {
      console.log("========== MESSAGE DELETED ==========");
      console.log("Message ID:", messageId);
      console.log("Receiver:", receiver);

      if (!messageId || !receiver) {
        console.log("Message ID or receiver missing");
        return;
      }

      emitToUser(receiver, "message_deleted", { messageId });
      console.log("Delete event dispatched");
    });

    socket.on("message_edited", ({ messageId, receiver, message }) => {
      console.log("========== MESSAGE EDITED ==========");
      console.log("Message ID:", messageId);
      console.log("Receiver:", receiver);
      console.log("New Message:", message);

      if (!messageId || !receiver) {
        console.log("Message ID or receiver missing");
        return;
      }

      emitToUser(receiver, "message_edited", { messageId, message });
      console.log("Edit event dispatched");
    });

    socket.on("message_reaction", ({ messageId, receiver, reactions }) => {
      if (receiver) {
        emitToUser(receiver, "message_reaction", { messageId, reactions });
      }
    });

    socket.on("messages_seen", ({ sender, receiver }) => {
      if (sender) {
        emitToUser(sender, "messages_seen", { receiver });
      }
    });

    socket.on("typing", ({ receiver, sender }) => {
      if (receiver) {
        emitToUser(receiver, "typing", { sender });
      }
    });

    socket.on("stop_typing", ({ receiver, sender }) => {
      if (receiver) {
        emitToUser(receiver, "stop_typing", { sender });
      }
    });

    socket.on("disconnect", () => {
      const disconnectedUserId = socket.userId;

      if (disconnectedUserId && onlineUsers.has(disconnectedUserId)) {
        const userSockets = onlineUsers.get(disconnectedUserId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(disconnectedUserId);
          const now = new Date();
          User.findByIdAndUpdate(disconnectedUserId, { isOnline: false, lastSeen: now }).catch(console.error);
          io.emit("user_last_seen", { userId: disconnectedUserId, lastSeen: now });
        }
      } else {
        for (const [uid, sockets] of onlineUsers.entries()) {
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
              onlineUsers.delete(uid);
              const now = new Date();
              User.findByIdAndUpdate(uid, { isOnline: false, lastSeen: now }).catch(console.error);
              io.emit("user_last_seen", { userId: uid, lastSeen: now });
            }
            break;
          }
        }
      }

      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log("User Disconnected:", socket.id);
    });
  });
};

export default socketHandler;