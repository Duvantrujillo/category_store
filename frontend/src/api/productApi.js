import apiClient from "@/lib/apiClient";

export const getAllProducts = async () => {
  const res = await apiClient.get('/product/all');
  return res.data;
};

export const searchProduct = async (q) => {
  const res = await apiClient.get('/product/search', { params: { q } });
  return res.data;
};
