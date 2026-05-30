import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/* =========================================
   CREATE BRAND
========================================= */

export const createBrand = async (
  formData
) => {

  const res = await axios.post(
    `${API}/brand/create`,
    formData
  );

  return res.data;

};

/* =========================================
   UPDATE BRAND
========================================= */

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

/* =========================================
   DELETE BRAND
========================================= */

export const deleteBrand = async (
  id
) => {

  const res = await axios.delete(
    `${API}/brand/delete/${id}`
  );

  return res.data;

};

/* =========================================
   GET ALL BRANDS
========================================= */

export const AllBrands = async () => {

  const res = await axios.get(
    `${API}/brand/all`
  );

  return res.data;

};