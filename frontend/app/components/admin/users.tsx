import { useState, useEffect } from "react";
import { ModalUsersAdmin } from "./userModal";
import { fetchUsers, deleteUser } from "~/api/users";

type UserFormData = {
  id?: string;
  name: string;
  last_name?: string;
  email: string;
  role: "admin" | "user" | "employee" | "superAdmin";
  password?: string;
  password2?: string;
};

type User = {
  id: string;
  name: string;
  last_name?: string;
  email: string;
  role: "admin" | "user" | "employee" | "superAdmin";
};

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

const UserRow = ({ user, onEdit, onDelete }: UserRowProps) => {
  return (
    <tr className="border-b text-center">
      <td className="py-3 truncate sm:min-w-10 md:text-md text-sm">
        {user.name}
      </td>
      <td className="py-3 truncate sm:min-w-10 md:text-md text-sm">
        {user.email}
      </td>
      <td className="py-3 md:text-md text-sm">{user.role}</td>

      <td className="py-3">
        <div className="flex  md:flex-row flex-col justify-center gap-2">
          <button
            onClick={() => onEdit(user)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Editar
          </button>

          <button
            onClick={() => onDelete(user.id)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
};

export const AdminUsers = () => {
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    const data = await fetchUsers();
    setUsers(data);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsOpenUserModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsOpenUserModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("¿Desea eliminar el usuario?");
    if (confirmed) {
      await deleteUser(id);
      await loadUsers();
    }
  };

  useEffect(() => {
    try {
      loadUsers();
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col items-center pt-20 w-full p-4">
      <div className="mb-6 w-full max-w-4xl flex justify-center">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-tertiary transition-colors font-semibold duration-300"
        >
          + Añadir Usuario
        </button>
      </div>

      <ModalUsersAdmin
        isOpen={isOpenUserModal}
        onClose={() => setIsOpenUserModal(false)}
        user={editingUser || undefined}
        load={loadUsers}
      />

      <table className="w-full max-w-4xl mx-auto border rounded-lg shadow-md overflow-hidden table-fixed">
        <thead className="">
          <tr className="text-center">
            <th className="mr-3">Nombre</th>
            <th className="py-3">Email</th>
            <th className="py-3">Rol</th>
            <th className="py-3">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
