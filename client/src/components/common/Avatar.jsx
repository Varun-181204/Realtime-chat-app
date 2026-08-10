function Avatar({ user, size = 48 }) {
  if (user?.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={user.fullName}
        className="rounded-full object-cover"
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-blue-600 font-bold text-white"
      style={{
        width: size,
        height: size,
      }}
    >
      {user?.fullName?.charAt(0).toUpperCase()}
    </div>
  );
}

export default Avatar;