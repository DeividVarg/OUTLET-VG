import axios from "axios"

const API_URL_BASE = import.meta.env.VITE_API_URL

const API_URL = API_URL_BASE + '/subcategories'

export const fetchSubCategories = async () => {
  const response = await axios.get(API_URL)
  return response.data.data
}

export const createSubCategory = async (data: any) => {
  const response = await axios.post(API_URL, data)
  return response.data.data
}

export const updateSubCategory = async (id: string, data: any) => {
  const response = await axios.patch(`${API_URL}/${id}`, data)
  return response.data
}

export const deleteSubCategory = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`)
  return response.data
}

