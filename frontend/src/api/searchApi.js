import apiClient from "@/lib/apiClient";

export const globalSearch = async (q) => {
  const res = await apiClient.get('/search', { params: { q } });
  return res.data;
};
