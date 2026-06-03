// src/api/payment.ts
import axios from "axios";

const API_URL_BASE = import.meta.env.VITE_API_URL;
const API_URL = API_URL_BASE + "/payments";

export const initPayment = async (purchase_id: string) => {
  const res = await axios.post(
    `${API_URL}/init`,
    { purchase_id },
    { withCredentials: true },
  );
  return res.data.data; // { url, token }
};

export const initPaymentMP = async (purchase_id: string) => {
  const res = await axios.post(
    `${API_URL}/mp/init`,
    { purchase_id },
    { withCredentials: true },
  );
  return res.data.data; // { url, preference_id }
};