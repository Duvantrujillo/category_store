import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const loginUser = async (data) => {
  const res = await axios.post(`${API}/user/login`, data);
  return res.data;
};

// REGISTER
export const registerUser = async (data) => {
  const res = await axios.post(`${API}/user/registerUser`, data);
  return res.data;
};