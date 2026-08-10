import { useEffect, useState } from "react";
import Avatar from "../common/Avatar";
import { getUsers } from "../../services/userService";

function UserSidebar({ selectedUser, setSelectedUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data.users);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-80 border-r border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-5">
        <h2 className="text-xl font-bold text-white">
          Chats
        </h2>
      </div>

      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => setSelectedUser(user)}
          className={`flex cursor-pointer items-center gap-4 border-b border-slate-800 p-4 hover:bg-slate-800 ${
            selectedUser?._id === user._id ? "bg-slate-800" : ""
          }`}
        >
          <Avatar
            name={user.fullName}
            online={false}
          />

          <div>
            <h3 className="text-white">
              {user.fullName}
            </h3>

            <p className="text-sm text-slate-400">
              {user.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserSidebar;