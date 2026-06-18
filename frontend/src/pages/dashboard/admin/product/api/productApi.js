import apiClient from "@/lib/apiClient";

export const allProduct = async () => {
  const res = await apiClient.get('/product/all');
  return res.data;
};

export const createProduct = async (form) => {
  const res = await apiClient.post('/product/create', form);
  return res.data;
};

export const updateProduct = async (id, form) => {
  const res = await apiClient.put(`/product/update/${id}`, form);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await apiClient.delete(`/product/delete/${id}`);
  return res.data;
};

export const searchProduct = async (q) => {
  const res = await apiClient.get('/product/search', { params: { q } });
  return res.data;
};
