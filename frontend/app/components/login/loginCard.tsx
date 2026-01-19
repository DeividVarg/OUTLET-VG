import React from 'react'
import { useNavigate } from 'react-router'
import { loginUser } from '~/api/users'

export const LoginCard = () => {
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    console.log(data)

    const log = await loginUser(data)

    if (log.success) {
      navigate('/admin')
    }
  }

  return (
    <div className="w-96 h-96 bg-gray-800 shadow-lg flex flex-col justify-center items-center rounded-4xl border border-sky-300 ">
      <div className="flex items-center ">
        <img
          src="/logo sin letras.svg"
          alt="Logo"
          className="h-30 w-24 -mr-4 -ml-10"
        />
        <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center gap-2"
      >
        <label htmlFor="" className="text-2xl">
          Correo
        </label>
        <input
          type="email"
          name="email"
          className="border border-gray-400 rounded-md p-2 mb-4 w-64"
          placeholder="Ingrese su correo"
        />
        <label htmlFor="">Contraseña</label>
        <input
          type="password"
          name="password"
          className="border border-gray-400 rounded-md p-2 mb-4 w-64"
          placeholder="ingrese su contraseña"
        />

        <button type="submit">Login</button>
      </form>
    </div>
  )
}
