import axios from 'axios';
const API = import.meta.env.VITE_API_URL;

export const getStats = async () => {
  const res = await axios.get(`${API}/dashboard/stats`);
  return res.data;
};
