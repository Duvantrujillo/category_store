import apiClient from "@/lib/apiClient";

export const allAtributeValue = async () => {
  const res = await apiClient.get('/attribute-values/all');
  return res.data;
};

export const createAtributeValue = async (form) => {
  const res = await apiClient.post('/attribute-values/create', form);
  return res.data;
};

export const updateAtributeValue = async (id, form) => {
  const res = await apiClient.put(`/attribute-values/update/${id}`, form);
  return res.data;
};

export const deleteAtributeValue = async (id) => {
  const res = await apiClient.delete(`/attribute-values/delete/${id}`);
  return res.data;
};
