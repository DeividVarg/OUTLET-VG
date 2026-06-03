import axios from "axios";

const API_URL_BASE = import.meta.env.VITE_API_URL;

const API_URL = API_URL_BASE + "/users";

export const fetchUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

export const createUser = async (data: any) => {
  const response = await axios.post(`${API_URL}/register`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const createUserAuth = async (data: any) => {
  const response = await axios.post(`${API_URL}/register/auth`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const updateUser = async (data: any) => {
  const response = await axios.patch(`${API_URL}/${data.id}`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/login`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const verifyLoginCode = async (data: {
  userId: string;
  code: string;
}) => {
  const response = await axios.post(`${API_URL}/login/verify`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const authMe = async () => {
  const response = await axios.get(`${API_URL}/auth/me`, {
    withCredentials: true,
  });
  return response.data;
};

export const logoutAction = async () => {
  const response = await axios.post(
    `${API_URL}/logout`,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const res = await axios.post(`${API_URL}/forgot-password`, { email });
  return res.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const res = await axios.post(`${API_URL}/reset-password`, {
    token,
    newPassword,
  });
  return res.data;
};
