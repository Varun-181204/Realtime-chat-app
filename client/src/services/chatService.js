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