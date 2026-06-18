import axios from "axios";
import apiClient from "@/lib/apiClient";

const API = import.meta.env.VITE_API_URL;

// Login y registro son públicos — usan axios sin token
export const loginUser = async (data) => {
  const res = await axios.post(`${API}/user/login`, data);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await axios.post(`${API}/user/create`, data);
  return res.data;
};

export const getUsers = async () => {
  const res = await apiClient.get('/user/all');
  return res.data;
};