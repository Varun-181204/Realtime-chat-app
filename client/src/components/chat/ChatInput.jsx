import { useState } from "react";

import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import EmojiPicker from "./EmojiPicker";
import { Smile, Plus, Image, FileText } from "lucide-react";
import imageCompression from "browser-image-compression";

function ChatInput({
  onSend,
  selectedUser,
}) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const { socket } = useSocket();
  const { user } = useAuth();

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!message.trim() && !selectedImage && !selectedFile) return;

  const formData = new FormData();

  formData.append("message", message);

  if (selectedUser) {
    formData.append("receiver", selectedUser._id);
  }

  if (selectedImage) {
    formData.append("image", selectedImage);
  }

  if (selectedFile) {
    formData.append("document", selectedFile);
  }

  onSend(formData);

  setMessage("");
  setSelectedImage(null);
  setSelectedFile(null);
  setShowEmojiPicker(false);
  setShowAttachmentMenu(false);
};

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  const handleImageSelect = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
  });

  setSelectedImage(compressed);
  setShowAttachmentMenu(false);
};

return (
  <form
    onSubmit={handleSubmit}
    className="relative flex items-center gap-3 border-t border-slate-800 bg-slate-900 p-4"
  >
    {/* Emoji Button */}
    <button
      type="button"
      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      className="rounded-full p-2 text-yellow-400 hover:bg-slate-700"
    >
      <Smile size={22} />
    </button>

    {/* Emoji Picker */}
    {showEmojiPicker && (
      <EmojiPicker onEmojiClick={addEmoji} />
    )}

    {/* Message Input */}
    <input
      type="text"
      placeholder="Type a message..."
      value={message}
      onChange={(e) => {
        setMessage(e.target.value);

        socket.emit("typing", {
          sender: user.id,
          receiver: selectedUser?._id,
        });

        clearTimeout(window.typingTimer);

        window.typingTimer = setTimeout(() => {
          socket.emit("stop_typing", {
            sender: user.id,
            receiver: selectedUser?._id,
          });
        }, 1000);
      }}
      className="flex-1 rounded-lg bg-slate-800 px-4 py-3 text-white outline-none"
    />

    {/* Attachment Button */}
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setShowAttachmentMenu(!showAttachmentMenu)
        }
        className="rounded-full p-2 text-white hover:bg-slate-700"
      >
        <Plus size={22} />
      </button>

      {/* Attachment Menu */}
      {showAttachmentMenu && (
        <div className="absolute bottom-14 right-0 w-48 rounded-xl bg-slate-800 shadow-xl border border-slate-700">

          {/* Photo */}
          <label className="flex cursor-pointer items-center gap-3 p-3 hover:bg-slate-700">
            <Image size={18} />
            <span>Photo</span>

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
            />
          </label>

          {/* Document */}
          <label className="flex cursor-pointer items-center gap-3 p-3 hover:bg-slate-700">
            <FileText size={18} />
            <span>Document</span>

            <input
              hidden
              type="file"
              accept=".pdf,.doc,.docx,.txt,.zip,.xlsx"
                onChange={(e) => {
             const file = e.target.files[0];

                if (!file) return;

              setSelectedFile(file);
              setShowAttachmentMenu(false);
              }}
            />

          </label>
        </div>
      )}
    </div>

    {/* Selected Image */}
    {selectedImage && (
      <div className="text-sm text-green-400 whitespace-nowrap">
        📷 {selectedImage.name}
      </div>
    )}

    {selectedFile && (
      <div className="text-sm text-blue-400 whitespace-nowrap">
        📄 {selectedFile.name}
      </div>
    )}

    {/* Send Button */}
    <button
      type="submit"
      className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
    >
      Send
    </button>
  </form>
);
}

export default ChatInput;