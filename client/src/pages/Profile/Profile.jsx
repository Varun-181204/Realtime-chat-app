import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Check, Loader2 } from "lucide-react";
import Avatar from "../../components/common/Avatar";
import ThemeToggle from "../../components/common/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { uploadProfilePicture } from "../../services/uploadService";
import { updateProfile } from "../../services/userService";

function Profile() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [preview, setPreview] = useState(user?.profilePicture || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const showNotification = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 3500);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show temporary local preview
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const uploadRes = await uploadProfilePicture(file);
      if (uploadRes?.imageUrl) {
        // Save immediately to DB
        const updateRes = await updateProfile({
          profilePicture: uploadRes.imageUrl,
        });

        if (updateRes?.user) {
          updateUser(updateRes.user);
          setPreview(updateRes.user.profilePicture);
          showNotification("Profile picture updated successfully!");
        }
      }
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      showNotification("Failed to upload profile picture", "error");
      setPreview(user?.profilePicture || "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showNotification("Full name cannot be empty", "error");
      return;
    }

    try {
      setIsSaving(true);
      const res = await updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
      });

      if (res?.user) {
        updateUser(res.user);
        showNotification("Profile details saved successfully!");
      }
    } catch (err) {
      console.error("PROFILE SAVE ERROR:", err);
      showNotification(
        err.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900 p-6 shadow-2xl">
        
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Chat
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle compact={true} showSound={false} />
            <h1 className="text-base font-bold text-slate-900 dark:text-white">My Profile</h1>
          </div>
        </div>

        {/* Feedback Alert */}
        {message.text && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
              message.type === "error"
                ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800"
            }`}
          >
            {message.type !== "error" && <Check size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center pb-6">
          <div className="relative group">
            <Avatar
              user={{
                fullName,
                profilePicture: preview,
              }}
              size={110}
            />

            <label
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
              title="Change Photo"
            >
              {isUploading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Camera size={24} />
                  <span className="text-[10px] font-semibold mt-1">Change</span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {isUploading ? "Uploading to cloud..." : "Click photo to change avatar"}
          </p>
        </div>

        {/* Form Details */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 outline-none"
            />
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Email cannot be changed</span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bio / Status
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a little about yourself..."
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="animate-spin" size={18} />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Profile;