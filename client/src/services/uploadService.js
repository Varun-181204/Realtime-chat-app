import api from "./api";

export const uploadProfilePicture = async (file) => {
  const formData = new FormData();

  formData.append("image", file);

  const { data } = await api.post(
    "/upload/profile-picture",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};