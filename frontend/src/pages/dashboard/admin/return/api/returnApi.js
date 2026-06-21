import apiClient from "@/lib/apiClient";

export const allReturnRequests = async () => {
  const res = await apiClient.get('/return-request/all');
  return res.data;
};

export const createReturnRequest = async (data) => {
  const res = await apiClient.post('/return-request/create', data);
  return res.data;
};

export const updateReturnRequest = async (id, data) => {
  const res = await apiClient.put(`/return-request/${id}`, data);
  return res.data;
};

export const createReturnItems = async (returnRequestId, items) => {
  const res = await apiClient.post('/return-item/create', {
    returnRequest: returnRequestId,
    items,
  });
  return res.data;
};

export const getPaymentMethods = async () => {
  const res = await apiClient.get('/payment/methods');
  return res.data;
};

export const createRefund = async (returnRequestId) => {
  const res = await apiClient.post('/refund/create', { returnRequestId });
  return res.data;
};

export const processRefund = async (refundId, method, reference) => {
  const res = await apiClient.post('/refund/process', { refundId, method, reference });
  return res.data;
};

export const searchReturn = async (q) => {
  const res = await apiClient.get('/return-request/search', { params: { q } });
  return res.data;
};
