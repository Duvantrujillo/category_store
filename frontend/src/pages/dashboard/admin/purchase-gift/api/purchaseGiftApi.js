import apiClient from "@/lib/apiClient";

export const allPurchaseGift = async () => {
  const res = await apiClient.get('/purchase-gift/all');
  return res.data;
};

export const createPurchaseGift = async (form) => {
  const res = await apiClient.post('/purchase-gift/create', form);
  return res.data;
};

export const updatePurchaseGift = async (id, form) => {
  const res = await apiClient.put(`/purchase-gift/update/${id}`, form);
  return res.data;
};

export const deletePurchaseGift = async (id) => {
  const res = await apiClient.delete(`/purchase-gift/delete/${id}`);
  return res.data;
};

export const searchPurchaseGift = async (q) => {
  const res = await apiClient.get('/purchase-gift/search', { params: { q } });
  return res.data;
};
