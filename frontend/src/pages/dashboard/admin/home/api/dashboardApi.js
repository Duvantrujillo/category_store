import apiClient from "@/lib/apiClient";

export const getStats = async () => {
  const res = await apiClient.get('/dashboard/stats');
  return res.data;
};
