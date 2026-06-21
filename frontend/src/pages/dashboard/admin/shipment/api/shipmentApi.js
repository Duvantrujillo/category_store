import apiClient from "@/lib/apiClient";

export const allshipment = async () => {
  const res = await apiClient.get('/shipment/all');
  return res.data;
};

export const updateShipment = async (id, data) => {
  const res = await apiClient.put(`/shipment/${id}`, data);
  return res.data;
};

export const getShipmentHistory = async (id) => {
  const res = await apiClient.get(`/shipment/${id}/history`);
  return res.data;
};

export const searchShipment = async (q) => {
  const res = await apiClient.get('/shipment/search', { params: { q } });
  return res.data;
};
