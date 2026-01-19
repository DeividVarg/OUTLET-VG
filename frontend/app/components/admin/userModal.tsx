import { useState, useEffect } from "react"
import {createUser, updateUser} from '~/api/users'

type UserFormData = {
    id?: string;
    name: string;
    last_name?: string;
    email: string;
    role: 'admin' | 'employee';
    password?: string;
    password2?: string;
}

type ModalUserProps = {
    isOpen: boolean
    onClose: () => void
    user?: UserFormData 
    onSave: (data: UserFormData) => void 
    load : () => void
}

export const ModalUsersAdmin = ({ isOpen, onClose, user, load}: ModalUserProps) => {
    
    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        last_name: "",
        email: "",
        role: "employee",
        password: "",
        password2: "",
    })
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!isOpen) return

        if (user && user.id) {
            setIsEditing(true);
            setFormData({
                id: user.id,
                name: user.name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
            })
        } else {
            setIsEditing(false);
            setFormData({
                name: "",
                last_name: "",
                email: "",
                role: "employee",
                password: "",
                password2: "",
            })
        }
    }, [isOpen, user])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isEditing) {
            if (formData.password !== formData.password2) {
                alert("Las contraseñas no coinciden")
                return
            }
            await createUser(formData);

            load()
            onClose();
            return
          }
        await updateUser(formData);
        load()
        onClose();
    }

    if (!isOpen) return null


    return (
        <div className="fixed inset-0 z-40 flex justify-center items-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl"></div>

            <div className="relative rounded-2xl p-6 shadow-xl bg-white text-black z-50 w-11/12 sm:w-2/3 lg:w-1/3">
                <h2 className="text-xl font-bold mb-4">
                    {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                    
                    <label>Nombre</label>
                    <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="border p-1 rounded"
                        placeholder="Nombre"
                        required
                    />

                    <label>Apellido</label>
                    <input
                        name="last_name"
                        type="text"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="border p-1 rounded"
                        placeholder="Apellido"
                        required
                    />

                    <label>Email</label>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border p-1 rounded"
                        placeholder="ejemplo@dominio.com"
                        required
                    />
                    
                    <label>Rol</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="border p-1 rounded"
                        required
                    >
                        <option value="employee">Empleado</option>
                        <option value="admin">Administrador</option>
                    </select>

                    {!isEditing && (
                      <>
                        <>
                            <label>Contraseña</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password || ''}
                                onChange={handleChange}
                                className="border p-1 rounded"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </>
                        <>  
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            name="password2"
                            type="password"
                            value={formData.password2 || ''}
                            onChange={handleChange}
                            className="border p-1 rounded"
                            placeholder="Confirmar contraseña"
                            required
                        />
                        </>
                      </>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            {isEditing ? "Actualizar" : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}