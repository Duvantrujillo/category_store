import apiClient from "@/lib/apiClient";

export const allAttribute = async () => {
  const res = await apiClient.get('/attribute/all');
  return res.data;
};

export const createAttribute = async (form) => {
  const res = await apiClient.post('/attribute/create', form);
  return res.data;
};

export const updateAttribute = async (id, form) => {
  const res = await apiClient.put(`/attribute/update/${id}`, form);
  return res.data;
};

export const deleteAttribute = async (id) => {
  const res = await apiClient.delete(`/attribute/delete/${id}`);
  return res.data;
};

export const searchAttribute = async (q) => {
  const res = await apiClient.get('/attribute/search', { params: { q } });
  return res.data;
};
