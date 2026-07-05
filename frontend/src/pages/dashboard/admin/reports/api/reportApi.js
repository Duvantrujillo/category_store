import apiClient from "@/lib/apiClient";

const buildParams = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.from)    params.set("from",    filters.from);
  if (filters.to)      params.set("to",      filters.to);
  if (filters.status)  params.set("status",  filters.status);
  if (filters.carrier) params.set("carrier", filters.carrier);
  return params.toString() ? `?${params}` : "";
};

export const fetchSummary        = (f) => apiClient.get(`/report/summary${buildParams(f)}`).then((r) => r.data);
export const fetchReturnsReport  = (f) => apiClient.get(`/report/returns${buildParams(f)}`).then((r) => r.data);
export const fetchRefundsReport  = (f) => apiClient.get(`/report/refunds${buildParams(f)}`).then((r) => r.data);
export const fetchShipmentsReport= (f) => apiClient.get(`/report/shipments${buildParams(f)}`).then((r) => r.data);
export const fetchSalesReport    = (f) => apiClient.get(`/report/sales${buildParams(f)}`).then((r) => r.data);
export const fetchDetailedReport = (f) => apiClient.get(`/report/detailed${buildParams(f)}`).then((r) => r.data);
export const fetchDiscountCodeReport = (f) => apiClient.get(`/report/discount-codes${buildParams(f)}`).then((r) => r.data);
