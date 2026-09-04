import { useState, useRef, useEffect } from "react";
import { Smile, Plus, Image, FileText, Send, X, Reply } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import EmojiPicker from "./EmojiPicker";

function ChatInput({ onSend, selectedUser, replyingTo, onCancelReply }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const { socket } = useSocket();
  const { user } = useAuth();
  const typingTimerRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!message.trim() && !selectedImage && !selectedFile) return;

    const formData = new FormData();
    formData.append("message", message.trim());

    if (selectedUser) {
      formData.append("receiver", selectedUser._id);
    }
    if (selectedImage) {
      formData.append("image", selectedImage);
    }
    if (selectedFile) {
      formData.append("document", selectedFile);
    }
    if (replyingTo?._id) {
      formData.append("replyTo", replyingTo._id);
    }

    onSend(formData);

    // Reset input states
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    clearImage();
    clearFile();
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
    if (onCancelReply) onCancelReply();

    // Stop typing immediately on send
    if (socket && selectedUser && user) {
      socket.emit("stop_typing", {
        sender: user.id,
        receiver: selectedUser._id,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTypingChange = (e) => {
    setMessage(e.target.value);

    if (!socket || !selectedUser || !user) return;

    socket.emit("typing", {
      sender: user.id,
      receiver: selectedUser._id,
    });

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        sender: user.id,
        receiver: selectedUser._id,
      });
    }, 1200);
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
      });

      setSelectedImage(compressed);
      setImagePreviewUrl(URL.createObjectURL(compressed));
    } catch {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }

    setShowAttachmentMenu(false);
    e.target.value = "";
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setShowAttachmentMenu(false);
    e.target.value = "";
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  const canSubmit = !!message.trim() || !!selectedImage || !!selectedFile;

  return (
    <div className="border-t border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur transition-colors duration-200">

      {/* Quoted Reply Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70 px-4 py-2 text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5 min-w-0 border-l-4 border-blue-500 pl-3">
            <Reply size={14} className="text-blue-500 dark:text-blue-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {String(replyingTo.sender) === String(user?.id) ? "Replying to yourself" : `Replying to ${selectedUser?.fullName || "contact"}`}
              </span>
              <p className="truncate text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                {replyingTo.image ? "📷 Photo" : replyingTo.file ? `📄 ${replyingTo.fileName || "Document"}` : replyingTo.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
            title="Cancel reply"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Attachment Preview Banner */}
      {(imagePreviewUrl || selectedFile) && (
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 px-4 py-2.5 bg-slate-50/60 dark:bg-slate-950/40">
          {imagePreviewUrl && (
            <div className="relative inline-block group">
              <img
                src={imagePreviewUrl}
                alt="Selected preview"
                className="h-14 w-14 rounded-lg object-cover border border-slate-300 dark:border-slate-700 shadow"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-red-600 hover:text-white shadow"
                title="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {selectedFile && (
            <div className="relative flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 pr-7 text-xs text-slate-800 dark:text-white">
              <FileText size={16} className="text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="max-w-[200px] truncate font-medium">{selectedFile.name}</span>
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-red-500"
                title="Remove file"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 p-3 md:p-3.5">
        
        {/* Emoji Button */}
        <div className="relative pb-1">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`rounded-full p-2 transition ${
              showEmojiPicker
                ? "bg-slate-100 dark:bg-slate-800 text-yellow-500"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-yellow-500"
            }`}
            title="Add emoji"
          >
            <Smile size={21} />
          </button>

          {showEmojiPicker && (
            <EmojiPicker onEmojiClick={addEmoji} />
          )}
        </div>

        {/* Attachment Options */}
        <div className="relative pb-1">
          <button
            type="button"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className={`rounded-full p-2 transition ${
              showAttachmentMenu
                ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white"
            }`}
            title="Attach file"
          >
            <Plus size={21} />
          </button>

          {showAttachmentMenu && (
            <div className="absolute bottom-14 left-0 z-50 w-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xl animate-in fade-in zoom-in-95">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Image size={15} />
                </div>
                <div>
                  <span className="font-semibold block">Photos</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, GIF</span>
                </div>
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white mt-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  <FileText size={15} />
                </div>
                <div>
                  <span className="font-semibold block">Document</span>
                  <span className="text-[10px] text-slate-400">PDF, DOC, ZIP</span>
                </div>
                <input
                  hidden
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.zip,.xlsx,.csv"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          )}
        </div>

        {/* Multi-line Auto-Expanding Textarea */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type a message (Shift+Enter for new line)..."
            value={message}
            onChange={handleTypingChange}
            onKeyDown={handleKeyDown}
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-transparent bg-slate-100 dark:bg-slate-800/90 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-500 max-h-32 min-h-[42px]"
          />
        </div>

        {/* Send Button */}
        <div className="pb-1">
          <button
            type="submit"
            disabled={!canSubmit}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition shadow-md active:scale-95 ${
              canSubmit
                ? "bg-blue-600 text-white hover:bg-blue-500 hover:scale-105"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            }`}
            title="Send (Enter)"
          >
            <Send size={18} />
          </button>
        </div>

      </form>
    </div>
  );
}

export default ChatInput;