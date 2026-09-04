import { useState } from "react";
import { X, Search, Phone, Video, Info } from "lucide-react";
import Avatar from "../common/Avatar";

function ChatHeader({
  user,
  isTyping,
  onlineUsers = [],
  onClose,
  searchQuery = "",
  setSearchQuery,
  matchCount = 0,
  lastSeen,
  onOpenDrawer,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (!user) return null;

  const isOnline = onlineUsers.includes(String(user._id));
  const effectiveLastSeen = lastSeen || user.lastSeen;

  const formatLastSeen = (dateString) => {
    if (!dateString) return "Offline";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Offline";

    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return "Last seen just now";

    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeString = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return `Last seen today at ${timeString}`;
    if (isYesterday) return `Last seen yesterday at ${timeString}`;

    return `Last seen ${date.toLocaleDateString([], { month: "short", day: "numeric" })}`;
  };

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      if (setSearchQuery) setSearchQuery("");
    } else {
      setIsSearchOpen(true);
    }
  };

  return (
    <div className="flex h-18 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3 select-none transition-colors duration-200">
      
      {/* Left: Contact Info (Clickable for Profile Drawer) */}
      <div
        onClick={onOpenDrawer}
        className="group flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer transition hover:opacity-90"
        title="View contact info & media"
      >
        <Avatar
          user={user}
          online={isOnline}
          size={44}
        />

        <div className="min-w-0">
          <h2 className="truncate font-semibold text-slate-900 dark:text-white text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            {user.fullName}
          </h2>

          <div className="flex items-center gap-1.5 mt-0.5">
            {isTyping ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                <span className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                </span>
                typing...
              </span>
            ) : isOnline ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-400">
                {formatLastSeen(effectiveLastSeen)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-1 text-slate-400">
        
        {/* Search Bar */}
        {isSearchOpen ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 text-xs text-slate-900 dark:text-white shadow-inner animate-in fade-in slide-in-from-right-4 duration-200">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              placeholder="Search in chat..."
              autoFocus
              className="bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none w-32 md:w-48"
            />
            {searchQuery && (
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/80 border border-blue-300 dark:border-blue-600/60 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-200">
                {matchCount} {matchCount === 1 ? "match" : "matches"}
              </span>
            )}
            <button
              type="button"
              onClick={handleToggleSearch}
              className="rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              title="Close search"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleToggleSearch}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Search in conversation"
          >
            <Search size={18} />
          </button>
        )}

        {/* Voice Call Dummy Button */}
        <button
          type="button"
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          title="Voice call (Coming soon)"
          onClick={() => alert("Voice calling feature coming soon!")}
        >
          <Phone size={18} />
        </button>

        {/* Video Call Dummy Button */}
        <button
          type="button"
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          title="Video call (Coming soon)"
          onClick={() => alert("Video calling feature coming soon!")}
        >
          <Video size={18} />
        </button>

        {/* Contact Info Drawer Button */}
        {onOpenDrawer && (
          <button
            type="button"
            onClick={onOpenDrawer}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Contact Info & Media"
          >
            <Info size={18} />
          </button>
        )}

        {/* Close Active Chat */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Close conversation"
          >
            <X size={19} />
          </button>
        )}
      </div>

    </div>
  );
}

export default ChatHeader;