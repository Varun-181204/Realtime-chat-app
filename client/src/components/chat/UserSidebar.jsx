import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, User as UserIcon, LogOut } from "lucide-react";
import Avatar from "../common/Avatar";
import ThemeToggle from "../common/ThemeToggle";
import { getUsers } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

function UserSidebar({
  selectedUser,
  setSelectedUser,
  unreadCounts = {},
  onlineUsers = [],
  recentConversations = {},
  typingMap = {},
}) {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'online'
  const [isLoading, setIsLoading] = useState(true);

  const formatRecentTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (isYesterday) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error("LOAD USERS ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search & Tab filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "online") {
      return onlineUsers.includes(String(u._id));
    }

    if (filter === "unread") {
      return (
        (unreadCounts[u._id] || 0) > 0 ||
        (unreadCounts[String(u._id)] || 0) > 0
      );
    }

    return true;
  });

  const totalUnread = Object.values(unreadCounts).reduce((acc, count) => acc + (count || 0), 0);

  return (
    <div className="flex h-full w-80 md:w-88 flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white select-none transition-colors duration-200">

      {/* ======================================================== */}
      {/* TOP: CURRENT USER PROFILE, THEME & ACTIONS */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-3.5 py-3 bg-slate-50/70 dark:bg-slate-900">
        <Link
          to="/profile"
          className="group flex items-center gap-2.5 rounded-xl p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800/80 min-w-0"
          title="Edit your profile"
        >
          <Avatar
            user={currentUser}
            online={true}
            size={36}
          />
          <div className="min-w-0">
            <h3 className="truncate text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              {currentUser?.fullName || "My Account"}
            </h3>
            <p className="truncate text-[10px] text-emerald-600 dark:text-emerald-400">Available</p>
          </div>
        </Link>

        {/* Controls: Theme Switcher & Actions */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle compact={true} showSound={true} />

          <Link
            to="/profile"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Profile Settings"
          >
            <UserIcon size={16} />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/60 dark:hover:text-red-400"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEARCH BAR */}
      {/* ======================================================== */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 p-3">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/90 py-2 pl-9 pr-8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
              filter === "unread"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <span>Unread</span>
            {totalUnread > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] text-white">
                {totalUnread}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilter("online")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
              filter === "online"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Online ({onlineUsers.length})
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CONTACT LIST */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
        {isLoading ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Loading chats...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {search ? "No contacts found" : filter === "unread" ? "No unread messages" : "No users online"}
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isOnline = onlineUsers?.includes(String(u._id));
            const unread = unreadCounts?.[u._id] || 0;
            const isSelected = selectedUser?._id === u._id;
            const recent = recentConversations?.[u._id];

            const isUserTyping = !!(typingMap[String(u._id)] || typingMap[u._id]);

            const previewText = recent
              ? recent.image
                ? "📷 Photo"
                : recent.file
                ? "📄 Document"
                : recent.message
              : u.bio || "No messages yet";

            return (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`group flex cursor-pointer items-center gap-3.5 px-4 py-3 transition ${
                  isSelected
                    ? "bg-blue-50/90 dark:bg-slate-800/95 border-l-4 border-blue-500 shadow-xs"
                    : "hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                }`}
              >
                {/* Avatar */}
                <Avatar
                  user={u}
                  online={isOnline}
                  size={42}
                />

                {/* Contact Meta */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`truncate text-sm font-semibold transition ${
                        isSelected
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white"
                      }`}
                    >
                      {u.fullName}
                    </h4>

                    {recent?.createdAt && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-1">
                        {formatRecentTime(recent.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs mt-1">
                    {isUserTyping ? (
                      <p className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-[11px] animate-pulse">
                        <span className="flex gap-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                        </span>
                        <span>typing...</span>
                      </p>
                    ) : (
                      <p className={`truncate text-[11px] max-w-[150px] ${
                        unread > 0
                          ? "text-slate-900 dark:text-slate-200 font-semibold"
                          : "text-slate-500 dark:text-slate-400"
                      }`}>
                        {previewText}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 shrink-0">
                      {unread > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow">
                          {unread}
                        </span>
                      )}

                      {isOnline ? (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" title="Online" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" title="Offline" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

export default UserSidebar;