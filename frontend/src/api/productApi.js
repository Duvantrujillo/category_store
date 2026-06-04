import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const getAllProducts = async () => {
    const res = await axios.get(`${API}/product/all`);
    return res.data;
};
