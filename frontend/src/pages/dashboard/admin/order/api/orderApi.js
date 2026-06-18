import apiClient from "@/lib/apiClient";

export const allOrder = async () => {
  const res = await apiClient.get('/order/all');
  return res.data;
};
