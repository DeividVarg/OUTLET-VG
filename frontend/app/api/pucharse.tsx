import axios from "axios";

const API_URL_BASE = import.meta.env.VITE_API_URL;

const API_URL = API_URL_BASE + "/purchases";

export const fetchPurchases = async () => {
  const response = await axios.get(API_URL, { withCredentials: true });
  return response.data.data;
};

export const fetchMyPurchases = async () => {
  const response = await axios.get(API_URL, { withCredentials: true });
  return response.data.data;
};

export const createPucharses = async (data: {
  direction: string;
  phone: string;
  product_id?: string;
  quantity?: number;
}) => {
  const response = await axios.post(API_URL, data, { withCredentials: true });
  return response.data.data;
};

export const updatePucharses = async (id: string, data: any) => {
  const response = await axios.patch(`${API_URL}/${id}`, data, {
    withCredentials: true,
  });
  return response.data;
};
