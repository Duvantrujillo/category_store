import apiClient from "@/lib/apiClient";

export const allProductVariant = async () => {
  const res = await apiClient.get('/product-variant/all');
  return res.data;
};

export const createProductVariant = async (form) => {
  const res = await apiClient.post('/product-variant/create', form);
  return res.data;
};

export const updateProductVariant = async (id, form) => {
  const res = await apiClient.put(`/product-variant/update/${id}`, form);
  return res.data;
};

export const deleteProductVariant = async (id) => {
  const res = await apiClient.delete(`/product-variant/delete/${id}`);
  return res.data;
};

export const searchSkuBarcode = async (q) => {
  const res = await apiClient.get('/product-variant/search', { params: { q } });
  return res.data;
};
