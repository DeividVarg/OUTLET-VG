import axios from 'axios'

const API_URL_BASE = import.meta.env.VITE_API_URL

const API_URL = API_URL_BASE + '/users'

export const fetchUsers = async () => {
  const response = await axios.get(API_URL)
  return response.data.data
}

export const createUser = async (data: any) => {
  const response = await axios.post(`${API_URL}/register`, data)
  return response.data
}

export const updateUser = async (data: any) => {
  const response = await axios.patch(`${API_URL}/${data.id}`, data)
  return response.data
}

export const deleteUser = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`)
  return response.data
}

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/login`, data, {
    withCredentials: true,
  })
  return response.data
}