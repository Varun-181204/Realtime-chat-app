function Avatar({
  user,
  name,
  profilePicture,
  online,
  size = 48,
}) {
  const imageSrc = profilePicture || user?.profilePicture;
  const displayName = name || user?.fullName || user?.name || "";
  const isOnline = online ?? user?.isOnline ?? false;

  const getInitials = (text) => {
    if (!text) return "U";
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.charAt(0).toUpperCase();
  };

  const badgeSize = size >= 48 ? 14 : size >= 36 ? 11 : 9;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center select-none"
      style={{
        width: size,
        height: size,
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={displayName || "Avatar"}
          className="rounded-full object-cover shadow"
          style={{
            width: size,
            height: size,
          }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 font-semibold text-white shadow"
          style={{
            width: size,
            height: size,
            fontSize: Math.max(12, Math.floor(size * 0.38)),
          }}
        >
          {getInitials(displayName)}
        </div>
      )}

      {isOnline && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-green-500 ring-2 ring-slate-900"
          style={{
            width: badgeSize,
            height: badgeSize,
          }}
          title="Online"
        />
      )}
    </div>
  );
}

export default Avatar;