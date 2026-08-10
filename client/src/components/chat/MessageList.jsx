function MessageList({ messages, currentUser }) {

  console.log(messages);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6">
      {messages.length === 0 ? (
  <div className="text-center text-slate-500">
    No messages yet.
  </div>
) : (
  messages
    .filter((msg) => msg)
    .map((msg) => (
      <div
        key={msg._id}
        className={`mb-3 flex ${
          String(msg.sender) === currentUser.id
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          className={`max-w-md rounded-xl px-4 py-2 ${
            String(msg.sender) === currentUser.id
              ? "bg-blue-600 text-white"
              : "bg-slate-800 text-white"
          }`}
        >
          {msg.message && (
            <div>{msg.message}</div>
          )}

          {msg.image && (
            <img
              src={msg.image}
              alt="Chat"
              className="mt-2 max-w-xs rounded-lg"
            />
          )}

          {msg.file && (
            <a
              href={msg.file}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-blue-300 hover:bg-slate-600"
            >
              📄 {msg.fileName}
            </a>
          )}

          {String(msg.sender) === currentUser.id && (
            <div className="mt-1 text-right text-xs text-gray-200">
              {msg.seen ? "✓✓" : "✓"}
            </div>
          )}
        </div>
      </div>
    ))
)}
    </div>
  );
}

export default MessageList;