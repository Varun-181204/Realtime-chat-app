import { useState } from "react";
import Avatar from "../../components/common/Avatar";
import { useAuth } from "../../context/AuthContext";
import { uploadProfilePicture } from "../../services/uploadService";

function Profile() {
  const { user } = useAuth();

  const [preview, setPreview] = useState(user?.profilePicture || "");

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));

    try {
      const res = await uploadProfilePicture(file);

      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="rounded-xl bg-slate-900 p-8">
        <Avatar
          user={{
            ...user,
            profilePicture: preview,
          }}
          size={120}
        />

        <input
          type="file"
          className="mt-6"
          accept="image/*"
          onChange={handleUpload}
        />
      </div>
    </div>
  );
}

export default Profile;