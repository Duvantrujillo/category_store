import apiClient from "@/lib/apiClient";

export const allPromotion = async () => {
  const res = await apiClient.get('/promotion/all');
  return res.data;
};

export const createPromotion = async (form) => {
  const res = await apiClient.post('/promotion/create', form);
  return res.data;
};

export const updatePromotion = async (id, form) => {
  const res = await apiClient.put(`/promotion/update/${id}`, form);
  return res.data;
};

export const deletePromotion = async (id) => {
  const res = await apiClient.delete(`/promotion/delete/${id}`);
  return res.data;
};

export const searchPromotion = async (q) => {
  const res = await apiClient.get('/promotion/search', { params: { q } });
  return res.data;
};
