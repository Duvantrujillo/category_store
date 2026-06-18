import apiClient from "@/lib/apiClient";

export const createCategory = async (form) => {
  const res = await apiClient.post('/category/create', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const allCategory = async () => {
  const res = await apiClient.get('/category/all');
  return res.data;
};

export const activeCategory = async () => {
  const res = await apiClient.get('/category/active');
  return res.data;
};

export const updateCategory = async (id, form) => {
  const res = await apiClient.put(`/category/update/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await apiClient.delete(`/category/delete/${id}`);
  return res.data;
};
