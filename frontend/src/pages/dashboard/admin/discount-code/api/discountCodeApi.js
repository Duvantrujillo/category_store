import apiClient from "@/lib/apiClient";

export const allDiscountCode = async () => {
  const res = await apiClient.get('/discount-code/all');
  return res.data;
};

export const createDiscountCode = async (form) => {
  const res = await apiClient.post('/discount-code/create', form);
  return res.data;
};

export const updateDiscountCode = async (id, form) => {
  const res = await apiClient.put(`/discount-code/update/${id}`, form);
  return res.data;
};

export const deleteDiscountCode = async (id) => {
  const res = await apiClient.delete(`/discount-code/delete/${id}`);
  return res.data;
};

export const searchDiscountCode = async (q) => {
  const res = await apiClient.get('/discount-code/search', { params: { q } });
  return res.data;
};
