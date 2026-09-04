import { useEffect, useRef, useState } from "react";
import { Edit2, Trash2, X, Download, FileText, Check, CheckCheck, Reply, ChevronDown } from "lucide-react";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function MessageList({
  messages,
  currentUser,
  onDeleteMessage,
  onEditMessage,
  onReactMessage,
  onReplyMessage,
  searchQuery = "",
  onImageClick,
}) {
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // States
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Track scroll position for floating scroll-to-bottom button
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isScrolledUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBottom(false);
  };

  // Format message time
  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get date label
  const getDateLabel = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return messageDate.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Check whether date separator is needed
  const shouldShowDate = (index) => {
    if (index === 0) return true;
    const currentMsgDate = new Date(messages[index].createdAt).toDateString();
    const prevMsgDate = new Date(messages[index - 1].createdAt).toDateString();
    return currentMsgDate !== prevMsgDate;
  };

  // Handle edit message
  const startEditing = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.message || "");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleSaveEdit = (messageId) => {
    if (!editText.trim()) return;
    onEditMessage(messageId, editText.trim());
    setEditingMessageId(null);
    setEditText("");
  };

  // Scroll to quoted message
  const scrollToMessage = (targetId) => {
    if (!targetId) return;
    const el = document.getElementById(`message-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightId(targetId);
      setTimeout(() => setHighlightId(null), 2000);
    }
  };

  // Render text with search term highlighting
  const renderHighlightedText = (text, query) => {
    if (!query || !query.trim() || !text) return text;

    const trimmed = query.trim();
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === trimmed.toLowerCase() ? (
        <mark key={i} className="rounded bg-amber-300 dark:bg-amber-400/40 text-amber-900 dark:text-amber-100 px-1 py-0.5 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleOpenImage = (src) => {
    if (onImageClick) {
      onImageClick(src);
    } else {
      setLightboxImage(src);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 md:p-6 chat-wallpaper transition-colors duration-200 relative"
    >
      
      {/* No messages */}
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500 select-none">
          <p className="text-sm font-medium">No messages yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Send a message to start the conversation</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const isMine = String(msg.sender) === String(currentUser?.id || currentUser?._id);
          const isEditing = editingMessageId === msg._id;
          const isHighlighted = highlightId === msg._id;

          return (
            <div key={msg._id || index}>

              {/* Date Separator */}
              {shouldShowDate(index) && (
                <div className="my-5 flex items-center justify-center select-none">
                  <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-3.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 shadow-sm backdrop-blur">
                    {getDateLabel(msg.createdAt)}
                  </span>
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                id={`message-${msg._id}`}
                className={`group relative mb-2.5 flex items-end gap-2 transition-all duration-300 rounded-2xl ${
                  isHighlighted ? "ring-2 ring-blue-500 bg-blue-100/40 dark:bg-blue-950/30 p-1" : ""
                } ${isMine ? "justify-end" : "justify-start"}`}
              >

                {/* Actions Toolbar on Hover */}
                {!isEditing && (
                  <div
                    className={`opacity-0 transition-opacity duration-150 group-hover:opacity-100 flex items-center gap-1 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-lg text-slate-500 dark:text-slate-400 backdrop-blur-xs ${
                      isMine ? "order-first" : "order-last"
                    }`}
                  >
                    {/* Quick Emojis */}
                    <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1 mr-0.5">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => onReactMessage?.(msg._id, emoji)}
                          className="rounded-lg p-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-125 transition active:scale-95"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Reply Action */}
                    <button
                      type="button"
                      onClick={() => onReplyMessage?.(msg)}
                      className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition"
                      title="Reply"
                    >
                      <Reply size={13} />
                    </button>

                    {/* Sender Actions */}
                    {isMine && (
                      <>
                        {msg.message && !msg.image && !msg.file && (
                          <button
                            type="button"
                            onClick={() => startEditing(msg)}
                            className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition"
                            title="Edit message"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(msg._id)}
                          className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400 transition"
                          title="Delete message"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* The Bubble */}
                <div
                  className={`relative max-w-sm md:max-w-md rounded-2xl px-4 py-2.5 shadow-sm transition-colors ${
                    isMine
                      ? "rounded-br-xs bg-gradient-to-tr from-blue-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10"
                      : "rounded-bl-xs border border-slate-200/90 bg-white text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  }`}
                >

                  {/* Quoted Message Card */}
                  {msg.replyTo && (
                    <div
                      onClick={() => scrollToMessage(msg.replyTo._id || msg.replyTo)}
                      className={`mb-2 cursor-pointer rounded-xl border-l-4 p-2.5 text-xs transition select-none shadow-sm ${
                        isMine
                          ? "border-sky-300 bg-black/25 text-white hover:bg-black/35"
                          : "border-blue-500 bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 dark:bg-black/30 dark:text-slate-200 dark:hover:bg-black/45"
                      }`}
                      title="Click to jump to original message"
                    >
                      <span className={`font-semibold text-[11px] block ${isMine ? "text-sky-200" : "text-blue-600 dark:text-sky-300"}`}>
                        {String(msg.replyTo.sender) === String(currentUser?.id || currentUser?._id)
                          ? "You"
                          : "Reply"}
                      </span>
                      <p className="truncate text-[11px] mt-0.5 opacity-90">
                        {msg.replyTo.image
                          ? "📷 Photo"
                          : msg.replyTo.file
                          ? `📄 ${msg.replyTo.fileName || "Document"}`
                          : msg.replyTo.message || "Original message"}
                      </p>
                    </div>
                  )}

                  {/* Inline Editing Mode */}
                  {isEditing ? (
                    <div className="space-y-2 py-1">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(msg._id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                        className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none ring-2 ring-blue-400"
                      />
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded px-2.5 py-1 text-slate-300 hover:bg-slate-700/50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(msg._id)}
                          className="rounded bg-white/20 px-3 py-1 font-semibold text-white hover:bg-white/30"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Text content with keyword search highlighting */}
                      {msg.message && (
                        <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">
                          {renderHighlightedText(msg.message, searchQuery)}
                        </p>
                      )}

                      {/* Image Preview with click-to-zoom Lightbox */}
                      {msg.image && (
                        <div className="mt-1 overflow-hidden rounded-xl">
                          <img
                            src={msg.image}
                            alt="Attached photo"
                            onClick={() => handleOpenImage(msg.image)}
                            className="max-h-72 w-auto cursor-pointer rounded-xl object-cover transition hover:opacity-95"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Document Card */}
                      {msg.file && (
                        <a
                          href={msg.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`mt-1 flex items-center gap-3 rounded-xl border p-3 transition ${
                            isMine
                              ? "border-white/20 bg-black/20 text-white hover:bg-black/30"
                              : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:bg-black/20 dark:text-white dark:hover:bg-black/30"
                          }`}
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            isMine ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
                          }`}>
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">
                              {msg.fileName || "Download Document"}
                            </p>
                            <span className={`text-[10px] ${isMine ? "text-white/80" : "text-slate-500 dark:text-white/70"}`}>
                              Click to view/download
                            </span>
                          </div>
                          <Download size={16} className={`shrink-0 ${isMine ? "text-white/90" : "text-slate-500 dark:text-white/80"}`} />
                        </a>
                      )}

                      {/* Reaction Badges */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 select-none">
                          {Object.entries(
                            msg.reactions.reduce((acc, r) => {
                              if (!acc[r.emoji]) {
                                acc[r.emoji] = { count: 0, hasMine: false };
                              }
                              acc[r.emoji].count += 1;
                              if (
                                String(r.user) ===
                                String(currentUser?.id || currentUser?._id)
                              ) {
                                acc[r.emoji].hasMine = true;
                              }
                              return acc;
                            }, {})
                          ).map(([emoji, data]) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => onReactMessage?.(msg._id, emoji)}
                              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition border shadow-sm ${
                                data.hasMine
                                  ? isMine
                                    ? "border-white/60 bg-white/30 text-white font-medium"
                                    : "border-blue-400 bg-blue-50 dark:bg-blue-950/90 text-blue-700 dark:text-blue-200 font-medium"
                                  : isMine
                                  ? "border-white/20 bg-black/20 text-white/90 hover:bg-black/30"
                                  : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
                              }`}
                              title={data.hasMine ? "Remove reaction" : "React"}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px] font-semibold">{data.count}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Timestamp & Delivery Ticks */}
                      <div
                        className={`mt-1 flex items-center justify-end gap-1 text-[10px] select-none ${
                          isMine ? "text-blue-200" : "text-slate-400 dark:text-slate-400"
                        }`}
                      >
                        <span>{formatTime(msg.createdAt)}</span>

                        {isMine && (
                          <span title={msg.seen ? "Read" : "Sent"}>
                            {msg.seen ? (
                              <CheckCheck size={14} className="text-sky-300 stroke-[2.5]" />
                            ) : (
                              <Check size={14} className="text-blue-200" />
                            )}
                          </span>
                        )}
                      </div>
                    </>
                  )}

                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Auto-scroll target */}
      <div ref={messagesEndRef} />

      {/* ======================================================== */}
      {/* FLOATING SCROLL TO BOTTOM BUTTON */}
      {/* ======================================================== */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 md:right-10 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-200 hover:scale-110 active:scale-95 animate-in fade-in zoom-in-75"
          title="Scroll to latest message"
        >
          <ChevronDown size={20} className="stroke-[2.5]" />
        </button>
      )}

      {/* ======================================================== */}
      {/* IMAGE LIGHTBOX MODAL */}
      {/* ======================================================== */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 rounded-full bg-slate-800/80 p-2.5 text-white hover:bg-slate-700 transition"
            title="Close image"
          >
            <X size={22} />
          </button>
          <img
            src={lightboxImage}
            alt="Fullscreen photo"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold">Delete Message?</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMessage(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MessageList;