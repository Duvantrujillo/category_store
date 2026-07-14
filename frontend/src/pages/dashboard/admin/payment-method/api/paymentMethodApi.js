import apiClient from "@/lib/apiClient";

export const allPaymentMethodsAdmin = async () => {
  const res = await apiClient.get('/payment-method/admin/all');
  return res.data;
};

export const createPaymentMethod = async (form) => {
  const res = await apiClient.post('/payment-method/create', form);
  return res.data;
};

export const updatePaymentMethod = async (id, form) => {
  const res = await apiClient.put(`/payment-method/update/${id}`, form);
  return res.data;
};

export const deletePaymentMethod = async (id) => {
  const res = await apiClient.delete(`/payment-method/delete/${id}`);
  return res.data;
};
