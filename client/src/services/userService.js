import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put("/users/profile", userData);
  return response.data;
};