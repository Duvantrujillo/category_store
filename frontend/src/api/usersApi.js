import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const getUsers = async () => {
  const res = await axios.get(`${API}/user/usersTotal`);

  return res.data;
};