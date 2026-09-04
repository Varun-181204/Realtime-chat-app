import api from "./api";

export const getMessages = async (receiverId) => {
  const response = await api.get(`/messages/${receiverId}`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await api.post(
    "/messages",
    messageData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const markMessagesAsSeen = (senderId) =>
  api.patch(`/messages/seen/${senderId}`);

export const getUnreadCounts = async () => {
  const response = await api.get("/messages/unread");
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

export const editMessage = async (messageId, message) => {
  const response = await api.patch(
    `/messages/${messageId}`,
    {
      message,
    }
  );

  return response.data;
};

export const getRecentConversations = async () => {
  const response = await api.get("/messages/conversations/recent");
  return response.data;
};

export const toggleReaction = async (messageId, emoji) => {
  const response = await api.post(`/messages/${messageId}/react`, {
    emoji,
  });
  return response.data;
};