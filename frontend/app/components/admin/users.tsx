import { useState, useEffect } from 'react'
import { ModalUsersAdmin } from './userModal'
import { fetchUsers, deleteUser } from '~/api/users'

type UserFormData = {
  id?: string
  name: string
  last_name?: string
  email: string
  role: 'admin' | 'user' | 'editor'
  password?: string
  password2?: string
}

type User = {
  id: string
  name: string
  last_name?: string
  email: string
  role: 'admin' | 'user' | 'editor'
}

interface UserRowProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (id: string) => void
}

const UserRow = ({ user, onEdit, onDelete }: UserRowProps) => (
  <div className="grid grid-flow-col-dense items-center p-3 border-b gap-3">
    <div className="w-full">{user.name}</div>
    <div className="w-full">{user.last_name}</div>
    <div className="w-full mr-16">{user.email}</div>
    <div className="w-full">{user.role}</div>
    <div className="w-full flex justify-end space-x-2">
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
  </div>
)

export const AdminUsers = () => {
  const [isOpenUserModal, setIsOpenUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [users, setUsers] = useState<User[]>([])

  const loadUsers = async () => {
    const data = await fetchUsers()
    setUsers(data)
  }

  const handleAdd = () => {
    setEditingUser(null)
    setIsOpenUserModal(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsOpenUserModal(true)
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('¿Desea eliminar el usuario?')
    if (confirmed) {
      await deleteUser(id)
      await loadUsers()
    }
  }

  useEffect(() => {
    try {
      loadUsers()
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }, [])

  return (
    <div className="h-screen flex flex-col items-center pt-20 w-full p-4">
      <div className="mb-6 w-full max-w-4xl flex justify-center">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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

      <div className="w-full max-w-4xl border rounded-lg shadow-md overflow-hidden ">
        <div className="flex justify-between items-center p-3 border-b font-semibold">
          <div className="w-1/5">Nombre</div>
          <div className="w-1/5">Apellido</div>
          <div className="w-1/5">Email</div>
          <div className="w-1/5">Rol</div>
          <div className="w-1/5">Acciones</div>
        </div>

        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
