import apiClient from "@/lib/apiClient";

export const allOrder = async () => {
  const res = await apiClient.get('/order/all');
  return res.data;
};

export const searchOrder = async (q) => {
  const res = await apiClient.get('/order/search', { params: { q } });
  return res.data;
};

export const filterOrderByDate = async (from, to) => {
  const res = await apiClient.get('/order/by-date', { params: { from, to } });
  return res.data;
};

export const deleteCancelledOrders = async () => {
  const res = await apiClient.delete('/order/cancelled');
  return res.data;
};
