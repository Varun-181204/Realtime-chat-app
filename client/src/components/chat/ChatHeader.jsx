import Avatar from "../common/Avatar";

function ChatHeader({
  user,
  isTyping,
}) {
  if (!user) {
    return (
      <div className="flex h-20 items-center border-b border-slate-800 px-6">
        <h2 className="text-slate-400">
          Select a conversation
        </h2>
      </div>
    );
  }

  return (
    <div className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
      <div className="flex items-center gap-4">
        <Avatar
          name={user.fullName}
          online={user.isOnline}
        />

        <div>
          <h2 className="font-semibold text-white">
            {user.fullName}
          </h2>

          <p
            className={`text-sm ${
              isTyping ? "text-blue-400" : "text-green-400"
            }`}
          >
            {isTyping
              ? "Typing..."
              : user.isOnline
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;