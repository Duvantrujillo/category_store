import apiClient from "@/lib/apiClient";

export const getAllProducts = async () => {
  const res = await apiClient.get('/product/all');
  return res.data;
};
