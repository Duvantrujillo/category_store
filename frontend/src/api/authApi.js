import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const loginUser = async (data) => {
  const res = await axios.post(`${API}/user/login`, data);
  return res.data;
};

// REGISTER
export const registerUser = async (data) => {
  const res = await axios.post(`${API}/user/create`, data);
  return res.data;
};


export const getUsers = async () => {
  const res = await axios.get(`${API}/user/all`);

  return res.data;
};