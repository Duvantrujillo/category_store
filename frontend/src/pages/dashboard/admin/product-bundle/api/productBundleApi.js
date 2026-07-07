import apiClient from "@/lib/apiClient";

export const createProductBundle = async (formData) => {
  const res = await apiClient.post('/bundle/create', formData);
  return res.data;
};

export const updateProductBundle = async (id, formData) => {
  const res = await apiClient.put(`/bundle/update/${id}`, formData);
  return res.data;
};

export const deleteProductBundle = async (id) => {
  const res = await apiClient.delete(`/bundle/delete/${id}`);
  return res.data;
};

export const AllProductBundles = async () => {
  const res = await apiClient.get('/bundle/all');
  return res.data;
};

export const searchProductBundle = async (q) => {
  const res = await apiClient.get('/bundle/search', { params: { q } });
  return res.data;
};
