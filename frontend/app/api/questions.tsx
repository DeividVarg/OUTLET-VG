import axios from "axios";

const API_URL_BASE = import.meta.env.VITE_API_URL;
const API_URL = API_URL_BASE + "/questions";

export const createQuestion = async (question: string, email: string) => {
  const response = await axios.post(API_URL, { question, email });
  return response.data.data;
};
