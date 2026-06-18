import axios from "axios";
import apiClient from "@/lib/apiClient";

const API = import.meta.env.VITE_API_URL;

export const getFormResponses = async () => {
  const res = await apiClient.get('/form/all');
  return res.data.data;
};

// Este endpoint es público (lo usa el cliente sin sesión)
export const postFormResponses = async (form) => {
  const res = await axios.post(`${API}/form/create`, form);
  return res.data;
};

export const updateFormResponse = async (id, form) => {
  const res = await apiClient.put(`/form/update/${id}`, form);
  return res.data;
};

export const deleteFormResponse = async (id) => {
  const res = await apiClient.delete(`/form/delete/${id}`);
  return res.data;
};
