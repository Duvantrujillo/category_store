import apiClient from "@/lib/apiClient";

export const createBrand = async (formData) => {
  const res = await apiClient.post('/brand/create', formData);
  return res.data;
};

export const updateBrand = async (id, formData) => {
  const res = await apiClient.put(`/brand/update/${id}`, formData);
  return res.data;
};

export const deleteBrand = async (id) => {
  const res = await apiClient.delete(`/brand/delete/${id}`);
  return res.data;
};

export const AllBrands = async () => {
  const res = await apiClient.get('/brand/all');
  return res.data;
};

export const searchBrand = async (q) => {
  const res = await apiClient.get('/brand/search', { params: { q } });
  return res.data;
};
