import axios from "axios";

const API_URL_BASE = import.meta.env.VITE_API_URL;

const API_URL = API_URL_BASE + "/cart";

export const fetchCart = async () => {
  const res = await axios.get(API_URL, { withCredentials: true });
  return res.data.data;
};

export const addToCart = async (product_id: string, quantity: number = 1) => {
  const res = await axios.post(
    API_URL,
    { product_id, quantity },
    { withCredentials: true },
  );
  return res.data.data;
};

export const updateCartItem = async (id: string, quantity: number) => {
  const res = await axios.patch(
    `${API_URL}/${id}`,
    { quantity },
    { withCredentials: true },
  );
  return res.data.data;
};

export const removeFromCart = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
  return res.data;
};

export const clearCart = async () => {
  const res = await axios.delete(`${API_URL}/clear`, { withCredentials: true });
  return res.data;
};
