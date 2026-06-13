import App from "@/App";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;



export const createBrand = async (
  formData
) => {

  const res = await axios.post(
    `${API}/brand/create`,
    formData
  );

  return res.data;

};



export const updateBrand = async (
  id,
  formData
) => {

  const res = await axios.put(
    `${API}/brand/update/${id}`,
    formData
  );

  return res.data;

};



export const deleteBrand = async (
  id
) => {
  const res = await axios.delete(
    `${API}/brand/delete/${id}`
  );
  return res.data;
};



export const AllBrands = async () => {

  const res = await axios.get(
    `${API}/brand/all`);
  return res.data;

};

export const searchBrand =  async (q) => {
  const res = await axios.get(`${API}/brand/search`,{params:{q}})
  return res.data
}