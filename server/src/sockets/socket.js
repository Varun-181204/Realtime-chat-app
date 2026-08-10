const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

socket.on("user_connected", (userId) => {
  console.log("Received from frontend:", userId);

  if (!userId) {
    console.log("No user id received");
    return;
  }

  onlineUsers.set(userId, socket.id);

  console.log(onlineUsers);

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

  const receiverSocketId = onlineUsers.get(
    String(messageData.receiver)
  );

  console.log("Receiver Socket:", receiverSocketId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit(
      "receive_message",
      messageData
    );

    console.log("Message sent to receiver");
  } else {
    console.log("Receiver is offline");
  }
});


socket.on("messages_seen", ({ sender, receiver }) => {

  const senderSocket = onlineUsers.get(sender);

  if (senderSocket) {

    io.to(senderSocket).emit("messages_seen", {
      receiver,
    });

  }

});

socket.on("typing", ({ receiver, sender }) => {
  const receiverSocket = onlineUsers.get(receiver);

  if (receiverSocket) {
    io.to(receiverSocket).emit("typing", {
      sender,
    });
  }
});

socket.on("stop_typing", ({ receiver, sender }) => {
  const receiverSocket = onlineUsers.get(receiver);

  if (receiverSocket) {
    io.to(receiverSocket).emit("stop_typing", {
      sender,
    });
  }
});

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit("online_users", Array.from(onlineUsers.keys()));

      console.log("User Disconnected:", socket.id);
    });
  });
};

export default socketHandler;